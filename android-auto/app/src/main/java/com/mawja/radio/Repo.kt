package com.mawja.radio

import android.app.Application
import androidx.media3.common.MediaItem
import androidx.media3.common.MediaMetadata
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder
import java.util.concurrent.ConcurrentHashMap
import kotlin.math.roundToInt

class App : Application() {
    override fun onCreate() { super.onCreate(); Store.init(this) }
}

data class Station(
    val id: String, val name: String, val url: String, val backup: String?, val logo: String?,
    val country: String, val cc: String, val tags: String, val bitrate: Int, val lat: Double?, val lon: Double?
) {
    fun json(): JSONObject = JSONObject().put("id", id).put("name", name).put("url", url).put("backup", backup)
        .put("logo", logo).put("country", country).put("cc", cc).put("tags", tags).put("bitrate", bitrate)
        .put("lat", lat).put("lon", lon)

    fun item(): MediaItem = MediaItem.Builder().setMediaId("st:$id").setUri(url).setMediaMetadata(
        MediaMetadata.Builder().setTitle(name).setStation(name)
            .setArtist(listOf(country, tags).filter { it.isNotBlank() }.joinToString(" · "))
            .setArtworkUri(ArtProvider.uri(logo)).setIsBrowsable(false).setIsPlayable(true)
            .setMediaType(MediaMetadata.MEDIA_TYPE_RADIO_STATION).build()
    ).build()

    companion object {
        fun of(o: JSONObject) = Station(
            o.getString("id"), o.getString("name"), o.getString("url"), o.str("backup"), o.str("logo"),
            o.optString("country"), o.optString("cc"), o.optString("tags"), o.optInt("bitrate"), o.dbl("lat"), o.dbl("lon")
        )
    }
}

data class Country(val name: String, val cc: String, val count: Int)
data class Weather(val place: String, val temp: Int, val icon: String, val code: Int = 0, val day: Boolean = true)

fun JSONObject.str(k: String): String? = if (isNull(k)) null else optString(k).ifBlank { null }
fun JSONObject.dbl(k: String): Double? = if (isNull(k)) null else optDouble(k).takeIf { !it.isNaN() }

fun flag(cc: String): String = if (cc.length != 2) "🌐" else
    cc.uppercase().map { String(Character.toChars(0x1F1E6 + (it - 'A'))) }.joinToString("")

fun stationId(item: MediaItem?) = item?.mediaId?.removePrefix("st:") ?: ""

const val UA = "SawtElBeit/1.1 (https://radio-cedars.vercel.app)"

object Repo {
    const val SITE = "https://radio-cedars.vercel.app"
    private const val FEATURED = "https://raw.githubusercontent.com/nas393/Radio-Cedars-/main/android-auto/featured.json"
    private const val TV = "https://raw.githubusercontent.com/nas393/Radio-Cedars-/main/android-auto/tv.json"
    private const val TTL = 30 * 60_000L
    private val mirrors = listOf(
        "https://de1.api.radio-browser.info", "https://de2.api.radio-browser.info", "https://fi1.api.radio-browser.info"
    )
    val stations = ConcurrentHashMap<String, Station>()
    private val lists = ConcurrentHashMap<String, Pair<Long, List<Station>>>()
    private var countries: List<Country>? = null

    fun clear() = lists.clear()

    fun get(url: String): String {
        val c = URL(url).openConnection() as HttpURLConnection
        c.connectTimeout = 8000; c.readTimeout = 10000
        c.setRequestProperty("User-Agent", UA)
        try {
            if (c.responseCode !in 200..299) error("HTTP ${c.responseCode}")
            return c.inputStream.bufferedReader().readText()
        } finally { c.disconnect() }
    }

    private fun rb(path: String): String {
        var last: Exception? = null
        for (m in mirrors) try { return get(m + path) } catch (e: Exception) { last = e }
        throw last ?: Exception("no mirror")
    }

    private val playlist = Regex("""\.(pls|m3u|asx|xspf)(\?|$)""", RegexOption.IGNORE_CASE)
    private fun playable(u: String?) = u != null && u.startsWith("http") && !playlist.containsMatchIn(u)

