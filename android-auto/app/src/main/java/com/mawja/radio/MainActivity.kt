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

    fun ask(p: String) { if (checkSelfPermission(p) != PackageManager.PERMISSION_GRANTED) requestPermissions(arrayOf(p), 1) }
}

private val cs @Composable get() = MaterialTheme.colorScheme

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
    MaterialTheme(colorScheme = if (dark) th.dark else th.light) {
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
        contentAlignment = Alignment.Center) { Text(if (p.kids) "🧸" else t.emoji, fontSize = (size.value / 2.4).sp) }
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
    MOODS(R.string.moods, true), WORLD(R.string.world, false), SEARCH(R.string.search, false), NEWS(R.string.news, false),
    MUSIC(R.string.music, false), PHOTOS(R.string.photos, false), PASS(R.string.passport, true)
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
    if (settings) Settings(prof) { settings = false }

    Column(Modifier.fillMaxSize().safeDrawingPadding()) {
        Row(Modifier.fillMaxWidth().padding(16.dp, 12.dp), verticalAlignment = Alignment.CenterVertically) {
            Badge(prof, 44.dp, switch)
            Column(Modifier.padding(start = 12.dp).weight(1f)) {
                Text(stringResource(R.string.app_name), style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = cs.onBackground)
                Text(clocks(now) + (Wall.state?.weather?.let { "   ${it.icon} ${it.temp}° ${it.place}" } ?: ""),
                    style = MaterialTheme.typography.bodySmall, color = cs.onBackground.copy(alpha = .8f), maxLines = 1)
            }
            if (Store.newsFlash) IconButton({ pc.news() }) { Icon(Icons.Default.Newspaper, stringResource(R.string.news_flash), tint = cs.onBackground) }
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
                Page.MOODS -> Moods(pc)
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
                Page.MUSIC -> Music(rev)
                Page.PHOTOS -> Photos(rev)
                Page.PASS -> Passport(rev)
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
fun Moods(pc: PlayerConn) {
    var tag by rememberSaveable { mutableStateOf("pop") }
    Column {
        Row(Modifier.fillMaxWidth().padding(horizontal = 12.dp).horizontalScroll(rememberScrollState()), Arrangement.spacedBy(8.dp)) {
            PlaybackService.MOODS.forEach { (label, t) -> FilterChip(tag == t, { tag = t }, { Text(stringResource(label)) }) }
        }
        Stations("m:$tag", pc) { Repo.mood(tag) }
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
fun Music(rev: Int) {
    val ctx = LocalContext.current
    var link by remember { mutableStateOf("") }
    val songs = remember(rev) { Store.songs() }
    val lists = remember(rev) { Store.playlists() }
    LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button({ open(ctx, "spotify:") }) { Text("Spotify") }
                Button({ open(ctx, "https://music.youtube.com") }) { Text("YouTube Music") }
            }
        }
        item { Text(stringResource(R.string.playlists), fontWeight = FontWeight.Bold, color = cs.onBackground, modifier = Modifier.padding(top = 12.dp)) }
        item {
            Row(verticalAlignment = Alignment.CenterVertically) {
                OutlinedTextField(link, { link = it }, Modifier.weight(1f), singleLine = true, placeholder = { Text(stringResource(R.string.add_playlist)) })
                IconButton({ if (link.startsWith("http")) { Store.addPlaylist(link.trim()); link = "" } }) { Icon(Icons.Default.Add, null, tint = cs.primary) }
            }
        }
        items(lists) { u ->
            Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)).background(cs.surface.copy(alpha = .85f)).clickable { open(ctx, u) }.padding(12.dp),
                verticalAlignment = Alignment.CenterVertically) {
                Text(if ("spotify" in u) "🟢" else "▶️", fontSize = 20.sp)
                Text(Uri.parse(u).run { (host ?: "") + (path ?: "") }, Modifier.padding(start = 12.dp).weight(1f), maxLines = 1, overflow = TextOverflow.Ellipsis, color = cs.onSurface)
                IconButton({ Store.removePlaylist(u) }) { Icon(Icons.Default.Close, null, tint = cs.onSurface) }
            }
        }
        item { Text("🎵 " + stringResource(R.string.liked_songs), fontWeight = FontWeight.Bold, color = cs.onBackground, modifier = Modifier.padding(top = 12.dp)) }
        if (songs.isEmpty()) item { Text(stringResource(R.string.empty), color = cs.onBackground.copy(alpha = .7f)) }
        items(songs) { s ->
            Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)).background(cs.surface.copy(alpha = .85f)).padding(start = 12.dp),
                verticalAlignment = Alignment.CenterVertically) {
                Text(s, Modifier.weight(1f), maxLines = 2, overflow = TextOverflow.Ellipsis, color = cs.onSurface)
                TextButton({ open(ctx, "https://open.spotify.com/search/" + Uri.encode(s)) }) { Text("Spotify") }
                TextButton({ open(ctx, "https://music.youtube.com/search?q=" + enc(s)) }) { Text("YouTube") }
                IconButton({ Store.removeSong(s) }) { Icon(Icons.Default.Close, null, tint = cs.onSurface) }
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
                cam.launch(FileProvider.getUriForFile(ctx, "com.mawja.radio.files", f))
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
fun Passport(rev: Int) {
    val st = remember(rev) { Store.stats() }
    val total = st.optInt("t")
    val countries = st.optJSONObject("c")?.let { o -> o.keys().asSequence().map { it to o.optInt(it) }.sortedByDescending { it.second }.toList() } ?: emptyList()
    val top = st.optJSONObject("s")?.let { o -> o.keys().asSequence().map { it to o.optInt(it) }.sortedByDescending { it.second }.take(5).toList() } ?: emptyList()
    LazyVerticalGrid(GridCells.Adaptive(96.dp), contentPadding = PaddingValues(16.dp),
        horizontalArrangement = Arrangement.spacedBy(10.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        item(span = { GridItemSpan(maxLineSpan) }) {
            Card(colors = CardDefaults.cardColors(cs.surface.copy(alpha = .88f))) {
                Column(Modifier.fillMaxWidth().padding(16.dp)) {
                    Text("🛂 " + stringResource(R.string.passport), style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = cs.onSurface)
                    Text(stringResource(R.string.hours, "%.1f".format(total / 60f)) + " · " + stringResource(R.string.countries, countries.size), color = cs.primary)
                    if (top.isNotEmpty()) Text(stringResource(R.string.top_stations), fontWeight = FontWeight.SemiBold, color = cs.onSurface, modifier = Modifier.padding(top = 10.dp))
                    top.forEachIndexed { i, (n, m) -> Text("${i + 1}. $n · ${m}m", color = cs.onSurface) }
                }
            }
        }
        items(countries) { (cc, m) ->
            Column(Modifier.border(2.dp, cs.primary, RoundedCornerShape(14.dp)).background(cs.surface.copy(alpha = .8f), RoundedCornerShape(14.dp)).padding(10.dp),
                horizontalAlignment = Alignment.CenterHorizontally) {
                Text(flag(cc), fontSize = 34.sp)
                Text(cc, fontWeight = FontWeight.Bold, color = cs.onSurface)
                Text("${m}m", style = MaterialTheme.typography.bodySmall, color = cs.onSurface.copy(alpha = .7f))
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
    val saved = stringResource(R.string.saved_song)
    val sleep = PlaybackService.instance?.sleepMin ?: 0
    Surface(color = cs.surface.copy(alpha = .92f), tonalElevation = 6.dp, shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp)) {
        Column(Modifier.fillMaxWidth().padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Logo(pc.station, 64.dp)
                Column(Modifier.weight(1f).padding(horizontal = 12.dp)) {
                    Text(pc.name, maxLines = 1, overflow = TextOverflow.Ellipsis, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = cs.onSurface)
                    Text(pc.sub, maxLines = 1, overflow = TextOverflow.Ellipsis, style = MaterialTheme.typography.bodyMedium, color = cs.onSurface.copy(alpha = .7f))
                }
                if (pc.song) IconButton({ if (PlaybackService.instance?.saveSong() == true) Toast.makeText(ctx, saved, Toast.LENGTH_SHORT).show() }) {
                    Icon(Icons.Default.LibraryMusic, stringResource(R.string.save_song), tint = cs.onSurface)
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
                Toggle(R.string.brief, Store.b("brief", true)) { Store.setB("brief", it) }
                Toggle(R.string.night_ride, Store.b("night", true)) { Store.setB("night", it) }
                Toggle(R.string.news_flash, Store.newsFlash) { Store.newsFlash = it }
                Toggle(R.string.breaking_speak, Store.b("bspeak")) { Store.setB("bspeak", it) }
                Toggle(R.string.breaking_notify, Store.b("bnotif", true)) { Store.setB("bnotif", it) }
                Toggle(R.string.alarm, Store.b("alarm")) { on ->
                    Store.setB("alarm", on)
                    if (on) {
                        val am = ctx.getSystemService(AlarmManager::class.java)
                        if (Build.VERSION.SDK_INT >= 31 && !am.canScheduleExactAlarms())
                            runCatching { ctx.startActivity(Intent(android.provider.Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM, Uri.parse("package:" + ctx.packageName))) }
                        scope.launch { runCatching { Repo.find("Fairuz").firstOrNull() }.getOrNull()?.let { Store.setS("alarmSt", it.json().toString()) } }
                    }
                    Alarm.schedule(ctx)
                }
                if (Store.b("alarm")) TextButton({
                    TimePickerDialog(ctx, { _, h, m -> Store.setI("ah", h); Store.setI("am", m); Alarm.schedule(ctx) }, Store.i("ah", 7), Store.i("am", 0), true).show()
                }) { Text("⏰ %02d:%02d".format(Store.i("ah", 7), Store.i("am", 0))) }
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
