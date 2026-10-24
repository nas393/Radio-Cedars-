package com.mawja.radio

import android.Manifest
import android.app.AlarmManager
import android.app.TimePickerDialog
import android.content.ActivityNotFoundException
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.WindowManager
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.app.AppCompatDelegate
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.GridItemSpan
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.viewinterop.AndroidView
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import android.webkit.WebView
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import androidx.core.os.LocaleListCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
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
import java.net.URLEncoder
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
    var song by mutableStateOf(false)
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
        song = t != null && t != name && station != null
        sub = if (song) t!! else m.artist?.toString() ?: ""
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
        WindowCompat.setDecorFitsSystemWindows(window, false)
        WindowCompat.getInsetsController(window, window.decorView).run {
            hide(WindowInsetsCompat.Type.systemBars())
            systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        }
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        if (Build.VERSION.SDK_INT >= 33) ask(Manifest.permission.POST_NOTIFICATIONS)
        pc = PlayerConn(this)
        setContent { Root(pc) }
    }

    override fun onDestroy() { pc.release(); super.onDestroy() }

    override fun onResume() { super.onResume(); if (PlaybackService.instance?.carOn == true) startSpeed(this) }

    override fun onRequestPermissionsResult(code: Int, perms: Array<out String>, res: IntArray) {
        super.onRequestPermissionsResult(code, perms, res)
        if (Manifest.permission.ACCESS_FINE_LOCATION in perms && res.any { it == PackageManager.PERMISSION_GRANTED }) startSpeed(this)
    }

    fun ask(p: String) { if (checkSelfPermission(p) != PackageManager.PERMISSION_GRANTED) requestPermissions(arrayOf(p), 1) }
}

private val cs @Composable get() = MaterialTheme.colorScheme

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

private fun enc(s: String) = URLEncoder.encode(s, "UTF-8")

@Composable
fun Root(pc: PlayerConn) {
    Store.rev.intValue
    var picking by rememberSaveable { mutableStateOf(true) }
    val prof = Store.current()
    val dark = when (Store.i("look")) { 1 -> false; 2 -> true; else -> isSystemInDarkTheme() }
    val th = THEMES[prof.theme]
    MaterialTheme(colorScheme = if (dark) th.dark else th.light, typography = HouseType) {
        Box(Modifier.fillMaxSize().background(cs.background)) {
            // Full-screen live wallpaper behind everything
            Wall.state?.let { AsyncImage(it.scene, null, Modifier.fillMaxSize(), contentScale = ContentScale.Crop) }
            Box(Modifier.fillMaxSize().background(Brush.verticalGradient(listOf(cs.background.copy(alpha = .35f), cs.background.copy(alpha = .9f)))))
            if (picking) Picker { Store.currentId = it; picking = false; PlaybackService.instance?.refreshWall(true) }
            else Home(pc, prof) { picking = true }
        }
    }
}

