package com.mawja.radio

import android.content.Context
import android.location.Geocoder
import android.location.LocationManager
import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioTrack
import android.view.ViewGroup
import android.webkit.WebView
import androidx.appcompat.app.AppCompatDelegate
import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectHorizontalDragGestures
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import coil.compose.AsyncImage
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.time.LocalDateTime
import java.time.LocalTime
import java.util.Date
import java.util.Locale
import kotlin.math.max
import kotlin.math.roundToInt
import kotlin.random.Random

// ---------------------------------------------------------------- the website's salon, room by room

typealias Pt = Pair<Float, Float>

/** One living room from the website: its photos and where each object sits ([day, night, sunset]). */
class Era(
    val id: String, val base: String, private val spots: Map<String, List<Pt?>>, val px: Map<String, Pt>,
    val tv: Map<String, List<Pt>>, val frames: Map<String, List<List<Pt>>>, val glass: Map<String, List<Float>>
) {
    fun spot(k: String, scene: String): Pt? = spots[k]?.getOrNull(Salon.SI[scene] ?: 0)
    val modern get() = id.startsWith("26")
}

object Salon {
    val SI = mapOf("day" to 0, "night" to 1, "sunset" to 2)
    val ORDER = listOf("80s", "80sh", "90s", "90sh", "00s", "00sh", "26", "26h")
    private fun pt(a: JSONArray) = a.getDouble(0).toFloat() to a.getDouble(1).toFloat()
    val eras: Map<String, Era> by lazy {
        val o = JSONObject(Store.ctx.assets.open("salon.json").bufferedReader().readText())
        o.keys().asSequence().associateWith { id ->
            val e = o.getJSONObject(id)
            fun <T> per(k: String, f: (Any) -> T): Map<String, T> = e.getJSONObject(k).let { m -> m.keys().asSequence().associateWith { f(m.get(it)) } }
            val sp = e.getJSONObject("spots").let { m ->
                m.keys().asSequence().associateWith { k -> m.getJSONArray(k).let { a -> (0 until a.length()).map { i -> a.optJSONArray(i)?.let(::pt) } } }
            }
            Era(id, e.getString("base"), sp,
                per("px") { pt(it as JSONArray) },
                per("tv") { a -> (a as JSONArray).let { q -> (0 until q.length()).map { pt(q.getJSONArray(it)) } } },
                per("frames") { a -> (a as JSONArray).let { fs -> (0 until fs.length()).map { i -> fs.getJSONArray(i).let { q -> (0 until q.length()).map { pt(q.getJSONArray(it)) } } } } },
                per("glass") { a -> (a as JSONArray).let { g -> (0 until g.length()).map { g.getDouble(it).toFloat() } } })
        }
    }
    fun era(): Era = eras[Store.s("era") ?: "90s"] ?: eras.getValue("90s")
    fun image(e: Era, scene: String) = Repo.SITE + e.base + scene + ".jpg"
}

/** Day / sunset / night from the real sunrise and sunset where the phone is (GPS), plus the local weather. */
object Sky {
    var weather by mutableStateOf<Weather?>(null)

    fun scene(): String {
        val t = LocalTime.now(); val m = t.hour * 60 + t.minute
        val rise = Store.i("rise", 6 * 60); val set = Store.i("set", 18 * 60)
        return when {
            m in (set - 45)..(set + 30) || m in (rise - 30)..(rise + 20) -> "sunset"
            m in rise..set -> "day"
            else -> "night"
        }
    }

    suspend fun refresh(ctx: Context) = withContext(Dispatchers.IO) {
        val loc = runCatching {
            val lm = ctx.getSystemService(LocationManager::class.java)
            listOf(LocationManager.NETWORK_PROVIDER, LocationManager.GPS_PROVIDER, LocationManager.PASSIVE_PROVIDER)
                .mapNotNull { runCatching { lm.getLastKnownLocation(it) }.getOrNull() }.maxByOrNull { it.time }
        }.getOrNull()
        val lat = loc?.latitude ?: 33.89; val lon = loc?.longitude ?: 35.50
        val j = JSONObject(Repo.get("https://api.open-meteo.com/v1/forecast?latitude=$lat&longitude=$lon" +
            "&current=temperature_2m,weather_code,is_day&daily=sunrise,sunset&timezone=auto&forecast_days=1"))
        val d = j.getJSONObject("daily")
        fun mins(k: String) = LocalDateTime.parse(d.getJSONArray(k).getString(0)).let { it.hour * 60 + it.minute }
        Store.setI("rise", mins("sunrise")); Store.setI("set", mins("sunset"))
        val c = j.getJSONObject("current"); val code = c.optInt("weather_code")
        @Suppress("DEPRECATION")
        val place = loc?.let { runCatching { Geocoder(ctx, Locale.getDefault()).getFromLocation(lat, lon, 1)?.firstOrNull()?.locality }.getOrNull() } ?: "Beirut"
        val w = Weather(place, c.optDouble("temperature_2m").roundToInt(), Repo.icon(code), code, c.optInt("is_day", 1) == 1)
        withContext(Dispatchers.Main) { weather = w }
    }
}

