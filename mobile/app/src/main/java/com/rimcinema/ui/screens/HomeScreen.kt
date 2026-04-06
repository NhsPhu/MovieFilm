package com.rimcinema.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
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
import com.rimcinema.data.model.MovieDTO
import com.rimcinema.viewmodel.HomeViewModel

@Composable
fun HomeScreen(
    onMovieClick: (Long) -> Unit,
    homeViewModel: HomeViewModel = viewModel()
) {
    val movies by homeViewModel.movies.collectAsState()
    val popular by homeViewModel.popular.collectAsState()
    val isLoading by homeViewModel.isLoading.collectAsState()

    if (isLoading) {
        Box(Modifier.fillMaxSize().background(Color(0xFF0A0A0A)), contentAlignment = Alignment.Center) {
            CircularProgressIndicator(color = Color(0xFFE50914))
        }
        return
    }

    val hero = movies.firstOrNull()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0A0A0A))
            .verticalScroll(rememberScrollState())
    ) {
        // Hero Banner
        if (hero != null) {
            Box(
                modifier = Modifier.fillMaxWidth().height(480.dp)
            ) {
                AsyncImage(
                    model = hero.posterUrl ?: hero.posterUrl,
                    contentDescription = hero.title,
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop
                )
                Box(
                    Modifier.fillMaxSize().background(
                        Brush.verticalGradient(
                            colors = listOf(Color.Transparent, Color(0xDD0A0A0A), Color(0xFF0A0A0A)),
                            startY = 200f
                        )
                    )
                )
                Column(
                    modifier = Modifier.align(Alignment.BottomStart).padding(20.dp)
                ) {
                    Text("⚡ ĐANG HOT", fontSize = 10.sp, fontWeight = FontWeight.ExtraBold, color = Color(0xFFE50914), letterSpacing = 2.sp)
                    Spacer(Modifier.height(8.dp))
                    Text(hero.title ?: "", fontSize = 30.sp, fontWeight = FontWeight.Black, color = Color.White, lineHeight = 34.sp, maxLines = 2)
                    Spacer(Modifier.height(6.dp))
                    Text(
                        "${hero.releaseYear ?: ""} • ${hero.durationSec?.let { "${it/60}h ${it%60}m" } ?: ""}",
                        fontSize = 12.sp, color = Color(0xFFAAAAAA)
                    )
                    Spacer(Modifier.height(16.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        Button(
                            onClick = { onMovieClick(hero.id) },
                            shape = RoundedCornerShape(10.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFE50914)),
                            modifier = Modifier.weight(1f).height(48.dp)
                        ) {
                            Text("▶  Xem Ngay", fontWeight = FontWeight.ExtraBold)
                        }
                        OutlinedButton(
                            onClick = { onMovieClick(hero.id) },
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.weight(1f).height(48.dp),
                            colors = ButtonDefaults.outlinedButtonColors(contentColor = Color.White)
                        ) {
                            Text("Chi Tiết", fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }

        // Trending row
        SectionTitle("🔥 Phim Nổi Bật")
        LazyRow(
            contentPadding = PaddingValues(horizontal = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(popular.ifEmpty { movies.take(10) }) { movie ->
                MoviePosterCard(movie = movie, onClick = { onMovieClick(movie.id) })
            }
        }

        Spacer(Modifier.height(28.dp))

        // Top Rated row
        SectionTitle("🏆 Đánh Giá Cao")
        LazyRow(
            contentPadding = PaddingValues(horizontal = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(movies.sortedByDescending { it.avgRating ?: 0.0 }.take(10)) { movie ->
                MovieWideCard(movie = movie, onClick = { onMovieClick(movie.id) })
            }
        }

        Spacer(Modifier.height(20.dp))
    }
}

@Composable
fun SectionTitle(title: String) {
    Text(title, fontSize = 18.sp, fontWeight = FontWeight.ExtraBold, color = Color.White, modifier = Modifier.padding(horizontal = 16.dp, vertical = 14.dp))
}

@Composable
fun MoviePosterCard(movie: MovieDTO, onClick: () -> Unit) {
    Column(modifier = Modifier.width(140.dp).clickable(onClick = onClick)) {
        AsyncImage(
            model = movie.posterUrl,
            contentDescription = movie.title,
            modifier = Modifier.fillMaxWidth().height(210.dp).clip(RoundedCornerShape(10.dp)).background(Color(0xFF1A1A1A)),
            contentScale = ContentScale.Crop
        )
        Text(movie.title ?: "", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFFCCCCCC), maxLines = 1, overflow = TextOverflow.Ellipsis, modifier = Modifier.padding(top = 6.dp))
        if ((movie.avgRating ?: 0.0) > 0) {
            Text("⭐ ${"%.1f".format(movie.avgRating)}", fontSize = 11.sp, color = Color(0xFFF5A623))
        }
    }
}

@Composable
fun MovieWideCard(movie: MovieDTO, onClick: () -> Unit) {
    Column(modifier = Modifier.width(200.dp).clickable(onClick = onClick)) {
        AsyncImage(
            model = movie.posterUrl,
            contentDescription = movie.title,
            modifier = Modifier.fillMaxWidth().height(112.dp).clip(RoundedCornerShape(10.dp)).background(Color(0xFF1A1A1A)),
            contentScale = ContentScale.Crop
        )
        Text(movie.title ?: "", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFFCCCCCC), maxLines = 1, overflow = TextOverflow.Ellipsis, modifier = Modifier.padding(top = 6.dp))
    }
}
