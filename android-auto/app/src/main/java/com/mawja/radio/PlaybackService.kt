package com.mawja.radio

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
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.guava.future
import kotlinx.coroutines.launch
import kotlinx.coroutines.suspendCancellableCoroutine
import java.io.File
import java.util.Locale
import kotlin.coroutines.resume

@OptIn(UnstableApi::class)
class PlaybackService : MediaLibraryService() {
    companion object {
        const val AUTOPLAY = "com.mawja.radio.AUTOPLAY"
        private const val CAR = "com.google.android.projection.gearhead"
        private val FAV = SessionCommand("fav", Bundle.EMPTY)
        var instance: PlaybackService? = null
    }

    private lateinit var player: ExoPlayer
    private lateinit var session: MediaLibrarySession
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
    private val handler = Handler(Looper.getMainLooper())
    private val children = HashMap<String, List<MediaItem>>()
    private val results = HashMap<String, List<Station>>()
    private var retries = 0
    private var tts: TextToSpeech? = null
    var sleepMin = 0; private set
    private val sleepRun = Runnable { player.pause(); sleepMin = 0; Store.bump() }

    override fun onCreate() {
        super.onCreate()
        instance = this
        val sources = DefaultMediaSourceFactory(this).setLoadErrorHandlingPolicy(DefaultLoadErrorHandlingPolicy(6))
        player = ExoPlayer.Builder(this).setMediaSourceFactory(sources)
            .setAudioAttributes(AudioAttributes.Builder().setUsage(C.USAGE_MEDIA).setContentType(C.AUDIO_CONTENT_TYPE_MUSIC).build(), true)
            .setHandleAudioBecomingNoisy(true).setWakeMode(C.WAKE_MODE_NETWORK).build()
        player.addListener(object : Player.Listener {
            override fun onPlayerError(error: PlaybackException) = recover()
            override fun onIsPlayingChanged(isPlaying: Boolean) { if (isPlaying) retries = 0 }
            override fun onMediaItemTransition(item: MediaItem?, reason: Int) {
                Repo.stations[stationId(item)]?.let { Store.addRecent(it) }
            }
        })
        val open = PendingIntent.getActivity(this, 0, Intent(this, MainActivity::class.java), PendingIntent.FLAG_IMMUTABLE)
        session = MediaLibrarySession.Builder(this, player, Callback()).setSessionActivity(open).build()
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
        scope.cancel(); tts?.shutdown()
        session.release(); player.release()
        super.onDestroy()
    }

    private fun playLast() {
        if (player.isPlaying) return
        val l = Store.recents().ifEmpty { return }
        player.setMediaItems(l.map { it.item() }, 0, C.TIME_UNSET); player.prepare(); player.play()
    }

    fun sleep(min: Int) {
        handler.removeCallbacks(sleepRun)
        sleepMin = min
        if (min > 0) handler.postDelayed(sleepRun, min * 60_000L)
        Store.bump()
    }

    /** Tunnels and dead streams: try the backup link, then reconnect, then move to the next station. */
    private fun recover() {
        val item = player.currentMediaItem ?: return
        val i = player.currentMediaItemIndex
        val s = Repo.stations[stationId(item)]
        if (s?.backup != null && item.localConfiguration?.uri?.toString() == s.url) {
            player.replaceMediaItem(i, item.buildUpon().setUri(s.backup).build()); player.prepare(); player.play(); return
        }
        if (retries++ < 5) handler.postDelayed({ player.prepare(); player.play() }, 4000L * retries)
        else if (player.hasNextMediaItem()) { retries = 0; player.seekToNextMediaItem(); player.prepare(); player.play() }
    }

    private fun t(id: Int) = getString(id)

    private fun folder(id: String, title: String, sub: String? = null) = MediaItem.Builder().setMediaId(id).setMediaMetadata(
        MediaMetadata.Builder().setTitle(title).setSubtitle(sub).setIsBrowsable(true).setIsPlayable(false)
            .setMediaType(MediaMetadata.MEDIA_TYPE_FOLDER_RADIO_STATIONS).build()
    ).build()

    private fun newsStub() = MediaItem.Builder().setMediaId("news").setMediaMetadata(
        MediaMetadata.Builder().setTitle(t(R.string.news_flash)).setIsBrowsable(false).setIsPlayable(true)
            .setMediaType(MediaMetadata.MEDIA_TYPE_NEWS).build()
    ).build()

