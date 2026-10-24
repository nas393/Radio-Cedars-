package com.radiocedars.app

import android.os.Bundle
import androidx.media3.common.AudioAttributes
import androidx.media3.common.C
import androidx.media3.common.MediaItem
import androidx.media3.common.MediaMetadata
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.session.LibraryResult
import androidx.media3.session.MediaLibraryService
import androidx.media3.session.MediaLibraryService.MediaLibrarySession
import androidx.media3.session.MediaSession
import com.google.common.collect.ImmutableList
import com.google.common.util.concurrent.Futures
import com.google.common.util.concurrent.ListenableFuture
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import org.json.JSONObject
import java.net.URL
import java.util.concurrent.Executors

class RadioPlaybackService : MediaLibraryService() {
    private lateinit var player: ExoPlayer
    private lateinit var librarySession: MediaLibrarySession
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private val executor = Executors.newSingleThreadExecutor()
    @Volatile private var stations: List<MediaItem> = emptyList()
    @Volatile private var loadError: String? = null

    override fun onCreate() {
        super.onCreate()

        player = ExoPlayer.Builder(this).build()
        player.setAudioAttributes(
            AudioAttributes.Builder()
                .setUsage(C.USAGE_MEDIA)
                .setContentType(C.AUDIO_CONTENT_TYPE_MUSIC)
                .build(),
            true
        )

        librarySession = MediaLibrarySession.Builder(
            this, player, object : MediaLibrarySession.Callback {
                override fun onGetLibraryRoot(
                    session: MediaLibrarySession,
                    browser: MediaSession.ControllerInfo,
                    params: LibraryParams?
                ): ListenableFuture<LibraryResult<MediaItem>> {
                    val root = MediaItem.Builder()
                        .setMediaId("root")
                        .setMediaMetadata(
                            MediaMetadata.Builder()
                                .setTitle("Radio Cedars")
                                .setIsBrowsable(true)
                                .setIsPlayable(false)
                                .build()
                        ).build()
                    return Futures.immediateFuture(LibraryResult.ofItem(root, params))
                }

                override fun onGetChildren(
                    session: MediaLibrarySession,
                    browser: MediaSession.ControllerInfo,
                    parentId: String,
                    page: Int,
                    pageSize: Int,
                    params: LibraryParams?
                ): ListenableFuture<LibraryResult<ImmutableList<MediaItem>>> {
                    if (parentId != "root") {
                        return Futures.immediateFuture(
                            LibraryResult.ofItemList(ImmutableList.of(), params)
                        )
                    }
                    if (stations.isNotEmpty()) {
                        val start = (page * pageSize).coerceAtMost(stations.size)
                        val end = (start + pageSize).coerceAtMost(stations.size)
                        return Futures.immediateFuture(
                            LibraryResult.ofItemList(ImmutableList.copyOf(stations.subList(start, end)), params)
                        )
                    }
                    loadStations()
                    return Futures.immediateFuture(
                        LibraryResult.ofItemList(ImmutableList.of(), params)
                    )
                }

                override fun onGetItem(
                    session: MediaLibrarySession,
                    browser: MediaSession.ControllerInfo,
                    mediaId: String
                ): ListenableFuture<LibraryResult<MediaItem>> {
                    val item = stations.firstOrNull { it.mediaId == mediaId }
                    return if (item != null) {
                        Futures.immediateFuture(LibraryResult.ofItem(item, null))
                    } else {
                        Futures.immediateFuture(LibraryResult.ofError(LibraryResult.RESULT_ERROR_BAD_VALUE))
                    }
                }
            }
        ).build()

        loadStations()
    }

    private fun loadStations() {
        if (stations.isNotEmpty()) return
        scope.launch {
            try {
                val connection = URL("https://radio-cedars.vercel.app/api/radio")
                    .openConnection()
                connection.connectTimeout = 15000
                connection.readTimeout = 20000
                val json = JSONObject(connection.getInputStream().bufferedReader().use { it.readText() })
                val array = json.getJSONArray("stations")
                val result = mutableListOf<MediaItem>()

                for (i in 0 until array.length()) {
                    val station = array.getJSONObject(i)
                    val id = station.optString("id")
                    val name = station.optString("name", "Radio station")
                    val url = station.optString("url")
                    if (id.isBlank() || url.isBlank() || !url.startsWith("https://")) continue

                    result.add(
                        MediaItem.Builder()
                            .setMediaId(id)
                            .setUri(url)
                            .setMediaMetadata(
                                MediaMetadata.Builder()
                                    .setTitle(name)
                                    .setArtist("Radio Cedars")
                                    .setIsBrowsable(false)
                                    .setIsPlayable(true)
                                    .build()
                            )
                            .build()
                    )
                }
                stations = result
                loadError = if (result.isEmpty()) "No stations returned" else null
                librarySession.notifyChildrenChanged("root", result.size, null)
            } catch (e: Exception) {
                loadError = e.message ?: "Unable to load stations"
            }
        }
    }

    override fun onGetSession(controllerInfo: MediaSession.ControllerInfo): MediaLibrarySession =
        librarySession

    override fun onDestroy() {
        scope.cancel()
        executor.shutdown()
        librarySession.release()
        player.release()
        super.onDestroy()
    }
}
