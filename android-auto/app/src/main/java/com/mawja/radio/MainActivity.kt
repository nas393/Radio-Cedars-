package com.mawja.radio

import android.Manifest
import android.content.ActivityNotFoundException
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.WindowManager
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.app.AppCompatDelegate
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Density
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import androidx.lifecycle.lifecycleScope
import androidx.media3.common.C
import androidx.media3.common.MediaItem
import androidx.media3.common.Player
import androidx.media3.session.MediaController
import androidx.media3.session.SessionToken
import coil.compose.AsyncImage
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

/** Connects the phone screen to the playback service. */
class PlayerConn(ctx: Context) {
    private var c: MediaController? = null
    var station by mutableStateOf<Station?>(null)
    var name by mutableStateOf("")
    var sub by mutableStateOf("")
    var playing by mutableStateOf(false)

    init {
        val f = MediaController.Builder(ctx, SessionToken(ctx, ComponentName(ctx, PlaybackService::class.java))).buildAsync()
        f.addListener({
            c = f.get().also { p ->
                p.addListener(object : Player.Listener { override fun onEvents(player: Player, events: Player.Events) = sync(player) })
                sync(p)
            }
        }, ContextCompat.getMainExecutor(ctx))
    }

    private fun sync(p: Player) {
        playing = p.isPlaying
        station = Repo.stations[stationId(p.currentMediaItem)]
        val m = p.mediaMetadata
        name = (m.station ?: m.title)?.toString() ?: ""
        val t = m.title?.toString()
        sub = if (t != null && t != name && station != null) t else m.artist?.toString() ?: ""
    }

    fun play(list: List<Station>, s: Station) = c?.run {
        setMediaItems(list.map { it.item() }, list.indexOf(s).coerceAtLeast(0), C.TIME_UNSET); prepare(); play()
    }
    fun news() = c?.run { setMediaItem(MediaItem.Builder().setMediaId("news").build()); prepare(); play() }
    fun toggle() = c?.run { if (isPlaying) pause() else { if (playbackState == Player.STATE_IDLE) prepare(); play() } }
    fun pause() = c?.pause()
    fun next() = c?.seekToNextMediaItem()
    fun prev() = c?.seekToPreviousMediaItem()
    fun release() = c?.release()
}

class MainActivity : AppCompatActivity() {
    private lateinit var pc: PlayerConn

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Store.currentId = 0   // one simple app, no profiles
        WindowCompat.setDecorFitsSystemWindows(window, false)
        WindowCompat.getInsetsController(window, window.decorView).run {
            hide(WindowInsetsCompat.Type.systemBars())
            systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        }
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        val ask = mutableListOf(Manifest.permission.ACCESS_COARSE_LOCATION)
        if (Build.VERSION.SDK_INT >= 33) ask += Manifest.permission.POST_NOTIFICATIONS
        ask.filter { checkSelfPermission(it) != PackageManager.PERMISSION_GRANTED }.let { if (it.isNotEmpty()) requestPermissions(it.toTypedArray(), 1) }
        pc = PlayerConn(this)
        setContent { Root(pc) }
    }

    override fun onResume() { super.onResume(); if (PlaybackService.instance?.carOn == true) startSpeed(this) }

    override fun onRequestPermissionsResult(code: Int, perms: Array<out String>, res: IntArray) {
        super.onRequestPermissionsResult(code, perms, res)
        if (res.any { it == PackageManager.PERMISSION_GRANTED }) {
            lifecycleScope.launch { runCatching { Sky.refresh(this@MainActivity) } }
            if (Manifest.permission.ACCESS_FINE_LOCATION in perms) startSpeed(this)
        }
    }

    override fun onStart() { super.onStart(); Ambience.visible = true }
    override fun onStop() { Ambience.visible = false; super.onStop() }
    override fun onDestroy() { pc.release(); super.onDestroy() }
}

fun startSpeed(ctx: Context) {
    if (!Store.b("speed", true)) return
    if (ctx.checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) SpeedService.start(ctx)
    else (ctx as? MainActivity)?.requestPermissions(arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION), 2)
}

fun currentLang() = AppCompatDelegate.getApplicationLocales()[0]?.language ?: Locale.getDefault().language

fun open(ctx: Context, url: String) = try { ctx.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url))) } catch (_: Exception) {}

fun share(ctx: Context, text: String) {
    val i = Intent(Intent.ACTION_SEND).setType("text/plain").putExtra(Intent.EXTRA_TEXT, text)
    try { ctx.startActivity(Intent(i).setPackage("com.whatsapp")) }
    catch (e: ActivityNotFoundException) { ctx.startActivity(Intent.createChooser(i, null)) }
}

