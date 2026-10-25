package com.mawja.radio

import android.content.Intent
import android.graphics.*
import android.os.Handler
import android.os.HandlerThread
import android.os.Looper
import android.text.TextPaint
import android.text.TextUtils
import androidx.car.app.AppManager
import androidx.car.app.CarAppService
import androidx.car.app.CarContext
import androidx.car.app.CarToast
import androidx.car.app.Screen
import androidx.car.app.Session
import androidx.car.app.SurfaceCallback
import androidx.car.app.SurfaceContainer
import androidx.car.app.constraints.ConstraintManager
import androidx.car.app.hardware.CarHardwareManager
import androidx.car.app.hardware.common.CarValue
import androidx.car.app.model.*
import androidx.car.app.navigation.model.NavigationTemplate
import androidx.car.app.validation.HostValidator
import androidx.core.content.ContextCompat
import androidx.core.graphics.drawable.IconCompat
import androidx.lifecycle.DefaultLifecycleObserver
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import kotlin.math.hypot
import kotlin.math.max
import kotlin.math.roundToInt
import androidx.car.app.hardware.info.Speed as CarSpeed

/** A second car app that draws the salon full screen on the car display. */
class CarSalonService : CarAppService() {
    override fun createHostValidator(): HostValidator = HostValidator.ALLOW_ALL_HOSTS_VALIDATOR
    @Suppress("OVERRIDE_DEPRECATION")
    override fun onCreateSession(): Session = SalonSession()
}

class SalonSession : Session() {
    override fun onCreateScreen(intent: Intent): Screen {
        val pc = PlayerConn(carContext)
        val r = SalonRenderer(carContext, pc)
        val screen = SalonCarScreen(carContext, pc, r)
        r.onPlayingChanged = { screen.invalidate() }
        r.open = { screen.open(it) }
        carContext.getCarService(AppManager::class.java).setSurfaceCallback(r)
        lifecycleScope.launch(Dispatchers.IO) { runCatching { Sky.refresh(carContext) } }
        listenSpeed(r)
        lifecycle.addObserver(object : DefaultLifecycleObserver {
            override fun onDestroy(owner: LifecycleOwner) { r.stop(); pc.release() }
        })
        return screen
    }

    /** The car's own speedometer reading; the phone's GPS is the fallback. */
    private fun listenSpeed(r: SalonRenderer) {
        val add = {
            carContext.getCarService(CarHardwareManager::class.java).carInfo
                .addSpeedListener(ContextCompat.getMainExecutor(carContext)) { s: CarSpeed ->
                    val v = s.displaySpeedMetersPerSecond
                    r.carKmh = if (v.status == CarValue.STATUS_SUCCESS) v.value?.let { (it * 3.6f).roundToInt() } else null
                }
        }
        runCatching { add() }.onFailure {
            runCatching {
                carContext.requestPermissions(listOf("com.google.android.gms.permission.CAR_SPEED")) { granted, _ -> if (granted.isNotEmpty()) runCatching { add() } }
            }
        }
        runCatching { startSpeed(carContext) }
    }
}

private fun CarContext.icon(id: Int) = CarIcon.Builder(IconCompat.createWithResource(this, id)).build()
private fun CarContext.act(id: Int, f: () -> Unit) = Action.Builder().setIcon(icon(id)).setOnClickListener { f() }.build()
private fun CarContext.limit() = runCatching { getCarService(ConstraintManager::class.java).getContentLimit(ConstraintManager.CONTENT_LIMIT_TYPE_LIST) }.getOrDefault(6)
private fun CarContext.toast(id: Int) = CarToast.makeText(this, getString(id), CarToast.LENGTH_LONG).show()

