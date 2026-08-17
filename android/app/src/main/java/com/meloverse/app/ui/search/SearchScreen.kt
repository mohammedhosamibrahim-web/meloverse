package com.meloverse.app.ui.search

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import com.meloverse.app.data.MangaDto
import com.meloverse.app.data.MangadexApi
import com.meloverse.app.data.currentLang
import com.meloverse.app.ui.components.BottomBar
import com.meloverse.app.ui.components.MangaCard
import com.meloverse.app.ui.navigation.goManga
import kotlinx.coroutines.launch

@Composable
fun SearchScreen(api: MangadexApi, nav: NavHostController) {
    val lang = currentLang()
    var query by remember { mutableStateOf("") }
    var results by remember { mutableStateOf<List<MangaDto>>(emptyList()) }
    var searching by remember { mutableStateOf(false) }
    var searched by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()

    fun doSearch() {
        val q = query.trim()
        if (q.isEmpty()) return
        searching = true
        searched = true
        scope.launch {
            runCatching { api.search(title = q, lang = listOf(lang)) }
                .onSuccess { results = it.data }
            searching = false
        }
    }

    Scaffold(bottomBar = { BottomBar(nav, "search") }) { padding ->
        Column(
            Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp)
        ) {
            Text(
                if (lang == "ar") "البحث" else "Search",
                style = MaterialTheme.typography.headlineSmall,
                modifier = Modifier.padding(bottom = 12.dp)
            )
            OutlinedTextField(
                value = query,
                onValueChange = { query = it },
                label = { Text(if (lang == "ar") "ابحث عن عنوان..." else "Search by title...") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
                trailingIcon = {
                    Button(onClick = ::doSearch) { Text(if (lang == "ar") "بحث" else "Go") }
                }
            )
            when {
                searching -> Column(
                    Modifier
                        .fillMaxWidth()
                        .padding(50.dp),
                    horizontalAlignment = androidx.compose.ui.Alignment.CenterHorizontally
                ) { CircularProgressIndicator() }

                searched && results.isEmpty() -> Text(
                    if (lang == "ar") "لا توجد نتائج مطابقة" else "No matching results",
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(top = 30.dp)
                )

                results.isNotEmpty() -> LazyVerticalGrid(
                    columns = GridCells.Adaptive(120.dp),
                    contentPadding = PaddingValues(top = 16.dp, bottom = 24.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    items(results, key = { it.id ?: it.hashCode() }) { m ->
                        MangaCard(manga = m, onClick = { m.id?.let { nav.goManga(it) } ?: Unit })
                    }
                }
            }
        }
    }
}
