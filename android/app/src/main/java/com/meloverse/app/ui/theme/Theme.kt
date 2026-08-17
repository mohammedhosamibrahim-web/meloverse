package com.meloverse.app.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val Violet = Color(0xFF7C3AED)
private val VioletDark = Color(0xFFA78BFA)

private val LightColors = lightColorScheme(
    primary = Violet,
    onPrimary = Color.White,
    secondary = Color(0xFFA855F7),
    background = Color(0xFFF7F7FB),
    surface = Color.White,
    surfaceVariant = Color(0xFFF0EFF7)
)

private val DarkColors = darkColorScheme(
    primary = VioletDark,
    onPrimary = Color(0xFF1D1B2E),
    secondary = Color(0xFFC4B5FD),
    background = Color(0xFF12101C),
    surface = Color(0xFF1D1A2C),
    surfaceVariant = Color(0xFF262238)
)

@Composable
fun MeloVerseTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = if (darkTheme) DarkColors else LightColors,
        content = content
    )
}
