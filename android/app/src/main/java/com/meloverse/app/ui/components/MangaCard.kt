package com.meloverse.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.meloverse.app.data.MangaDto
import com.meloverse.app.data.MangaMapper
import com.meloverse.app.data.currentLang
import java.time.OffsetDateTime

@Composable
fun MangaCard(
    manga: MangaDto,
    rating: Float? = null,
    chapterCount: Int = 0,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val lang = currentLang()
    val isNew = runCatching {
        val upd = manga.attributes?.updatedAt ?: manga.attributes?.latestUploadedChapter
        upd != null && System.currentTimeMillis() - OffsetDateTime.parse(upd).toInstant().toEpochMilli() < 7L * 86400000
    }.getOrDefault(false)
    Card(onClick = onClick, modifier = modifier, shape = RoundedCornerShape(14.dp)) {
        Box {
            AsyncImage(
                model = MangaMapper.coverUrl(manga),
                contentDescription = null,
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(2f / 3f),
                contentScale = ContentScale.Crop
            )
            if (isNew) {
                Text(
                    "NEW",
                    color = Color.White,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.ExtraBold,
                    modifier = Modifier
                        .align(Alignment.TopStart)
                        .padding(8.dp)
                        .background(Color(0xFFEF4444), RoundedCornerShape(999.dp))
                        .padding(horizontal = 8.dp, vertical = 3.dp)
                )
            }
            Column(
                Modifier
                    .align(Alignment.BottomStart)
                    .fillMaxWidth()
                    .background(Color(0x99000000))
                    .padding(10.dp)
            ) {
                Text(
                    text = MangaMapper.title(manga, lang),
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color.White,
                    fontWeight = FontWeight.SemiBold,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
                Row {
                    if (rating != null) {
                        Text("★ ", color = Color(0xFFF5B301), fontSize = 13.sp, fontWeight = FontWeight.Bold)
                        Text(rating.toString(), color = Color(0xFFF5B301), fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                    if (chapterCount > 0) {
                        Text(
                            "  ·  ${if (lang == "ar") "الفصل" else "Ch."} $chapterCount",
                            color = Color(0xFFDDD8EA),
                            fontSize = 11.5.sp,
                            maxLines = 1
                        )
                    } else if (rating == null) {
                        Text(MangaMapper.typeLabel(manga), color = Color(0xFFDDD8EA), fontSize = 11.5.sp, maxLines = 1)
                    }
                }
            }
        }
    }
}
