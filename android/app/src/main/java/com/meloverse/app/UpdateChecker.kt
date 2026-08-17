package com.meloverse.app

import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import java.net.HttpURLConnection
import java.net.URL
import org.json.JSONObject

/** Checks {SERVER_URL}/api/update/latest and shows a dialog when a newer APK exists */
object UpdateChecker {

    private val server: String get() = BuildConfig.SERVER_URL

    fun check(context: Context, onNewVersion: (url: String, versionName: String) -> Unit) {
        if (server.isEmpty()) return
        Thread {
            var conn: HttpURLConnection? = null
            try {
                conn = URL("$server/api/update/latest").openConnection() as HttpURLConnection
                conn.connectTimeout = 8000
                conn.readTimeout = 8000
                if (conn.responseCode == 200) {
                    val json = JSONObject(conn.inputStream.bufferedReader().readText())
                    val serverCode = json.optInt("versionCode", 0)
                    val versionName = json.optString("versionName", "")
                    val url = json.optString("url", "")
                    if (serverCode > BuildConfig.VERSION_CODE && url.isNotEmpty()) {
                        val fullUrl = if (url.startsWith("http")) url else server + url
                        onNewVersion(fullUrl, versionName)
                    }
                }
            } catch (_: Exception) {
            } finally {
                runCatching { conn?.disconnect() }
            }
        }.start()
    }

    @Composable
    fun UpdateDialog(url: String, versionName: String, onDismiss: () -> Unit) {
        val ctx = androidx.compose.ui.platform.LocalContext.current
        AlertDialog(
            onDismissRequest = onDismiss,
            title = { Text("تحديث متوفر 🎉") },
            text = { Text("نسخة جديدة من MeloVerse (v$versionName) جاهزة. حمّلها الآن للاستفادة من آخر الميزات.") },
            confirmButton = {
                TextButton(onClick = {
                    onDismiss()
                    ctx.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                }) { Text("تنزيل التحديث", color = MaterialTheme.colorScheme.primary) }
            },
            dismissButton = {
                TextButton(onClick = onDismiss) { Text("لاحقًا") }
            }
        )
    }
}
