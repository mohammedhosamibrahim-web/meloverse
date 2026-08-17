package com.meloverse.app.data

import retrofit2.http.GET
import retrofit2.http.Path
import retrofit2.http.Query

/** Retrofit interface for MangaDex API v5 */
interface MangadexApi {

    @GET("manga")
    suspend fun trending(
        @Query("order[followedCount]") order: String = "desc",
        @Query("contentRating[]") ratings: List<String> = listOf("safe", "suggestive"),
        @Query("availableTranslatedLanguage[]") lang: List<String>,
        @Query("includes[]") includes: List<String> = listOf("cover_art"),
        @Query("limit") limit: Int = 24,
        @Query("offset") offset: Int = 0
    ): MangaCollectionDto

    @GET("manga")
    suspend fun latest(
        @Query("order[latestUploadedChapter]") order: String = "desc",
        @Query("contentRating[]") ratings: List<String> = listOf("safe", "suggestive"),
        @Query("availableTranslatedLanguage[]") lang: List<String>,
        @Query("includes[]") includes: List<String> = listOf("cover_art"),
        @Query("limit") limit: Int = 24
    ): MangaCollectionDto

    @GET("manga")
    suspend fun search(
        @Query("title") title: String,
        @Query("contentRating[]") ratings: List<String> = listOf("safe", "suggestive"),
        @Query("availableTranslatedLanguage[]") lang: List<String>,
        @Query("includes[]") includes: List<String> = listOf("cover_art"),
        @Query("limit") limit: Int = 24
    ): MangaCollectionDto

    @GET("manga/{id}")
    suspend fun manga(
        @Path("id") id: String,
        @Query("includes[]") includes: List<String> = listOf("cover_art", "author", "artist")
    ): MangaDetailDto

    @GET("manga/{id}/feed")
    suspend fun feed(
        @Path("id") id: String,
        @Query("translatedLanguage[]") lang: List<String>,
        @Query("order[publishAt]") publishOrder: String = "desc",
        @Query("order[chapter]") chapterOrder: String = "desc",
        @Query("contentRating[]") ratings: List<String> = listOf("safe", "suggestive"),
        @Query("limit") limit: Int = 100,
        @Query("offset") offset: Int = 0
    ): ChapterCollectionDto

    @GET("at-home/server/{id}")
    suspend fun atHome(@Path("id") id: String): AtHomeDto
}
