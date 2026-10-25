package com.mawja.radio

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import androidx.compose.runtime.mutableIntStateOf
import androidx.core.content.ContextCompat
import org.json.JSONArray
import org.json.JSONObject
import java.io.File

data class Profile(val id: Int, val name: String, val theme: Int, val kids: Boolean)

/** Netflix-style profiles; each keeps its own favorites, recents, photos, songs, playlists, stats and theme. */
object Store {
    lateinit var ctx: Context; private set
    private lateinit var p: SharedPreferences
    val rev = mutableIntStateOf(0)
    private val defaults = listOf("Baba", "Mama", "Kid 1", "Kid 2", "Guest")

    fun init(c: Context) { ctx = c; p = c.getSharedPreferences("mawja", Context.MODE_PRIVATE) }
    fun bump() { rev.intValue++ }
    private fun edit(f: SharedPreferences.Editor.() -> Unit) { p.edit().apply(f).apply(); bump() }

    fun b(k: String, d: Boolean = false) = p.getBoolean(k, d)
    fun setB(k: String, v: Boolean) = edit { putBoolean(k, v) }
    fun i(k: String, d: Int = 0) = p.getInt(k, d)
    fun setI(k: String, v: Int) = edit { putInt(k, v) }
    fun s(k: String): String? = p.getString(k, null)
    fun setS(k: String, v: String) = edit { putString(k, v) }

    fun profiles() = (0..4).map {
        Profile(it, p.getString("name$it", null) ?: defaults[it], p.getInt("theme$it", 0), p.getBoolean("kids$it", it in 2..3))
    }
    var currentId: Int
        get() = p.getInt("cur", 0)
        set(v) = edit { putInt("cur", v) }
    fun current() = profiles()[currentId]
    fun rename(id: Int, n: String) = edit { putString("name$id", n) }
    fun setTheme(id: Int, t: Int) = edit { putInt("theme$id", t) }
    fun setKids(id: Int, v: Boolean) = edit { putBoolean("kids$id", v) }

    private fun arr(k: String) = try { JSONArray(p.getString(k + currentId, "[]")) } catch (e: Exception) { JSONArray() }
    private fun put(k: String, a: JSONArray) = edit { putString(k + currentId, a.toString()) }
    private fun strings(k: String) = arr(k).let { a -> (0 until a.length()).map { a.optString(it) } }

    private fun list(k: String): List<Station> = arr(k).let { a ->
        (0 until a.length()).mapNotNull { runCatching { Station.of(a.getJSONObject(it)).also { s -> Repo.stations[s.id] = s } }.getOrNull() }
    }
    private fun save(k: String, l: List<Station>) = put(k, JSONArray(l.map { it.json() }))

    fun favs() = list("fav")
    fun recents() = list("rec")
    fun last() = recents().firstOrNull()
    fun isFav(id: String) = favs().any { it.id == id }
    fun toggleFav(s: Station) { val f = favs(); save("fav", if (f.any { it.id == s.id }) f.filter { it.id != s.id } else listOf(s) + f) }
    fun addRecent(s: Station) = save("rec", (listOf(s) + recents().filter { it.id != s.id }).take(20))

    // Song catcher + Spotify / YouTube playlist links
    fun songs() = strings("song")
    fun addSong(t: String) = put("song", JSONArray((listOf(t) + songs().filter { it != t }).take(200)))
    fun removeSong(t: String) = put("song", JSONArray(songs().filter { it != t }))
    fun playlists() = strings("pl")
    fun addPlaylist(u: String) = put("pl", JSONArray(playlists().filter { it != u } + u))
    fun removePlaylist(u: String) = put("pl", JSONArray(playlists().filter { it != u }))

    // Photos live only on this phone, one folder per profile.
    fun galleryDir(id: Int = currentId) = File(ctx.filesDir, "gallery/$id").apply { mkdirs() }
    fun gallery(): List<File> = galleryDir().listFiles()?.filter { it.isFile && it.length() > 0 }?.sortedBy { it.name } ?: emptyList()

    // Where you moved each salon dot, per room (% of the picture)
    fun pos(era: String, k: String): Pt? = s("pos_${era}_$k")?.split(",")?.let { runCatching { it[0].toFloat() to it[1].toFloat() }.getOrNull() }
    fun setPos(era: String, k: String, x: Float, y: Float) = setS("pos_${era}_$k", "$x,$y")
    fun resetPos(era: String) = edit { HOTSPOTS.forEach { remove("pos_${era}_${it.first}") } }

    // Which of your photos hangs in each wall frame, per room
    fun framePhoto(era: String, i: Int): File? = s("fr_${era}_$i")?.let { File(galleryDir(), it).takeIf { f -> f.exists() } }
    fun setFrame(era: String, i: Int, name: String?) = edit { if (name == null) remove("fr_${era}_$i") else putString("fr_${era}_$i", name) }

    // Listening stats & radio passport: {"t": minutes, "s": {station: min}, "c": {country code: min}}
    fun stats(): JSONObject = try { JSONObject(p.getString("stat$currentId", "{}")!!) } catch (e: Exception) { JSONObject() }
    fun addMinute(s: Station) {
        val o = stats(); o.put("t", o.optInt("t") + 1)
        fun inc(k: String, key: String) { val m = o.optJSONObject(k) ?: JSONObject().also { o.put(k, it) }; m.put(key, m.optInt(key) + 1) }
        inc("s", s.name); if (s.cc.isNotBlank()) inc("c", s.cc)
        edit { putString("stat$currentId", o.toString()) }
    }

    /** True the first time a breaking headline is seen. */
    fun markSeen(t: String): Boolean {
        val seen = (p.getString("seen", "") ?: "").split("\n").filter { it.isNotEmpty() }
        val h = t.hashCode().toString()
        if (h in seen) return false
        p.edit().putString("seen", (seen.takeLast(100) + h).joinToString("\n")).apply(); return true
    }

    var dataSaver: Boolean
        get() = b("ds")
        set(v) { Repo.clear(); setB("ds", v) }
    var autoplay: Boolean
        get() = b("auto", true)
        set(v) = setB("auto", v)
    var newsFlash: Boolean
        get() = b("news")
        set(v) = setB("news", v)
}

/** Starts the last station when a Bluetooth device (car / headset) connects. */
class BtReceiver : BroadcastReceiver() {
    override fun onReceive(c: Context, i: Intent) {
        if (!Store.autoplay || Store.last() == null) return
        try {
            ContextCompat.startForegroundService(c, Intent(c, PlaybackService::class.java).setAction(PlaybackService.AUTOPLAY))
        } catch (_: Exception) { /* Android 12+ may block background starts; the play button still resumes. */ }
    }
}
