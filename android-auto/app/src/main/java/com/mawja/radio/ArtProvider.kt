package com.mawja.radio

import android.content.ContentProvider
import android.content.ContentValues
import android.net.Uri
import android.os.ParcelFileDescriptor
import java.io.File
import java.net.HttpURLConnection
import java.net.URL

/** Serves station logos to Android Auto, which can't load web images directly. */
class ArtProvider : ContentProvider() {
    companion object {
        private const val AUTH = "com.mawja.radio.art"
        fun uri(url: String?): Uri? = url?.let { Uri.parse("content://$AUTH/" + Uri.encode(it)) }
    }

    override fun openFile(uri: Uri, mode: String): ParcelFileDescriptor? {
        val url = uri.lastPathSegment ?: return null
        val f = File(context!!.cacheDir, "art_" + Integer.toHexString(url.hashCode()))
        if (!f.exists()) {
            // Only fetch logos of stations the app itself listed.
            if (Repo.stations.values.none { it.logo == url }) return null
            try {
                val c = URL(url).openConnection() as HttpURLConnection
                c.connectTimeout = 5000; c.readTimeout = 8000
                c.inputStream.use { i -> f.outputStream().use { i.copyTo(it) } }
            } catch (e: Exception) { f.delete(); return null }
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