/** A short burst of radio static while turning the dial. */
object Crackle {
    fun play() = Thread {
        runCatching {
            val sr = 22050; val n = sr / 4
            val buf = ShortArray(n) { (Random.nextInt(-5000, 5000) * (1 - it / n.toFloat())).toInt().toShort() }
            val t = AudioTrack.Builder()
                .setAudioAttributes(AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_MEDIA).setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build())
                .setAudioFormat(AudioFormat.Builder().setEncoding(AudioFormat.ENCODING_PCM_16BIT).setSampleRate(sr).setChannelMask(AudioFormat.CHANNEL_OUT_MONO).build())
                .setBufferSizeInBytes(n * 2).setTransferMode(AudioTrack.MODE_STATIC).build()
            t.write(buf, 0, n); t.play(); Thread.sleep(400); t.release()
        }
    }.start()
}

// ---------------------------------------------------------------- colors of the house

val WALNUT = Color(0xFF17120E); val WALL = Color(0xFF221B15); val WALL2 = Color(0xFF2B221A)
val STONE = Color(0xFFEADFCB); val STONE_DIM = Color(0xFFAA9C87); val OCHRE = Color(0xFFD9A441)
val BRASS = Color(0xFFC9A45C); val BRICK = Color(0xFFC2452F); val CREAM = Color(0xFFF2E8D5); val INK = Color(0xFF231A12)
private val GOLD = Brush.radialGradient(listOf(Color(0xFFF3DC9C), Color(0xFFC9A45C), Color(0xFF8C6A2E)))
private val WOOD = Brush.horizontalGradient(listOf(Color(0xFF3A2A1C), Color(0xFF5A4028), Color(0xFF3E2C1D), Color(0xFF56402A), Color(0xFF3A2A1C)))

// ---------------------------------------------------------------- the screen

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SalonScreen(pc: PlayerConn) {
    val ctx = LocalContext.current
    val scope = rememberCoroutineScope()
    val rev = Store.rev.intValue
    val era = remember(rev) { Salon.era() }
    val scene by produceState(Sky.scene(), rev) { while (true) { value = Sky.scene(); delay(60_000) } }
    var drawer by remember { mutableStateOf<String?>(null) }
    var radioTab by rememberSaveable { mutableStateOf("LB") }
    var tvList by remember { mutableStateOf<String?>(null) }
    var full by remember { mutableStateOf(false) }
    var drive by remember { mutableStateOf(false) }
    val moving = (Speed.kmh ?: 0) > 10
    LaunchedEffect(Unit) { while (true) { runCatching { Sky.refresh(ctx) }; delay(15 * 60_000L) } }
    val surprise: () -> Unit = {
        scope.launch {
            val l = runCatching { Repo.byCountry("LB") }.getOrNull().orEmpty()
            l.randomOrNull()?.let { Crackle.play(); pc.play(l, it) }
        }
    }

    if (drive) { Drive(pc) { drive = false }; return }

    BoxWithConstraints(Modifier.fillMaxSize().background(WALNUT)) {
        val size = era.px[scene] ?: era.px.getValue("day")
        val h = maxHeight; val w = h * (size.first / size.second)
        val scroll = rememberScrollState()
        val dens = LocalDensity.current
        val viewW = maxWidth
        LaunchedEffect(era.id, scene) {
            val rx = era.spot("radio", scene)?.first ?: 50f
            with(dens) { scroll.scrollTo(((w.toPx() * rx / 100f) - viewW.toPx() / 2).roundToInt().coerceAtLeast(0)) }
        }
        fun x(p: Float) = w * (p / 100f); fun y(p: Float) = h * (p / 100f)
        fun px(p: Pt) = w * (p.first / size.first) to h * (p.second / size.second)

        Box(Modifier.fillMaxHeight().horizontalScroll(scroll)) {
            Box(Modifier.size(w, h)) {
                AsyncImage(Salon.image(era, scene), null, Modifier.fillMaxSize(), contentScale = ContentScale.FillBounds)
                // your photos in the wall frames
                val photos = remember(rev) { Store.gallery() }
                era.frames[scene].orEmpty().forEachIndexed { i, q ->
                    photos.getOrNull(i)?.let { f ->
                        val a = px(q.minOf { it.first } to q.minOf { it.second }); val b = px(q.maxOf { it.first } to q.maxOf { it.second })
                        AsyncImage(f, null, Modifier.offset(a.first, a.second).size(b.first - a.first, b.second - a.second), contentScale = ContentScale.Crop)
                    }
                }
                // the window shows the real weather outside
                era.glass[scene]?.let { g ->
                    WindowWeather(Modifier.offset(x(g[0]), y(g[1])).size(x(g[2] - g[0]), y(g[3] - g[1])), Sky.weather)
                }
                // night: the lamp lights the room or it stays dim
                val lampOn = Store.b("lamp", true)
                if (scene == "night") {
                    if (!lampOn) Box(Modifier.fillMaxSize().background(Color.Black.copy(alpha = .45f)))
                    else era.spot("lamp", scene)?.let { (lx, ly) ->
                        Glow(Modifier.offset(x(lx) - w * .25f, y(ly) - w * .25f).size(w * .5f), Color(0x55FFC870))
                    }
                }
                // the radio glows while it plays
                if (pc.playing) era.spot("radio", scene)?.let { (rx, ry) ->
                    val t by rememberInfiniteTransition(label = "glow").animateFloat(.35f, .8f, infiniteRepeatable(tween(1400), RepeatMode.Reverse), label = "a")
                    Glow(Modifier.offset(x(rx) - 90.dp, y(ry) - 90.dp).size(180.dp), OCHRE.copy(alpha = t))
                }
                // the TV on the wall plays the channels
                val tvq = era.tv[scene]
                if (tvList != null && !moving && tvq != null && !full) {
                    val a = px(tvq.minOf { it.first } to tvq.minOf { it.second }); val b = px(tvq.maxOf { it.first } to tvq.maxOf { it.second })
                    Box(Modifier.offset(a.first, a.second).size(b.first - a.first, b.second - a.second).background(Color.Black)) {
                        YouTubeView(tvList!!, Modifier.fillMaxSize())
                        Row(Modifier.align(Alignment.TopEnd)) {
                            MiniBtn(Icons.Default.Fullscreen) { full = true }
                            MiniBtn(Icons.Default.Close) { tvList = null }
                        }
                    }
                }
                // the hotspots, as on the website
                listOf("radio" to R.string.radio_l, "tv" to R.string.tv, "news" to R.string.news, "window" to R.string.weather_l,
                    "photos" to R.string.photos, "cassettes" to R.string.cassettes, "lamp" to R.string.lamp).forEach { (k, label) ->
                    era.spot(k, scene)?.let { (sx, sy) ->
                        Hotspot(Modifier.offset(x(sx) - 60.dp, y(sy) - 14.dp), stringResource(label)) {
                            if (k == "lamp") Store.setB("lamp", !lampOn) else drawer = k
                        }
                    }
                }
            }
        }

        TopBar(Modifier.align(Alignment.TopCenter), surprise, { drawer = "era" }, { drawer = "window" })

        Column(Modifier.align(Alignment.BottomCenter)) {
            Tuner(pc, onHome = { drawer = null }, onPill = { drawer = "radio" }, surprise = surprise)
            Spacer(Modifier.height(8.dp))
            Tabs { drawer = it }
        }
    }

    if (full && tvList != null) YouTube(tvList!!) { full = false }

    drawer?.let { d ->
        ModalBottomSheet(onDismissRequest = { drawer = null }, containerColor = Color(0xFF1B140F), contentColor = STONE,
            sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)) {
            Box(Modifier.fillMaxHeight(.82f)) {
                when (d) {
                    "radio" -> RadioDrawer(pc, era.modern, radioTab) { radioTab = it }
                    "tv" -> TvDrawer(moving) { pc.pause(); tvList = it; drawer = null }
                    "news" -> Newspaper()
                    "window" -> WeatherCard()
                    "photos" -> Photos(rev)
                    "cassettes" -> Cassettes(pc)
                    "era" -> EraPicker { Store.setS("era", it); PlaybackService.instance?.refreshWall(false); drawer = null }
                    else -> More(pc, { radioTab = it; drawer = "radio" }, { drawer = "era" }) { drawer = null; drive = true }
                }
            }
        }
    }
}