class SalonCarScreen(cc: CarContext, private val pc: PlayerConn, private val r: SalonRenderer) : Screen(cc) {
    fun open(k: String) {
        when (k) {
            "radio", "tuner" -> screenManager.push(MenuScreen(carContext, pc))
            "cassettes" -> screenManager.push(StationsScreen(carContext, pc, carContext.getString(R.string.cassettes)) { Store.favs() })
            "news" -> screenManager.push(NewsScreen(carContext, pc))
            "window" -> screenManager.push(WeatherScreen(carContext))
            "tv" -> carContext.toast(R.string.tv_phone)
            "photos" -> carContext.toast(R.string.photos_phone)
            "lamp" -> { Store.setB("lamp", !Store.b("lamp", true)); r.kick() }
        }
    }

    override fun onGetTemplate(): Template {
        val strip = ActionStrip.Builder()
            .addAction(carContext.act(R.drawable.ic_list) { open("radio") })
            .addAction(carContext.act(R.drawable.ic_prev) { Crackle.play(); pc.prev() })
            .addAction(carContext.act(if (pc.playing) R.drawable.ic_pause else R.drawable.ic_play) { pc.toggle(); r.kick() })
            .addAction(carContext.act(R.drawable.ic_next) { Crackle.play(); pc.next() })
            .build()
        val map = ActionStrip.Builder().addAction(Action.PAN)
            .addAction(carContext.act(R.drawable.ic_heart) {
                pc.station?.let { Store.toggleFav(it); CarToast.makeText(carContext, (if (Store.isFav(it.id)) "♥ " else "♡ ") + it.name, CarToast.LENGTH_SHORT).show() }
            }).build()
        @Suppress("DEPRECATION")
        return NavigationTemplate.Builder().setActionStrip(strip).setMapActionStrip(map).build()
    }
}

class MenuScreen(cc: CarContext, private val pc: PlayerConn) : Screen(cc) {
    override fun onGetTemplate(): Template {
        fun row(t: String, f: () -> Unit) = Row.Builder().setTitle(t).setBrowsable(true).setOnClickListener { f() }.build()
        fun list(t: Int, load: suspend () -> List<Station>) = row(carContext.getString(t)) { screenManager.push(StationsScreen(carContext, pc, carContext.getString(t), load)) }
        val items = ItemList.Builder()
            .addItem(list(R.string.favorites) { Store.favs() })
            .addItem(list(R.string.lebanon) { Repo.byCountry("LB") })
            .addItem(list(R.string.recent) { Store.recents() })
            .addItem(list(R.string.featured) { Repo.featured() })
            .addItem(row(carContext.getString(R.string.news)) { screenManager.push(NewsScreen(carContext, pc)) })
            .addItem(row(carContext.getString(R.string.weather_l)) { screenManager.push(WeatherScreen(carContext)) })
            .build()
        @Suppress("DEPRECATION")
        return ListTemplate.Builder().setTitle(carContext.getString(R.string.radio_l)).setHeaderAction(Action.BACK).setSingleList(items).build()
    }
}

class StationsScreen(cc: CarContext, private val pc: PlayerConn, private val title: String, load: suspend () -> List<Station>) : Screen(cc) {
    private var list: List<Station>? = null
    init { lifecycleScope.launch { list = runCatching { load() }.getOrDefault(emptyList()); invalidate() } }

    override fun onGetTemplate(): Template {
        val b = ListTemplate.Builder().setTitle(title).setHeaderAction(Action.BACK)
        val l = list ?: return b.setLoading(true).build()
        val items = ItemList.Builder()
        if (l.isEmpty()) items.setNoItemsMessage(carContext.getString(R.string.empty))
        l.take(carContext.limit()).forEach { s ->
            items.addItem(Row.Builder().setTitle(s.name.ifBlank { "—" }).addText("${flag(s.cc)} ${s.country}".trim().ifBlank { " " })
                .setOnClickListener { Crackle.play(); pc.play(l, s); screenManager.popToRoot() }.build())
        }
        @Suppress("DEPRECATION")
        return b.setSingleList(items.build()).build()
    }
}

