package com.meloverse.app.ui.home

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.GridItemSpan
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DrawerValue
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalDrawerSheet
import androidx.compose.material3.ModalNavigationDrawer
import androidx.compose.material3.NavigationDrawerItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.rememberDrawerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import coil.compose.AsyncImage
import com.meloverse.app.BuildConfig
import com.meloverse.app.data.LibraryStore
import com.meloverse.app.data.MangaDto
import com.meloverse.app.data.MangaMapper
import com.meloverse.app.data.MangadexApi
import com.meloverse.app.data.currentLang
import com.meloverse.app.ui.components.BottomBar
import com.meloverse.app.ui.components.MangaCard
import com.meloverse.app.ui.components.SectionTitle
import com.meloverse.app.ui.navigation.goManga
import java.net.HttpURLConnection
import java.net.URL
import kotlinx.coroutines.launch
import org.json.JSONObject

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(api: MangadexApi, store: LibraryStore, nav: NavHostController) {
    val lang = currentLang()
    val scope = rememberCoroutineScope()
    val drawerState = rememberDrawerState(DrawerValue.Closed)
    var tab by remember { mutableIntStateOf(0) }
    var trending by remember { mutableStateOf<List<MangaDto>>(emptyList()) }
    var latest by remember { mutableStateOf<List<MangaDto>>(emptyList()) }
    var ratings by remember { mutableStateOf<Map<String, Pair<Float?, Int>>>(emptyMap()) }
    var loading by remember { mutableStateOf(true) }

    LaunchedEffect(Unit) {
        runCatching {
            val tr = api.trending(lang = listOf(lang))
            val lt = api.latest(lang = listOf(lang))
            trending = tr.data
            latest = lt.data
            // enrich ratings/chapters from our backend (best-effort)
            runCatching {
                if (BuildConfig.SERVER_URL.isNotEmpty()) {
                    val ids = (tr.data + lt.data).mapNotNull { it.id }.distinct().joinToString(",")
                    if (ids.isNotEmpty()) {
                        val conn = URL("${BuildConfig.SERVER_URL}/api/catalog/by-ids?ids=$ids").openConnection() as HttpURLConnection
                        conn.connectTimeout = 8000
                        conn.readTimeout = 8000
                        if (conn.responseCode == 200) {
                            val json = JSONObject(conn.inputStream.bufferedReader().readText()).getJSONObject("data")
                            val map = mutableMapOf<String, Pair<Float?, Int>>()
                            json.keys().forEach { k ->
                                val o = json.getJSONObject(k)
                                map[k] = (if (o.has("rating") && !o.isNull("rating")) o.getDouble("rating").toFloat() else null) to o.optInt("chapters", 0)
                            }
                            ratings = map
                        }
                        conn.disconnect()
                    }
                }
            }
        }
        loading = false
    }

    ModalNavigationDrawer(
        drawerState = drawerState,
        drawerContent = {
            ModalDrawerSheet {
                Column(Modifier.padding(horizontal = 12.dp)) {
                    Row(
                        Modifier
                            .fillMaxWidth()
                            .padding(16.dp, 20.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            "MeloVerse",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.ExtraBold,
                            color = MaterialTheme.colorScheme.primary
                        )
                    }
                    DrawerItem("🏠", if (lang == "ar") "الصفحة الرئيسية" else "Home") { nav.navigate("home") { popUpTo("home"); launchSingleTop = true } }
                    DrawerItem("🔍", if (lang == "ar") "البحث عن مانجا" else "Search manga") { nav.navigate("search") }
                    DrawerItem("📚", if (lang == "ar") "مكتبتي / المفضلة" else "Library / Favorites") { nav.navigate("library") }
                    DrawerItem("🕘", if (lang == "ar") "أقرأها الآن" else "Reading now") { nav.navigate("library") }
                    HorizontalDivider(Modifier.padding(vertical = 10.dp))
                    Text(
                        if (lang == "ar") "الروابط" else "Links",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 6.dp)
                    )
                    val ctx = LocalContext.current
                    if (BuildConfig.SERVER_URL.isNotEmpty()) {
                        DrawerItem("⬇", if (lang == "ar") "تحميل التطبيق (APK)" else "Download app (APK)") {
                            ctx.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("${BuildConfig.SERVER_URL}/builds/latest.apk")))
                        }
                    }
                }
            }
        }
    ) {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = { Text("MeloVerse", fontWeight = FontWeight.ExtraBold) },
                    navigationIcon = {
                        IconButton(onClick = { scope.launch { drawerState.open() } }) { Text("☰", fontSize = 20.sp) }
                    },
                    actions = {
                        IconButton(onClick = { nav.navigate("search") }) { Text("🔍", fontSize = 18.sp) }
                    }
                )
            },
            bottomBar = { BottomBar(nav, "home") }
        ) { padding ->
            Column(Modifier.padding(padding).fillMaxSize()) {
                TabRow(selectedTabIndex = tab) {
                    listOf(
                        if (lang == "ar") "آخر التحديثات" else "Latest",
                        if (lang == "ar") "الأكثر مشاهدة" else "Popular",
                        if (lang == "ar") "التحميلات" else "Downloads",
                        if (lang == "ar") "الأنمي" else "Anime"
                    ).forEachIndexed { i, label ->
                        Tab(selected = tab == i, onClick = { tab = i }, text = { Text(label, fontSize = 12.5.sp) })
                    }
                }
                when (tab) {
                    0 -> LatestContent(latest, ratings, nav, loading, store)
                    1 -> PopularContent(trending, ratings, nav, loading)
                    2 -> DownloadsContent(store, nav)
                    3 -> AnimeContent()
                }
            }
        }
    }
}