@Composable
fun Glow(m: Modifier, c: Color) = Box(m.background(Brush.radialGradient(listOf(c, Color.Transparent)), CircleShape))

@Composable
fun MiniBtn(icon: androidx.compose.ui.graphics.vector.ImageVector, onClick: () -> Unit) =
    IconButton(onClick, Modifier.size(32.dp).padding(2.dp).background(Color.Black.copy(alpha = .55f), CircleShape)) {
        Icon(icon, null, tint = Color.White, modifier = Modifier.size(18.dp))
    }

@Composable
fun Hotspot(m: Modifier, label: String, onClick: () -> Unit) {
    val t by rememberInfiniteTransition(label = "dot").animateFloat(.5f, 1f, infiniteRepeatable(tween(1600), RepeatMode.Reverse), label = "d")
    Column(m.width(120.dp).clickable(onClick = onClick), horizontalAlignment = Alignment.CenterHorizontally) {
        Box(Modifier.size(28.dp), contentAlignment = Alignment.Center) {
            Glow(Modifier.size(28.dp), Color.White.copy(alpha = .35f * t))
            Box(Modifier.size(12.dp).background(Color.White.copy(alpha = .9f), CircleShape).border(2.dp, Color.White.copy(alpha = .5f), CircleShape))
        }
        Text(label, Modifier.background(CREAM.copy(alpha = .92f), RoundedCornerShape(50)).padding(horizontal = 10.dp, vertical = 2.dp),
            color = INK, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, maxLines = 1)
    }
}

