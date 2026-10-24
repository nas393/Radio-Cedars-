package com.mawja.radio

import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.ui.graphics.Color

private val W = Color.White
private val INK = Color(0xFF1A1A1A)

/** One look per family member, each with a night (dark) and day (light) version. */
class FamilyTheme(
    val name: String, val emoji: String, primary: Long, secondary: Long,
    bg: Long, surface: Long, variant: Long, dayPrimary: Long, dayBg: Long, dayVariant: Long
) {
    val dark = darkColorScheme(
        primary = Color(primary), onPrimary = Color.Black, secondary = Color(secondary),
        background = Color(bg), surface = Color(surface), surfaceVariant = Color(variant),
        onBackground = W, onSurface = W, onSurfaceVariant = W.copy(alpha = .8f)
    )
    val light = lightColorScheme(
        primary = Color(dayPrimary), onPrimary = W, secondary = Color(secondary),
        background = Color(dayBg), surface = W, surfaceVariant = Color(dayVariant),
        onBackground = INK, onSurface = INK, onSurfaceVariant = INK.copy(alpha = .75f)
    )
}

val THEMES = listOf(
    FamilyTheme("Cedar Forest", "🌲", 0xFF7BC67E, 0xFFD4AF37, 0xFF0E2417, 0xFF15331F, 0xFF1E4429, 0xFF1F6B3A, 0xFFF3F8F2, 0xFFDCEBDD),
    FamilyTheme("Jasmine", "🌸", 0xFFF48FB1, 0xFFB39DDB, 0xFF241019, 0xFF331722, 0xFF45202F, 0xFFB0306A, 0xFFFFF7F0, 0xFFF6E3EA),
    FamilyTheme("Mediterranean", "🌊", 0xFF4FC3F7, 0xFFFFD580, 0xFF061A2B, 0xFF0B2A44, 0xFF12395A, 0xFF0B6FA4, 0xFFF1F7FB, 0xFFD8E9F3),
    FamilyTheme("Byblos Sunset", "🌅", 0xFFFF8A65, 0xFFFFC857, 0xFF2A0F2E, 0xFF3B1640, 0xFF4A1D50, 0xFFC4462A, 0xFFFFF5EE, 0xFFF9E0D6),
    FamilyTheme("Beirut Nights", "✨", 0xFFFFC300, 0xFF00E5FF, 0xFF05070D, 0xFF111522, 0xFF1B2133, 0xFF8A6A00, 0xFFF7F7F2, 0xFFE6E6DA)
)

/** The car look for Drive mode: dashboard black with amber gauges. */
val DRIVE = FamilyTheme("Drive", "🚗", 0xFFFFB300, 0xFF4CAF50, 0xFF0B0D10, 0xFF15181D, 0xFF1E2228, 0xFFB37A00, 0xFFF5F5F5, 0xFFE3E3E3)
