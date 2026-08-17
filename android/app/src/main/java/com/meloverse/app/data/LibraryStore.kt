package com.meloverse.app.data

import android.content.Context
import java.io.File
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken

/** Local-first library: follows + reading progress persisted as JSON in filesDir */
class LibraryStore(context: Context) {

    data class Follow(val id: String, val title: String, val cover: String, val type: String = "")
    data class Progress(
        val chapterId: String,
        val pageIndex: Int,
        val chapterIndex: Int,
        val totalPages: Int,
        val chapterTitle: String = ""
    )

    private val dir = File(context.filesDir, "library").apply { mkdirs() }
    private val followsFile = File(dir, "follows.json")
    private val progressFile = File(dir, "progress.json")
    private val gson = Gson()

    fun follows(): List<Follow> {
        if (!followsFile.exists()) return emptyList()
        return runCatching {
            gson.fromJson<List<Follow>>(followsFile.readText(), object : TypeToken<List<Follow>>() {}.type)
        }.getOrElse { emptyList() }
    }

    fun isFollowed(id: String): Boolean = follows().any { it.id == id }

    fun toggleFollow(id: String, title: String, cover: String, type: String = ""): Boolean {
        val list = follows().toMutableList()
        val exists = list.any { it.id == id }
        if (exists) list.removeAll { it.id == id } else list.add(0, Follow(id, title, cover, type))
        followsFile.writeText(gson.toJson(list))
        return !exists
    }

    fun progress(mangaId: String): Progress? {
        if (!progressFile.exists()) return null
        return runCatching {
            gson.fromJson<Map<String, Progress>>(progressFile.readText(), object : TypeToken<Map<String, Progress>>() {}.type)
        }.getOrNull()?.get(mangaId)
    }

    fun saveProgress(mangaId: String, p: Progress) {
        val map: MutableMap<String, Progress> = runCatching {
            gson.fromJson<MutableMap<String, Progress>>(progressFile.readText(), object : TypeToken<MutableMap<String, Progress>>() {}.type)
        }.getOrElse { mutableMapOf() }
        map[mangaId] = p
        progressFile.writeText(gson.toJson(map))
    }

    fun clearAll() {
        followsFile.delete()
        progressFile.delete()
    }
}
