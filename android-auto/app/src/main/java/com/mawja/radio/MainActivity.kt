package com.mawja.radio

import android.Manifest
import android.content.ActivityNotFoundException
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.view.WindowManager
import androidx.activity.compose.setContent
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.app.AppCompatDelegate
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
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
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
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
import kotlinx.coroutines.delay
import java.util.Locale

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
        sub = m.title?.toString()?.takeIf { it != name } ?: m.artist?.toString() ?: ""
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
        setContent { Root(pc, ::share) { if (Build.VERSION.SDK_INT >= 31) ask(Manifest.permission.BLUETOOTH_CONNECT) } }
    }

    override fun onDestroy() { pc.release(); super.onDestroy() }

    private fun ask(p: String) {
        if (checkSelfPermission(p) != PackageManager.PERMISSION_GRANTED) requestPermissions(arrayOf(p), 1)
    }

    private fun share(text: String) {
        val i = Intent(Intent.ACTION_SEND).setType("text/plain").putExtra(Intent.EXTRA_TEXT, text)
        try { startActivity(Intent(i).setPackage("com.whatsapp")) }
        catch (e: ActivityNotFoundException) { startActivity(Intent.createChooser(i, null)) }
    }
}

private val cs @Composable get() = MaterialTheme.colorScheme

@Composable
fun Root(pc: PlayerConn, share: (String) -> Unit, askBt: () -> Unit) {
    Store.rev.intValue
    var picking by rememberSaveable { mutableStateOf(true) }
    val prof = Store.current()
    MaterialTheme(colorScheme = THEMES[prof.theme].scheme) {
        Surface(Modifier.fillMaxSize(), color = cs.background) {
            if (picking) Picker { Store.currentId = it; picking = false }
            else Home(pc, prof, { picking = true }, share, askBt)
        }
    }
}

@Composable
fun Badge(p: Profile, size: Dp, onClick: () -> Unit) {
    val t = THEMES[p.theme]
    Box(Modifier.size(size).clip(RoundedCornerShape(size / 4))
        .background(Brush.linearGradient(listOf(t.scheme.primary, t.scheme.secondary))).clickable(onClick = onClick),
        contentAlignment = Alignment.Center) { Text(t.emoji, fontSize = (size.value / 2.4).sp) }
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

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun Home(pc: PlayerConn, prof: Profile, switch: () -> Unit, share: (String) -> Unit, askBt: () -> Unit) {
    val tabs = listOf(R.string.favorites, R.string.recent, R.string.featured, R.string.lebanon, R.string.world, R.string.search)
    var tab by rememberSaveable { mutableIntStateOf(if (Store.favs().isEmpty()) 3 else 0) }
    var country by remember { mutableStateOf<Country?>(null) }
    var settings by remember { mutableStateOf(false) }
    var query by rememberSaveable { mutableStateOf("") }
    val rev = Store.rev.intValue
    val weather by produceState<Weather?>(null, pc.station?.cc) {
        value = pc.station?.let { runCatching { Repo.weather(it) }.getOrNull() }
    }
    if (settings) Settings(prof, askBt) { settings = false }

    Column(Modifier.fillMaxSize().background(Brush.verticalGradient(listOf(cs.surfaceVariant, cs.background))).safeDrawingPadding()) {
        Row(Modifier.fillMaxWidth().padding(16.dp, 12.dp), verticalAlignment = Alignment.CenterVertically) {
            Badge(prof, 44.dp, switch)
            Text(stringResource(R.string.app_name), Modifier.padding(start = 12.dp).weight(1f),
                style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = cs.onBackground)
            weather?.let { AssistChip({}, { Text("${it.icon} ${it.temp}° ${it.place}", maxLines = 1) }) }
            if (Store.newsFlash) IconButton({ pc.news() }) { Icon(Icons.Default.Newspaper, stringResource(R.string.news_flash), tint = cs.onBackground) }
            IconButton({ settings = true }) { Icon(Icons.Default.Settings, stringResource(R.string.settings), tint = cs.onBackground) }
        }
        ScrollableTabRow(tab, containerColor = Color.Transparent, contentColor = cs.primary, edgePadding = 12.dp) {
            tabs.forEachIndexed { i, r -> Tab(tab == i, { tab = i; country = null }, text = { Text(stringResource(r)) }) }
        }
        Box(Modifier.weight(1f)) {
            when (tab) {
                0 -> Grid(remember(rev) { Store.favs() }, pc)
                1 -> Grid(remember(rev) { Store.recents() }, pc)
                2 -> Stations("feat", pc) { Repo.featured() }
                3 -> Stations("LB", pc) { Repo.byCountry("LB") }
                4 -> country?.let { c ->
                    Column {
                        Row(Modifier.clickable { country = null }.padding(16.dp, 8.dp), verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.AutoMirrored.Filled.ArrowBack, stringResource(R.string.back), tint = cs.onBackground)
                            Text("  ${flag(c.cc)} ${c.name}", color = cs.onBackground, fontWeight = FontWeight.SemiBold)
                        }
                        Stations(c.cc, pc) { Repo.byCountry(c.cc) }
                    }
                } ?: Countries { country = it }
                else -> Column {
                    OutlinedTextField(query, { query = it }, Modifier.fillMaxWidth().padding(16.dp, 8.dp), singleLine = true,
                        leadingIcon = { Icon(Icons.Default.Search, null) }, placeholder = { Text(stringResource(R.string.search)) })
                    if (query.trim().length >= 2) Stations("q:$query", pc) { delay(400); Repo.find(query.trim()) }
                }
            }
        }
        NowPlaying(pc, share)
    }
}

