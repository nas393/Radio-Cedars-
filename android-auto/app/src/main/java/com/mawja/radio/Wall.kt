package com.mawja.radio

import android.content.Context
import android.graphics.*
import android.media.ExifInterface
import android.net.Uri
import android.text.TextPaint
import android.text.TextUtils
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone
import kotlin.math.max
import kotlin.random.Random

/**
 * Live wallpaper: your photo (or a real photo of the station's region matching its weather),
 * with rain / snow / fog / night effects, then the station, song, weather and clocks on top.
 * The phone shows it full screen; the car shows it as the now-playing background.
 */
object Wall {
    class State(val scene: File, val weather: Weather?)
    var state by mutableStateOf<State?>(null)
    private var slide = 0
    private val lebanon = listOf("Beirut", "Byblos", "Cedars of God", "Jeita Grotto", "Baalbek", "Raouche", "Batroun", "Qadisha Valley")

    fun scene(w: Weather?): String { val c = w?.code ?: 0
        return when {
            c in 95..99 -> "storm"; c in 71..77 || c == 85 || c == 86 -> "snow"
            c in 51..67 || c in 80..82 -> "rain"; c == 45 || c == 48 -> "fog"
            w?.day == false -> "night"; c == 3 -> "clouds"; else -> "sunny"
        }
    }

    private suspend fun regionPhoto(s: Station?, w: Weather?): Bitmap? {
        val cc = s?.cc?.ifBlank { null } ?: "LB"
        val place = if (cc == "LB") lebanon[slide % lebanon.size] else Capitals.of(cc)?.city ?: s?.country ?: "Lebanon"
        val l = runCatching { Repo.commons("$place ${scene(w)}").ifEmpty { Repo.commons(place) } }.getOrDefault(emptyList())
        if (l.isEmpty()) return null
        return decode(runCatching { Repo.bytes(l[slide % l.size]) }.getOrNull() ?: return null, 1400)
    }

    private fun decode(bytes: ByteArray, size: Int, rotate: Int = 0): Bitmap? {
        val o = BitmapFactory.Options().apply { inJustDecodeBounds = true }
        BitmapFactory.decodeByteArray(bytes, 0, bytes.size, o)
        var ss = 1; while (o.outWidth / (ss * 2) >= size && o.outHeight / (ss * 2) >= size) ss *= 2
        val b = BitmapFactory.decodeByteArray(bytes, 0, bytes.size, BitmapFactory.Options().apply { inSampleSize = ss }) ?: return null
        return if (rotate == 0) b else Bitmap.createBitmap(b, 0, 0, b.width, b.height, Matrix().apply { postRotate(rotate.toFloat()) }, true)
    }

    private fun myPhoto(f: File): Bitmap? = runCatching {
        val r = when (ExifInterface(f.path).getAttributeInt(ExifInterface.TAG_ORIENTATION, 1)) {
            ExifInterface.ORIENTATION_ROTATE_90 -> 90; ExifInterface.ORIENTATION_ROTATE_180 -> 180; ExifInterface.ORIENTATION_ROTATE_270 -> 270; else -> 0
        }
        decode(f.readBytes(), 1400, r)
    }.getOrNull()

