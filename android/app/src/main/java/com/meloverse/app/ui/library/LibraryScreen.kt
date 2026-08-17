package com.meloverse.app.ui.library

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import coil.compose.AsyncImage
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import com.meloverse.app.data.LibraryStore
import com.meloverse.app.data.currentLang
import com.meloverse.app.ui.components.BottomBar
import com.meloverse.app.ui.navigation.goManga

@Composable
fun LibraryScreen(store: LibraryStore, nav: NavHostController) {
    val lang = currentLang()
    var follows by remember { mutableStateOf(store.follows()) }

    Scaffold(bottomBar = { BottomBar(nav, "library") }) { padding ->
        Column(
            Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp)
        ) {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text(
                    if (lang == "ar") "مكتبتي" else "My Library",
                    style = MaterialTheme.typography.headlineSmall
                )
                if (follows.isNotEmpty()) {
                    TextButton(onClick = {
                        store.clearAll()
                        follows = emptyList()
                    }) { Text(if (lang == "ar") "مسح الكل" else "Clear all") }
                }
            }
            if (follows.isEmpty()) {
                Text(
                    if (lang == "ar") "لا توجد متابعات بعد — تابع أعمالك المفضلة من صفحاتها." else "Nothing followed yet — follow your favorite series from their pages.",
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(top = 30.dp)
                )
            } else {
                LazyVerticalGrid(
                    columns = GridCells.Adaptive(120.dp),
                    contentPadding = PaddingValues(top = 12.dp, bottom = 24.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(follows, key = { it.id }) { f ->
                        val prog = store.progress(f.id)
                        Card(
                            onClick = { nav.goManga(f.id) },
                            shape = RoundedCornerShape(14.dp)
                        ) {
                            Column {
                                AsyncImage(
                                    model = f.cover,
                                    contentDescription = null,
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .aspectRatio(2f / 3f),
                                    contentScale = ContentScale.Crop
                                )
                                Column(Modifier.padding(10.dp)) {
                                    Text(
                                        f.title,
                                        style = MaterialTheme.typography.bodyMedium,
                                        fontWeight = FontWeight.SemiBold,
                                        maxLines = 2,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                    Text(
                                        if (prog != null)
                                            (if (lang == "ar") "أكمل القراءة" else "Continue") + " · " + prog.pageIndex
                                        else f.type,
                                        style = MaterialTheme.typography.bodySmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                                        maxLines = 1
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