    private fun parse(arr: JSONArray): List<Station> {
        val out = ArrayList<Station>(); val seen = HashSet<String>()
        for (i in 0 until arr.length()) {
            val o = arr.getJSONObject(i)
            if (o.optInt("lastcheckok") != 1) continue
            val name = o.optString("name").trim().take(60)
            if (name.isEmpty() || !seen.add(name.lowercase())) continue
            val a = o.str("url_resolved"); val b = o.str("url")
            val main = if (playable(a)) a!! else if (playable(b)) b!! else continue
            val s = Station(
                o.getString("stationuuid"), name, main, b?.takeIf { it != main && playable(it) },
                o.str("favicon")?.takeIf { it.startsWith("http") }, o.optString("country"),
                o.optString("countrycode").uppercase(), o.optString("tags").take(60), o.optInt("bitrate"),
                o.dbl("geo_lat"), o.dbl("geo_long")
            )
            stations[s.id] = s; out += s
        }
        return out
    }

    private fun search(vararg p: Pair<String, String>): List<Station> {
        val all = listOf("hidebroken" to "true", "order" to "clickcount", "reverse" to "true") +
            (if (Store.dataSaver) listOf("bitrateMax" to "64") else emptyList()) + p
        return parse(JSONArray(rb("/json/stations/search?" + all.joinToString("&") { it.first + "=" + URLEncoder.encode(it.second, "UTF-8") })))
    }

    private suspend fun <T> io(f: () -> T): T = withContext(Dispatchers.IO) { f() }

    private suspend fun cached(k: String, f: () -> List<Station>): List<Station> {
        lists[k]?.let { if (System.currentTimeMillis() - it.first < TTL) return it.second }
        return io(f).also { if (it.isNotEmpty()) lists[k] = System.currentTimeMillis() to it }
    }

    suspend fun byCountry(cc: String) = cached("c:$cc") { search("countrycode" to cc, "limit" to "100") }
    suspend fun find(text: String) = io { search("name" to text, "limit" to "40") }

    suspend fun countries(): List<Country> = countries ?: io {
        val a = JSONArray(rb("/json/countries")); val l = ArrayList<Country>()
        for (i in 0 until a.length()) {
            val o = a.getJSONObject(i); val n = o.optInt("stationcount")
            if (n >= 15) l += Country(o.optString("name"), o.optString("iso_3166_1").uppercase(), n)
        }
        l.sortedBy { it.name }.also { countries = it }
    }

    // Curated list editable on GitHub (android-auto/featured.json) — no app update needed.
    suspend fun featured() = cached("featured") {
        val a = JSONArray(get(FEATURED)); val out = ArrayList<Station>()
        for (i in 0 until a.length()) try {
            val o = a.getJSONObject(i)
            if (o.has("url")) {
                val s = Station("f$i", o.getString("name"), o.getString("url"), o.str("backup"), o.str("logo"),
                    o.optString("country"), o.optString("cc"), "", 0, null, null)
                stations[s.id] = s; out += s
            } else {
                val p = mutableListOf("name" to o.getString("search"), "limit" to "3")
                o.str("cc")?.let { p += "countrycode" to it }
                search(*p.toTypedArray()).firstOrNull()?.let { if (out.none { x -> x.id == it.id }) out += it }
            }
        } catch (_: Exception) {}
        out
    }

    /** Top headline per news source as (language, title). */
    suspend fun news(): List<Pair<String, String>> = io {
        val src = JSONObject(get("$SITE/api/news")).getJSONArray("sources"); val out = ArrayList<Pair<String, String>>()
        for (i in 0 until src.length()) {
            val s = src.getJSONObject(i); val items = s.optJSONArray("items") ?: continue
            if (items.length() > 0) out += s.optString("lang", "ar") to items.getJSONObject(0).optString("title")
        }
        out.filter { it.second.isNotBlank() }
    }