fun clocks(now: Date): String {
    val f = SimpleDateFormat("HH:mm", Locale.US); val local = f.format(now)
    f.timeZone = TimeZone.getTimeZone("Asia/Beirut"); val bey = f.format(now)
    return if (bey == local) "🇱🇧 $local" else "$local · 🇱🇧 $bey"
}

private val cs @Composable get() = MaterialTheme.colorScheme

@Composable
fun Root(pc: PlayerConn) {
    Store.rev.intValue
    val d = LocalDensity.current
    val scale = listOf(1f, 1.15f, 1.3f)[Store.i("aa").coerceIn(0, 2)]
    CompositionLocalProvider(LocalDensity provides Density(d.density, d.fontScale * scale)) {
        MaterialTheme(colorScheme = THEMES[0].dark, typography = HouseType) {
            SalonScreen(pc)
        }
    }
}

@Composable
fun Logo(s: Station?, size: Dp) {
    Box(Modifier.size(size).clip(RoundedCornerShape(size / 4)).background(WALL2), contentAlignment = Alignment.Center) {
        Text(s?.name?.take(1)?.uppercase() ?: "♪", fontSize = (size.value / 2.4).sp, fontFamily = Lalezar, color = OCHRE)
        if (s?.logo != null) AsyncImage(s.logo, null, Modifier.fillMaxSize(), contentScale = ContentScale.Crop)
    }
}

@Composable
fun Countries(pick: (Country) -> Unit) {
    val list by produceState<List<Country>?>(null) { value = runCatching { Repo.countries() }.getOrElse { emptyList() } }
    val l = list ?: return Box(Modifier.fillMaxWidth().padding(32.dp), Alignment.Center) { CircularProgressIndicator(color = OCHRE) }
    LazyColumn(contentPadding = PaddingValues(8.dp)) {
        items(l, key = { it.cc }) { c ->
            Row(Modifier.fillMaxWidth().clickable { pick(c) }.padding(16.dp, 14.dp), verticalAlignment = Alignment.CenterVertically) {
                Text(flag(c.cc), fontSize = 24.sp)
                Text(c.name, Modifier.padding(start = 16.dp).weight(1f), color = STONE, style = MaterialTheme.typography.titleMedium)
                Text("${c.count}", color = STONE_DIM)
            }
        }
    }
}

/** Your own pictures — they hang in the salon's wall frames. */
@Composable
fun Photos(rev: Int) {
    val ctx = LocalContext.current
    val scope = rememberCoroutineScope()
    val photos = remember(rev) { Store.gallery() }
    val refresh = { Store.bump(); PlaybackService.instance?.refreshWall(true) }
    val pick = rememberLauncherForActivityResult(ActivityResultContracts.PickMultipleVisualMedia(12)) { uris ->
        scope.launch(Dispatchers.IO) {
            uris.forEach { u ->
                runCatching {
                    ctx.contentResolver.openInputStream(u)?.use { i -> File(Store.galleryDir(), "img_${System.nanoTime()}.jpg").outputStream().use { i.copyTo(it) } }
                }
            }
            launch(Dispatchers.Main) { refresh() }
        }
    }
    var shot by remember { mutableStateOf<File?>(null) }
    val cam = rememberLauncherForActivityResult(ActivityResultContracts.TakePicture()) { ok -> if (!ok) shot?.delete(); refresh() }
    Column {
        DrawerTitle("🖼️ " + stringResource(R.string.photos))
        Row(Modifier.padding(16.dp, 0.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            val b = ButtonDefaults.buttonColors(containerColor = Color(0xFFE2C27A), contentColor = INK)
            Button({ pick.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)) }, colors = b) {
                Icon(Icons.Default.PhotoLibrary, null); Text(" " + stringResource(R.string.add_phone))
            }
            Button({
                val f = File(Store.galleryDir(), "cam_${System.currentTimeMillis()}.jpg"); shot = f
                cam.launch(FileProvider.getUriForFile(ctx, "com.sawtelbeit.app.files", f))
            }, colors = b) { Icon(Icons.Default.PhotoCamera, null); Text(" " + stringResource(R.string.camera)) }
        }
        if (photos.isNotEmpty()) TextButton({
            val era = Salon.era(); val n = era.frames.values.maxOfOrNull { it.size } ?: 0
            for (i in 0 until n) Store.setFrame(era.id, i, photos[i % photos.size].name)
            PlaybackService.instance?.refreshWall(false)
        }, Modifier.padding(horizontal = 8.dp)) { Text(stringResource(R.string.fill_frames), color = OCHRE) }
        Text(stringResource(R.string.frame_hint), Modifier.padding(horizontal = 16.dp), color = STONE_DIM, fontSize = 13.sp)
        if (photos.isEmpty()) Text(stringResource(R.string.no_photos), Modifier.padding(24.dp), color = STONE_DIM, textAlign = TextAlign.Center)
        else LazyVerticalGrid(GridCells.Adaptive(110.dp), contentPadding = PaddingValues(16.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            items(photos, key = { it.name }) { f ->
                Box(Modifier.aspectRatio(1f).clip(RoundedCornerShape(10.dp))) {
                    AsyncImage(f, null, Modifier.fillMaxSize(), contentScale = ContentScale.Crop)
                    MiniBtn(Icons.Default.Close) { f.delete(); refresh() }
                }
            }
        }
    }
}