@Composable
fun Stations(key: Any, pc: PlayerConn, load: suspend () -> List<Station>) {
    val list by produceState<List<Station>?>(null, key, Store.dataSaver) { value = runCatching { load() }.getOrElse { emptyList() } }
    list?.let { Grid(it, pc) } ?: Box(Modifier.fillMaxSize(), Alignment.Center) { CircularProgressIndicator() }
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
fun Grid(list: List<Station>, pc: PlayerConn) {
    if (list.isEmpty()) {
        Box(Modifier.fillMaxSize(), Alignment.Center) { Text(stringResource(R.string.empty), color = cs.onBackground.copy(alpha = .6f)) }
        return
    }
    LazyVerticalGrid(GridCells.Adaptive(150.dp), contentPadding = PaddingValues(16.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        items(list, key = { it.id }) { s ->
            val on = pc.station?.id == s.id
            Card({ pc.play(list, s) }, colors = CardDefaults.cardColors(if (on) cs.primary.copy(alpha = .25f) else cs.surface),
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
fun NowPlaying(pc: PlayerConn, share: (String) -> Unit) {
    if (pc.name.isEmpty()) return
    Store.rev.intValue
    val shareText = stringResource(R.string.share_text, pc.name + if (pc.sub.isNotBlank()) " — ${pc.sub}" else "") + " " + Repo.SITE
    val sleep = PlaybackService.instance?.sleepMin ?: 0
    Surface(color = cs.surface, tonalElevation = 6.dp, shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp)) {
        Column(Modifier.fillMaxWidth().padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Logo(pc.station, 64.dp)
                Column(Modifier.weight(1f).padding(horizontal = 12.dp)) {
                    Text(pc.name, maxLines = 1, overflow = TextOverflow.Ellipsis, style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold, color = cs.onSurface)
                    Text(pc.sub, maxLines = 1, overflow = TextOverflow.Ellipsis, style = MaterialTheme.typography.bodyMedium,
                        color = cs.onSurface.copy(alpha = .7f))
                }
                pc.station?.let { s ->
                    IconButton({ Store.toggleFav(s) }) {
                        Icon(if (Store.isFav(s.id)) Icons.Default.Favorite else Icons.Default.FavoriteBorder, stringResource(R.string.favorite), tint = cs.primary)
                    }
                }
                IconButton({ share(shareText) }) { Icon(Icons.Default.Share, null, tint = cs.onSurface) }
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
fun Settings(prof: Profile, askBt: () -> Unit, close: () -> Unit) {
    var name by remember { mutableStateOf(prof.name) }
    val lang = AppCompatDelegate.getApplicationLocales()[0]?.language ?: Locale.getDefault().language
    AlertDialog(onDismissRequest = close,
        confirmButton = { TextButton({ Store.rename(prof.id, name.trim().ifEmpty { prof.name }); close() }) { Text(stringResource(R.string.done)) } },
        title = { Text(stringResource(R.string.settings)) },
        text = {
            Column(Modifier.verticalScroll(rememberScrollState()), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                OutlinedTextField(name, { name = it }, label = { Text(stringResource(R.string.rename)) }, singleLine = true)
                Text(stringResource(R.string.theme) + ": " + THEMES[prof.theme].name, fontWeight = FontWeight.Bold)
                FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    THEMES.forEachIndexed { i, t ->
                        Box(Modifier.size(44.dp).clip(CircleShape).background(Brush.linearGradient(listOf(t.scheme.primary, t.scheme.secondary)))
                            .border(if (prof.theme == i) 3.dp else 0.dp, cs.onSurface, CircleShape).clickable { Store.setTheme(prof.id, i) },
                            contentAlignment = Alignment.Center) { Text(t.emoji) }
                    }
                }
                Text(stringResource(R.string.language), fontWeight = FontWeight.Bold)
                FlowRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    listOf("en" to "English", "ar" to "العربية", "fr" to "Français", "pt" to "Português").forEach { (tag, label) ->
                        FilterChip(lang == tag, { AppCompatDelegate.setApplicationLocales(LocaleListCompat.forLanguageTags(tag)) }, { Text(label) })
                    }
                }
                Toggle(R.string.data_saver, Store.dataSaver) { Store.dataSaver = it }
                Toggle(R.string.autoplay, Store.autoplay) { Store.autoplay = it; if (it) askBt() }
                Toggle(R.string.news_flash, Store.newsFlash) { Store.newsFlash = it }
            }
        })
}

@Composable
fun Toggle(label: Int, on: Boolean, set: (Boolean) -> Unit) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Text(stringResource(label), Modifier.weight(1f))
        Switch(on, set)
    }
}
