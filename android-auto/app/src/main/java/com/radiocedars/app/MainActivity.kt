package com.radiocedars.app

import android.app.Activity
import android.os.Bundle
import android.webkit.WebView
import android.webkit.WebViewClient

class MainActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val webView = WebView(this)
        webView.settings.javaScriptEnabled = true
        webView.settings.domStorageEnabled = true
        webView.webViewClient = WebViewClient()
        setContentView(webView)
        webView.loadUrl("https://radio-cedars.vercel.app")
    }

    @Deprecated("Deprecated in Android")
    override fun onBackPressed() {
        super.onBackPressed()
    }
}