    private val weatherCache = ConcurrentHashMap<String, Pair<Long, Weather>>()
    suspend fun weather(s: Station): Weather? = io {
        val cap = Capitals.of(s.cc)
        val lat = s.lat ?: cap?.lat ?: return@io null
        val lon = s.lon ?: cap?.lon ?: return@io null
        val key = "$lat,$lon"
        weatherCache[key]?.let { if (System.currentTimeMillis() - it.first < 20 * 60_000L) return@io it.second }
        val c = JSONObject(get("https://api.open-meteo.com/v1/forecast?latitude=$lat&longitude=$lon&current=temperature_2m,weather_code,is_day"))
            .getJSONObject("current")
        val code = c.optInt("weather_code")
        Weather(if (s.lat != null || cap == null) s.country else cap.city, c.optDouble("temperature_2m").roundToInt(), icon(code),
            code, c.optInt("is_day", 1) == 1).also { weatherCache[key] = System.currentTimeMillis() to it }
    }

    fun bytes(url: String): ByteArray {
        val c = URL(url).openConnection() as HttpURLConnection
        c.connectTimeout = 8000; c.readTimeout = 15000
        c.setRequestProperty("User-Agent", UA)
        try { return c.inputStream.use { it.readBytes() } } finally { c.disconnect() }
    }

    suspend fun mood(tag: String) = cached("m:$tag") { search("tag" to tag, "limit" to "60") }

    suspend fun stationOfDay(): Station? = byCountry("LB").let { if (it.isEmpty()) null else it[java.time.LocalDate.now().dayOfYear % it.size] }

    data class Headline(val source: String, val lang: String, val title: String, val link: String?, val date: Long)
    suspend fun headlines(): List<Headline> = io {
        val src = JSONObject(get("$SITE/api/news")).getJSONArray("sources"); val out = ArrayList<Headline>()
        for (i in 0 until src.length()) {
            val s = src.getJSONObject(i); val items = s.optJSONArray("items") ?: continue
            for (j in 0 until minOf(items.length(), 8)) {
                val o = items.getJSONObject(j)
                val d = runCatching { java.time.Instant.parse(o.optString("date")).toEpochMilli() }.getOrDefault(0L)
                out += Headline(s.optString("source"), s.optString("lang", "ar"), o.optString("title"), o.str("link"), d)
            }
        }
        out.filter { it.title.isNotBlank() }.sortedByDescending { it.date }
    }

    data class TvList(val title: String, val id: String)
    data class TvChannel(val name: String, val ar: String, val color: Int, val lists: List<TvList>)

    /** Lebanese channels' official YouTube playlists — same list as the website's TV (android-auto/tv.json). */
    suspend fun tv(lang: String): List<TvChannel> = io {
        val raw = runCatching { get(TV) }.getOrNull() ?: Store.ctx.assets.open("tv.json").bufferedReader().readText()
        val a = JSONArray(raw)
        (0 until a.length()).map { i ->
            val c = a.getJSONObject(i); val l = c.getJSONArray("lists")
            TvChannel(c.optString("name"), c.optString("ar"),
                runCatching { android.graphics.Color.parseColor(c.optString("color")) }.getOrDefault(0xFF1E4429.toInt()),
                (0 until l.length()).map { j ->
                    val o = l.getJSONObject(j); val t = o.opt("t")
                    TvList(if (t is JSONObject) t.optString(lang).ifBlank { t.optString("en") } else t.toString(), o.getString("id"))
                })
        }
    }

    /** Real photos of a place from Wikimedia Commons (free, no key). */
    private val photos = ConcurrentHashMap<String, List<String>>()
    suspend fun commons(q: String): List<String> = photos[q] ?: io {
        val u = "https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=25" +
            "&prop=imageinfo&iiprop=url&iiurlwidth=1400&gsrsearch=" + URLEncoder.encode("$q filetype:bitmap", "UTF-8")
        val pages = JSONObject(get(u)).optJSONObject("query")?.optJSONObject("pages") ?: return@io emptyList<String>()
        val out = ArrayList<String>()
        for (k in pages.keys()) pages.getJSONObject(k).optJSONArray("imageinfo")?.optJSONObject(0)?.str("thumburl")
            ?.let { if (Regex("""\.jpe?g""", RegexOption.IGNORE_CASE).containsMatchIn(it)) out += it }
        out
    }.also { if (it.isNotEmpty()) photos[q] = it }

