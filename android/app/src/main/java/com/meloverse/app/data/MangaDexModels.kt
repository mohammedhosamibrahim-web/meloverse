package com.meloverse.app.data

/** MangaDex API v5 DTOs (Gson) — subset needed by MeloVerse */

data class RelDto(
    val type: String? = null,
    val id: String? = null,
    val attributes: RelAttrsDto? = null
)

data class RelAttrsDto(
    val fileName: String? = null,
    val name: String? = null
)

data class TagDto(val attributes: TagAttrsDto? = null)
data class TagAttrsDto(val name: Map<String, String> = emptyMap())

data class MangaDto(
    val id: String? = null,
    val attributes: MangaAttrsDto? = null,
    val relationships: List<RelDto> = emptyList()
)

data class MangaAttrsDto(
    val title: Map<String, String> = emptyMap(),
    val altTitles: List<Map<String, String>> = emptyList(),
    val description: Map<String, String> = emptyMap(),
    val status: String? = null,
    val originalLanguage: String? = null,
    val tags: List<TagDto> = emptyList(),
    val updatedAt: String? = null,
    val lastChapter: String? = null,
    val latestUploadedChapter: String? = null
)

data class MangaCollectionDto(
    val result: String? = null,
    val data: List<MangaDto> = emptyList(),
    val total: Int = 0
)

data class MangaDetailDto(
    val result: String? = null,
    val data: MangaDto? = null
)

data class ChapterDto(
    val id: String? = null,
    val attributes: ChapterAttrsDto? = null
)

data class ChapterAttrsDto(
    val chapter: String? = null,
    val title: String? = null,
    val pages: Int = 0,
    val publishAt: String? = null
)

data class ChapterCollectionDto(
    val result: String? = null,
    val data: List<ChapterDto> = emptyList(),
    val total: Int = 0
)

data class AtHomeDto(
    val result: String? = null,
    val baseUrl: String? = null,
    val chapter: AtHomeChapterDto? = null
)

data class AtHomeChapterDto(
    val hash: String? = null,
    val data: List<String> = emptyList(),
    val dataSaver: List<String> = emptyList()
)
