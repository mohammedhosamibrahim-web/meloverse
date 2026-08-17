package com.meloverse.app.ui.reader

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.runtime.snapshotFlow
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import coil.compose.AsyncImage
import com.meloverse.app.data.ChapterDto
import com.meloverse.app.data.LibraryStore
import com.meloverse.app.data.MangaMapper
import com.meloverse.app.data.MangadexApi
import com.meloverse.app.data.currentLang
import com.meloverse.app.data.fetchAllChapters
import com.meloverse.app.data.pageUrl
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.launch

@Composable
fun ReaderScreen(
    api: MangadexApi,
    store: LibraryStore,
    nav: NavHostController,
    chapterId: String,
    mangaId: String,
    langParam: String = ""
) {
    val lang = if (langParam == "ar" || langParam == "en") langParam else currentLang()
    val scope = rememberCoroutineScope()
    var chapters by remember { mutableStateOf<List<ChapterDto>>(emptyList()) }
    var idx by remember { mutableIntStateOf(0) }
    var loading by remember { mutableStateOf(true) }
    var webtoonMode by remember { mutableStateOf(true) }
    var autoNext by remember { mutableStateOf(true) }
    var dataSaver by remember { mutableStateOf(true) }
    var showChapters by remember { mutableStateOf(false) }
    var chapterLabel by remember { mutableStateOf("") }
    var filterMode by remember { mutableIntStateOf(0) } // 0 original, 1 mono, 2 sepia
    val pageColorFilter = androidx.compose.ui.graphics.ColorFilter.colorMatrix(
        androidx.compose.ui.graphics.ColorMatrix(
            when (filterMode) {
                1 -> floatArrayOf(
                    0.213f, 0.715f, 0.072f, 0f, 0f,
                    0.213f, 0.715f, 0.072f, 0f, 0f,
                    0.213f, 0.715f, 0.072f, 0f, 0f,
                    0f, 0f, 0f, 1f, 0f
                )
                2 -> floatArrayOf(
                    0.393f, 0.769f, 0.189f, 0f, 0f,
                    0.349f, 0.686f, 0.168f, 0f, 0f,
                    0.272f, 0.534f, 0.131f, 0f, 0f,
                    0f, 0f, 0f, 1f, 0f
                )
                else -> null
            } ?: floatArrayOf(
                1f, 0f, 0f, 0f, 0f,
                0f, 1f, 0f, 0f, 0f,
                0f, 0f, 1f, 0f, 0f,
                0f, 0f, 0f, 1f, 0f
            )
        )
    )

    // combined items for webtoon infinite scroll: (chapterIndex, pageUrl)
    val combined = remember { mutableStateListOf<Pair<Int, String>>() }
    var pages by remember { mutableStateOf<List<String>>(emptyList()) }
    val pagesPerChapter = remember { mutableStateListOf<Int>() } // chapterIdx -> page count
    var appendedNext by remember { mutableStateOf(false) }

    val listState = rememberLazyListState()
    val pagerState = rememberPagerState(pageCount = { pages.size + if (autoNext && idx + 1 < chapters.size) 1 else 0 })

    suspend fun fetchPages(i: Int): List<String> {
        val atHome = api.atHome(chapters[i].id ?: return emptyList())
        val files = atHome.chapter?.let { if (dataSaver) it.dataSaver else it.data } ?: emptyList()
        return files.map { pageUrl(atHome, it, dataSaver) }
    }

    suspend fun loadChapter(i: Int) {
        if (i < 0 || i >= chapters.size) return
        idx = i
        val urls = fetchPages(i)
        pages = urls
        while (pagesPerChapter.size <= i) pagesPerChapter.add(0)
        pagesPerChapter[i] = urls.size
        combined.clear()
        urls.forEach { combined.add(i to it) }
        appendedNext = false
        val ch = chapters[i].attributes
        chapterLabel = (if (lang == "ar") "الفصل " else "Chapter ") + (ch?.chapter ?: (i + 1).toString())
        listState.scrollToItem(0)
    }

    suspend fun appendNextChapter() {
        val next = idx + 1
        if (next >= chapters.size) return
        val urls = fetchPages(next)
        while (pagesPerChapter.size <= next) pagesPerChapter.add(0)
        pagesPerChapter[next] = urls.size
        urls.forEach { combined.add(next to it) }
        appendedNext = true
    }

    fun saveProgress(chapterIndex: Int, pageInChapter: Int) {
        if (mangaId.isEmpty() || chapterIndex >= chapters.size) return
        val ch = chapters[chapterIndex]
        store.saveProgress(
            mangaId,
            LibraryStore.Progress(
                chapterId = ch.id ?: "",
                pageIndex = pageInChapter,
                chapterIndex = chapterIndex,
                totalPages = pagesPerChapter.getOrElse(chapterIndex) { 1 },
                chapterTitle = ch.attributes?.chapter ?: ""
            )
        )
    }

    LaunchedEffect(Unit) {
        runCatching {
            if (mangaId.isNotEmpty()) {
                var chs = api.fetchAllChapters(mangaId, lang)
                // chapter may belong to the other language — fetch it so navigation stays correct
                if (chs.none { it.id == chapterId } && chapterId.isNotEmpty()) {
                    val other = if (lang == "ar") "en" else "ar"
                    val otherChs = api.fetchAllChapters(mangaId, other)
                    if (otherChs.any { it.id == chapterId }) chs = otherChs
                }
                chapters = chs
            }
            if (chapters.isEmpty() && chapterId.isNotEmpty()) {
                chapters = listOf(ChapterDto(id = chapterId))
            }
        }
        val startIdx = chapters.indexOfFirst { it.id == chapterId }.coerceAtLeast(0)
        runCatching { loadChapter(startIdx) }
        loading = false
    }

    // webtoon: auto append next chapter when approaching the end
    LaunchedEffect(listState.firstVisibleItemIndex, combined.size) {
        if (!webtoonMode || combined.isEmpty()) return@LaunchedEffect
        if (listState.firstVisibleItemIndex >= combined.lastIndex - 2 && autoNext && !appendedNext && idx + 1 < chapters.size) {
            runCatching { appendNextChapter() }
        }
    }

    // progress tracking
    LaunchedEffect(webtoonMode) {
        if (webtoonMode) {
            snapshotFlow { listState.firstVisibleItemIndex }
                .distinctUntilChanged()
                .collect { vis ->
                    if (combined.isEmpty()) return@collect
                    val (ci, _) = combined[vis.coerceIn(0, combined.lastIndex)]
                    val pageInChapter = combined.take(vis + 1).count { it.first == ci } - 1
                    saveProgress(ci, pageInChapter)
                }
        } else {
            snapshotFlow { pagerState.currentPage }
                .distinctUntilChanged()
                .collect { page ->
                    if (pages.isEmpty()) return@collect
                    val realPage = page.coerceIn(0, pages.lastIndex)
                    saveProgress(idx, realPage)
                }
        }
    }

    if (loading) {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { CircularProgressIndicator() }
        return
    }

    Column(Modifier.fillMaxSize()) {
        // toolbar
        Row(
            Modifier
                .fillMaxWidth()
                .background(MaterialTheme.colorScheme.surfaceVariant)
                .padding(horizontal = 10.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            TextButton(onClick = { nav.popBackStack() }) { Text("←") }
            Text(
                chapterLabel,
                fontWeight = FontWeight.Bold,
                maxLines = 1,
                modifier = Modifier.weight(1f)
            )
            TextButton(onClick = { webtoonMode = !webtoonMode }) {
                Text(if (webtoonMode) "▥" else "▤")
            }
            TextButton(onClick = { autoNext = !autoNext }) {
                Text(if (autoNext) "⇄" else "⇄̶", color = if (autoNext) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant)
            }
            TextButton(onClick = {
                dataSaver = !dataSaver
                scope.launch { runCatching { loadChapter(idx) } }
            }) {
                Text(if (dataSaver) "☁" else "☁̶", color = if (dataSaver) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant)
            }
            TextButton(onClick = { filterMode = (filterMode + 1) % 3 }) {
                Text(if (filterMode == 0) "◐" else if (filterMode == 1) "⬛" else "🟤")
            }
            if (chapters.size > 1) {
                TextButton(onClick = { showChapters = true }) { Text("☰") }
            }
        }

        if (webtoonMode) {
            LazyColumn(
                state = listState,
                modifier = Modifier.fillMaxSize(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                itemsIndexed(combined) { _, (ci, url) ->
                    AsyncImage(
                        model = url,
                        contentDescription = null,
                        colorFilter = pageColorFilter,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
                if (idx + 1 < chapters.size) {
                    item {
                        if (autoNext && appendedNext) {
                            Text(
                                (if (lang == "ar") "فصل جديد يُحمَّل تلقائيًا..." else "Next chapter auto-loading..."),
                                style = MaterialTheme.typography.labelMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.padding(12.dp)
                            )
                        } else {
                            OutlinedButton(
                                onClick = { scope.launch { runCatching { loadChapter(idx + 1) } } },
                                modifier = Modifier.padding(16.dp)
                            ) { Text(if (lang == "ar") "الفصل التالي ↓" else "Next chapter ↓") }
                        }
                    }
                } else {
                    item { Text(if (lang == "ar") "نهاية الفصول 🎉" else "End of chapters 🎉", modifier = Modifier.padding(20.dp)) }
                }
            }
        } else {
            HorizontalPager(
                state = pagerState,
                modifier = Modifier.fillMaxSize()
            ) { page ->
                if (page < pages.size) {
                    AsyncImage(
                        model = pages[page],
                        contentDescription = null,
                        colorFilter = pageColorFilter,
                        modifier = Modifier.fillMaxWidth()
                    )
                } else {
                    Box(
                        Modifier
                            .fillMaxWidth()
                            .heightIn(min = 200.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Button(onClick = { scope.launch { runCatching { loadChapter(idx + 1) } } }) {
                            Text(if (lang == "ar") "الفصل التالي" else "Next chapter")
                        }
                    }
                }
            }
        }
    }

    if (showChapters) {
        AlertDialog(
            onDismissRequest = { showChapters = false },
            title = { Text(if (lang == "ar") "قائمة الفصول" else "Chapters") },
            text = {
                LazyColumn(Modifier.heightIn(max = 420.dp)) {
                    items(chapters.size) { i ->
                        val ch = chapters[i]
                        val num = ch.attributes?.chapter
                        TextButton(
                            onClick = {
                                showChapters = false
                                scope.launch { runCatching { loadChapter(i) } }
                            },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                ((if (lang == "ar") "الفصل " else "Chapter ") + (num ?: (i + 1).toString())) + "  " + (ch.attributes?.title ?: ""),
                                fontWeight = if (i == idx) FontWeight.Bold else FontWeight.Normal,
                                maxLines = 1
                            )
                        }
                    }
                }
            },
            confirmButton = { TextButton(onClick = { showChapters = false }) { Text(if (lang == "ar") "إغلاق" else "Close") } }
        )
    }
}
