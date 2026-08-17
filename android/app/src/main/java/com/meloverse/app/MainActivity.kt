package com.meloverse.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import com.meloverse.app.ui.navigation.MeloNavHost
import com.meloverse.app.ui.theme.MeloVerseTheme

class MainActivity : ComponentActivity() {

    // holds the latest available update (url to versionName) when found
    private var update by mutableStateOf<Pair<String, String>?>(null)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        UpdateChecker.check(this) { url, versionName ->
            runOnUiThread { update = url to versionName }
        }
        setContent {
            MeloVerseTheme {
                update?.let { (url, ver) ->
                    UpdateChecker.UpdateDialog(url, ver, onDismiss = { update = null })
                }
                MeloNavHost()
            }
        }
    }
}
