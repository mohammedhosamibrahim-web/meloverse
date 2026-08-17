package com.meloverse.app.ui.navigation

import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.meloverse.app.MeloVerseApp
import com.meloverse.app.data.ApiClient
import com.meloverse.app.data.LibraryStore
import com.meloverse.app.data.MangadexApi
import com.meloverse.app.ui.detail.MangaDetailScreen
import com.meloverse.app.ui.home.HomeScreen
import com.meloverse.app.ui.library.LibraryScreen
import com.meloverse.app.ui.reader.ReaderScreen
import com.meloverse.app.ui.search.SearchScreen

@Composable
fun MeloNavHost(api: MangadexApi = ApiClient.api) {
    val navController = rememberNavController()
    val context = LocalContext.current
    val store: LibraryStore =
        (context.applicationContext as MeloVerseApp).library

    NavHost(navController = navController, startDestination = "home") {
        composable("home") { HomeScreen(api, store, navController) }
        composable("search") { SearchScreen(api, navController) }
        composable("library") { LibraryScreen(store, navController) }
        composable(
            "manga/{id}",
            arguments = listOf(navArgument("id") { type = NavType.StringType })
        ) { entry ->
            MangaDetailScreen(api, store, navController, entry.arguments?.getString("id") ?: "")
        }
        composable(
            "reader/{chapterId}?manga={mangaId}&lang={lang}",
            arguments = listOf(
                navArgument("chapterId") { type = NavType.StringType },
                navArgument("mangaId") { type = NavType.StringType; defaultValue = "" },
                navArgument("lang") { type = NavType.StringType; defaultValue = "" }
            )
        ) { entry ->
            ReaderScreen(
                api, store, navController,
                entry.arguments?.getString("chapterId") ?: "",
                entry.arguments?.getString("mangaId") ?: "",
                entry.arguments?.getString("lang") ?: ""
            )
        }
    }
}

fun NavHostController.goManga(id: String) = navigate("manga/$id")
fun NavHostController.goReader(chapterId: String, mangaId: String, lang: String = "") =
    navigate("reader/$chapterId?manga=$mangaId&lang=$lang")
