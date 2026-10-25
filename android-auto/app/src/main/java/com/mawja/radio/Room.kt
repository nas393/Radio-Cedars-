package com.mawja.radio

import android.app.TimePickerDialog
import android.graphics.BitmapFactory
import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioTrack
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import java.io.File
import kotlin.random.Random

/** The objects you can tap in the salon, with their default names. */
val HOTSPOTS = listOf("radio" to R.string.radio_l, "tv" to R.string.tv, "news" to R.string.news, "window" to R.string.weather_l,
    "photos" to R.string.photos, "cassettes" to R.string.cassettes, "lamp" to R.string.lamp)

/** A photo of your own living room, used as a salon with dots you place yourself. */
object MyRoom {
    val file: File? get() = Store.s("myroom")?.let { File(Store.ctx.filesDir, it) }?.takeIf { it.exists() }

    fun era(): Era? {
        val f = file ?: return null
        val o = BitmapFactory.Options().apply { inJustDecodeBounds = true }
        BitmapFactory.decodeFile(f.path, o)
        if (o.outWidth <= 0) return null
        val px = o.outWidth.toFloat() to o.outHeight.toFloat()
        val d = mapOf("radio" to (30f to 60f), "tv" to (70f to 40f), "news" to (50f to 80f), "window" to (50f to 25f),
            "photos" to (20f to 30f), "cassettes" to (80f to 70f), "lamp" to (10f to 50f))
        return Era("mine", "", d.mapValues { listOf(it.value, it.value, it.value) },
            mapOf("day" to px, "night" to px, "sunset" to px), emptyMap(), emptyMap(), emptyMap())
    }

    /** Saves a new room photo under a fresh name so every screen reloads it. */
    fun set(src: File) {
        Store.s("myroom")?.let { File(Store.ctx.filesDir, it).delete() }
        val name = "myroom_${System.currentTimeMillis()}.jpg"
        src.copyTo(File(Store.ctx.filesDir, name), true); src.delete()
        Store.setS("myroom", name); Store.setS("era", "mine")
    }
}

/** Quiet room sounds: rain on the window when it really rains, and a ticking clock. */
object Ambience {
    @Volatile var rain = false
    @Volatile var tick = false
    @Volatile var visible = true
    private var thread: Thread? = null

    fun set(r: Boolean, t: Boolean) {
        rain = r; tick = t
        if ((r || t) && thread?.isAlive != true) thread = Thread(::loop).also { it.isDaemon = true; it.start() }
    }

    private fun loop() = runCatching {
        val sr = 22050; val n = 2205
        val tr = AudioTrack.Builder()
            .setAudioAttributes(AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_MEDIA).setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build())
            .setAudioFormat(AudioFormat.Builder().setEncoding(AudioFormat.ENCODING_PCM_16BIT).setSampleRate(sr).setChannelMask(AudioFormat.CHANNEL_OUT_MONO).build())
            .setBufferSizeInBytes(n * 4).setTransferMode(AudioTrack.MODE_STREAM).build()
        tr.play()
        val buf = ShortArray(n); var lp = 0f; var t = 0L
        while (rain || tick) {
            for (i in 0 until n) {
                var v = 0f
                if (visible && rain) { lp += (Random.nextFloat() * 2 - 1 - lp) * .08f; v += lp * .35f; if (Random.nextInt(3000) == 0) v += .35f }
                if (visible && tick) { val ph = (t % sr).toInt(); if (ph < 200) v += (if (ph % 2 == 0) 1f else -1f) * .22f * (1 - ph / 200f) }
                buf[i] = (v.coerceIn(-1f, 1f) * 16000).toInt().toShort(); t++
            }
            tr.write(buf, 0, n)
        }
        tr.stop(); tr.release()
    }
}

/** Edit the room: names for every object and frame, dot positions, and the room's own options. */
@Composable
fun EditRoom(era: Era) {
    val ctx = LocalContext.current
    val frames = era.frames.values.maxOfOrNull { it.size } ?: 0
    LazyColumn(contentPadding = PaddingValues(bottom = 24.dp)) {
        item { DrawerTitle("✏️ " + stringResource(R.string.edit_room)) }
        item { Text(stringResource(R.string.move_hint), Modifier.padding(16.dp, 0.dp, 16.dp, 8.dp), color = STONE_DIM, fontSize = 13.sp) }
        items(HOTSPOTS) { (k, label) ->
            var v by remember { mutableStateOf(Store.s("lbl_$k") ?: "") }
            OutlinedTextField(v, { v = it; Store.setS("lbl_$k", it) }, Modifier.fillMaxWidth().padding(16.dp, 4.dp),
                label = { Text(stringResource(label)) }, singleLine = true)
        }
        items((0 until frames).toList()) { i ->
            var v by remember { mutableStateOf(Store.s("flbl_${era.id}_$i") ?: "") }
            OutlinedTextField(v, { v = it; Store.setS("flbl_${era.id}_$i", it) }, Modifier.fillMaxWidth().padding(16.dp, 4.dp),
                label = { Text(stringResource(R.string.frame_n, i + 1)) }, singleLine = true)
        }
        item { TextButton({ Store.resetPos(era.id) }, Modifier.padding(8.dp)) { Text(stringResource(R.string.reset_pos), color = OCHRE) } }
        item {
            Column(Modifier.padding(horizontal = 16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Toggle(R.string.frame_slides, Store.b("fslides")) { Store.setB("fslides", it) }
                Toggle(R.string.sound_rain, Store.b("srain")) { Store.setB("srain", it) }
                Toggle(R.string.sound_clock, Store.b("sclock")) { Store.setB("sclock", it) }
                Toggle(R.string.visitor, Store.b("visitor")) { Store.setB("visitor", it) }
                Toggle(R.string.ritual, Store.b("ritual")) { Store.setB("ritual", it) }
                if (Store.b("ritual")) TextButton({
                    TimePickerDialog(ctx, { _, h, m -> Store.setI("rh", h); Store.setI("rm", m) }, Store.i("rh", 7), Store.i("rm", 0), true).show()
                }) { Text("⏰ %02d:%02d".format(Store.i("rh", 7), Store.i("rm", 0)), color = OCHRE) }
            }
        }
    }
}