    fun cover(b: Bitmap, w: Int, h: Int): Bitmap {
        val out = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888)
        val s = max(w / b.width.toFloat(), h / b.height.toFloat())
        Canvas(out).drawBitmap(b, Matrix().apply { postScale(s, s); postTranslate((w - b.width * s) / 2, (h - b.height * s) / 2) }, Paint(Paint.FILTER_BITMAP_FLAG))
        return out
    }

    private fun effects(c: Canvas, w: Int, h: Int, sc: String) {
        val r = Random(7); val p = Paint(Paint.ANTI_ALIAS_FLAG)
        when (sc) {
            "rain", "storm" -> {
                c.drawColor(Color.argb(if (sc == "storm") 120 else 70, 10, 20, 40))
                p.color = Color.argb(130, 220, 230, 255); p.strokeWidth = w / 450f
                repeat(240) { val x = r.nextFloat() * w; val y = r.nextFloat() * h; c.drawLine(x, y, x - w / 70f, y + h / 24f, p) }
            }
            "snow" -> { c.drawColor(Color.argb(40, 255, 255, 255)); p.color = Color.argb(220, 255, 255, 255)
                repeat(200) { c.drawCircle(r.nextFloat() * w, r.nextFloat() * h, w / 300f + r.nextFloat() * w / 220f, p) } }
            "fog" -> c.drawColor(Color.argb(100, 230, 230, 235))
            "night" -> { c.drawColor(Color.argb(120, 5, 10, 30)); p.color = Color.argb(210, 255, 255, 255)
                repeat(70) { c.drawCircle(r.nextFloat() * w, r.nextFloat() * h * .4f, w / 700f + r.nextFloat() * 2f, p) } }
            "clouds" -> c.drawColor(Color.argb(45, 120, 130, 150))
            else -> { p.shader = RadialGradient(w * .85f, h * .1f, w * .7f, Color.argb(120, 255, 200, 90), Color.TRANSPARENT, Shader.TileMode.CLAMP)
                c.drawRect(0f, 0f, w.toFloat(), h.toFloat(), p) }
        }
    }

    private fun clocks(): String {
        val f = SimpleDateFormat("HH:mm", Locale.US); val now = Date(); val local = f.format(now)
        f.timeZone = TimeZone.getTimeZone("Asia/Beirut"); val bey = f.format(now)
        return if (bey == local) local else "$local · 🇱🇧 $bey"
    }

    private val display by lazy { runCatching { androidx.core.content.res.ResourcesCompat.getFont(Store.ctx, R.font.lalezar) }.getOrNull() ?: Typeface.DEFAULT_BOLD }
    private val body by lazy { runCatching { androidx.core.content.res.ResourcesCompat.getFont(Store.ctx, R.font.readex) }.getOrNull() ?: Typeface.DEFAULT }
    private const val STONE = 0xFFEADFCB.toInt(); private const val STONE_DEEP = 0xFFC9B997.toInt(); private const val INK = 0xFF231A12.toInt()
    private const val OCHRE = 0xFFD9A441.toInt(); private const val BRICK = 0xFFC2452F.toInt(); private const val COBALT = 0xFF3D74B8.toInt()

    /** One pointed (Lebanese-house) arch: straight sides from [bottom] up to [side], meeting at [apex]. */
    private fun arch(path: Path, x0: Float, x1: Float, apex: Float, side: Float, bottom: Float) {
        val cx = (x0 + x1) / 2; val h = side - apex; val w = x1 - x0
        path.moveTo(x0, bottom); path.lineTo(x0, side)
        path.cubicTo(x0, side - h * .55f, cx - w * .18f, apex + h * .12f, cx, apex)
        path.cubicTo(cx + w * .18f, apex + h * .12f, x1, side - h * .55f, x1, side)
        path.lineTo(x1, bottom); path.close()
    }

    /** Now-playing art in the website's look: the view through three limestone arches, the radio dial below. */
    private fun carArt(scene: Bitmap, s: Station?, song: String?, w: Weather?, logo: Bitmap?): Bitmap {
        val n = 1024; val out = Bitmap.createBitmap(n, n, Bitmap.Config.ARGB_8888); val c = Canvas(out)
        c.drawColor(STONE)
        val arches = Path(); val gap = 26f; val left = 52f; val right = n - 52f; val aw = (right - left - 2 * gap) / 3
        for (k in 0..2) { val x0 = left + k * (aw + gap); arch(arches, x0, x0 + aw, 70f, 300f, 680f) }
        c.save(); c.clipPath(arches)
        c.drawBitmap(cover(scene, (right - left).toInt(), 610), left, 70f, Paint(Paint.FILTER_BITMAP_FLAG)); c.restore()
        c.drawPath(arches, Paint(Paint.ANTI_ALIAS_FLAG).apply { style = Paint.Style.STROKE; strokeWidth = 8f; color = STONE_DEEP })
        // the radio dial: ochre scale with the brick needle
        val dial = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = OCHRE; strokeWidth = 4f }
        c.drawLine(left, 712f, right, 712f, dial)
        for (k in 0..24) { val x = left + k * (right - left) / 24; c.drawLine(x, 702f, x, if (k % 4 == 0) 690f else 698f, dial) }
        val needle = left + ((s?.name?.hashCode() ?: 0).toLong().and(0xffff) % 1000) / 1000f * (right - left)
        c.drawRect(needle - 4f, 680f, needle + 4f, 722f, Paint().apply { color = BRICK })
        val t = TextPaint(Paint.ANTI_ALIAS_FLAG)
        fun line(text: String, size: Float, x: Float, y: Float, face: Typeface, color: Int) {
            t.textSize = size; t.typeface = face; t.color = color
            c.drawText(TextUtils.ellipsize(text, t, n - x - 52f, TextUtils.TruncateAt.END).toString(), x, y, t)
        }
        val tx = if (logo != null) 236f else 52f
        logo?.let {
            val sh = BitmapShader(cover(it, 160, 160), Shader.TileMode.CLAMP, Shader.TileMode.CLAMP)
            sh.setLocalMatrix(Matrix().apply { setTranslate(52f, 770f) })
            c.drawCircle(132f, 850f, 80f, Paint(Paint.ANTI_ALIAS_FLAG).apply { shader = sh })
            c.drawCircle(132f, 850f, 80f, Paint(Paint.ANTI_ALIAS_FLAG).apply { style = Paint.Style.STROKE; strokeWidth = 6f; color = OCHRE })
        }
        line(s?.name ?: "Sawt el Beit", 70f, tx, 830f, display, INK)
        song?.let { line(it, 38f, tx, 882f, body, 0xFF6A5B48.toInt()) }
        line(listOfNotNull(w?.let { "${it.icon} ${it.temp}° ${it.place}" }, clocks()).joinToString("   "), 34f, tx, 950f, body, 0xFF8E2A1C.toInt())
        return out
    }

    /** Car-menu tiles in the house colors: a limestone arch on a floor tile, with an emoji inside. */
    suspend fun icon(ctx: Context, key: String, emoji: String): Uri = withContext(Dispatchers.IO) {
        val f = File(ctx.cacheDir, "ico_" + key.replace(Regex("[^A-Za-z0-9]"), "_") + ".png")
        if (!f.exists()) {
            val n = 256; val b = Bitmap.createBitmap(n, n, Bitmap.Config.ARGB_8888); val c = Canvas(b)
            val tile = listOf(COBALT, OCHRE, BRICK, 0xFF2B221A.toInt())[(key.hashCode() and 0x7fffffff) % 4]
            c.drawRoundRect(RectF(0f, 0f, n.toFloat(), n.toFloat()), 44f, 44f, Paint(Paint.ANTI_ALIAS_FLAG).apply { color = tile })
            val a = Path(); arch(a, 52f, n - 52f, 34f, 120f, n - 24f)
            c.drawPath(a, Paint(Paint.ANTI_ALIAS_FLAG).apply { color = STONE })
            val p = TextPaint(Paint.ANTI_ALIAS_FLAG).apply { textSize = 104f; textAlign = Paint.Align.CENTER }
            c.drawText(emoji, n / 2f, 182f, p)
            f.outputStream().use { b.compress(Bitmap.CompressFormat.PNG, 100, it) }
        }
        ArtProvider.file(f.name)
    }

    private var files = emptyList<String>()

    /** Builds a fresh wallpaper; returns the car artwork URI. */
    suspend fun refresh(ctx: Context, s: Station?, song: String?, next: Boolean): Uri? = withContext(Dispatchers.IO) {
        if (next) slide++
        val w = runCatching { Repo.weather(s?.takeIf { it.cc.isNotBlank() } ?: PlaybackService.LEB) }.getOrNull()
        val prof = Store.current()
        val mine = if (prof.kids) emptyList() else Store.gallery()
        val src = Store.i("src")   // 0 = mix, 1 = my photos, 2 = region
        val useMine = mine.isNotEmpty() && (src == 1 || (src == 0 && slide % 2 == 0))
        val photo = (if (useMine) myPhoto(mine[slide % mine.size]) else regionPhoto(s, w))
            ?: mine.firstOrNull()?.let { myPhoto(it) }
            ?: Bitmap.createBitmap(1400, 1400, Bitmap.Config.ARGB_8888).also { b ->
                Canvas(b).drawPaint(Paint().apply { shader = LinearGradient(0f, 0f, 1400f, 1400f, 0xFF1E4429.toInt(), 0xFF05070D.toInt(), Shader.TileMode.CLAMP) })
            }
        val fx = scene(w)
        val bg = cover(photo, 1400, 1400).also { effects(Canvas(it), 1400, 1400, fx) }
        val logo = s?.logo?.let { runCatching { decode(Repo.bytes(it), 200) }.getOrNull() }
        val ts = System.currentTimeMillis()
        val sf = File(ctx.cacheDir, "wall_s$ts.jpg"); val af = File(ctx.cacheDir, "wall_a$ts.jpg")
        sf.outputStream().use { bg.compress(Bitmap.CompressFormat.JPEG, 85, it) }
        af.outputStream().use { carArt(bg, s, song, w, logo).compress(Bitmap.CompressFormat.JPEG, 88, it) }
        // keep the previous pair so a screen still loading it doesn't break
        ctx.cacheDir.listFiles(java.io.FileFilter { f -> f.name.startsWith("wall_") && f.name !in files && f != sf && f != af })?.forEach { it.delete() }
        files = listOf(sf.name, af.name)
        MawjaWidget.bg = cover(bg, 640, 280)
        withContext(Dispatchers.Main) { state = State(sf, w) }
        ArtProvider.file(af.name)
    }
}
