package com.mawja.radio

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import androidx.compose.runtime.mutableIntStateOf
import androidx.core.content.ContextCompat
import org.json.JSONArray

data class Profile(val id: Int, val name: String, val theme: Int)

/** Netflix-style family profiles; each keeps its own favorites, recents and theme. */
object Store {
    private lateinit var p: SharedPreferences
    val rev = mutableIntStateOf(0)
    private val defaults = listOf("Baba", "Mama", "Kid 1", "Kid 2", "Teta")

    fun init(c: Context) { p = c.getSharedPreferences("mawja", Context.MODE_PRIVATE) }
    fun bump() { rev.intValue++ }
    private fun edit(f: SharedPreferences.Editor.() -> Unit) { p.edit().apply(f).apply(); bump() }

    fun profiles() = (0..4).map { Profile(it, p.getString("name$it", null) ?: defaults[it], p.getInt("theme$it", it)) }
    var currentId: Int
        get() = p.getInt("cur", 0)
        set(v) = edit { putInt("cur", v) }
    fun current() = profiles()[currentId]
    fun rename(id: Int, n: String) = edit { putString("name$id", n) }
    fun setTheme(id: Int, t: Int) = edit { putInt("theme$id", t) }

    private fun list(k: String): List<Station> = try {
        val a = JSONArray(p.getString(k + currentId, "[]"))
        (0 until a.length()).map { Station.of(a.getJSONObject(it)).also { s -> Repo.stations[s.id] = s } }
    } catch (e: Exception) { emptyList() }
    private fun save(k: String, l: List<Station>) = edit { putString(k + currentId, JSONArray(l.map { it.json() }).toString()) }

    fun favs() = list("fav")
    fun recents() = list("rec")
    fun last() = recents().firstOrNull()
    fun isFav(id: String) = favs().any { it.id == id }
    fun toggleFav(s: Station) { val f = favs(); save("fav", if (f.any { it.id == s.id }) f.filter { it.id != s.id } else listOf(s) + f) }
    fun addRecent(s: Station) = save("rec", (listOf(s) + recents().filter { it.id != s.id }).take(20))

    var dataSaver: Boolean
        get() = p.getBoolean("ds", false)
        set(v) { Repo.clear(); edit { putBoolean("ds", v) } }
    var autoplay: Boolean
        get() = p.getBoolean("auto", true)
        set(v) = edit { putBoolean("auto", v) }
    var newsFlash: Boolean
        get() = p.getBoolean("news", false)
        set(v) = edit { putBoolean("news", v) }
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
