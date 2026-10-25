# keep the app's own code whole (small, and safe for the WebView bridge and car services)
-keep class com.mawja.radio.** { *; }
-keepclassmembers class * { @android.webkit.JavascriptInterface <methods>; }
