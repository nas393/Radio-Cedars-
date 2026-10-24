package com.mawja.radio

import androidx.compose.material3.ColorScheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.ui.graphics.Color

class FamilyTheme(val name: String, val emoji: String, val scheme: ColorScheme)

private val W = Color.White

/** One theme per family member — picked per profile in Settings. */
val THEMES = listOf(
    FamilyTheme("Cedar Forest", "🌲", darkColorScheme(
        primary = Color(0xFF7BC67E), onPrimary = Color(0xFF0B2A16), secondary = Color(0xFFD4AF37),
        background = Color(0xFF0E2417), surface = Color(0xFF15331F), surfaceVariant = Color(0xFF1E4429),
        onBackground = W, onSurface = W, onSurfaceVariant = Color(0xFFCFE8D2))),
    FamilyTheme("Jasmine", "🌸", lightColorScheme(
        primary = Color(0xFFB0306A), onPrimary = W, secondary = Color(0xFF7A4E9E),
        background = Color(0xFFFFF7F0), surface = W, surfaceVariant = Color(0xFFF6E3EA),
        onBackground = Color(0xFF2B1720), onSurface = Color(0xFF2B1720))),
    FamilyTheme("Mediterranean", "🌊", darkColorScheme(
        primary = Color(0xFF4FC3F7), onPrimary = Color(0xFF00243A), secondary = Color(0xFFFFD580),
        background = Color(0xFF061A2B), surface = Color(0xFF0B2A44), surfaceVariant = Color(0xFF12395A),
        onBackground = W, onSurface = W)),
    FamilyTheme("Byblos Sunset", "🌅", darkColorScheme(
        primary = Color(0xFFFF8A65), onPrimary = Color(0xFF3A0E00), secondary = Color(0xFFFFC857),
        background = Color(0xFF2A0F2E), surface = Color(0xFF3B1640), surfaceVariant = Color(0xFF4A1D50),
        onBackground = W, onSurface = W)),
    FamilyTheme("Beirut Nights", "✨", darkColorScheme(
        primary = Color(0xFFFFC300), onPrimary = Color.Black, secondary = Color(0xFF00E5FF),
        background = Color(0xFF05070D), surface = Color(0xFF111522), surfaceVariant = Color(0xFF1B2133),
        onBackground = W, onSurface = W))
)
