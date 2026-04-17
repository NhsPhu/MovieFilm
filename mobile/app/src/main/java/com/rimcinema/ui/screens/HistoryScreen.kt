package com.rimcinema.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.rimcinema.data.api.ApiClient
import com.rimcinema.data.model.WatchHistoryDTO
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HistoryScreen(
    onBack: () -> Unit,
    onWatchMovie: (Long) -> Unit
) {
    val scope = rememberCoroutineScope()
    var historyList by remember { mutableStateOf<List<WatchHistoryDTO>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }

    fun loadHistory() {
        scope.launch {
            isLoading = true
            error = null
            try {
                val resp = ApiClient.movieApi.getWatchHistory()
                historyList = resp.body() ?: emptyList()
            } catch (e: Exception) {
                error = "Không thể tải lịch sử xem"
            } finally {
                isLoading = false
            }
        }
    }

    LaunchedEffect(Unit) { loadHistory() }

    fun clearAll() {
        scope.launch {
            try {
                ApiClient.movieApi.clearHistory()
                historyList = emptyList()
            } catch (_: Exception) {}
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("Lịch Sử Xem", fontWeight = FontWeight.ExtraBold, color = Color.White)
                        Text("${historyList.size} phim đã xem", fontSize = 11.sp, color = Color(0xFF888888))
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back", tint = Color.White)
                    }
                },
                actions = {
                    if (historyList.isNotEmpty()) {
                        TextButton(onClick = { clearAll() }) {
                            Text("Xóa tất cả", color = Color(0xFFE50914), fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color(0xFF0A0A0A))
            )
        },
        containerColor = Color(0xFF0A0A0A)
    ) { padding ->
        when {
            isLoading -> {
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = Color(0xFFE50914))
                }
            }
            error != null -> {
                Box(Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(Icons.Default.ErrorOutline, null, tint = Color(0xFF555555), modifier = Modifier.size(56.dp))
                        Spacer(Modifier.height(12.dp))
                        Text(error!!, color = Color(0xFF666666), fontSize = 14.sp)
                        Spacer(Modifier.height(16.dp))
                        OutlinedButton(onClick = { loadHistory() }) {
                            Text("Thử lại", color = Color(0xFFE50914))
                        }
                    }
                }
            }
            historyList.isEmpty() -> {
                Box(Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(Icons.Default.History, null, tint = Color(0xFF333333), modifier = Modifier.size(64.dp))
                        Spacer(Modifier.height(14.dp))
                        Text("Chưa xem phim nào", fontSize = 17.sp, fontWeight = FontWeight.Bold, color = Color(0xFF555555))
                        Spacer(Modifier.height(6.dp))
                        Text("Phim đã xem sẽ xuất hiện ở đây", fontSize = 13.sp, color = Color(0xFF444444))
                    }
                }
            }
            else -> {
                LazyColumn(
                    contentPadding = PaddingValues(
                        start = 16.dp, end = 16.dp,
                        top = padding.calculateTopPadding() + 8.dp,
                        bottom = 24.dp
                    ),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    items(historyList) { item ->
                        HistoryCard(item = item, onWatch = { onWatchMovie(item.movieId) })
                    }
                }
            }
        }
    }
}

@Composable
fun HistoryCard(item: WatchHistoryDTO, onWatch: () -> Unit) {
    val progress = run {
        val secs = item.currentTimeSec ?: 0L
        if (item.isFinished == true) 1f
        else minOf((secs / (120f * 60f)) + 0.05f, 0.95f)
    }
    val pctLabel = if (item.isFinished == true) "Hoàn thành" else "${(progress * 100).toInt()}%"
    val dateStr = item.lastWatchedAt?.take(10) ?: "Gần đây"

    Surface(
        shape = RoundedCornerShape(12.dp),
        color = Color(0xFF111111),
        modifier = Modifier.fillMaxWidth().clickable(onClick = onWatch)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            // Poster
            AsyncImage(
                model = item.posterUrl,
                contentDescription = item.movieTitle,
                modifier = Modifier
                    .width(100.dp)
                    .height(65.dp)
                    .clip(RoundedCornerShape(topStart = 12.dp, bottomStart = 12.dp))
                    .background(Color(0xFF1A1A1A)),
                contentScale = ContentScale.Crop
            )

            // Info
            Column(
                modifier = Modifier
                    .weight(1f)
                    .padding(horizontal = 12.dp, vertical = 10.dp)
            ) {
                Text(
                    item.movieTitle ?: "Không rõ",
                    fontSize = 13.sp, fontWeight = FontWeight.Bold,
                    color = Color.White, maxLines = 1
                )
                Spacer(Modifier.height(3.dp))
                Text(
                    "$dateStr  •  $pctLabel",
                    fontSize = 11.sp, color = Color(0xFF666666)
                )
                Spacer(Modifier.height(6.dp))
                // Progress bar
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(3.dp)
                        .clip(RoundedCornerShape(2.dp))
                        .background(Color(0xFF2A2A2A))
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth(progress)
                            .fillMaxHeight()
                            .background(Color(0xFFE50914))
                    )
                }
            }

            // Play icon
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.padding(end = 12.dp)
            ) {
                Icon(
                    if (item.isFinished == true) Icons.Default.Replay else Icons.Default.PlayCircle,
                    null,
                    tint = Color(0xFFE50914),
                    modifier = Modifier.size(30.dp)
                )
                Spacer(Modifier.height(2.dp))
                Text(
                    if (item.isFinished == true) "Lại" else "Tiếp",
                    fontSize = 9.sp, fontWeight = FontWeight.ExtraBold,
                    color = Color(0xFFE50914)
                )
            }
        }
    }
}
