@file:OptIn(androidx.compose.ui.text.ExperimentalTextApi::class)

package com.mawja.radio

import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontVariation
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.material3.lightColorScheme
import androidx.compose.ui.graphics.Color

private val W = Color.White
private val DARK_INK = Color(0xFF1A1A1A)

/** One look per family member, each with a night (dark) and day (light) version. */
class FamilyTheme(
    val name: String, val emoji: String, primary: Long, secondary: Long,
    bg: Long, surface: Long, variant: Long, dayPrimary: Long, dayBg: Long, dayVariant: Long, fg: Long = 0xFFFFFFFF
) {
    val dark = darkColorScheme(
        primary = Color(primary), onPrimary = Color.Black, secondary = Color(secondary),
        background = Color(bg), surface = Color(surface), surfaceVariant = Color(variant),
        onBackground = Color(fg), onSurface = Color(fg), onSurfaceVariant = Color(fg).copy(alpha = .8f)
    )
    val light = lightColorScheme(
        primary = Color(dayPrimary), onPrimary = W, secondary = Color(secondary),
        background = Color(dayBg), surface = W, surfaceVariant = Color(dayVariant),
        onBackground = DARK_INK, onSurface = DARK_INK, onSurfaceVariant = DARK_INK.copy(alpha = .75f)
    )
}

val THEMES = listOf(
    // The website's house: walnut room, limestone text, ochre dial, cobalt tiles
    FamilyTheme("Sawt el Beit", "🏠", 0xFFD9A441, 0xFF86ABDD, 0xFF17120E, 0xFF221B15, 0xFF2B221A, 0xFFB23A2A, 0xFFFBF6E9, 0xFFF1E8D6, 0xFFEADFCB),
    FamilyTheme("Cedar Forest", "🌲", 0xFF7BC67E, 0xFFD4AF37, 0xFF0E2417, 0xFF15331F, 0xFF1E4429, 0xFF1F6B3A, 0xFFF3F8F2, 0xFFDCEBDD),
    FamilyTheme("Jasmine", "🌸", 0xFFF48FB1, 0xFFB39DDB, 0xFF241019, 0xFF331722, 0xFF45202F, 0xFFB0306A, 0xFFFFF7F0, 0xFFF6E3EA),
    FamilyTheme("Mediterranean", "🌊", 0xFF4FC3F7, 0xFFFFD580, 0xFF061A2B, 0xFF0B2A44, 0xFF12395A, 0xFF0B6FA4, 0xFFF1F7FB, 0xFFD8E9F3),
    FamilyTheme("Byblos Sunset", "🌅", 0xFFFF8A65, 0xFFFFC857, 0xFF2A0F2E, 0xFF3B1640, 0xFF4A1D50, 0xFFC4462A, 0xFFFFF5EE, 0xFFF9E0D6),
    FamilyTheme("Beirut Nights", "✨", 0xFFFFC300, 0xFF00E5FF, 0xFF05070D, 0xFF111522, 0xFF1B2133, 0xFF8A6A00, 0xFFF7F7F2, 0xFFE6E6DA)
)

/** The car look for Drive mode: dashboard black with amber gauges. */
val DRIVE = FamilyTheme("Drive", "🚗", 0xFFD9A441, 0xFFC2452F, 0xFF0E0B08, 0xFF17120E, 0xFF221B15, 0xFFB23A2A, 0xFFFBF6E9, 0xFFF1E8D6, 0xFFEADFCB)

/** The website's fonts: Lalezar for titles, Readex Pro for text (both cover Arabic). */
val Lalezar = FontFamily(Font(R.font.lalezar))
private fun readex(w: Int) = Font(R.font.readex, FontWeight(w), variationSettings = FontVariation.Settings(FontVariation.weight(w)))
val Readex = FontFamily(readex(400), readex(500), readex(600), readex(700))
val HouseType = Typography().let { t ->
    Typography(
        displayLarge = t.displayLarge.copy(fontFamily = Lalezar), displayMedium = t.displayMedium.copy(fontFamily = Lalezar),
        displaySmall = t.displaySmall.copy(fontFamily = Lalezar), headlineLarge = t.headlineLarge.copy(fontFamily = Lalezar),
        headlineMedium = t.headlineMedium.copy(fontFamily = Lalezar), headlineSmall = t.headlineSmall.copy(fontFamily = Lalezar),
        titleLarge = t.titleLarge.copy(fontFamily = Lalezar), titleMedium = t.titleMedium.copy(fontFamily = Readex),
        titleSmall = t.titleSmall.copy(fontFamily = Readex), bodyLarge = t.bodyLarge.copy(fontFamily = Readex),
        bodyMedium = t.bodyMedium.copy(fontFamily = Readex), bodySmall = t.bodySmall.copy(fontFamily = Readex),
        labelLarge = t.labelLarge.copy(fontFamily = Readex), labelMedium = t.labelMedium.copy(fontFamily = Readex),
        labelSmall = t.labelSmall.copy(fontFamily = Readex)
    )
}
