package com.mawja.radio

import android.annotation.SuppressLint
import android.os.Handler
import android.os.Looper
import android.webkit.JavascriptInterface
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.webkit.WebViewAssetLoader
import org.json.JSONArray
import org.json.JSONObject

/** What the globe page may ask the app: network, play, favorites, lists, close. */
class GlobeBridge(private val wv: WebView, private val pc: PlayerConn, private val onClose: () -> Unit) {
    private val main = Handler(Looper.getMainLooper())
    private fun reply(id: Int, ok: Boolean, text: String) =
        main.post { wv.evaluateJavascript("__res($id,$ok,${JSONObject.quote(text)})", null) }

    @JavascriptInterface
    fun get(id: Int, url: String) {
        Thread {
            try {
                val rb = "api.radio-browser.info/json/"
                reply(id, true, if (rb in url) Repo.rbPath("/json/" + url.substringAfter(rb)) else Repo.get(url))
            } catch (e: Exception) { reply(id, false, e.message ?: "error") }
        }.start()
    }

    @JavascriptInterface
    fun play(list: String, id: String) {
        main.post { val l = Repo.fromBrowser(list); l.firstOrNull { it.id == id }?.let { pc.play(l, it) } }
    }

    @JavascriptInterface
    fun fav(json: String): Boolean {
        val s = Repo.fromBrowser("[$json]").firstOrNull() ?: return false
        Store.toggleFav(s); return Store.isFav(s.id)
    }

    @JavascriptInterface fun isFav(id: String) = Store.isFav(id)

    @JavascriptInterface
    fun list(k: String): String = JSONArray((if (k == "fav") Store.favs() else Store.recents()).map { it.rb() }).toString()

    @JavascriptInterface fun close() { main.post(onClose) }
}

/** Explore the world: the interactive 3D Earth, with the house tuner bar kept at the bottom. */
@SuppressLint("SetJavaScriptEnabled")
@Composable
fun Explore(pc: PlayerConn, close: () -> Unit) {
    var view by remember { mutableStateOf<WebView?>(null) }
    BackHandler(onBack = close)
    LaunchedEffect(pc.station?.id, view) {
        view?.evaluateJavascript("window.setPlaying&&setPlaying(${JSONObject.quote(pc.station?.id ?: "")})", null)
    }
    Box(Modifier.fillMaxSize().background(Color(0xFF03060F))) {
        AndroidView({ c ->
            val loader = WebViewAssetLoader.Builder().addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(c)).build()
            WebView(c).apply {
                setBackgroundColor(0xFF03060F.toInt())
                settings.javaScriptEnabled = true; settings.domStorageEnabled = true
                webViewClient = object : WebViewClient() {
                    override fun shouldInterceptRequest(v: WebView, r: WebResourceRequest): WebResourceResponse? = loader.shouldInterceptRequest(r.url)
                }
                addJavascriptInterface(GlobeBridge(this, pc, close), "Sawt")
                val q = "lang=${currentLang()}&night=${if (Sky.scene() == "night") 1 else 0}" +
                    "&lat=${Store.s("lat") ?: ""}&lon=${Store.s("lon") ?: ""}&playing=${pc.station?.id ?: ""}"
                loadUrl("https://appassets.androidplatform.net/assets/explore/index.html?$q")
                view = this
            }
        }, Modifier.fillMaxSize(), onRelease = { it.destroy() })
        Column(Modifier.align(Alignment.BottomCenter).navigationBarsPadding().padding(bottom = 10.dp)) {
            Tuner(pc, onHome = close, onPill = {}, surprise = {})
        }
    }
}
