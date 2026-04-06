package com.rimcinema.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import com.rimcinema.viewmodel.MovieDetailViewModel

@Composable
fun MovieDetailScreen(
    movieId: Long,
    onBack: () -> Unit,
    onWatch: (Long) -> Unit,
    onRelatedClick: (Long) -> Unit,
    viewModel: MovieDetailViewModel = viewModel()
) {
    val movie by viewModel.movie.collectAsState()
    val related by viewModel.related.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()

    LaunchedEffect(movieId) { viewModel.loadMovie(movieId) }

    if (isLoading) {
        Box(Modifier.fillMaxSize().background(Color(0xFF0A0A0A)), contentAlignment = Alignment.Center) {
            CircularProgressIndicator(color = Color(0xFFE50914))
        }
        return
    }

    val m = movie ?: return

    Column(
        modifier = Modifier.fillMaxSize().background(Color(0xFF0A0A0A)).verticalScroll(rememberScrollState())
    ) {
        // Backdrop
        Box(modifier = Modifier.fillMaxWidth().height(280.dp)) {
            AsyncImage(model = m.posterUrl, contentDescription = m.title, modifier = Modifier.fillMaxSize(), contentScale = ContentScale.Crop)
            Box(Modifier.fillMaxSize().background(Brush.verticalGradient(listOf(Color.Transparent, Color(0xFF0A0A0A)))))
            IconButton(onClick = onBack, modifier = Modifier.padding(top = 40.dp, start = 8.dp).align(Alignment.TopStart)) {
                Surface(shape = androidx.compose.foundation.shape.CircleShape, color = Color(0x99000000), modifier = Modifier.size(40.dp)) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back", tint = Color.White, modifier = Modifier.padding(8.dp))
                }
            }
        }

        // Info
        Column(modifier = Modifier.padding(horizontal = 20.dp, vertical = 12.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                Text("⚡ ĐANG HOT", fontSize = 10.sp, fontWeight = FontWeight.ExtraBold, color = Color(0xFFE50914), letterSpacing = 2.sp)
                if ((m.avgRating ?: 0.0) > 0) Text("⭐ ${"%.1f".format(m.avgRating)}/5", fontSize = 13.sp, color = Color(0xFFF5A623), fontWeight = FontWeight.Bold)
            }
            Spacer(Modifier.height(10.dp))
            Text(m.title ?: "", fontSize = 28.sp, fontWeight = FontWeight.Black, color = Color.White, lineHeight = 34.sp)
            Spacer(Modifier.height(8.dp))
            Text("${m.releaseYear ?: ""}${m.durationSec?.let { "  •  ${it/60}h ${it%60}m" } ?: ""}", fontSize = 13.sp, color = Color(0xFF888888))
            Spacer(Modifier.height(12.dp))

            // Genres
            m.genres?.let { genres ->
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    genres.forEach { g ->
                        Surface(shape = RoundedCornerShape(20.dp), color = Color(0xFF1E1E1E), border = ButtonDefaults.outlinedButtonBorder) {
                            Text(g, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFFCCCCCC), modifier = Modifier.padding(horizontal = 12.dp, vertical = 5.dp))
                        }
                    }
                }
            }

            Spacer(Modifier.height(20.dp))

            // Buttons
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                Button(
                    onClick = { onWatch(movieId) },
                    modifier = Modifier.weight(1f).height(52.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFE50914))
                ) {
                    Icon(Icons.Default.PlayArrow, null, Modifier.size(20.dp))
                    Spacer(Modifier.width(8.dp))
                    Text("Xem Ngay", fontWeight = FontWeight.ExtraBold, fontSize = 16.sp)
                }
                Surface(
                    modifier = Modifier.size(52.dp),
                    shape = RoundedCornerShape(12.dp),
                    color = Color(0xFF1E1E1E),
                    onClick = {}
                ) {
                    Icon(Icons.Default.Add, null, tint = Color.White, modifier = Modifier.padding(14.dp))
                }
            }

            Spacer(Modifier.height(20.dp))
            Text(m.description ?: "Chưa có mô tả.", fontSize = 14.sp, color = Color(0xFFAAAAAA), lineHeight = 22.sp)
        }

        // Related
        if (related.isNotEmpty()) {
            Text("Phim Liên Quan", fontSize = 17.sp, fontWeight = FontWeight.ExtraBold, color = Color.White, modifier = Modifier.padding(horizontal = 20.dp, vertical = 12.dp))
            LazyRow(contentPadding = PaddingValues(horizontal = 20.dp), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                items(related) { r ->
                    Column(modifier = Modifier.width(110.dp).clickable { onRelatedClick(r.id) }) {
                        AsyncImage(model = r.posterUrl, contentDescription = r.title, modifier = Modifier.fillMaxWidth().height(160.dp).clip(RoundedCornerShape(8.dp)).background(Color(0xFF1A1A1A)), contentScale = ContentScale.Crop)
                        Text(r.title ?: "", fontSize = 11.sp, color = Color(0xFFBBBBBB), fontWeight = FontWeight.SemiBold, maxLines = 2, overflow = TextOverflow.Ellipsis, modifier = Modifier.padding(top = 5.dp))
                    }
                }
            }
        }

        Spacer(Modifier.height(32.dp))
    }
}
