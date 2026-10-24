package com.mawja.radio

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import androidx.annotation.OptIn
import androidx.appcompat.app.AppCompatDelegate
import androidx.core.app.NotificationCompat
import androidx.media3.common.AudioAttributes
import androidx.media3.common.C
import androidx.media3.common.MediaItem
import androidx.media3.common.MediaMetadata
import androidx.media3.common.PlaybackException
import androidx.media3.common.Player
import androidx.media3.common.util.UnstableApi
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.exoplayer.source.DefaultMediaSourceFactory
import androidx.media3.exoplayer.upstream.DefaultLoadErrorHandlingPolicy
import androidx.media3.session.CommandButton
import androidx.media3.session.LibraryResult
import androidx.media3.session.MediaLibraryService
import androidx.media3.session.MediaLibraryService.LibraryParams
import androidx.media3.session.MediaLibraryService.MediaLibrarySession
import androidx.media3.session.MediaSession
import androidx.media3.session.MediaSession.MediaItemsWithStartPosition
import androidx.media3.session.SessionCommand
import androidx.media3.session.SessionResult
import com.google.common.collect.ImmutableList
import com.google.common.util.concurrent.Futures
import com.google.common.util.concurrent.ListenableFuture
import kotlinx.coroutines.*
import kotlinx.coroutines.guava.future
import java.io.File
import java.time.LocalDate
import java.util.Calendar
import java.util.Locale
import kotlin.coroutines.resume

@OptIn(UnstableApi::class)
class PlaybackService : MediaLibraryService() {
    companion object {
        const val AUTOPLAY = "com.mawja.radio.AUTOPLAY"
        private const val CAR = "com.google.android.projection.gearhead"
        private val FAV = SessionCommand("fav", Bundle.EMPTY)
        val LEB = Station("lb", "Lebanon", "", null, null, "Lebanon", "LB", "", 0, null, null)
        val MOODS = listOf(R.string.happy to "pop", R.string.nostalgic to "oldies", R.string.calm to "chillout",
            R.string.party to "dance", R.string.tarab to "arabic")
        var instance: PlaybackService? = null
        fun nightNow() = Calendar.getInstance().get(Calendar.HOUR_OF_DAY).let { it >= 23 || it < 5 }
    }

    private lateinit var player: ExoPlayer
    private lateinit var session: MediaLibrarySession
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
    private val handler = Handler(Looper.getMainLooper())
    private val children = HashMap<String, List<MediaItem>>()
    private val results = HashMap<String, List<Station>>()
    private var retries = 0
    private var tts: TextToSpeech? = null
    private var lastId: String? = null
    private var lastTitle: String? = null
    private var wallJob: Job? = null
    private var minutes = 0
    var sleepMin = 0; private set
    var carOn = false; private set
    private val sleepRun = Runnable { fade(1f, 0f, 20_000) { player.pause(); player.volume = 1f }; sleepMin = 0; Store.bump() }

    private val minuteTick = object : Runnable {
        override fun run() {
            if (++minutes % 10 == 0) scope.launch { checkBreaking() }
            handler.postDelayed(this, 60_000L)
        }
    }
    private val slideTick = object : Runnable {
        override fun run() {
            val m = Store.i("slide")
            if (m > 0 || player.isPlaying) refreshWall(m > 0)
            handler.postDelayed(this, (if (m > 0) m else 10) * 60_000L)
        }
    }