/** Rain, snow, fog, stars or sun through the glass, matching the weather where you are. */
@Composable
fun WindowWeather(m: Modifier, w: Weather?) {
    val fx = Wall.scene(w)
    val time by produceState(0f) { val start = System.nanoTime(); while (true) { withFrameNanos { value = (it - start) / 1e9f } } }
    val drops = remember { List(90) { Random.nextFloat() to Random.nextFloat() } }
    Canvas(m) {
        when (fx) {
            "rain", "storm" -> {
                drawRect(Color(0x33081428))
                drops.forEach { (dx, dy) ->
                    val yy = ((dy + time * 1.3f) % 1f) * size.height; val xx = dx * size.width
                    drawLine(Color(0x99DDE6FF), Offset(xx, yy), Offset(xx - 4f, yy + size.height / 14), 2f, StrokeCap.Round)
                }
                if (fx == "storm" && (time % 6f) < .12f) drawRect(Color(0x66FFFFFF))
            }
            "snow" -> drops.forEach { (dx, dy) ->
                val yy = ((dy + time * .12f) % 1f) * size.height; val xx = (dx + .02f * kotlin.math.sin(time + dy * 9)) * size.width
                drawCircle(Color(0xDDFFFFFF), 3f + dx * 3f, Offset(xx, yy))
            }
            "fog" -> drawRect(Color(0x66E6E6EB))
            "clouds" -> drawRect(Color(0x26788296))
            "night" -> drops.take(25).forEach { (dx, dy) ->
                drawCircle(Color.White.copy(alpha = .4f + .4f * kotlin.math.abs(kotlin.math.sin(time + dx * 7))), 1.6f, Offset(dx * size.width, dy * size.height * .5f))
            }
            else -> drawRect(Brush.radialGradient(listOf(Color(0x44FFD27A), Color.Transparent), Offset(size.width * .8f, 0f), size.width))
        }
    }
}

@Composable
fun Arches(m: Modifier, c: Color) = Canvas(m) {
    val aw = size.width / 3.4f; val gap = (size.width - aw * 3) / 2
    for (k in 0..2) {
        val x0 = k * (aw + gap)
        val p = androidx.compose.ui.graphics.Path().apply {
            moveTo(x0, size.height); lineTo(x0, size.height * .35f)
            cubicTo(x0, size.height * .05f, x0 + aw, size.height * .05f, x0 + aw, size.height * .35f); lineTo(x0 + aw, size.height); close()
        }
        drawPath(p, c)
    }
}

@Composable
fun RoundBtn(m: Modifier = Modifier, onClick: () -> Unit, content: @Composable () -> Unit) =
    Box(m.size(52.dp).clip(CircleShape).background(WALNUT.copy(alpha = .8f)).border(1.dp, BRASS.copy(alpha = .45f), CircleShape).clickable(onClick = onClick),
        contentAlignment = Alignment.Center) { content() }

@Composable
fun TopBar(m: Modifier, surprise: () -> Unit, era: () -> Unit, weather: () -> Unit) {
    val lang = currentLang()
    val now by produceState(Date()) { while (true) { delay(20_000); value = Date() } }
    Column(m.fillMaxWidth().safeDrawingPadding().padding(horizontal = 16.dp, vertical = 8.dp), horizontalAlignment = Alignment.CenterHorizontally) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Row(Modifier.clip(RoundedCornerShape(50)).background(WALNUT.copy(alpha = .8f)).border(1.dp, BRASS.copy(alpha = .45f), RoundedCornerShape(50)).padding(4.dp)) {
                listOf("pt" to "PT", "fr" to "FR", "en" to "EN", "ar" to "عربي").forEach { (tag, label) ->
                    val on = lang == tag
                    Text(label, Modifier.clip(RoundedCornerShape(50)).background(if (on) Color(0xFFE2C27A) else Color.Transparent)
                        .clickable { AppCompatDelegate.setApplicationLocales(androidx.core.os.LocaleListCompat.forLanguageTags(tag)) }
                        .padding(horizontal = 12.dp, vertical = 8.dp), color = if (on) INK else STONE_DIM, fontWeight = FontWeight.SemiBold)
                }
            }
            Spacer(Modifier.width(10.dp))
            RoundBtn(onClick = { Store.setI("aa", (Store.i("aa") + 1) % 3) }) { Text("Aa", color = STONE, fontWeight = FontWeight.Bold) }
            Spacer(Modifier.weight(1f))
            RoundBtn(onClick = surprise) { Text("🎲", fontSize = 22.sp) }
            Spacer(Modifier.width(12.dp))
            Arches(Modifier.size(52.dp, 40.dp).clickable(onClick = era), BRASS)
        }
        // the clock & date and weather widgets
        Row(Modifier.padding(top = 10.dp), Arrangement.spacedBy(8.dp)) {
            val loc = Locale(lang)
            Pill { Text(SimpleDateFormat("HH:mm", loc).format(now) + "  ·  " + SimpleDateFormat("EEE d MMM", loc).format(now), color = STONE) }
            Sky.weather?.let { w -> Pill(weather) { Text("${w.icon} ${w.temp}° ${w.place}", color = STONE, maxLines = 1) } }
        }
    }
}

@Composable
fun Pill(onClick: (() -> Unit)? = null, content: @Composable () -> Unit) =
    Box(Modifier.clip(RoundedCornerShape(50)).background(WALNUT.copy(alpha = .8f)).border(1.dp, BRASS.copy(alpha = .4f), RoundedCornerShape(50))
        .then(if (onClick != null) Modifier.clickable(onClick = onClick) else Modifier).padding(horizontal = 14.dp, vertical = 8.dp)) { content() }