/** Drive mode: dashboard black with ochre gauges, a big speedometer and big buttons. */
@Composable
fun Drive(pc: PlayerConn, exit: () -> Unit) {
    val ctx = LocalContext.current
    LaunchedEffect(Unit) { startSpeed(ctx) }
    val now by produceState(Date()) { while (true) { delay(15_000); value = Date() } }
    MaterialTheme(colorScheme = DRIVE.dark, typography = HouseType) {
        BoxWithConstraints(Modifier.fillMaxSize().background(cs.background).safeDrawingPadding().padding(20.dp)) {
            val wide = maxWidth > maxHeight
            Text(clocks(now) + (Sky.weather?.let { "   ${it.icon} ${it.temp}° ${it.place}" } ?: ""),
                Modifier.align(Alignment.TopStart), color = cs.onBackground.copy(alpha = .85f), fontSize = 18.sp)
            IconButton(exit, Modifier.align(Alignment.TopEnd)) { Icon(Icons.Default.Close, null, tint = cs.onBackground) }
            val gauge: @Composable () -> Unit = {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(Speed.kmh?.toString() ?: "--", fontSize = 120.sp, fontFamily = Lalezar, color = cs.primary)
                    Text("km/h", color = cs.onBackground.copy(alpha = .7f), fontSize = 20.sp)
                }
            }
            val player: @Composable () -> Unit = {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Logo(pc.station, 72.dp)
                    Text(pc.name.ifEmpty { stringResource(R.string.app_name) }, Modifier.padding(top = 8.dp), fontSize = 26.sp, fontFamily = Lalezar,
                        maxLines = 1, overflow = TextOverflow.Ellipsis, color = cs.onBackground)
                    Text(pc.sub, fontSize = 17.sp, maxLines = 1, overflow = TextOverflow.Ellipsis, color = cs.onBackground.copy(alpha = .7f))
                    Row(Modifier.padding(top = 16.dp), Arrangement.spacedBy(20.dp), Alignment.CenterVertically) {
                        IconButton({ pc.prev() }, Modifier.size(72.dp)) { Icon(Icons.Default.SkipPrevious, null, Modifier.size(52.dp), cs.onBackground) }
                        FilledIconButton({ pc.toggle() }, Modifier.size(104.dp)) {
                            Icon(if (pc.playing) Icons.Default.Pause else Icons.Default.PlayArrow, null, Modifier.size(64.dp))
                        }
                        IconButton({ pc.next() }, Modifier.size(72.dp)) { Icon(Icons.Default.SkipNext, null, Modifier.size(52.dp), cs.onBackground) }
                        pc.station?.let { s ->
                            IconButton({ Store.toggleFav(s) }, Modifier.size(72.dp)) {
                                Icon(if (Store.isFav(s.id)) Icons.Default.Favorite else Icons.Default.FavoriteBorder, null, Modifier.size(40.dp), cs.primary)
                            }
                        }
                    }
                }
            }
            if (wide) Row(Modifier.align(Alignment.Center), Arrangement.spacedBy(48.dp), Alignment.CenterVertically) { gauge(); player() }
            else Column(Modifier.align(Alignment.Center), Arrangement.spacedBy(32.dp), Alignment.CenterHorizontally) { gauge(); player() }
        }
    }
}

@Composable
fun YouTube(list: String, close: () -> Unit) {
    Dialog(close, DialogProperties(usePlatformDefaultWidth = false)) {
        Box(Modifier.fillMaxSize().background(Color.Black)) {
            YouTubeView(list, Modifier.fillMaxSize())
            IconButton(close, Modifier.align(Alignment.TopEnd).padding(8.dp).background(Color.Black.copy(alpha = .6f), CircleShape)) {
                Icon(Icons.Default.Close, null, tint = Color.White)
            }
        }
    }
}

@Composable
fun Toggle(label: Int, on: Boolean, set: (Boolean) -> Unit) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Text(stringResource(label), Modifier.weight(1f), color = STONE)
        Switch(on, set, colors = SwitchDefaults.colors(checkedTrackColor = OCHRE, checkedThumbColor = INK))
    }
}