class NewsScreen(cc: CarContext, private val pc: PlayerConn) : Screen(cc) {
    private var list: List<Repo.Headline>? = null
    init { lifecycleScope.launch { list = runCatching { Repo.headlines() }.getOrDefault(emptyList()); invalidate() } }

    override fun onGetTemplate(): Template {
        val b = ListTemplate.Builder().setTitle(carContext.getString(R.string.news)).setHeaderAction(Action.BACK)
        val l = list ?: return b.setLoading(true).build()
        val items = ItemList.Builder()
            .addItem(Row.Builder().setTitle("🔊 " + carContext.getString(R.string.read_aloud)).setOnClickListener { pc.news(); screenManager.popToRoot() }.build())
        l.take(carContext.limit() - 1).forEach { h -> items.addItem(Row.Builder().setTitle(h.title).addText(h.source.ifBlank { " " }).build()) }
        @Suppress("DEPRECATION")
        return b.setSingleList(items.build()).build()
    }
}

class WeatherScreen(cc: CarContext) : Screen(cc) {
    private var beirut: Weather? = null
    init { lifecycleScope.launch { beirut = runCatching { Repo.weather(PlaybackService.LEB) }.getOrNull(); invalidate() } }

    override fun onGetTemplate(): Template {
        val w = Sky.weather
        val msg = listOfNotNull(w?.let { "${it.icon} ${it.temp}° ${it.place}" }, beirut?.let { "🇱🇧 ${it.place} ${it.icon} ${it.temp}°" })
            .joinToString("\n").ifBlank { "…" }
        return MessageTemplate.Builder(msg).setTitle(carContext.getString(R.string.weather_l)).setHeaderAction(Action.BACK).build()
    }
}

/** Draws the salon on the car's screen: the room, your frames, the weather in the window, the dots, the widgets and the tuner. */
class SalonRenderer(private val cc: CarContext, private val pc: PlayerConn) : SurfaceCallback {
    var onPlayingChanged: () -> Unit = {}
    var open: (String) -> Unit = {}
    @Volatile var carKmh: Int? = null
    private val main = Handler(Looper.getMainLooper())
    private val thread = HandlerThread("salon").apply { start() }
    private val h = Handler(thread.looper)
    @Volatile private var surface: SurfaceContainer? = null
    @Volatile private var visible = Rect()
    private var room: Bitmap? = null
    private var roomKey = ""
    private val photos = HashMap<String, Bitmap?>()
    @Volatile private var scrollX = -1f
    private var offX = 0f
    private var roomW = 0f
    private var tuner = RectF(); private var power = RectF()
    private var focus: String? = null
    private var focusAt = 0L
    private var wasPlaying = false
    private var dp = 2f

    private val tick = object : Runnable {
        override fun run() { render(); h.postDelayed(this, 1000) }
    }

    fun kick() { h.post { render() } }
    fun stop() { h.removeCallbacksAndMessages(null); thread.quitSafely() }

    override fun onSurfaceAvailable(c: SurfaceContainer) {
        surface = c; dp = c.dpi / 160f; visible = Rect(0, 0, c.width, c.height)
        h.removeCallbacks(tick); h.post(tick)
    }
    override fun onVisibleAreaChanged(r: Rect) { visible = Rect(r); kick() }
    override fun onStableAreaChanged(r: Rect) {}
    override fun onSurfaceDestroyed(c: SurfaceContainer) { surface = null; h.removeCallbacks(tick) }
    override fun onScroll(dx: Float, dy: Float) { scrollX += dx; kick() }
    override fun onFling(vx: Float, vy: Float) { scrollX -= vx / 6; kick() }