/** The wooden tuner bar from the website: salon, ‹ ›, the station pill (swipe to tune) and the power button. */
@Composable
fun Tuner(pc: PlayerConn, onHome: () -> Unit, onPill: () -> Unit, surprise: () -> Unit) {
    Row(Modifier.fillMaxWidth().padding(horizontal = 12.dp).clip(RoundedCornerShape(30.dp)).background(WOOD)
        .border(1.dp, BRASS.copy(alpha = .35f), RoundedCornerShape(30.dp)).padding(8.dp), verticalAlignment = Alignment.CenterVertically) {
        Column(Modifier.clickable(onClick = onHome).padding(horizontal = 8.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Icon(Icons.Default.Home, null, tint = Color(0xFFE2C27A))
            Text(stringResource(R.string.salon), color = STONE, fontSize = 11.sp)
        }
        Box(Modifier.width(1.dp).height(36.dp).background(BRASS.copy(alpha = .3f)))
        IconButton({ Crackle.play(); pc.prev() }) { Icon(Icons.Default.ChevronLeft, null, tint = STONE) }
        IconButton({ Crackle.play(); pc.next() }) { Icon(Icons.Default.ChevronRight, null, tint = STONE) }
        var drag by remember { mutableFloatStateOf(0f) }
        Row(Modifier.weight(1f).height(52.dp).clip(RoundedCornerShape(14.dp))
            .background(Brush.verticalGradient(listOf(Color(0xFFF6EBCF), Color(0xFFE6CF93)))).border(1.dp, Color(0xFFB8964E), RoundedCornerShape(14.dp))
            .pointerInput(Unit) {
                detectHorizontalDragGestures(onDragEnd = {
                    if (drag > 60) { Crackle.play(); pc.prev() } else if (drag < -60) { Crackle.play(); pc.next() }
                    drag = 0f
                }) { _, dx -> drag += dx }
            }.clickable(onClick = onPill).padding(horizontal = 14.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(Modifier.size(10.dp).background(if (pc.playing) BRICK else Color(0xFF8C7F6A), CircleShape))
            Column(Modifier.padding(start = 10.dp)) {
                Text(pc.name.ifEmpty { stringResource(R.string.app_name) }, fontFamily = Lalezar, fontSize = 19.sp, color = INK, maxLines = 1, overflow = TextOverflow.Ellipsis)
                if (pc.sub.isNotBlank()) Text(pc.sub, fontSize = 11.sp, color = INK.copy(alpha = .65f), maxLines = 1, overflow = TextOverflow.Ellipsis)
            }
        }
        Spacer(Modifier.width(8.dp))
        Box(Modifier.size(58.dp).clip(CircleShape).background(GOLD).border(2.dp, Color(0xFF8C6A2E), CircleShape)
            .clickable { if (pc.name.isEmpty()) surprise() else pc.toggle() }, contentAlignment = Alignment.Center) {
            Icon(Icons.Default.PowerSettingsNew, null, tint = INK, modifier = Modifier.size(30.dp))
        }
    }
}

@Composable
fun Tabs(open: (String) -> Unit) {
    Row(Modifier.fillMaxWidth().background(WALNUT).navigationBarsPadding().padding(vertical = 8.dp), Arrangement.SpaceEvenly) {
        listOf(Triple("radio", "📻", R.string.radio_l), Triple("tv", "📺", R.string.tv), Triple("news", "📰", R.string.news), Triple("more", "☰", R.string.more))
            .forEach { (k, icon, label) ->
                Column(Modifier.clickable { open(k) }.padding(horizontal = 12.dp, vertical = 4.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(icon, fontSize = 26.sp, color = STONE)
                    Text(stringResource(label), color = STONE, fontSize = 13.sp)
                }
            }
    }
}

// ---------------------------------------------------------------- drawers

@Composable
fun DrawerTitle(t: String) = Text(t, Modifier.fillMaxWidth().padding(16.dp, 4.dp, 16.dp, 12.dp), fontFamily = Lalezar, fontSize = 26.sp, color = Color(0xFFE2C27A))

@OptIn(androidx.compose.foundation.layout.ExperimentalLayoutApi::class)
@Composable
fun RadioDrawer(pc: PlayerConn, modern: Boolean, tab: String, setTab: (String) -> Unit) {
    var query by rememberSaveable { mutableStateOf("") }
    var country by remember { mutableStateOf<Country?>(null) }
    val rev = Store.rev.intValue
    Column {
        DrawerTitle("📻 " + stringResource(R.string.radio_l))
        Row(Modifier.horizontalScroll(rememberScrollState()).padding(horizontal = 12.dp), Arrangement.spacedBy(6.dp)) {
            listOf("LB" to R.string.lebanon, "feat" to R.string.featured, "fav" to R.string.favorites, "rec" to R.string.recent,
                "world" to R.string.world, "search" to R.string.search).forEach { (k, l) ->
                FilterChip(tab == k, { setTab(k); country = null }, { Text(stringResource(l)) },
                    colors = FilterChipDefaults.filterChipColors(selectedContainerColor = Color(0xFFE2C27A), selectedLabelColor = INK, labelColor = STONE))
            }
        }
        if (tab == "search") OutlinedTextField(query, { query = it }, Modifier.fillMaxWidth().padding(12.dp), singleLine = true,
            leadingIcon = { Icon(Icons.Default.Search, null) }, placeholder = { Text(stringResource(R.string.search)) })
        if (tab == "world" && country == null) { Countries { country = it }; return@Column }
        val key = tab + (country?.cc ?: "") + query + rev
        val list by produceState<List<Station>?>(null, key) {
            value = runCatching {
                when (tab) {
                    "feat" -> Repo.featured(); "fav" -> Store.favs(); "rec" -> Store.recents()
                    "world" -> Repo.byCountry(country!!.cc)
                    "search" -> if (query.trim().length < 2) emptyList() else { delay(400); Repo.find(query.trim()) }
                    else -> Repo.byCountry("LB")
                }
            }.getOrElse { emptyList() }
        }
        val l = list ?: run { Box(Modifier.fillMaxWidth().padding(32.dp), Alignment.Center) { CircularProgressIndicator(color = OCHRE) }; return@Column }
        if (l.isEmpty()) { Text(stringResource(R.string.empty), Modifier.padding(24.dp), color = STONE_DIM); return@Column }
        if (modern) Carousel(l, pc) else Dial(l, pc)
        LazyColumn(contentPadding = PaddingValues(12.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
            items(l, key = { it.id }) { s -> StationRow(s, pc.station?.id == s.id) { Crackle.play(); pc.play(l, s) } }
        }
    }
}

/** Old rooms: a radio dial you turn with your finger. */
@Composable
fun Dial(list: List<Station>, pc: PlayerConn) {
    var pos by remember(list) { mutableFloatStateOf(max(0, list.indexOfFirst { it.id == pc.station?.id }).toFloat()) }
    val idx = pos.roundToInt().coerceIn(0, list.lastIndex)
    Column(Modifier.padding(12.dp)) {
        Box(Modifier.fillMaxWidth().height(84.dp).clip(RoundedCornerShape(14.dp))
            .background(Brush.verticalGradient(listOf(Color(0xFF3A2C1F), WALL2))).border(1.dp, BRASS.copy(alpha = .5f), RoundedCornerShape(14.dp))
            .pointerInput(list) {
                detectHorizontalDragGestures(onDragEnd = { Crackle.play(); pc.play(list, list[pos.roundToInt().coerceIn(0, list.lastIndex)]) }) { _, dx ->
                    pos = (pos + dx / 28f).coerceIn(0f, list.lastIndex.toFloat())
                }
            }) {
            Canvas(Modifier.fillMaxSize().padding(horizontal = 14.dp, vertical = 12.dp)) {
                for (i in 0..40) {
                    val xx = size.width * i / 40
                    drawLine(OCHRE.copy(alpha = .8f), Offset(xx, size.height), Offset(xx, size.height * (if (i % 5 == 0) .45f else .7f)), 2f)
                }
                val nx = size.width * (pos / max(1, list.lastIndex))
                drawLine(BRICK, Offset(nx, 0f), Offset(nx, size.height), 5f, StrokeCap.Round)
            }
            Row(Modifier.fillMaxWidth().padding(horizontal = 10.dp, vertical = 4.dp), Arrangement.SpaceBetween) {
                listOf("88", "92", "96", "100", "104", "108").forEach { Text(it, color = STONE_DIM, fontSize = 11.sp) }
            }
        }
        Text(list[idx].name, Modifier.fillMaxWidth().padding(top = 8.dp), fontFamily = Lalezar, fontSize = 22.sp, color = OCHRE, textAlign = TextAlign.Center, maxLines = 1)
    }
}

/** 2026 rooms: a modern swipeable row of station discs. */
@Composable
fun Carousel(list: List<Station>, pc: PlayerConn) {
    LazyRow(contentPadding = PaddingValues(12.dp), horizontalArrangement = Arrangement.spacedBy(14.dp)) {
        items(list, key = { it.id }) { s ->
            val on = pc.station?.id == s.id
            Column(Modifier.width(96.dp).clickable { pc.play(list, s) }, horizontalAlignment = Alignment.CenterHorizontally) {
                Box(Modifier.size(88.dp).clip(CircleShape).border(if (on) 3.dp else 1.dp, if (on) OCHRE else BRASS.copy(alpha = .4f), CircleShape)) { Logo(s, 88.dp) }
                Text(s.name, Modifier.padding(top = 6.dp), fontSize = 12.sp, maxLines = 2, textAlign = TextAlign.Center, color = if (on) OCHRE else STONE)
            }
        }
    }
}

@Composable
fun StationRow(s: Station, on: Boolean, play: () -> Unit) {
    Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(14.dp)).background(if (on) WALL2 else WALL).border(1.dp, if (on) OCHRE else Color.Transparent, RoundedCornerShape(14.dp))
        .clickable(onClick = play).padding(10.dp), verticalAlignment = Alignment.CenterVertically) {
        Logo(s, 48.dp)
        Column(Modifier.weight(1f).padding(horizontal = 12.dp)) {
            Text(s.name, fontWeight = FontWeight.SemiBold, color = STONE, maxLines = 1, overflow = TextOverflow.Ellipsis)
            Text("${flag(s.cc)} ${s.country}", fontSize = 12.sp, color = STONE_DIM, maxLines = 1)
        }
        IconButton({ Store.toggleFav(s) }) {
            Icon(if (Store.isFav(s.id)) Icons.Default.Favorite else Icons.Default.FavoriteBorder, null, tint = OCHRE)
        }
    }
}

@Composable
fun TvDrawer(moving: Boolean, play: (String) -> Unit) {
    val lang = currentLang()
    val list by produceState<List<Repo.TvChannel>?>(null) { value = runCatching { Repo.tv(lang) }.getOrElse { emptyList() } }
    var ch by remember { mutableStateOf<Repo.TvChannel?>(null) }
    Column {
        DrawerTitle("📺 " + stringResource(R.string.tv))
        if (moving) { Text("🚗 " + stringResource(R.string.tv_driving), Modifier.padding(24.dp), color = STONE); return@Column }
        val l = list ?: run { CircularProgressIndicator(Modifier.padding(32.dp), color = OCHRE); return@Column }
        LazyRow(contentPadding = PaddingValues(12.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            items(l) { c ->
                Column(Modifier.clip(RoundedCornerShape(14.dp)).background(Color(c.color)).border(if (ch == c) 3.dp else 0.dp, OCHRE, RoundedCornerShape(14.dp))
                    .clickable { ch = c }.padding(horizontal = 18.dp, vertical = 14.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(c.name, fontFamily = Lalezar, fontSize = 18.sp, color = Color.White)
                    Text(c.ar, fontSize = 11.sp, color = Color.White.copy(alpha = .85f))
                }
            }
        }
        val c = ch ?: l.firstOrNull() ?: return@Column
        LazyColumn(contentPadding = PaddingValues(12.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
            items(c.lists) { p ->
                Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)).background(WALL).clickable { play(p.id) }.padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.PlayCircle, null, tint = OCHRE)
                    Text(p.title, Modifier.padding(start = 12.dp), color = STONE)
                }
            }
        }
    }
}

/** Today's headlines as a folded newspaper. */
@Composable
fun Newspaper() {
    val ctx = LocalContext.current
    val lang = currentLang()
    val list by produceState<List<Repo.Headline>?>(null) { value = runCatching { Repo.headlines() }.getOrElse { emptyList() } }
    Column(Modifier.padding(12.dp).clip(RoundedCornerShape(4.dp)).background(CREAM).padding(16.dp)) {
        Text(stringResource(R.string.app_name), Modifier.fillMaxWidth(), fontFamily = Lalezar, fontSize = 38.sp, color = INK, textAlign = TextAlign.Center)
        Text(SimpleDateFormat("EEEE d MMMM yyyy", Locale(lang)).format(Date()), Modifier.fillMaxWidth(), fontSize = 12.sp, color = INK.copy(alpha = .7f), textAlign = TextAlign.Center)
        Box(Modifier.padding(vertical = 8.dp).fillMaxWidth().height(3.dp).background(INK))
        val l = list ?: run { CircularProgressIndicator(Modifier.padding(24.dp).align(Alignment.CenterHorizontally), color = BRICK); return@Column }
        LazyColumn {
            items(l.take(50)) { h ->
                Column(Modifier.fillMaxWidth().clickable { h.link?.let { open(ctx, it) } }.padding(vertical = 10.dp)) {
                    Text(h.source.uppercase() + if (h.date > 0) "  ·  " + SimpleDateFormat("HH:mm", Locale.US).format(Date(h.date)) else "",
                        fontSize = 11.sp, color = Color(0xFF8E2A1C), fontWeight = FontWeight.Bold)
                    Text(h.title, fontSize = 17.sp, color = INK, fontWeight = FontWeight.SemiBold)
                }
                Box(Modifier.fillMaxWidth().height(1.dp).background(Color(0xFFCDBEA2)))
            }
        }
    }
}

@Composable
fun WeatherCard() {
    val w = Sky.weather
    val bey by produceState<Weather?>(null) { value = runCatching { Repo.weather(PlaybackService.LEB) }.getOrNull() }
    Column(Modifier.fillMaxWidth().padding(24.dp), horizontalAlignment = Alignment.CenterHorizontally) {
        DrawerTitle("🪟 " + stringResource(R.string.weather_l))
        if (w == null) CircularProgressIndicator(color = OCHRE) else {
            Text(w.icon, fontSize = 72.sp)
            Text("${w.temp}°", fontFamily = Lalezar, fontSize = 72.sp, color = OCHRE)
            Text(w.place, fontSize = 20.sp, color = STONE)
        }
        bey?.let { if (w?.place != it.place) Text("🇱🇧 ${it.place} · ${it.icon} ${it.temp}°", Modifier.padding(top = 20.dp), color = STONE_DIM, fontSize = 16.sp) }
    }
}

/** Favorite stations as cassettes on the shelf. */
@Composable
fun Cassettes(pc: PlayerConn) {
    val rev = Store.rev.intValue
    val favs = remember(rev) { Store.favs() }
    Column {
        DrawerTitle("📼 " + stringResource(R.string.cassettes))
        if (favs.isEmpty()) { Text(stringResource(R.string.fav_hint), Modifier.padding(24.dp), color = STONE_DIM); return@Column }
        LazyVerticalGrid(GridCells.Adaptive(150.dp), contentPadding = PaddingValues(12.dp),
            horizontalArrangement = Arrangement.spacedBy(10.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            items(favs, key = { it.id }) { s ->
                Box(Modifier.aspectRatio(1.6f).clip(RoundedCornerShape(10.dp)).background(Color(0xFF2B2420))
                    .border(2.dp, if (pc.station?.id == s.id) OCHRE else BRASS.copy(alpha = .4f), RoundedCornerShape(10.dp)).clickable { pc.play(favs, s) }) {
                    Text(s.name, Modifier.fillMaxWidth().padding(8.dp).background(CREAM, RoundedCornerShape(4.dp)).padding(6.dp, 3.dp),
                        fontFamily = Lalezar, fontSize = 14.sp, color = INK, maxLines = 1, overflow = TextOverflow.Ellipsis)
                    Canvas(Modifier.align(Alignment.BottomCenter).fillMaxWidth().height(44.dp)) {
                        listOf(.32f, .68f).forEach { cx ->
                            drawCircle(Color(0xFF1A1410), size.height * .38f, Offset(size.width * cx, size.height * .45f))
                            drawCircle(STONE_DIM, size.height * .14f, Offset(size.width * cx, size.height * .45f))
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun EraPicker(pick: (String) -> Unit) {
    val cur = Salon.era().id
    Column {
        DrawerTitle("🏠 " + stringResource(R.string.era))
        LazyVerticalGrid(GridCells.Adaptive(160.dp), contentPadding = PaddingValues(12.dp),
            horizontalArrangement = Arrangement.spacedBy(10.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            items(Salon.ORDER.filter { it in Salon.eras }) { id ->
                val e = Salon.eras.getValue(id)
                Column(Modifier.clip(RoundedCornerShape(14.dp)).border(if (id == cur) 3.dp else 1.dp, if (id == cur) OCHRE else BRASS.copy(alpha = .3f), RoundedCornerShape(14.dp))
                    .clickable { pick(id) }) {
                    AsyncImage(Repo.SITE + e.base + "day-s.jpg", null, Modifier.fillMaxWidth().aspectRatio(1.5f), contentScale = ContentScale.Crop)
                    val dec = when (id.take(2)) { "80" -> "1980s"; "90" -> "1990s"; "00" -> "2000s"; else -> "2026" }
                    Text("$dec · " + stringResource(if (id.endsWith("h")) R.string.house else R.string.apt), Modifier.padding(10.dp), color = STONE, fontWeight = FontWeight.SemiBold)
                }
            }
        }
    }
}

@Composable
fun MoreRow(icon: String, label: String, onClick: () -> Unit) =
    Row(Modifier.fillMaxWidth().clickable(onClick = onClick).padding(16.dp, 14.dp), verticalAlignment = Alignment.CenterVertically) {
        Text(icon, fontSize = 22.sp); Text(label, Modifier.padding(start = 16.dp), color = STONE, fontSize = 17.sp)
    }

@Composable
fun More(pc: PlayerConn, radio: (String) -> Unit, era: () -> Unit, drive: () -> Unit) {
    val ctx = LocalContext.current
    val sleep = PlaybackService.instance?.sleepMin ?: 0
    val shareText = stringResource(R.string.share_text, pc.name) + " " + Repo.SITE
    LazyColumn {
        item { DrawerTitle("☰ " + stringResource(R.string.more)) }
        item { MoreRow("🌍", stringResource(R.string.world)) { radio("world") } }
        item { MoreRow("🔎", stringResource(R.string.search)) { radio("search") } }
        item { MoreRow("📼", stringResource(R.string.cassettes)) { radio("fav") } }
        item { MoreRow("🚗", stringResource(R.string.drive), drive) }
        item { MoreRow("🏠", stringResource(R.string.era)) { era() } }
        item { MoreRow("⏾", stringResource(R.string.sleep) + if (sleep > 0) " · ${sleep}m" else "") {
            PlaybackService.instance?.sleep(when (sleep) { 0 -> 15; 15 -> 30; 30 -> 60; else -> 0 })
        } }
        if (pc.name.isNotEmpty()) item { MoreRow("📤", stringResource(R.string.share)) { share(ctx, shareText) } }
        item { DrawerTitle("⚙️ " + stringResource(R.string.settings)) }
        item {
            Column(Modifier.padding(horizontal = 16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Toggle(R.string.speed_show, Store.b("speed", true)) { Store.setB("speed", it); if (it) startSpeed(ctx) else SpeedService.stop(ctx) }
                Toggle(R.string.speed_car, Store.b("speedCar", true)) { Store.setB("speedCar", it); PlaybackService.instance?.showSpeed(null) }
                Toggle(R.string.autoplay, Store.autoplay) { Store.autoplay = it }
                Toggle(R.string.brief, Store.b("brief", true)) { Store.setB("brief", it) }
                Toggle(R.string.night_ride, Store.b("night", true)) { Store.setB("night", it) }
                Toggle(R.string.news_flash, Store.newsFlash) { Store.newsFlash = it }
                Toggle(R.string.breaking_speak, Store.b("bspeak")) { Store.setB("bspeak", it) }
                Toggle(R.string.breaking_notify, Store.b("bnotif", true)) { Store.setB("bnotif", it) }
                Toggle(R.string.data_saver, Store.dataSaver) { Store.dataSaver = it }
                Spacer(Modifier.height(24.dp))
            }
        }
    }
}

@Composable
fun YouTubeView(list: String, m: Modifier) {
    val html = "<html><body style='margin:0;background:#000;height:100%'><iframe style='border:0;width:100%;height:100%' " +
        "src='https://www.youtube.com/embed/videoseries?list=$list&autoplay=1&playsinline=1' allow='autoplay; encrypted-media; fullscreen' allowfullscreen></iframe></body></html>"
    AndroidView({ c ->
        WebView(c).apply {
            layoutParams = ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT)
            settings.javaScriptEnabled = true; settings.domStorageEnabled = true; settings.mediaPlaybackRequiresUserGesture = false
            loadDataWithBaseURL(Repo.SITE, html, "text/html", "utf-8", null)
        }
    }, m, onRelease = { it.destroy() })
}
