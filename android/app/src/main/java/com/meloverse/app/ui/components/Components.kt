package com.meloverse.app.ui.components

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import com.meloverse.app.data.MangaDto
import com.meloverse.app.data.currentLang

@Composable
fun BottomBar(nav: NavHostController, current: String) {
    val lang = currentLang()
    val items = listOf(
        "home" to if (lang == "ar") "الرئيسية" else "Home",
        "search" to if (lang == "ar") "البحث" else "Search",
        "library" to if (lang == "ar") "مكتبتي" else "Library"
    )
    NavigationBar {
        items.forEach { (route, label) ->
            NavigationBarItem(
                selected = current == route,
                onClick = {
                    if (nav.currentDestination?.route != route) nav.navigate(route) {
                        popUpTo("home") { saveState = true }
                        launchSingleTop = true
                        restoreState = true
                    }
                },
                label = { Text(label, maxLines = 1) },
                icon = {},
                colors = NavigationBarItemDefaults.colors()
            )
        }
    }
}

@Composable
fun SectionTitle(text: String) {
    Text(
        text = text,
        style = MaterialTheme.typography.titleMedium,
        fontWeight = FontWeight.Bold,
        modifier = Modifier.padding(top = 20.dp, bottom = 10.dp)
    )
}

@Composable
fun MangaRow(cards: List<MangaDto>, onOpen: (String) -> Unit) {
    androidx.compose.foundation.lazy.LazyRow(
        contentPadding = PaddingValues(end = 8.dp)
    ) {
        items(cards.size) { i ->
            val m = cards[i]
            MangaCard(
                manga = m,
                onClick = { m.id?.let(onOpen) ?: Unit },
                modifier = Modifier
                    .width(130.dp)
                    .padding(end = 12.dp)
            )
        }
    }
}