    override fun onClick(x: Float, y: Float) {
        h.post {
            if (power.contains(x, y)) { main.post { pc.toggle() }; return@post }
            if (tuner.contains(x, y)) { main.post { open("tuner") }; return@post }
            val era = Salon.era(); val sc = Sky.scene(); val H = (surface?.height ?: return@post).toFloat()
            val hit = HOTSPOTS.map { it.first }.filter { !(Store.b("visitor") && it == "photos") }.mapNotNull { k ->
                (Store.pos(era.id, k) ?: era.spot(k, sc))?.let { (px, py) -> k to hypot(offX + px / 100 * roomW - x, py / 100 * H - y) }
            }.minByOrNull { it.second }?.takeIf { it.second < 48 * dp }?.first
            if (hit == null) focus = null
            else if (focus == hit) { focus = null; main.post { open(hit) } }
            else { focus = hit; focusAt = System.currentTimeMillis() }
            render()
        }
    }

    private fun decode(bytes: ByteArray, maxH: Int): Bitmap? {
        val o = BitmapFactory.Options().apply { inJustDecodeBounds = true }
        BitmapFactory.decodeByteArray(bytes, 0, bytes.size, o)
        var s = 1; while (o.outHeight / (s * 2) >= maxH) s *= 2
        return BitmapFactory.decodeByteArray(bytes, 0, bytes.size, BitmapFactory.Options().apply { inSampleSize = s })
    }

    private fun photo(f: File): Bitmap? = photos.getOrPut(f.name) { runCatching { decode(f.readBytes(), 300) }.getOrNull() }

    private val fill = Paint(Paint.FILTER_BITMAP_FLAG or Paint.ANTI_ALIAS_FLAG)
    private val txt = TextPaint(Paint.ANTI_ALIAS_FLAG)

    private fun pill(c: Canvas, x: Float, y: Float, text: String, size: Float = 18f): Float {
        txt.textSize = size * dp; txt.typeface = Wall.body; txt.color = 0xFFEADFCB.toInt()
        val w = txt.measureText(text) + 28 * dp; val hh = 40 * dp
        val r = RectF(x, y, x + w, y + hh)
        c.drawRoundRect(r, hh / 2, hh / 2, Paint(Paint.ANTI_ALIAS_FLAG).apply { color = 0xD917120E.toInt() })
        c.drawRoundRect(r, hh / 2, hh / 2, Paint(Paint.ANTI_ALIAS_FLAG).apply { style = Paint.Style.STROKE; strokeWidth = dp; color = 0x80C9A45C.toInt() })
        c.drawText(text, x + 14 * dp, y + hh / 2 - (txt.ascent() + txt.descent()) / 2, txt)
        return w
    }

    private fun render() {
        val sc0 = surface ?: return
        val s = sc0.surface ?: return
        if (!s.isValid) return
        if (pc.playing != wasPlaying) { wasPlaying = pc.playing; main.post(onPlayingChanged) }
        if (focus != null && System.currentTimeMillis() - focusAt > 5000) focus = null
        val era = Salon.era(); val sc = Sky.scene()
        val key = era.id + sc + Store.s("myroom")
        if (key != roomKey) { room = runCatching { decode(Salon.bytes(era, sc), sc0.height) }.getOrNull(); roomKey = key; scrollX = -1f }
        val c = runCatching { s.lockCanvas(null) }.getOrNull() ?: return
        try { draw(c, era, sc) } finally { runCatching { s.unlockCanvasAndPost(c) } }
    }

