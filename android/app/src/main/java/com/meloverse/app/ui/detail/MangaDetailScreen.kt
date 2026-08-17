package com.meloverse.app.ui.detail

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import coil.compose.AsyncImage
import com.meloverse.app.data.ChapterDto
import com.meloverse.app.data.LibraryStore
import com.meloverse.app.data.MangaDto
import com.meloverse.app.data.MangaMapper
import com.meloverse.app.data.MangadexApi
import com.meloverse.app.data.currentLang
import com.meloverse.app.data.fetchAllChapters
import com.meloverse.app.ui.navigation.goReader

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun MangaDetailScreen(
    api: MangadexApi,
    store: LibraryStore,
    nav: NavHostController,
    mangaId: String
) {
    val lang = currentLang()
    var manga by remember { mutableStateOf<MangaDto?>(null) }
    var chaptersAr by remember { mutableStateOf<List<ChapterDto>>(emptyList()) }
    var chaptersEn by remember { mutableStateOf<List<ChapterDto>>(emptyList()) }
    var selLang by remember { mutableStateOf(lang) }
    var fallback by remember { mutableStateOf(false) }
    var loading by remember { mutableStateOf(true) }
    var followed by remember { mutableStateOf(store.isFollowed(mangaId)) }

    LaunchedEffect(Unit) {
        runCatching {
            val detail = api.manga(mangaId)
            val ar = api.fetchAllChapters(mangaId, "ar")
            val en = api.fetchAllChapters(mangaId, "en")
            manga = detail.data
            chaptersAr = ar
            chaptersEn = en
            // automatic fallback: if the user's language has no chapters, switch
            if (ar.isEmpty() && en.isNotEmpty()) { selLang = "en"; fallback = true }
            else if (en.isEmpty() && ar.isNotEmpty()) { selLang = "ar"; fallback = true }
        }
        loading = false
    }

    if (loading) {
        Column(
            Modifier.fillMaxSize(),
            horizontalAlignment = androidx.compose.ui.Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) { CircularProgressIndicator() }
        return
    }

    val m = manga ?: return
    val chapters = if (selLang == "ar") chaptersAr else chaptersEn
    val prog = store.progress(mangaId)
    val continueChapter = prog?.let { p -> chapters.firstOrNull { it.id == p.chapterId } } ?: chapters.lastOrNull()

    Column(Modifier.fillMaxSize()) {
        LazyColumn(Modifier.fillMaxSize()) {
            item {
                Column(Modifier.padding(16.dp)) {
                    Card(shape = RoundedCornerShape(16.dp)) {
                        AsyncImage(
                            model = MangaMapper.coverUrl(m, thumb = false),
                            contentDescription = null,
                            modifier = Modifier
                                .fillMaxWidth()
                                .heightIn(max = 480.dp),
                            contentScale = ContentScale.Fit
                        )
                    }
                    Text(
                        MangaMapper.title(m, lang),
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.ExtraBold,
                        modifier = Modifier.padding(top = 14.dp)
                    )
                    val alt = MangaMapper.altTitle(m)
                    if (alt.isNotEmpty()) {
                        Text(alt, color = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.padding(top = 2.dp))
                    }
                    val tags = m.attributes?.tags.orEmpty().take(8)
                    FlowRow(
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        modifier = Modifier.padding(top = 10.dp)
                    ) {
                        tags.forEach { tg ->
                            val name = tg.attributes?.name?.get(lang) ?: tg.attributes?.name?.get("en") ?: ""
                            if (name.isNotEmpty()) {
                                Text(
                                    name,
                                    style = MaterialTheme.typography.labelMedium,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    modifier = Modifier
                                        .padding(4.dp)
                                        .background(MaterialTheme.colorScheme.surfaceVariant, RoundedCornerShape(999.dp))
                                        .padding(horizontal = 10.dp, vertical = 4.dp)
                                )
                            }
                        }
                    }
                    // language picker (Arabic / English) with counts
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.padding(top = 12.dp)) {
                        LangChip("العربية (${chaptersAr.size})", selLang == "ar") { selLang = "ar"; fallback = false }
                        LangChip("English (${chaptersEn.size})", selLang == "en") { selLang = "en"; fallback = false }
                    }
                    if (fallback) {
                        Text(
                            if (selLang == "en") "⚠ العربية غير متاحة لهذا العمل — عرض الإنجليزية تلقائيًا. اختر لغتك." else "⚠ English not available — showing Arabic automatically. Pick your language.",
                            color = Color(0xFFB45309),
                            fontSize = 12.5.sp,
                            modifier = Modifier.padding(top = 6.dp)
                        )
                    }
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(10.dp),
                        modifier = Modifier.padding(top = 14.dp)
                    ) {
                        Button(onClick = { followed = store.toggleFollow(mangaId, MangaMapper.title(m, lang), MangaMapper.coverUrl(m)) }) {
                            Text(if (followed) (if (lang == "ar") "متابَع ✓" else "Following") else (if (lang == "ar") "＋ متابعة" else "+ Follow"))
                        }
                        if (continueChapter != null) {
                            OutlinedButton(onClick = { nav.goReader(continueChapter.id ?: "", mangaId, selLang) }) {
                                Text(if (lang == "ar") "▶ أكمل القراءة" else "▶ Continue reading")
                            }
                        }
                    }
                    val desc = MangaMapper.description(m, lang)
                    if (desc.isNotEmpty()) {
                        Text(
                            desc,
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.padding(top = 12.dp)
                        )
                    }
                    Text(
                        (if (lang == "ar") "الفصول" else "Chapters") + " (${chapters.size})",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(top = 24.dp, bottom = 8.dp)
                    )
                }
            }
            items(chapters, key = { it.id ?: it.hashCode() }) { ch ->
                val num = ch.attributes?.chapter
                val label = (if (lang == "ar") "الفصل " else "Chapter ") + (num ?: "?")
                Card(
                    onClick = { nav.goReader(ch.id ?: "", mangaId, selLang) },
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 4.dp)
                ) {
                    Row(
                        Modifier.padding(horizontal = 14.dp, vertical = 12.dp),
                        verticalAlignment = androidx.compose.ui.Alignment.CenterVertically
                    ) {
                        Text(
                            label,
                            fontWeight = FontWeight.SemiBold,
                            modifier = Modifier.padding(end = 10.dp)
                        )
                        Text(
                            ch.attributes?.title ?: "",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                            modifier = Modifier.weight(1f)
                        )
                        if (ch.id == prog?.chapterId) {
                            Text(
                                if (lang == "ar") "متابَع" else "In progress",
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.primary
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun LangChip(label: String, active: Boolean, onClick: () -> Unit) {
    val bg = if (active) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant
    val fg = if (active) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant
    Text(
        label,
        modifier = Modifier
            .background(bg, RoundedCornerShape(999.dp))
            .clickable(onClick = onClick)
            .padding(horizontal = 14.dp, vertical = 8.dp),
        color = fg,
        fontWeight = FontWeight.SemiBold,
        fontSize = 13.sp
    )
}
