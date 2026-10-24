package com.mawja.radio

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.pm.ServiceInfo
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.Bundle
import android.os.IBinder
import android.os.Looper
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.core.app.NotificationCompat
import androidx.core.app.ServiceCompat
import kotlin.math.roundToInt
import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.BroadcastReceiver
import android.content.ComponentName
import android.content.ContentProvider
import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import android.os.Build
import android.os.ParcelFileDescriptor
import android.view.KeyEvent
import android.widget.RemoteViews
import androidx.core.content.ContextCompat
import androidx.media3.session.MediaButtonReceiver
import java.io.File
import java.net.HttpURLConnection
import java.net.URL

/** Serves station logos and the live wallpaper to Android Auto, which can't load web images directly. */
class ArtProvider : ContentProvider() {
    companion object {
        private const val AUTH = "com.sawtelbeit.app.art"
        fun uri(url: String?): Uri? = url?.let { Uri.parse("content://$AUTH/" + Uri.encode(it)) }
        fun file(name: String): Uri = Uri.parse("content://$AUTH/f/$name")
    }

    override fun openFile(uri: Uri, mode: String): ParcelFileDescriptor? {
        val seg = uri.pathSegments
        val f = if (seg.size == 2 && seg[0] == "f") {
            File(context!!.cacheDir, File(seg[1]).name).takeIf { it.name.startsWith("wall_") && it.exists() } ?: return null
        } else {
            val url = uri.lastPathSegment ?: return null
            val f = File(context!!.cacheDir, "art_" + Integer.toHexString(url.hashCode()))
            if (!f.exists()) {
                if (Repo.stations.values.none { it.logo == url }) return null   // only logos the app itself listed
                try {
                    val c = URL(url).openConnection() as HttpURLConnection
                    c.connectTimeout = 5000; c.readTimeout = 8000
                    c.inputStream.use { i -> f.outputStream().use { i.copyTo(it) } }
                } catch (e: Exception) { f.delete(); return null }
            }
            f
        }
        return ParcelFileDescriptor.open(f, ParcelFileDescriptor.MODE_READ_ONLY)
    }

    override fun onCreate() = true
    override fun getType(uri: Uri) = "image/*"
    override fun query(u: Uri, p: Array<String>?, s: String?, a: Array<String>?, o: String?) = null
    override fun insert(u: Uri, v: ContentValues?) = null
    override fun update(u: Uri, v: ContentValues?, s: String?, a: Array<String>?) = 0
    override fun delete(u: Uri, s: String?, a: Array<String>?) = 0
}

/** Home-screen widget: wallpaper photo, station, song, Beirut clock and a play button. */
class MawjaWidget : AppWidgetProvider() {
    override fun onUpdate(c: Context, m: AppWidgetManager, ids: IntArray) = push(c)

    companion object {
        var name = ""; var sub = ""; var playing = false; var bg: Bitmap? = null
        fun push(c: Context) {
            val m = AppWidgetManager.getInstance(c)
            val ids = m.getAppWidgetIds(ComponentName(c, MawjaWidget::class.java)); if (ids.isEmpty()) return
            val v = RemoteViews(c.packageName, R.layout.widget)
            v.setTextViewText(R.id.w_name, name.ifEmpty { c.getString(R.string.app_name) })
            v.setTextViewText(R.id.w_sub, sub)
            v.setImageViewResource(R.id.w_play, if (playing) R.drawable.ic_pause else R.drawable.ic_play)
            bg?.let { v.setImageViewBitmap(R.id.w_bg, it) }
            val key = Intent(Intent.ACTION_MEDIA_BUTTON).setClass(c, MediaButtonReceiver::class.java)
                .putExtra(Intent.EXTRA_KEY_EVENT, KeyEvent(KeyEvent.ACTION_DOWN, KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE))
            v.setOnClickPendingIntent(R.id.w_play, PendingIntent.getBroadcast(c, 1, key, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT))
            v.setOnClickPendingIntent(R.id.w_root, PendingIntent.getActivity(c, 2, Intent(c, MainActivity::class.java), PendingIntent.FLAG_IMMUTABLE))
            m.updateAppWidget(ids, v)
        }
    }
}

object Speed { var kmh by mutableStateOf<Int?>(null) }

/** GPS speed while driving. Started from the open app so it keeps working with the screen off. */
class SpeedService : Service(), LocationListener {
    companion object {
        fun start(c: Context) = runCatching { ContextCompat.startForegroundService(c, Intent(c, SpeedService::class.java)) }
        fun stop(c: Context) = c.stopService(Intent(c, SpeedService::class.java))
    }

    override fun onBind(i: Intent?): IBinder? = null

    override fun onStartCommand(i: Intent?, flags: Int, id: Int): Int {
        if (i?.action == "stop") { Store.setB("speed", false); stopSelf(); return START_NOT_STICKY }
        getSystemService(NotificationManager::class.java)
            .createNotificationChannel(NotificationChannel("speed", getString(R.string.speed), NotificationManager.IMPORTANCE_LOW))
        val stop = PendingIntent.getService(this, 4, Intent(this, SpeedService::class.java).setAction("stop"), PendingIntent.FLAG_IMMUTABLE)
        val n = NotificationCompat.Builder(this, "speed").setSmallIcon(R.drawable.ic_note).setContentTitle(getString(R.string.speed))
            .setOngoing(true).addAction(0, getString(R.string.stop), stop).build()
        try {
            ServiceCompat.startForeground(this, 42, n, if (Build.VERSION.SDK_INT >= 29) ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION else 0)
            getSystemService(LocationManager::class.java).requestLocationUpdates(LocationManager.GPS_PROVIDER, 1000L, 0f, this, Looper.getMainLooper())
        } catch (e: Exception) { stopSelf() }
        return START_NOT_STICKY
    }

    override fun onLocationChanged(l: Location) {
        val k = if (l.hasSpeed()) (l.speed * 3.6f).roundToInt() else 0
        Speed.kmh = k; PlaybackService.instance?.showSpeed(k)
    }
    @Deprecated("Deprecated in Java")
    override fun onStatusChanged(p: String?, s: Int, e: Bundle?) {}
    override fun onProviderEnabled(p: String) {}
    override fun onProviderDisabled(p: String) {}

    override fun onDestroy() {
        runCatching { getSystemService(LocationManager::class.java).removeUpdates(this) }
        Speed.kmh = null; PlaybackService.instance?.showSpeed(null)
        super.onDestroy()
    }
}
