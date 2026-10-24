package com.mawja.radio

import android.app.AlarmManager
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
import java.util.Calendar

/** Serves station logos and the live wallpaper to Android Auto, which can't load web images directly. */
class ArtProvider : ContentProvider() {
    companion object {
        private const val AUTH = "com.mawja.radio.art"
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

/** Fairuz sunrise alarm: plays the saved Fairuz station, fading in over a minute. */
object Alarm {
    fun schedule(c: Context) {
        val am = c.getSystemService(AlarmManager::class.java)
        val pi = PendingIntent.getBroadcast(c, 7, Intent(c, AlarmReceiver::class.java).setAction("ring"),
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)
        am.cancel(pi)
        if (!Store.b("alarm")) return
        val now = Calendar.getInstance()
        val t = (now.clone() as Calendar).apply {
            set(Calendar.HOUR_OF_DAY, Store.i("ah", 7)); set(Calendar.MINUTE, Store.i("am", 0)); set(Calendar.SECOND, 0)
            if (!after(now)) add(Calendar.DAY_OF_YEAR, 1)
        }
        if (Build.VERSION.SDK_INT < 31 || am.canScheduleExactAlarms()) {
            val show = PendingIntent.getActivity(c, 8, Intent(c, MainActivity::class.java), PendingIntent.FLAG_IMMUTABLE)
            am.setAlarmClock(AlarmManager.AlarmClockInfo(t.timeInMillis, show), pi)
        } else am.setWindow(AlarmManager.RTC_WAKEUP, t.timeInMillis, 10 * 60_000L, pi)
    }
}

class AlarmReceiver : BroadcastReceiver() {
    override fun onReceive(c: Context, i: Intent) {
        Alarm.schedule(c)   // after boot, and tomorrow's ring
        if (i.action != "ring") return
        try { ContextCompat.startForegroundService(c, Intent(c, PlaybackService::class.java).setAction(PlaybackService.ALARM)) }
        catch (_: Exception) {}
    }
}