    private fun draw(c: Canvas, era: Era, sc: String) {
        val W = c.width.toFloat(); val H = c.height.toFloat()
        c.drawColor(0xFF17120E.toInt())
        room?.let { r ->
            roomW = r.width * (H / r.height)
            val maxS = max(0f, roomW - W)
            if (scrollX < 0) scrollX = ((era.spot("radio", sc)?.first ?: 50f) / 100 * roomW - W / 2).coerceIn(0f, maxS)
            scrollX = scrollX.coerceIn(0f, maxS)
            offX = if (roomW < W) (W - roomW) / 2 else -scrollX
            c.drawBitmap(r, null, RectF(offX, 0f, offX + roomW, H), fill)
            val px = era.px[sc] ?: era.px.values.firstOrNull() ?: (1f to 1f)
            fun sx(p: Float) = offX + p / px.first * roomW
            fun sy(p: Float) = p / px.second * H
            // your pictures in the frames
            if (!Store.b("visitor")) era.frames[sc].orEmpty().forEachIndexed { i, q ->
                Store.framePhoto(era.id, i)?.let { photo(it) }?.let { b ->
                    val dst = RectF(sx(q.minOf { it.first }), sy(q.minOf { it.second }), sx(q.maxOf { it.first }), sy(q.maxOf { it.second }))
                    val k = max(dst.width() / b.width, dst.height() / b.height)
                    val cw = dst.width() / k; val ch = dst.height() / k
                    val src = Rect(((b.width - cw) / 2).toInt(), ((b.height - ch) / 2).toInt(), ((b.width + cw) / 2).toInt(), ((b.height + ch) / 2).toInt())
                    c.drawBitmap(b, src, dst, fill)
                }
            }
            // the real weather through the window
            era.glass[sc]?.let { g ->
                val rr = RectF(offX + g[0] / 100 * roomW, g[1] / 100 * H, offX + g[2] / 100 * roomW, g[3] / 100 * H)
                c.save(); c.clipRect(rr); c.translate(rr.left, rr.top)
                Wall.effects(c, rr.width().toInt().coerceAtLeast(1), rr.height().toInt().coerceAtLeast(1), Wall.scene(Sky.weather)); c.restore()
            }
            if (sc == "night" && !Store.b("lamp", true)) c.drawColor(Color.argb(115, 0, 0, 0))
            // the radio glows while it plays
            if (pc.playing) (Store.pos(era.id, "radio") ?: era.spot("radio", sc))?.let { (x, y) ->
                val cx = offX + x / 100 * roomW; val cy = y / 100 * H
                c.drawCircle(cx, cy, 110 * dp, Paint().apply { shader = RadialGradient(cx, cy, 110 * dp, Color.argb(140, 217, 164, 65), Color.TRANSPARENT, Shader.TileMode.CLAMP) })
            }
            // the dots: tap once for the name, twice to open
            HOTSPOTS.filter { !(Store.b("visitor") && it.first == "photos") }.forEach { (k, label) ->
                (Store.pos(era.id, k) ?: era.spot(k, sc))?.let { (x, y) ->
                    val cx = offX + x / 100 * roomW; val cy = y / 100 * H
                    if (cx < -20 || cx > W + 20) return@let
                    val on = focus == k
                    c.drawCircle(cx, cy, (if (on) 20 else 14) * dp, Paint(Paint.ANTI_ALIAS_FLAG).apply {
                        shader = RadialGradient(cx, cy, (if (on) 20 else 14) * dp, Color.argb(if (on) 170 else 110, 255, 255, 255), Color.TRANSPARENT, Shader.TileMode.CLAMP) })
                    c.drawCircle(cx, cy, 6 * dp, Paint(Paint.ANTI_ALIAS_FLAG).apply { color = Color.argb(235, 255, 255, 255) })
                    if (on) {
                        val name = Store.s("lbl_$k")?.ifBlank { null } ?: cc.getString(label)
                        txt.textSize = 16 * dp; txt.typeface = Wall.body
                        val tw = txt.measureText(name) + 24 * dp; val r2 = RectF(cx - tw / 2, cy + 14 * dp, cx + tw / 2, cy + 44 * dp)
                        c.drawRoundRect(r2, 15 * dp, 15 * dp, Paint(Paint.ANTI_ALIAS_FLAG).apply { color = 0xEBF2E8D5.toInt() })
                        txt.color = 0xFF231A12.toInt(); c.drawText(name, r2.left + 12 * dp, r2.centerY() - (txt.ascent() + txt.descent()) / 2, txt)
                    }
                }
            }
        }
        // widgets: clock & date, weather, speed
        val v = if (visible.isEmpty) Rect(0, 0, W.toInt(), H.toInt()) else visible
        val loc = Locale(currentLang()); val now = Date()
        var x = v.left + 16 * dp; val y = v.top + 16 * dp
        x += pill(c, x, y, SimpleDateFormat("HH:mm", loc).format(now) + "  ·  " + SimpleDateFormat("EEE d MMM", loc).format(now)) + 8 * dp
        Sky.weather?.let { w -> x += pill(c, x, y, "${w.icon} ${w.temp}° ${w.place}") + 8 * dp }
        (carKmh ?: Speed.kmh)?.let { k -> pill(c, x, y, "$k km/h") }
        // the wooden tuner
        val bh = 76 * dp
        tuner = RectF(v.left + 16 * dp, v.bottom - 16 * dp - bh, v.right - 16 * dp, v.bottom - 16 * dp)
        c.drawRoundRect(tuner, 26 * dp, 26 * dp, Paint(Paint.ANTI_ALIAS_FLAG).apply {
            shader = LinearGradient(tuner.left, 0f, tuner.right, 0f, intArrayOf(0xFF3A2A1C.toInt(), 0xFF5A4028.toInt(), 0xFF3E2C1D.toInt(), 0xFF56402A.toInt()), null, Shader.TileMode.CLAMP) })
        val pr = bh / 2 - 8 * dp
        power = RectF(tuner.right - 10 * dp - 2 * pr, tuner.centerY() - pr, tuner.right - 10 * dp, tuner.centerY() + pr)
        val pill = RectF(tuner.left + 10 * dp, tuner.top + 9 * dp, power.left - 12 * dp, tuner.bottom - 9 * dp)
        c.drawRoundRect(pill, 14 * dp, 14 * dp, Paint(Paint.ANTI_ALIAS_FLAG).apply {
            shader = LinearGradient(0f, pill.top, 0f, pill.bottom, 0xFFF6EBCF.toInt(), 0xFFE6CF93.toInt(), Shader.TileMode.CLAMP) })
        c.drawCircle(pill.left + 18 * dp, pill.centerY(), 6 * dp, Paint(Paint.ANTI_ALIAS_FLAG).apply { color = if (pc.playing) 0xFFC2452F.toInt() else 0xFF8C7F6A.toInt() })
        val tx = pill.left + 34 * dp; val avail = pill.right - tx - 12 * dp
        txt.color = 0xFF231A12.toInt(); txt.typeface = Wall.display; txt.textSize = 24 * dp
        val title = pc.name.ifBlank { cc.getString(R.string.app_name) }
        val sub = pc.sub
        c.drawText(TextUtils.ellipsize(title, txt, avail, TextUtils.TruncateAt.END).toString(), tx, if (sub.isBlank()) pill.centerY() + 8 * dp else pill.centerY() - 2 * dp, txt)
        if (sub.isNotBlank()) {
            txt.typeface = Wall.body; txt.textSize = 14 * dp; txt.color = 0xA6231A12.toInt()
            c.drawText(TextUtils.ellipsize(sub, txt, avail, TextUtils.TruncateAt.END).toString(), tx, pill.centerY() + 18 * dp, txt)
        }
        c.drawCircle(power.centerX(), power.centerY(), pr, Paint(Paint.ANTI_ALIAS_FLAG).apply {
            shader = RadialGradient(power.centerX() - pr / 3, power.centerY() - pr / 3, pr * 1.4f, intArrayOf(0xFFF3DC9C.toInt(), 0xFFC9A45C.toInt(), 0xFF8C6A2E.toInt()), null, Shader.TileMode.CLAMP) })
        val ink = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = 0xFF231A12.toInt(); style = Paint.Style.STROKE; strokeWidth = 3 * dp; strokeCap = Paint.Cap.ROUND }
        val ir = pr * .42f
        c.drawArc(RectF(power.centerX() - ir, power.centerY() - ir, power.centerX() + ir, power.centerY() + ir), -60f, 300f, false, ink)
        c.drawLine(power.centerX(), power.centerY() - ir * 1.25f, power.centerX(), power.centerY() - ir * .2f, ink)
    }
}