@Composable
fun Badge(p: Profile, size: Dp, onClick: () -> Unit) {
    val t = THEMES[p.theme]
    Box(Modifier.size(size).clip(RoundedCornerShape(size / 4))
        .background(Brush.linearGradient(listOf(t.dark.primary, t.dark.secondary))).clickable(onClick = onClick),
        contentAlignment = Alignment.Center) {
        Text(if (p.kids) "🧸" else p.name.take(1).uppercase(), fontSize = (size.value / 2).sp, fontFamily = Lalezar, color = Color(0xFF17120E))
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun Picker(pick: (Int) -> Unit) {
    Column(Modifier.fillMaxSize().padding(24.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center) {
        Text(stringResource(R.string.who), style = MaterialTheme.typography.headlineMedium, color = cs.onBackground)
        Spacer(Modifier.height(32.dp))
        FlowRow(horizontalArrangement = Arrangement.spacedBy(24.dp, Alignment.CenterHorizontally), verticalArrangement = Arrangement.spacedBy(24.dp)) {
            Store.profiles().forEach { p ->
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Badge(p, 104.dp) { pick(p.id) }
                    Text(p.name, Modifier.padding(top = 8.dp), color = cs.onBackground, fontWeight = FontWeight.SemiBold)
                }
            }
        }
    }
}

private enum class Page(val label: Int, val kids: Boolean) {
    FAV(R.string.favorites, true), REC(R.string.recent, true), FEAT(R.string.featured, true), LB(R.string.lebanon, true),
    WORLD(R.string.world, false), SEARCH(R.string.search, false), NEWS(R.string.news, false),
    TV(R.string.tv, false), PHOTOS(R.string.photos, false)
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun Home(pc: PlayerConn, prof: Profile, switch: () -> Unit) {
    val tabs = Page.entries.filter { !prof.kids || it.kids }
    var tab by rememberSaveable(prof.id) { mutableIntStateOf(if (Store.favs().isEmpty()) 3 else 0) }
    var country by remember { mutableStateOf<Country?>(null) }
    var settings by remember { mutableStateOf(false) }
    var query by rememberSaveable { mutableStateOf("") }
    val rev = Store.rev.intValue
    val now by produceState(Date()) { while (true) { delay(30_000); value = Date() } }
    var drive by rememberSaveable { mutableStateOf(false) }
    if (settings) Settings(prof) { settings = false }
    if (drive) { Drive(pc) { drive = false }; return }

    Column(Modifier.fillMaxSize().safeDrawingPadding()) {
        Row(Modifier.fillMaxWidth().padding(16.dp, 12.dp), verticalAlignment = Alignment.CenterVertically) {
            Badge(prof, 44.dp, switch)
            Column(Modifier.padding(start = 12.dp).weight(1f)) {
                Text(stringResource(R.string.app_name), style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = cs.onBackground)
                Text(clocks(now) + (Wall.state?.weather?.let { "   ${it.icon} ${it.temp}° ${it.place}" } ?: ""),
                    style = MaterialTheme.typography.bodySmall, color = cs.onBackground.copy(alpha = .8f), maxLines = 1)
            }
            if (Store.newsFlash) IconButton({ pc.news() }) { Icon(Icons.Default.Newspaper, stringResource(R.string.news_flash), tint = cs.onBackground) }
            IconButton({ drive = true }) { Icon(Icons.Default.DirectionsCar, stringResource(R.string.drive), tint = cs.onBackground) }
            IconButton({ settings = true }) { Icon(Icons.Default.Settings, stringResource(R.string.settings), tint = cs.onBackground) }
        }
        val sel = tab.coerceIn(0, tabs.size - 1)
        ScrollableTabRow(sel, containerColor = Color.Transparent, contentColor = cs.primary, edgePadding = 12.dp) {
            tabs.forEachIndexed { i, t -> Tab(sel == i, { tab = i; country = null }, text = { Text(stringResource(t.label)) }) }
        }
        Box(Modifier.weight(1f)) {
            when (tabs[sel]) {
                Page.FAV -> Grid(remember(rev) { Store.favs() }, pc)
                Page.REC -> Grid(remember(rev) { Store.recents() }, pc)
                Page.FEAT -> Stations("feat", pc) { Repo.featured() }
                Page.LB -> Stations("LB", pc, dayPick = true) { Repo.byCountry("LB") }
                Page.WORLD -> country?.let { c ->
                    Column {
                        Row(Modifier.clickable { country = null }.padding(16.dp, 8.dp), verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.AutoMirrored.Filled.ArrowBack, stringResource(R.string.back), tint = cs.onBackground)
                            Text("  ${flag(c.cc)} ${c.name}", color = cs.onBackground, fontWeight = FontWeight.SemiBold)
                        }
                        Stations(c.cc, pc) { Repo.byCountry(c.cc) }
                    }
                } ?: Countries { country = it }
                Page.SEARCH -> Column {
                    OutlinedTextField(query, { query = it }, Modifier.fillMaxWidth().padding(16.dp, 8.dp), singleLine = true,
                        leadingIcon = { Icon(Icons.Default.Search, null) }, placeholder = { Text(stringResource(R.string.search)) })
                    if (query.trim().length >= 2) Stations("q:$query", pc) { delay(400); Repo.find(query.trim()) }
                }
                Page.NEWS -> News()
                Page.TV -> Tv(pc)
                Page.PHOTOS -> Photos(rev)
            }
        }
        NowPlaying(pc)
    }
}

fun clocks(now: Date): String {
    val f = SimpleDateFormat("HH:mm", Locale.US); val local = f.format(now)
    f.timeZone = TimeZone.getTimeZone("Asia/Beirut"); val bey = f.format(now)
    return if (bey == local) "🇱🇧 $local" else "$local · 🇱🇧 $bey"
}

@Composable
fun Stations(key: Any, pc: PlayerConn, dayPick: Boolean = false, load: suspend () -> List<Station>) {
    val list by produceState<List<Station>?>(null, key, Store.dataSaver) { value = runCatching { load() }.getOrElse { emptyList() } }
    val l = list ?: return Box(Modifier.fillMaxSize(), Alignment.Center) { CircularProgressIndicator() }
    val sod = if (dayPick && l.isNotEmpty()) l[java.time.LocalDate.now().dayOfYear % l.size] else null
    if (sod == null) Grid(l, pc) else Grid(l, pc) {
        Card({ pc.play(l, sod) }, Modifier.fillMaxWidth(), colors = CardDefaults.cardColors(cs.primary.copy(alpha = .2f))) {
            Row(Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                Logo(sod, 56.dp)
                Column(Modifier.padding(start = 12.dp)) {
                    Text("⭐ " + stringResource(R.string.station_day), style = MaterialTheme.typography.labelMedium, color = cs.primary)
                    Text(sod.name, fontWeight = FontWeight.Bold, color = cs.onSurface)
                }
            }
        }
    }
}

@Composable
fun Countries(pick: (Country) -> Unit) {
    val list by produceState<List<Country>?>(null) { value = runCatching { Repo.countries() }.getOrElse { emptyList() } }
    val l = list ?: return Box(Modifier.fillMaxSize(), Alignment.Center) { CircularProgressIndicator() }
    LazyColumn(contentPadding = PaddingValues(8.dp)) {
        items(l, key = { it.cc }) { c ->
            Row(Modifier.fillMaxWidth().clickable { pick(c) }.padding(16.dp, 14.dp), verticalAlignment = Alignment.CenterVertically) {
                Text(flag(c.cc), fontSize = 24.sp)
                Text(c.name, Modifier.padding(start = 16.dp).weight(1f), color = cs.onBackground, style = MaterialTheme.typography.titleMedium)
                Text("${c.count}", color = cs.onBackground.copy(alpha = .5f))
            }
        }
    }
}

@Composable
fun Logo(s: Station?, size: Dp) {
    Box(Modifier.size(size).clip(RoundedCornerShape(16.dp)).background(cs.surfaceVariant), contentAlignment = Alignment.Center) {
        Text(s?.name?.take(1)?.uppercase() ?: "♪", fontSize = (size.value / 2.4).sp, fontWeight = FontWeight.Bold, color = cs.primary)
        if (s?.logo != null) AsyncImage(s.logo, null, Modifier.fillMaxSize(), contentScale = ContentScale.Crop)
    }
}

@Composable
fun Grid(list: List<Station>, pc: PlayerConn, header: (@Composable () -> Unit)? = null) {
    if (list.isEmpty()) {
        Box(Modifier.fillMaxSize(), Alignment.Center) { Text(stringResource(R.string.empty), color = cs.onBackground.copy(alpha = .7f)) }
        return
    }
    LazyVerticalGrid(GridCells.Adaptive(150.dp), contentPadding = PaddingValues(16.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        header?.let { h -> item(span = { GridItemSpan(maxLineSpan) }) { h() } }
        items(list, key = { it.id }) { s ->
            val on = pc.station?.id == s.id
            Card({ pc.play(list, s) }, colors = CardDefaults.cardColors(if (on) cs.primary.copy(alpha = .3f) else cs.surface.copy(alpha = .85f)),
                border = if (on) BorderStroke(2.dp, cs.primary) else null) {
                Column(Modifier.fillMaxWidth().padding(12.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                    Logo(s, 96.dp)
                    Text(s.name, Modifier.padding(top = 8.dp), maxLines = 2, overflow = TextOverflow.Ellipsis,
                        textAlign = TextAlign.Center, fontWeight = FontWeight.SemiBold, color = cs.onSurface)
                    Text("${flag(s.cc)} ${s.country}", maxLines = 1, overflow = TextOverflow.Ellipsis,
                        style = MaterialTheme.typography.bodySmall, color = cs.onSurface.copy(alpha = .7f))
                }
            }
        }
    }
}

@Composable
fun News() {
    val ctx = LocalContext.current
    val list by produceState<List<Repo.Headline>?>(null) { value = runCatching { Repo.headlines() }.getOrElse { emptyList() } }
    val l = list ?: return Box(Modifier.fillMaxSize(), Alignment.Center) { CircularProgressIndicator() }
    LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        items(l.take(60)) { h ->
            Card({ h.link?.let { open(ctx, it) } }, Modifier.fillMaxWidth(), colors = CardDefaults.cardColors(cs.surface.copy(alpha = .88f))) {
                Column(Modifier.padding(14.dp)) {
                    Text(h.source + if (h.date > 0) " · " + SimpleDateFormat("HH:mm", Locale.US).format(Date(h.date)) else "",
                        style = MaterialTheme.typography.labelMedium, color = cs.primary)
                    Text(h.title, fontWeight = FontWeight.SemiBold, color = cs.onSurface)
                }
            }
        }
    }
}

@Composable
fun Photos(rev: Int) {
    val ctx = LocalContext.current
    val scope = rememberCoroutineScope()
    val photos = remember(rev) { Store.gallery() }
    val refresh = { Store.bump(); PlaybackService.instance?.refreshWall(true) }
    val pick = rememberLauncherForActivityResult(ActivityResultContracts.PickMultipleVisualMedia(30)) { uris ->
        scope.launch(Dispatchers.IO) {
            uris.forEach { u -> runCatching {
                ctx.contentResolver.openInputStream(u)?.use { i -> File(Store.galleryDir(), "img_${System.nanoTime()}.jpg").outputStream().use { i.copyTo(it) } }
            } }
            launch(Dispatchers.Main) { refresh() }
        }
    }
    var shot by remember { mutableStateOf<File?>(null) }
    val cam = rememberLauncherForActivityResult(ActivityResultContracts.TakePicture()) { ok -> if (!ok) shot?.delete(); refresh() }
    Column {
        Row(Modifier.padding(16.dp, 8.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Button({ pick.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)) }) { Icon(Icons.Default.PhotoLibrary, null); Text(" " + stringResource(R.string.add_phone)) }
            Button({
                val f = File(Store.galleryDir(), "cam_${System.currentTimeMillis()}.jpg"); shot = f
                cam.launch(FileProvider.getUriForFile(ctx, "com.sawtelbeit.app.files", f))
            }) { Icon(Icons.Default.PhotoCamera, null); Text(" " + stringResource(R.string.camera)) }
            IconButton({ PlaybackService.instance?.refreshWall(true) }) { Icon(Icons.Default.Wallpaper, null, tint = cs.onBackground) }
        }
        if (photos.isEmpty()) Box(Modifier.fillMaxSize(), Alignment.Center) { Text(stringResource(R.string.no_photos), color = cs.onBackground.copy(alpha = .8f), textAlign = TextAlign.Center, modifier = Modifier.padding(24.dp)) }
        else LazyVerticalGrid(GridCells.Adaptive(110.dp), contentPadding = PaddingValues(16.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            items(photos, key = { it.name }) { f ->
                Box(Modifier.aspectRatio(1f).clip(RoundedCornerShape(12.dp))) {
                    AsyncImage(f, null, Modifier.fillMaxSize(), contentScale = ContentScale.Crop)
                    IconButton({ f.delete(); refresh() }, Modifier.align(Alignment.TopEnd).size(32.dp).background(Color.Black.copy(alpha = .5f), CircleShape)) {
                        Icon(Icons.Default.Close, null, tint = Color.White, modifier = Modifier.size(18.dp))
                    }
                }
            }
        }
    }
}

@Composable
fun NowPlaying(pc: PlayerConn) {
    if (pc.name.isEmpty()) return
    val ctx = LocalContext.current
    Store.rev.intValue
    val shareText = stringResource(R.string.share_text, pc.name + if (pc.sub.isNotBlank()) " — ${pc.sub}" else "") + " " + Repo.SITE
    val sleep = PlaybackService.instance?.sleepMin ?: 0
    Surface(color = cs.surface.copy(alpha = .92f), tonalElevation = 6.dp, shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp)) {
        Column(Modifier.fillMaxWidth().padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Logo(pc.station, 64.dp)
                Column(Modifier.weight(1f).padding(horizontal = 12.dp)) {
                    Text(pc.name, maxLines = 1, overflow = TextOverflow.Ellipsis, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = cs.onSurface)
                    Text(pc.sub, maxLines = 1, overflow = TextOverflow.Ellipsis, style = MaterialTheme.typography.bodyMedium, color = cs.onSurface.copy(alpha = .7f))
                }
                pc.station?.let { s ->
                    IconButton({ Store.toggleFav(s) }) {
                        Icon(if (Store.isFav(s.id)) Icons.Default.Favorite else Icons.Default.FavoriteBorder, stringResource(R.string.favorite), tint = cs.primary)
                    }
                }
                IconButton({ share(ctx, shareText) }) { Icon(Icons.Default.Share, null, tint = cs.onSurface) }
            }
            Row(Modifier.fillMaxWidth().padding(top = 8.dp), Arrangement.SpaceEvenly, Alignment.CenterVertically) {
                TextButton({ PlaybackService.instance?.sleep(when (sleep) { 0 -> 15; 15 -> 30; 30 -> 60; else -> 0 }) }) {
                    Icon(Icons.Default.Bedtime, null); Text(if (sleep > 0) " ${sleep}m" else " " + stringResource(R.string.sleep))
                }
                IconButton({ pc.prev() }, Modifier.size(56.dp)) { Icon(Icons.Default.SkipPrevious, null, Modifier.size(36.dp), cs.onSurface) }
                FilledIconButton({ pc.toggle() }, Modifier.size(72.dp)) {
                    Icon(if (pc.playing) Icons.Default.Pause else Icons.Default.PlayArrow, null, Modifier.size(40.dp))
                }
                IconButton({ pc.next() }, Modifier.size(56.dp)) { Icon(Icons.Default.SkipNext, null, Modifier.size(36.dp), cs.onSurface) }
            }
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun Chips(options: List<Pair<Int, String>>, selected: Int, pick: (Int) -> Unit) {
    FlowRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
        options.forEach { (v, label) -> FilterChip(selected == v, { pick(v) }, { Text(label) }) }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun Settings(prof: Profile, close: () -> Unit) {
    val ctx = LocalContext.current
    val scope = rememberCoroutineScope()
    var name by remember { mutableStateOf(prof.name) }
    val lang = AppCompatDelegate.getApplicationLocales()[0]?.language ?: Locale.getDefault().language
    val wall = { PlaybackService.instance?.refreshWall(false) }
    AlertDialog(onDismissRequest = close,
        confirmButton = { TextButton({ Store.rename(prof.id, name.trim().ifEmpty { prof.name }); close() }) { Text(stringResource(R.string.done)) } },
        title = { Text(stringResource(R.string.settings)) },
        text = {
            Column(Modifier.verticalScroll(rememberScrollState()), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                OutlinedTextField(name, { name = it }, label = { Text(stringResource(R.string.rename)) }, singleLine = true)
                Toggle(R.string.kids, prof.kids) { Store.setKids(prof.id, it); wall() }
                Head(stringResource(R.string.theme) + ": " + THEMES[prof.theme].name)
                FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    THEMES.forEachIndexed { i, t ->
                        Box(Modifier.size(44.dp).clip(CircleShape).background(Brush.linearGradient(listOf(t.dark.primary, t.dark.secondary)))
                            .border(if (prof.theme == i) 3.dp else 0.dp, cs.onSurface, CircleShape).clickable { Store.setTheme(prof.id, i) },
                            contentAlignment = Alignment.Center) { Text(t.emoji) }
                    }
                }
                Head(stringResource(R.string.look))
                Chips(listOf(0 to stringResource(R.string.auto), 1 to stringResource(R.string.day), 2 to stringResource(R.string.night)), Store.i("look")) { Store.setI("look", it) }
                Head(stringResource(R.string.language))
                FlowRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    listOf("en" to "English", "ar" to "العربية", "fr" to "Français", "pt" to "Português").forEach { (tag, label) ->
                        FilterChip(lang == tag, { AppCompatDelegate.setApplicationLocales(LocaleListCompat.forLanguageTags(tag)) }, { Text(label) })
                    }
                }
                Toggle(R.string.wallpaper, Store.b("wall", true)) { Store.setB("wall", it); wall() }
                if (!prof.kids) Chips(listOf(0 to stringResource(R.string.source_mix), 1 to stringResource(R.string.source_mine), 2 to stringResource(R.string.source_region)),
                    Store.i("src")) { Store.setI("src", it); wall() }
                Head(stringResource(R.string.slide))
                Chips(listOf(0 to stringResource(R.string.every_song), 5 to "5 min", 15 to "15 min", 30 to "30 min"), Store.i("slide")) { Store.setI("slide", it) }
                Toggle(R.string.data_saver, Store.dataSaver) { Store.dataSaver = it }
                Toggle(R.string.autoplay, Store.autoplay) { Store.autoplay = it; if (it && Build.VERSION.SDK_INT >= 31) (ctx as? MainActivity)?.ask(Manifest.permission.BLUETOOTH_CONNECT) }
                Toggle(R.string.speed_show, Store.b("speed", true)) { Store.setB("speed", it); if (it) startSpeed(ctx) else SpeedService.stop(ctx) }
                Toggle(R.string.speed_car, Store.b("speedCar", true)) { Store.setB("speedCar", it); PlaybackService.instance?.showSpeed(null) }
                Toggle(R.string.brief, Store.b("brief", true)) { Store.setB("brief", it) }
                Toggle(R.string.night_ride, Store.b("night", true)) { Store.setB("night", it) }
                Toggle(R.string.news_flash, Store.newsFlash) { Store.newsFlash = it }
                Toggle(R.string.breaking_speak, Store.b("bspeak")) { Store.setB("bspeak", it) }
                Toggle(R.string.breaking_notify, Store.b("bnotif", true)) { Store.setB("bnotif", it) }
            }
        })
}

@Composable
fun Head(t: String) = Text(t, fontWeight = FontWeight.Bold)

@Composable
fun Toggle(label: Int, on: Boolean, set: (Boolean) -> Unit) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Text(stringResource(label), Modifier.weight(1f))
        Switch(on, set)
    }
}

/** Drive mode: the car look, a big speedometer and big buttons. */
@Composable
fun Drive(pc: PlayerConn, exit: () -> Unit) {
    val ctx = LocalContext.current
    LaunchedEffect(Unit) { startSpeed(ctx) }
    val now by produceState(Date()) { while (true) { delay(15_000); value = Date() } }
    MaterialTheme(colorScheme = DRIVE.dark, typography = HouseType) {
        BoxWithConstraints(Modifier.fillMaxSize().background(cs.background.copy(alpha = .85f)).safeDrawingPadding().padding(20.dp)) {
            val wide = maxWidth > maxHeight
            Text(clocks(now) + (Wall.state?.weather?.let { "   ${it.icon} ${it.temp}° ${it.place}" } ?: ""),
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
                    Text(pc.name.ifEmpty { stringResource(R.string.app_name) }, Modifier.padding(top = 8.dp), fontSize = 26.sp, fontWeight = FontWeight.Bold,
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

/** The website's Lebanese TV: each channel's official YouTube playlists. Phone only, paused while moving. */
@Composable
fun Tv(pc: PlayerConn) {
    val lang = currentLang()
    val list by produceState<List<Repo.TvChannel>?>(null) { value = runCatching { Repo.tv(lang) }.getOrElse { emptyList() } }
    var ch by remember { mutableStateOf<Repo.TvChannel?>(null) }
    var play by remember { mutableStateOf<String?>(null) }
    val moving = (Speed.kmh ?: 0) > 10
    if (moving) {
        Box(Modifier.fillMaxSize(), Alignment.Center) { Text("🚗 " + stringResource(R.string.tv_driving), color = cs.onBackground, textAlign = TextAlign.Center) }
        return
    }
    play?.let { id -> YouTube(id) { play = null } }
    val l = list ?: return Box(Modifier.fillMaxSize(), Alignment.Center) { CircularProgressIndicator() }
    val c = ch
    if (c == null) LazyVerticalGrid(GridCells.Adaptive(150.dp), contentPadding = PaddingValues(16.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        items(l) { x ->
            Card({ ch = x }, colors = CardDefaults.cardColors(Color(x.color))) {
                Column(Modifier.fillMaxWidth().padding(vertical = 28.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(x.name, fontSize = 22.sp, fontWeight = FontWeight.Bold, color = Color.White)
                    Text(x.ar, color = Color.White.copy(alpha = .85f))
                }
            }
        }
    } else Column {
        Row(Modifier.clickable { ch = null }.padding(16.dp, 8.dp), verticalAlignment = Alignment.CenterVertically) {
            Icon(Icons.AutoMirrored.Filled.ArrowBack, stringResource(R.string.back), tint = cs.onBackground)
            Text("  📺 ${c.name}", color = cs.onBackground, fontWeight = FontWeight.SemiBold)
        }
        LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            items(c.lists) { p ->
                Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)).background(cs.surface.copy(alpha = .88f))
                    .clickable { pc.pause(); play = p.id }.padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.PlayCircle, null, tint = cs.primary)
                    Text(p.title, Modifier.padding(start = 12.dp), color = cs.onSurface)
                }
            }
        }
    }
}

@Composable
fun YouTube(list: String, close: () -> Unit) {
    val html = "<html><body style='margin:0;background:#000;height:100%'><iframe style='border:0;width:100%;height:100%' " +
        "src='https://www.youtube.com/embed/videoseries?list=$list&autoplay=1&playsinline=1' allow='autoplay; encrypted-media; fullscreen' allowfullscreen></iframe></body></html>"
    Dialog(close, DialogProperties(usePlatformDefaultWidth = false)) {
        Box(Modifier.fillMaxSize().background(Color.Black)) {
            AndroidView({ c -> WebView(c).apply {
                settings.javaScriptEnabled = true; settings.domStorageEnabled = true; settings.mediaPlaybackRequiresUserGesture = false
                loadDataWithBaseURL(Repo.SITE, html, "text/html", "utf-8", null)
            } }, Modifier.fillMaxSize(), onRelease = { it.destroy() })
            IconButton(close, Modifier.align(Alignment.TopEnd).padding(8.dp).background(Color.Black.copy(alpha = .6f), CircleShape)) {
                Icon(Icons.Default.Close, null, tint = Color.White)
            }
        }
    }
}