    private fun icon(c: Int) = when (c) {
        0 -> "☀️"; 1, 2 -> "🌤️"; 3 -> "☁️"; 45, 48 -> "🌫️"
        in 51..67, in 80..82 -> "🌧️"; in 71..77, 85, 86 -> "❄️"; in 95..99 -> "⛈️"; else -> "🌡️"
    }
}

object Capitals {
    class Cap(val city: String, val lat: Double, val lon: Double)
    private val map by lazy {
        ("LB:Beirut:33.89:35.50,SY:Damascus:33.51:36.29,JO:Amman:31.95:35.93,IQ:Baghdad:33.31:44.36,SA:Riyadh:24.71:46.68," +
         "AE:Dubai:25.20:55.27,QA:Doha:25.29:51.53,KW:Kuwait:29.37:47.98,BH:Manama:26.23:50.59,OM:Muscat:23.59:58.41," +
         "EG:Cairo:30.04:31.24,LY:Tripoli:32.89:13.19,TN:Tunis:36.81:10.18,DZ:Algiers:36.75:3.06,MA:Rabat:34.02:-6.83," +
         "TR:Ankara:39.93:32.86,IR:Tehran:35.69:51.39,CY:Nicosia:35.19:33.38,AM:Yerevan:40.18:44.51,GR:Athens:37.98:23.73," +
         "IT:Rome:41.90:12.50,FR:Paris:48.86:2.35,ES:Madrid:40.42:-3.70,PT:Lisbon:38.72:-9.14,GB:London:51.51:-0.13," +
         "IE:Dublin:53.35:-6.26,DE:Berlin:52.52:13.40,NL:Amsterdam:52.37:4.90,BE:Brussels:50.85:4.35,CH:Bern:46.95:7.45," +
         "AT:Vienna:48.21:16.37,SE:Stockholm:59.33:18.07,NO:Oslo:59.91:10.75,DK:Copenhagen:55.68:12.57,FI:Helsinki:60.17:24.94," +
         "PL:Warsaw:52.23:21.01,CZ:Prague:50.08:14.44,HU:Budapest:47.50:19.04,RO:Bucharest:44.43:26.10,BG:Sofia:42.70:23.32," +
         "RS:Belgrade:44.79:20.45,HR:Zagreb:45.81:15.98,UA:Kyiv:50.45:30.52,RU:Moscow:55.76:37.62,US:Washington:38.91:-77.04," +
         "CA:Ottawa:45.42:-75.70,MX:Mexico City:19.43:-99.13,BR:São Paulo:-23.55:-46.63,AR:Buenos Aires:-34.60:-58.38," +
         "CL:Santiago:-33.45:-70.67,CO:Bogotá:4.71:-74.07,VE:Caracas:10.49:-66.88,PE:Lima:-12.05:-77.04,AU:Sydney:-33.87:151.21," +
         "NZ:Wellington:-41.29:174.78,AO:Luanda:-8.84:13.23,ZA:Johannesburg:-26.20:28.05,NG:Lagos:6.52:3.38,CI:Abidjan:5.36:-4.01," +
         "SN:Dakar:14.72:-17.47,GH:Accra:5.60:-0.19,KE:Nairobi:-1.29:36.82,MZ:Maputo:-25.97:32.57,CV:Praia:14.93:-23.51," +
         "CD:Kinshasa:-4.44:15.27,IN:New Delhi:28.61:77.21,PK:Islamabad:33.68:73.05,CN:Beijing:39.90:116.40,JP:Tokyo:35.68:139.69," +
         "KR:Seoul:37.57:126.98,ID:Jakarta:-6.21:106.85,PH:Manila:14.60:120.98,TH:Bangkok:13.76:100.50,MY:Kuala Lumpur:3.14:101.69," +
         "SG:Singapore:1.35:103.82").split(",").associate { r ->
            val p = r.split(":"); p[0] to Cap(p[1], p[2].toDouble(), p[3].toDouble())
        }
    }
    fun of(cc: String) = map[cc.uppercase()]
}
