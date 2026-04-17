package com.rimcinema.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.rimcinema.data.api.ApiClient
import com.rimcinema.data.model.WatchlistItemDTO
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WatchlistScreen(
    onBack: () -> Unit,
    onMovieClick: (Long) -> Unit
) {
    val scope = rememberCoroutineScope()
    var watchlist by remember { mutableStateOf<List<WatchlistItemDTO>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }

    fun loadWatchlist() {
        scope.launch {
            isLoading = true
            error = null
            try {
                val resp = ApiClient.movieApi.getWatchlist()
                watchlist = resp.body() ?: emptyList()
            } catch (e: Exception) {
                error = "Không thể tải danh sách yêu thích"
            } finally {
                isLoading = false
            }
        }
    }

    fun removeItem(movieId: Long) {
        scope.launch {
            try {
                ApiClient.movieApi.removeFromWatchlist(movieId)
                watchlist = watchlist.filter { it.id != movieId }
            } catch (_: Exception) {}
        }
    }

    LaunchedEffect(Unit) { loadWatchlist() }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("Phim Yêu Thích", fontWeight = FontWeight.ExtraBold, color = Color.White)
                        Text("${watchlist.size} phim đã lưu", fontSize = 11.sp, color = Color(0xFF888888))
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color(0xFF0A0A0A))
            )
        },
        containerColor = Color(0xFF0A0A0A)
    ) { padding ->
        when {
            isLoading -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = Color(0xFFE50914))
            }
            error != null -> Box(
                Modifier.fillMaxSize().padding(padding),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(Icons.Default.ErrorOutline, null, tint = Color(0xFF555555), modifier = Modifier.size(56.dp))
                    Spacer(Modifier.height(12.dp))
                    Text(error!!, color = Color(0xFF666666))
                    Spacer(Modifier.height(16.dp))
                    OutlinedButton(onClick = { loadWatchlist() }) {
                        Text("Thử lại", color = Color(0xFFE50914))
                    }
                }
            }
            watchlist.isEmpty() -> Box(
                Modifier.fillMaxSize().padding(padding),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(Icons.Default.FavoriteBorder, null, tint = Color(0xFF333333), modifier = Modifier.size(64.dp))
                    Spacer(Modifier.height(14.dp))
                    Text("Danh sách trống", fontSize = 17.sp, fontWeight = FontWeight.Bold, color = Color(0xFF555555))
                    Spacer(Modifier.height(6.dp))
                    Text("Nhấn ❤ trên phim để lưu vào đây", fontSize = 13.sp, color = Color(0xFF444444))
                }
            }
            else -> LazyVerticalGrid(
                columns = GridCells.Fixed(2),
                contentPadding = PaddingValues(
                    start = 12.dp, end = 12.dp,
                    top = padding.calculateTopPadding() + 8.dp,
                    bottom = 24.dp
                ),
                horizontalArrangement = Arrangement.spacedBy(10.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(watchlist) { item ->
                    WatchlistCard(
                        item = item,
                        onClick = { onMovieClick(item.id) },
                        onRemove = { removeItem(item.id) }
                    )
                }
            }
        }
    }
}

@Composable
fun WatchlistCard(
    item: WatchlistItemDTO,
    onClick: () -> Unit,
    onRemove: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .aspectRatio(0.67f)
            .clip(RoundedCornerShape(12.dp))
            .background(Color(0xFF111111))
            .clickable(onClick = onClick)
    ) {
        AsyncImage(
            model = item.posterUrl,
            contentDescription = item.title,
            modifier = Modifier.fillMaxSize(),
            contentScale = ContentScale.Crop
        )

        // Gradient overlay at bottom
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .fillMaxHeight(0.45f)
                .align(Alignment.BottomCenter)
                .background(
                    androidx.compose.ui.graphics.Brush.verticalGradient(
                        colors = listOf(Color.Transparent, Color(0xDD000000))
                    )
                )
        )

        // Remove button (top-right)
        IconButton(
            onClick = onRemove,
            modifier = Modifier
                .align(Alignment.TopEnd)
                .padding(4.dp)
                .size(32.dp)
        ) {
            Surface(shape = androidx.compose.foundation.shape.CircleShape, color = Color(0x99000000)) {
                Icon(
                    Icons.Default.Favorite,
                    "Remove",
                    tint = Color(0xFFE50914),
                    modifier = Modifier.padding(5.dp).size(16.dp)
                )
            }
        }

        // Title & info at bottom
        Column(
            modifier = Modifier
                .align(Alignment.BottomStart)
                .padding(8.dp)
        ) {
            Text(
                item.title ?: "",
                fontSize = 12.sp, fontWeight = FontWeight.Bold,
                color = Color.White, maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )
            if ((item.avgRating ?: 0.0) > 0) {
                Spacer(Modifier.height(2.dp))
                Text(
                    "⭐ ${"%.1f".format(item.avgRating)}",
                    fontSize = 10.sp, color = Color(0xFFF5A623), fontWeight = FontWeight.Bold
                )
            }
        }
    }
}
