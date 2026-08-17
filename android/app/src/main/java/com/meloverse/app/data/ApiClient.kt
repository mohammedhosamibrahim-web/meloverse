package com.meloverse.app.data

import java.util.Locale
import java.util.concurrent.TimeUnit
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object ApiClient {
    private const val BASE_URL = "https://api.mangadex.org/"

    val api: MangadexApi by lazy {
        val logging = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BASIC
        }
        val client = OkHttpClient.Builder()
            .addInterceptor { chain ->
                chain.proceed(
                    chain.request().newBuilder()
                        .header("User-Agent", "MeloVerse/0.1 (android)")
                        .build()
                )
            }
            .addInterceptor(logging)
            .connectTimeout(20, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .build()
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(MangadexApi::class.java)
    }
}

/** UI language drives which translations we request from MangaDex */
fun currentLang(): String = if (Locale.getDefault().language == "ar") "ar" else "en"

object MangaMapper {
    fun title(m: MangaDto, lang: String): String {
        val attrs = m.attributes ?: return "—"
        return attrs.title[lang]
            ?: attrs.title["en"]
            ?: attrs.title["ar"]
            ?: attrs.title.values.firstOrNull()
            ?: "—"
    }

    fun altTitle(m: MangaDto): String =
        (m.attributes?.altTitles.orEmpty().flatMap { it.values }).firstOrNull() ?: ""

    fun description(m: MangaDto, lang: String): String {
        val d = m.attributes?.description ?: return ""
        return d[lang] ?: d["en"] ?: d["ar"] ?: ""
    }

    fun coverUrl(m: MangaDto, thumb: Boolean = true): String {
        val rel = m.relationships?.firstOrNull { it.type == "cover_art" } ?: return ""
        val file = rel.attributes?.fileName ?: return ""
        val raw = "https://uploads.mangadex.org/covers/${m.id}/$file" + if (thumb) ".256.jpg" else ""
        return proxy(raw)
    }

    fun typeLabel(m: MangaDto): String {
        val tags = m.attributes?.tags.orEmpty()
        val names = tags.mapNotNull { it.attributes?.name?.get("en") }
        return names.firstOrNull { it in setOf("Web Comic", "Manhwa", "Manhua", "Manga") }
            ?: names.firstOrNull() ?: ""
    }

    fun statusLabel(s: String?): String = when (s) {
        "ongoing" -> "مستمرة"
        "completed" -> "مكتملة"
        "cancelled" -> "ملغاة"
        "hiatus" -> "متوقفة"
        else -> s ?: ""
    }

    fun sortChapters(list: List<ChapterDto>): List<ChapterDto> =
        list.sortedWith(
            compareBy(
                { it.attributes?.chapter?.toFloatOrNull() ?: Float.MAX_VALUE },
                { it.attributes?.publishAt ?: "" }
            )
        )
}

/** Fetch ALL chapters of a work in a language (paginated, cap 1200) */
suspend fun MangadexApi.fetchAllChapters(id: String, lang: String, cap: Int = 1200): List<ChapterDto> {
    val out = mutableListOf<ChapterDto>()
    var offset = 0
    var total = 1
    while (offset < total && out.size < cap) {
        val page = feed(id = id, lang = listOf(lang), offset = offset)
        out += page.data
        total = page.total
        offset += 100
        if (page.data.isEmpty()) break
    }
    return MangaMapper.sortChapters(out)
}

/** Route remote images through our CDN proxy (bypasses ISP/referer blocks) */
fun proxy(raw: String): String {
    if (raw.isEmpty()) return ""
    val server = com.meloverse.app.BuildConfig.SERVER_URL
    if (server.isNotEmpty() && raw.startsWith("http")) {
        return "$server/img/${java.net.URLEncoder.encode(raw, "UTF-8")}"
    }
    return raw
}

/** Build a full page URL from at-home data */
fun pageUrl(atHome: AtHomeDto, file: String, dataSaver: Boolean): String {
    val base = atHome.baseUrl ?: return ""
    val hash = atHome.chapter?.hash ?: return ""
    val quality = if (dataSaver) "data-saver" else "data"
    return proxy("$base/$quality/$hash/$file")
}