    private suspend fun kids(parent: String): List<MediaItem> = when {
        parent == "root" -> buildList {
            add(folder("fav", "★ " + t(R.string.favorites), Store.current().name))
            add(folder("rec", t(R.string.recent)))
            add(folder("feat", t(R.string.featured)))
            add(folder("c:LB", flag("LB") + " " + t(R.string.lebanon)))
            add(folder("world", "🌍 " + t(R.string.world)))
            add(folder("profiles", t(R.string.profiles), Store.current().name))
            if (Store.newsFlash) add(newsStub())
        }
        parent == "fav" -> Store.favs().map { it.item() }
        parent == "rec" -> Store.recents().map { it.item() }
        parent == "feat" -> Repo.featured().map { it.item() }
        parent == "world" -> Repo.countries().map { folder("c:${it.cc}", flag(it.cc) + " " + it.name, "${it.count}") }
        parent == "profiles" -> Store.profiles().map { folder("p:${it.id}", it.name) }
        parent.startsWith("p:") -> { Store.currentId = parent.drop(2).toInt(); Store.favs().map { it.item() } }
        parent.startsWith("c:") -> Repo.byCountry(parent.drop(2)).map { it.item() }
        else -> emptyList()
    }.also { children[parent] = it }

    private fun resolve(item: MediaItem): MediaItem? =
        if (item.localConfiguration != null) item else Repo.stations[stationId(item)]?.item()

    /** Reads the top headlines aloud: synthesized to a file, then played like a station. */
    private suspend fun news(): MediaItem {
        val all = try { Repo.news() } catch (e: Exception) { emptyList() }
        val app = AppCompatDelegate.getApplicationLocales()[0]?.language ?: Locale.getDefault().language
        val lang = if (all.any { it.first == app }) app else all.firstOrNull()?.first ?: app
        val text = all.filter { it.first == lang }.take(3).joinToString(". ") { it.second }.ifEmpty { t(R.string.no_news) }
        val file = File(cacheDir, "news.wav")
        suspendCancellableCoroutine<Unit> { cont ->
            fun speak(e: TextToSpeech) {
                e.language = Locale(lang)
                e.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
                    override fun onStart(id: String?) {}
                    override fun onDone(id: String?) { if (cont.isActive) cont.resume(Unit) }
                    @Deprecated("Deprecated in Java")
                    override fun onError(id: String?) { if (cont.isActive) cont.resume(Unit) }
                })
                e.synthesizeToFile(text, Bundle(), file, "news")
            }
            tts?.let { speak(it) } ?: run {
                lateinit var e: TextToSpeech
                e = TextToSpeech(this) { st -> if (st == TextToSpeech.SUCCESS) { tts = e; speak(e) } else if (cont.isActive) cont.resume(Unit) }
            }
        }
        return MediaItem.Builder().setMediaId("news").setUri(Uri.fromFile(file)).setMediaMetadata(
            MediaMetadata.Builder().setTitle(t(R.string.news_flash)).setArtist(text.take(90)).setIsBrowsable(false)
                .setIsPlayable(true).setMediaType(MediaMetadata.MEDIA_TYPE_NEWS).build()
        ).build()
    }

    private fun favButton() = CommandButton.Builder().setDisplayName(t(R.string.favorite))
        .setIconResId(R.drawable.ic_heart).setSessionCommand(FAV).build()

    private inner class Callback : MediaLibrarySession.Callback {
        override fun onConnect(session: MediaSession, controller: MediaSession.ControllerInfo): MediaSession.ConnectionResult {
            if (controller.packageName == CAR && Store.autoplay && player.mediaItemCount == 0) handler.post { playLast() }
            val cmds = MediaSession.ConnectionResult.DEFAULT_SESSION_AND_LIBRARY_COMMANDS.buildUpon().add(FAV).build()
            return MediaSession.ConnectionResult.AcceptedResultBuilder(session)
                .setAvailableSessionCommands(cmds).setCustomLayout(ImmutableList.of(favButton())).build()
        }

        override fun onCustomCommand(
            session: MediaSession, controller: MediaSession.ControllerInfo, customCommand: SessionCommand, args: Bundle
        ): ListenableFuture<SessionResult> {
            if (customCommand.customAction == FAV.customAction) Repo.stations[stationId(player.currentMediaItem)]?.let { Store.toggleFav(it) }
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
                // "Hey Google, play <station> on Mawja"
                q != null -> {
                    val r = (if (q.isBlank()) emptyList() else try { Repo.find(q) } catch (e: Exception) { emptyList() })
                        .ifEmpty { Store.recents().ifEmpty { Store.favs() } }
                    MediaItemsWithStartPosition(r.map { it.item() }, 0, C.TIME_UNSET)
                }
                first?.mediaId == "news" -> MediaItemsWithStartPosition(listOf(news()), 0, C.TIME_UNSET)
                else -> {
                    // A single station tapped in the car: queue its whole list so next/previous on the wheel works.
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
