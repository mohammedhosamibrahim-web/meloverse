package com.meloverse.app

import android.app.Application
import com.meloverse.app.data.LibraryStore

class MeloVerseApp : Application() {
    lateinit var library: LibraryStore
        private set

    override fun onCreate() {
        super.onCreate()
        library = LibraryStore(this)
    }
}