/** Anime tab — trending anime from AniList via our backend */
@Composable
private fun AnimeContent() {
    val lang = currentLang()
    var list by remember { mutableStateOf<List<JSONObject>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    LaunchedEffect(Unit) {
        runCatching {
            if (BuildConfig.SERVER_URL.isNotEmpty()) {
                val conn = URL("${BuildConfig.SERVER_URL}/api/anime/trending").openConnection() as HttpURLConnection
                conn.connectTimeout = 10000
                conn.readTimeout = 15000
                if (conn.responseCode == 200) {
                    val arr = JSONObject(conn.inputStream.bufferedReader().readText()).getJSONArray("data")
                    list = (0 until arr.length()).map { arr.getJSONObject(it) }
                }
                conn.disconnect()
            }
        }
        loading = false
    }
    LazyVerticalGrid(
        columns = GridCells.Adaptive(110.dp),
        contentPadding = PaddingValues(12.dp),
        horizontalArrangement = Arrangement.spacedBy(10.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp),
        modifier = Modifier.fillMaxSize()
    ) {
        if (loading) {
            item(span = { GridItemSpan(maxLineSpan) }) {
                Box(Modifier.fillMaxWidth().padding(40.dp), contentAlignment = Alignment.Center) { CircularProgressIndicator() }
            }
        } else if (list.isEmpty()) {
            item(span = { GridItemSpan(maxLineSpan) }) {
                Text(if (lang == "ar") "لا تتوفر بيانات الأنمي حاليًا" else "Anime data unavailable", color = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.padding(20.dp))
            }
        } else {
            items(list.size) { i ->
                val a = list[i]
                Column {
                    AsyncImage(
                        model = a.optString("cover").ifEmpty { null },
                        contentDescription = null,
                        modifier = Modifier.fillMaxWidth().aspectRatio(2f / 3f).background(MaterialTheme.colorScheme.surfaceVariant, RoundedCornerShape(10.dp)),
                        contentScale = androidx.compose.ui.layout.ContentScale.Crop
                    )
                    Text(a.optString("title"), fontSize = 12.sp, fontWeight = FontWeight.SemiBold, maxLines = 2, overflow = TextOverflow.Ellipsis, modifier = Modifier.padding(top = 4.dp))
                    val rating = a.optDouble("rating", 0.0)
                    val eps = a.optInt("episodes", 0)
                    Text(
                        buildString {
                            if (rating > 0) append("★ $rating")
                            if (eps > 0) { if (rating > 0) append(" · "); append("${if (lang == "ar") "حلقة" else "ep"} $eps") }
                        },
                        fontSize = 10.5.sp,
                        color = Color(0xFFF5B301)
                    )
                }
            }
        }
    }
}

@Composable
private fun DrawerItem(icon: String, label: String, onClick: () -> Unit) {
    NavigationDrawerItem(
        label = { Text("$icon  $label") },
        selected = false,
        onClick = onClick,
        modifier = Modifier.padding(vertical = 2.dp)
    )
}

@Composable
private fun PopularContent(list: List<MangaDto>, ratings: Map<String, Pair<Float?, Int>>, nav: NavHostController, loading: Boolean) {
    val lang = currentLang()
    LazyColumn(
        Modifier.fillMaxSize().padding(horizontal = 16.dp),
        contentPadding = PaddingValues(bottom = 24.dp)
    ) {
        item { SectionTitle(if (lang == "ar") "الأكثر مشاهدة" else "Most popular") }
        if (loading) {
            item { Box(Modifier.fillMaxWidth().padding(40.dp), contentAlignment = Alignment.Center) { CircularProgressIndicator() } }
        } else {
            item {
                LazyRow(contentPadding = PaddingValues(end = 8.dp)) {
                    items(list) { m ->
                        val r = ratings[m.id]
                        MangaCard(
                            manga = m,
                            rating = r?.first,
                            chapterCount = r?.second ?: 0,
                            onClick = { m.id?.let { nav.goManga(it) } },
                            modifier = Modifier.width(130.dp).padding(end = 12.dp)
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun LatestContent(list: List<MangaDto>, ratings: Map<String, Pair<Float?, Int>>, nav: NavHostController, loading: Boolean, store: LibraryStore) {
    val lang = currentLang()
    LazyColumn(
        Modifier.fillMaxSize().padding(horizontal = 16.dp),
        contentPadding = PaddingValues(bottom = 24.dp)
    ) {
        item { SectionTitle(if (lang == "ar") "أكمل القراءة" else "Continue reading") }
        val progIds = store.follows().filter { store.progress(it.id) != null }
        if (progIds.isNotEmpty()) {
            item {
                LazyRow(contentPadding = PaddingValues(end = 8.dp)) {
                    items(progIds.take(6)) { f ->
                        val p = store.progress(f.id)!!
                        Column(
                            Modifier.width(180.dp).padding(end = 10.dp)
                        ) {
                            androidx.compose.material3.Card(onClick = { nav.goManga(f.id) }, shape = RoundedCornerShape(12.dp)) {
                                Row(Modifier.padding(8.dp), verticalAlignment = Alignment.CenterVertically) {
                                    AsyncImage(model = f.cover, contentDescription = null, modifier = Modifier.width(46.dp).height(66.dp), contentScale = androidx.compose.ui.layout.ContentScale.Crop)
                                    Column(Modifier.padding(start = 8.dp)) {
                                        Text(f.title, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, maxLines = 2)
                                        Text("${if (lang == "ar") "الفصل" else "Ch."} ${p.chapterTitle.ifEmpty { (p.chapterIndex + 1).toString() }} · ${p.pageIndex}", fontSize = 10.5.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        } else {
            item { Text(if (lang == "ar") "لا يوجد تقدم قراءة بعد" else "No reading progress yet", color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 13.sp) }
        }
        item { SectionTitle(if (lang == "ar") "آخر التحديثات" else "Latest updates") }
        if (loading) {
            item { Box(Modifier.fillMaxWidth().padding(40.dp), contentAlignment = Alignment.Center) { CircularProgressIndicator() } }
        } else {
            item {
                LazyRow(contentPadding = PaddingValues(end = 8.dp)) {
                    items(list) { m ->
                        val r = ratings[m.id]
                        MangaCard(
                            manga = m,
                            rating = r?.first,
                            chapterCount = r?.second ?: 0,
                            onClick = { m.id?.let { nav.goManga(it) } },
                            modifier = Modifier.width(130.dp).padding(end = 12.dp)
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun DownloadsContent(store: LibraryStore, nav: NavHostController) {
    val lang = currentLang()
    val follows = store.follows().filter { store.progress(it.id) != null }
    LazyColumn(Modifier.fillMaxSize().padding(16.dp), contentPadding = PaddingValues(bottom = 24.dp)) {
        item {
            SectionTitle(if (lang == "ar") "التحميلات والمحفوظات" else "Downloads & saved")
            Text(
                if (lang == "ar") "التحميل دون اتصال قادم في النسخ القادمة. هنا تجد آخر ما قرأته." else "Offline download is coming. Here are your recent reads.",
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                fontSize = 13.sp
            )
        }
        if (follows.isEmpty()) {
            item { Text(if (lang == "ar") "لا محفوظات بعد" else "Nothing saved yet", color = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.padding(top = 20.dp)) }
        } else {
            items(follows) { f ->
                val p = store.progress(f.id)!!
                androidx.compose.material3.Card(
                    onClick = { nav.goManga(f.id) },
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)
                ) {
                    Row(Modifier.padding(10.dp), verticalAlignment = Alignment.CenterVertically) {
                        AsyncImage(model = f.cover, contentDescription = null, modifier = Modifier.width(44.dp).height(62.dp), contentScale = androidx.compose.ui.layout.ContentScale.Crop)
                        Column(Modifier.padding(start = 10.dp)) {
                            Text(f.title, fontWeight = FontWeight.SemiBold, fontSize = 13.5.sp, maxLines = 1)
                            Text("${if (lang == "ar") "الفصل" else "Ch."} ${p.chapterTitle.ifEmpty { (p.chapterIndex + 1).toString() }} · ${p.pageIndex + 1}/${p.totalPages}", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                }
            }
        }
    }
}