    override fun onCreate() {
        super.onCreate()
        instance = this
        val sources = DefaultMediaSourceFactory(this).setLoadErrorHandlingPolicy(DefaultLoadErrorHandlingPolicy(6))
        player = ExoPlayer.Builder(this).setMediaSourceFactory(sources)
            .setAudioAttributes(AudioAttributes.Builder().setUsage(C.USAGE_MEDIA).setContentType(C.AUDIO_CONTENT_TYPE_MUSIC).build(), true)
            .setHandleAudioBecomingNoisy(true).setWakeMode(C.WAKE_MODE_NETWORK).build()
        player.addListener(object : Player.Listener {
            override fun onPlayerError(error: PlaybackException) = recover()
            override fun onIsPlayingChanged(isPlaying: Boolean) { if (isPlaying) retries = 0; pushWidget() }
            override fun onMediaItemTransition(item: MediaItem?, reason: Int) {
                if (item?.mediaId == lastId) return
                lastId = item?.mediaId
                Repo.stations[stationId(item)]?.let { Store.addRecent(it) }
                refreshWall(false)
            }
            override fun onMediaMetadataChanged(m: MediaMetadata) {
                val t = m.title?.toString()
                if (t != lastTitle) { lastTitle = t; if (Store.i("slide") == 0) refreshWall(true) }
                pushWidget()
            }
        })
        val open = PendingIntent.getActivity(this, 0, Intent(this, MainActivity::class.java), PendingIntent.FLAG_IMMUTABLE)
        session = MediaLibrarySession.Builder(this, player, Callback()).setSessionActivity(open).build()
        getSystemService(NotificationManager::class.java).createNotificationChannel(
            NotificationChannel("breaking", getString(R.string.breaking), NotificationManager.IMPORTANCE_HIGH))
        handler.postDelayed(minuteTick, 60_000L)
        handler.post(slideTick)
        refreshWall(false)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent?.action == AUTOPLAY) playLast()
        return super.onStartCommand(intent, flags, startId)
    }

    override fun onGetSession(controllerInfo: MediaSession.ControllerInfo) = session

    override fun onTaskRemoved(rootIntent: Intent?) {
        if (!player.playWhenReady || player.mediaItemCount == 0) stopSelf()
    }

    override fun onDestroy() {
        instance = null
        handler.removeCallbacksAndMessages(null)
        scope.cancel(); tts?.shutdown()
        session.release(); player.release()
        super.onDestroy()
    }

    private fun start(items: List<MediaItem>) {
        if (items.isEmpty()) return
        player.setMediaItems(items, 0, C.TIME_UNSET); player.prepare(); player.play()
    }

    private fun playLast() { if (!player.isPlaying) start(Store.recents().map { it.item() }) }

    private var speedAt = 0L
    private var shownSpeed: Int? = null

    /** Car speed in the now-playing line: "🚗 87 km/h · Lebanon". */
    fun showSpeed(k: Int?) {
        val now = System.currentTimeMillis()
        if (k == shownSpeed || (k != null && now - speedAt < 3000)) return
        speedAt = now; shownSpeed = k
        val cur = player.currentMediaItem ?: return
        val s = Repo.stations[stationId(cur)] ?: return
        val base = listOf(s.country, s.tags).filter { it.isNotBlank() }.joinToString(" · ")
        val artist = if (k == null || !Store.b("speedCar", true)) base else "🚗 $k km/h" + if (base.isNotBlank()) " · $base" else ""
        player.replaceMediaItem(player.currentMediaItemIndex,
            cur.buildUpon().setMediaMetadata(cur.mediaMetadata.buildUpon().setArtist(artist).build()).build())
    }

    /** Car connected: morning brief before 10am, night ride after 11pm, else the last station. */
    private fun carStart() = scope.launch {
        val night = Store.b("night", true) && nightNow()
        val list = (if (night) runCatching { Repo.mood("chillout") }.getOrNull().orEmpty() else emptyList()).ifEmpty { Store.recents() }
        val items = list.map { it.item() }.toMutableList()
        val today = LocalDate.now().toString()
        if (Store.b("brief", true) && Calendar.getInstance().get(Calendar.HOUR_OF_DAY) in 5..9 && Store.s("briefDay") != today) {
            Store.setS("briefDay", today); items.add(0, briefItem())
        }
        start(items)
    }

    private fun fade(from: Float, to: Float, ms: Long, end: () -> Unit = {}) {
        val steps = 30; var k = 0
        handler.post(object : Runnable {
            override fun run() {
                k++; player.volume = from + (to - from) * k / steps
                if (k < steps) handler.postDelayed(this, ms / steps) else end()
            }
        })
    }

    fun sleep(min: Int) {
        handler.removeCallbacks(sleepRun); sleepMin = min
        if (min > 0) handler.postDelayed(sleepRun, min * 60_000L)
        Store.bump()
    }


    fun refreshWall(next: Boolean) {
        wallJob?.cancel()
        wallJob = scope.launch {
            if (!Store.b("wall", true)) { Wall.state = null; return@launch }
            val item = player.currentMediaItem
            val s = Repo.stations[stationId(item)] ?: Store.last()
            val song = player.mediaMetadata.title?.toString()?.takeIf { it != player.mediaMetadata.station?.toString() }
            val uri = runCatching { Wall.refresh(this@PlaybackService, s, song, next) }.getOrNull() ?: return@launch
            val cur = player.currentMediaItem ?: return@launch
            if (item != null && cur.mediaId == item.mediaId && cur.mediaId.startsWith("st:"))
                player.replaceMediaItem(player.currentMediaItemIndex,
                    cur.buildUpon().setMediaMetadata(cur.mediaMetadata.buildUpon().setArtworkUri(uri).build()).build())
            pushWidget()
        }
    }

    private fun pushWidget() {
        val m = player.mediaMetadata
        MawjaWidget.name = (m.station ?: m.title)?.toString() ?: ""
        MawjaWidget.sub = m.title?.toString()?.takeIf { it != MawjaWidget.name } ?: m.artist?.toString() ?: ""
        MawjaWidget.playing = player.isPlaying
        MawjaWidget.push(this)
    }

    /** Tunnels and dead streams: try the backup link, then reconnect, then move to the next station. */
    private fun recover() {
        val item = player.currentMediaItem ?: return
        val s = Repo.stations[stationId(item)]
        if (s?.backup != null && item.localConfiguration?.uri?.toString() == s.url) {
            player.replaceMediaItem(player.currentMediaItemIndex, item.buildUpon().setUri(s.backup).build())
            player.prepare(); player.play(); return
        }
        if (retries++ < 5) handler.postDelayed({ player.prepare(); player.play() }, 4000L * retries)
        else if (player.hasNextMediaItem()) { retries = 0; player.seekToNextMediaItem(); player.prepare(); player.play() }
    }

    // ---------- speech: news flash, morning brief, breaking news ----------

    private fun appLang() = AppCompatDelegate.getApplicationLocales()[0]?.language ?: Locale.getDefault().language
    private fun langOf(t: String) = if (t.any { it in '؀'..'ۿ' }) "ar" else appLang()

    private fun done(f: () -> Unit) = object : UtteranceProgressListener() {
        override fun onStart(id: String?) {}
        override fun onDone(id: String?) = f()
        @Deprecated("Deprecated in Java")
        override fun onError(id: String?) = f()
    }

    private fun withTts(lang: String, f: (TextToSpeech) -> Unit) {
        tts?.let { it.language = Locale(lang); f(it); return }
        lateinit var e: TextToSpeech
        e = TextToSpeech(this) { if (it == TextToSpeech.SUCCESS) { tts = e; e.language = Locale(lang); f(e) } }
    }

    private suspend fun spoken(text: String, lang: String, title: String): MediaItem {
        cacheDir.listFiles()?.filter { it.name.startsWith("tts_") }?.forEach { it.delete() }
        val file = File(cacheDir, "tts_${System.currentTimeMillis()}.wav")
        withTimeoutOrNull(20_000) {
            suspendCancellableCoroutine<Unit> { cont ->
                withTts(lang) { e ->
                    e.setOnUtteranceProgressListener(done { if (cont.isActive) cont.resume(Unit) })
                    e.synthesizeToFile(text, Bundle(), file, "f")
                }
            }
        }
        return MediaItem.Builder().setMediaId("news").setUri(Uri.fromFile(file)).setMediaMetadata(
            MediaMetadata.Builder().setTitle(title).setArtist(text.take(90)).setIsBrowsable(false)
                .setIsPlayable(true).setMediaType(MediaMetadata.MEDIA_TYPE_NEWS).build()
        ).build()
    }

    private suspend fun headlinesText(): Pair<String, String> {
        val all = try { Repo.news() } catch (e: Exception) { emptyList() }
        val app = appLang()
        val lang = if (all.any { it.first == app }) app else all.firstOrNull()?.first ?: app
        return lang to all.filter { it.first == lang }.take(3).joinToString(". ") { it.second }.ifEmpty { t(R.string.no_news) }
    }

    private suspend fun news(): MediaItem { val (lang, text) = headlinesText(); return spoken(text, lang, t(R.string.news_flash)) }

    private suspend fun briefItem(): MediaItem {
        val (lang, text) = headlinesText()
        val w = runCatching { Repo.weather(Store.last()?.takeIf { it.cc.isNotBlank() } ?: LEB) }.getOrNull()
        val intro = t(R.string.good_morning) + ". " + (w?.let { "${it.place}, ${it.temp}°. " } ?: "")
        return spoken(intro + text, lang, t(R.string.brief))
    }

    private suspend fun checkBreaking() {
        val speak = Store.b("bspeak"); val notify = Store.b("bnotif", true)
        if (!speak && !notify) return
        val marker = Regex("عاجل|\\b(breaking|urgent|just in|alerte|flash)\\b", RegexOption.IGNORE_CASE)
        val n = runCatching { Repo.headlines() }.getOrNull()?.firstOrNull {
            System.currentTimeMillis() - it.date < 3_600_000L && marker.containsMatchIn(it.title) && Store.markSeen(it.title)
        } ?: return
        if (notify) {
            val tap = PendingIntent.getActivity(this, 3, Intent(Intent.ACTION_VIEW, Uri.parse(n.link ?: Repo.SITE)), PendingIntent.FLAG_IMMUTABLE)
            runCatching {
                getSystemService(NotificationManager::class.java).notify(n.title.hashCode(),
                    NotificationCompat.Builder(this, "breaking").setSmallIcon(R.drawable.ic_note).setContentTitle(t(R.string.breaking) + " · " + n.source)
                        .setContentText(n.title).setStyle(NotificationCompat.BigTextStyle().bigText(n.title))
                        .setContentIntent(tap).setAutoCancel(true).build())
            }
        }
        if (speak && player.isPlaying) withTts(langOf(n.title)) { e ->
            player.volume = .25f
            e.setOnUtteranceProgressListener(done { handler.post { player.volume = 1f } })
            e.speak(n.title, TextToSpeech.QUEUE_FLUSH, null, "b")
        }
    }

    // ---------- car browse tree ----------

    private fun t(id: Int) = getString(id)

    private fun folder(id: String, title: String, sub: String? = null) = MediaItem.Builder().setMediaId(id).setMediaMetadata(
        MediaMetadata.Builder().setTitle(title).setSubtitle(sub).setIsBrowsable(true).setIsPlayable(false)
            .setMediaType(MediaMetadata.MEDIA_TYPE_FOLDER_RADIO_STATIONS).build()
    ).build()

    private fun newsStub() = MediaItem.Builder().setMediaId("news").setMediaMetadata(
        MediaMetadata.Builder().setTitle("📰 " + t(R.string.news_flash)).setIsBrowsable(false).setIsPlayable(true)
            .setMediaType(MediaMetadata.MEDIA_TYPE_NEWS).build()
    ).build()

    private suspend fun kids(parent: String): List<MediaItem> = when {
        parent == "root" -> buildList {
            val prof = Store.current()
            if (Store.b("night", true) && nightNow()) add(folder("night", "🌙 " + t(R.string.night_ride)))
            runCatching { Repo.stationOfDay() }.getOrNull()?.let { s ->
                val it = s.item()
                add(it.buildUpon().setMediaMetadata(it.mediaMetadata.buildUpon().setTitle("⭐ " + s.name).setSubtitle(t(R.string.station_day)).build()).build())
            }
            add(folder("fav", "★ " + t(R.string.favorites), prof.name))
            add(folder("rec", t(R.string.recent)))
            add(folder("feat", t(R.string.featured)))
            add(folder("c:LB", flag("LB") + " " + t(R.string.lebanon)))
            if (!prof.kids) add(folder("world", "🌍 " + t(R.string.world)))
            add(folder("profiles", t(R.string.profiles), prof.name))
            if (Store.newsFlash) add(newsStub())
        }
        parent == "fav" -> Store.favs().map { it.item() }
        parent == "rec" -> Store.recents().map { it.item() }
        parent == "feat" -> Repo.featured().map { it.item() }
        parent == "night" -> Repo.mood("chillout").map { it.item() }
        parent == "world" -> Repo.countries().map { folder("c:${it.cc}", flag(it.cc) + " " + it.name, "${it.count}") }
        parent == "profiles" -> Store.profiles().map { folder("p:${it.id}", it.name) }
        parent.startsWith("p:") -> { Store.currentId = parent.drop(2).toInt(); refreshWall(true); Store.favs().map { it.item() } }
        parent.startsWith("c:") -> Repo.byCountry(parent.drop(2)).map { it.item() }
        else -> emptyList()
    }.also { children[parent] = it }

    private fun resolve(item: MediaItem): MediaItem? =
        if (item.localConfiguration != null) item else Repo.stations[stationId(item)]?.item()

    private fun button(name: Int, icon: Int, cmd: SessionCommand) =
        CommandButton.Builder().setDisplayName(t(name)).setIconResId(icon).setSessionCommand(cmd).build()

    private inner class Callback : MediaLibrarySession.Callback {
        override fun onConnect(session: MediaSession, controller: MediaSession.ControllerInfo): MediaSession.ConnectionResult {
            if (controller.packageName == CAR) carOn = true
            if (controller.packageName == CAR && Store.autoplay && player.mediaItemCount == 0) handler.post { carStart() }
            val cmds = MediaSession.ConnectionResult.DEFAULT_SESSION_AND_LIBRARY_COMMANDS.buildUpon().add(FAV).build()
            return MediaSession.ConnectionResult.AcceptedResultBuilder(session).setAvailableSessionCommands(cmds)
                .setCustomLayout(ImmutableList.of(button(R.string.favorite, R.drawable.ic_heart, FAV)))
                .build()
        }

        // Arrival fade: the music eases out when you leave the car.
        override fun onDisconnected(session: MediaSession, controller: MediaSession.ControllerInfo) {
            if (controller.packageName == CAR) { carOn = false; SpeedService.stop(this@PlaybackService) }
            if (controller.packageName == CAR && player.isPlaying) fade(1f, 0f, 3000) { player.pause(); player.volume = 1f }
        }

        override fun onCustomCommand(
            session: MediaSession, controller: MediaSession.ControllerInfo, customCommand: SessionCommand, args: Bundle
        ): ListenableFuture<SessionResult> {
            when (customCommand.customAction) {
                FAV.customAction -> Repo.stations[stationId(player.currentMediaItem)]?.let { Store.toggleFav(it) }
            }
            return Futures.immediateFuture(SessionResult(SessionResult.RESULT_SUCCESS))
        }

        override fun onGetLibraryRoot(
            session: MediaLibrarySession, browser: MediaSession.ControllerInfo, params: LibraryParams?
        ): ListenableFuture<LibraryResult<MediaItem>> {
            val extras = Bundle().apply {
                putInt("android.media.browse.CONTENT_STYLE_BROWSABLE_HINT", 1)
                putInt("android.media.browse.CONTENT_STYLE_PLAYABLE_HINT", 2)
                putBoolean("android.media.browse.SEARCH_SUPPORTED", true)
            }
            return Futures.immediateFuture(LibraryResult.ofItem(folder("root", t(R.string.app_name)), LibraryParams.Builder().setExtras(extras).build()))
        }

        override fun onGetChildren(
            session: MediaLibrarySession, browser: MediaSession.ControllerInfo, parentId: String, page: Int, pageSize: Int, params: LibraryParams?
        ): ListenableFuture<LibraryResult<ImmutableList<MediaItem>>> = scope.future {
            LibraryResult.ofItemList(try { kids(parentId) } catch (e: Exception) { emptyList() }, params)
        }

        override fun onGetItem(
            session: MediaLibrarySession, browser: MediaSession.ControllerInfo, mediaId: String
        ): ListenableFuture<LibraryResult<MediaItem>> {
            val item = Repo.stations[mediaId.removePrefix("st:")]?.item() ?: folder(mediaId, mediaId)
            return Futures.immediateFuture(LibraryResult.ofItem(item, null))
        }

        override fun onSearch(
            session: MediaLibrarySession, browser: MediaSession.ControllerInfo, query: String, params: LibraryParams?
        ): ListenableFuture<LibraryResult<Void>> {
            scope.launch {
                val r = try { Repo.find(query) } catch (e: Exception) { emptyList() }
                results[query] = r
                session.notifySearchResultChanged(browser, query, r.size, params)
            }
            return Futures.immediateFuture(LibraryResult.ofVoid())
        }

        override fun onGetSearchResult(
            session: MediaLibrarySession, browser: MediaSession.ControllerInfo, query: String, page: Int, pageSize: Int, params: LibraryParams?
        ): ListenableFuture<LibraryResult<ImmutableList<MediaItem>>> = scope.future {
            val r = results[query] ?: try { Repo.find(query) } catch (e: Exception) { emptyList() }
            LibraryResult.ofItemList(r.map { it.item() }.also { children["search"] = it }, params)
        }

        override fun onAddMediaItems(
            mediaSession: MediaSession, controller: MediaSession.ControllerInfo, mediaItems: MutableList<MediaItem>
        ): ListenableFuture<MutableList<MediaItem>> = Futures.immediateFuture(mediaItems.mapNotNull { resolve(it) }.toMutableList())

        override fun onSetMediaItems(
            mediaSession: MediaSession, controller: MediaSession.ControllerInfo, mediaItems: MutableList<MediaItem>,
            startIndex: Int, startPositionMs: Long
        ): ListenableFuture<MediaItemsWithStartPosition> = scope.future {
            val first = mediaItems.firstOrNull()
            val q = first?.requestMetadata?.searchQuery
            when {
                // "Hey Google, play <station> on Sawt el Beit"
                q != null -> {
                    val r = (if (q.isBlank()) emptyList() else try { Repo.find(q) } catch (e: Exception) { emptyList() })
                        .ifEmpty { Store.recents().ifEmpty { Store.favs() } }
                    MediaItemsWithStartPosition(r.map { it.item() }, 0, C.TIME_UNSET)
                }
                first?.mediaId == "news" -> MediaItemsWithStartPosition(listOf(news()), 0, C.TIME_UNSET)
                else -> {
                    // A station tapped in the car: queue its whole list so next/previous on the wheel works.
                    val id = first?.mediaId
                    val list = if (mediaItems.size == 1) children.values.firstOrNull { l ->
                        l.any { it.mediaId == id } && l.all { it.mediaMetadata.isPlayable == true && it.mediaId != "news" }
                    } else null
                    if (list != null) MediaItemsWithStartPosition(list, list.indexOfFirst { it.mediaId == id }, C.TIME_UNSET)
                    else MediaItemsWithStartPosition(mediaItems.mapNotNull { resolve(it) }, startIndex, startPositionMs)
                }
            }
        }

        override fun onPlaybackResumption(
            mediaSession: MediaSession, controller: MediaSession.ControllerInfo
        ): ListenableFuture<MediaItemsWithStartPosition> = Futures.immediateFuture(
            MediaItemsWithStartPosition(Store.recents().map { it.item() }, 0, C.TIME_UNSET)
        )
    }
}
