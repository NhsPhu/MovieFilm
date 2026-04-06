package com.rimcinema.ui.screens

import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.media3.common.MediaItem
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.PlayerView
import com.rimcinema.data.api.ApiClient
import com.rimcinema.util.SessionManager
import com.rimcinema.viewmodel.WatchViewModel

@androidx.annotation.OptIn(androidx.media3.common.util.UnstableApi::class)
@Composable
fun WatchScreen(
    movieId: Long,
    sessionManager: SessionManager,
    onBack: () -> Unit,
    watchViewModel: WatchViewModel = viewModel()
) {
    val movie by watchViewModel.movie.collectAsState()
    val ratings by watchViewModel.ratings.collectAsState()
    val isSubmitting by watchViewModel.isSubmitting.collectAsState()
    var myScore by remember { mutableIntStateOf(0) }
    var myReview by remember { mutableStateOf("") }

    val context = LocalContext.current
    val streamUrl = ApiClient.getStreamUrl(movieId)

    val exoPlayer = remember {
        ExoPlayer.Builder(context).build().apply {
            setMediaItem(MediaItem.fromUri(streamUrl))
            prepare()
        }
    }

    LaunchedEffect(movieId) { watchViewModel.loadData(movieId) }
    DisposableEffect(Unit) { onDispose { exoPlayer.release() } }

    val m = movie

    Column(
        modifier = Modifier.fillMaxSize().background(Color(0xFF0A0A0A)).verticalScroll(rememberScrollState())
    ) {
        // Video Player
        Box(modifier = Modifier.fillMaxWidth().aspectRatio(16f / 9f).background(Color.Black)) {
            AndroidView(
                factory = { ctx ->
                    PlayerView(ctx).apply {
                        player = exoPlayer
                        layoutParams = FrameLayout.LayoutParams(
                            ViewGroup.LayoutParams.MATCH_PARENT,
                            ViewGroup.LayoutParams.MATCH_PARENT
                        )
                    }
                },
                modifier = Modifier.fillMaxSize()
            )
            IconButton(onClick = onBack, modifier = Modifier.padding(8.dp).align(Alignment.TopStart)) {
                Surface(shape = CircleShape, color = Color(0x99000000), modifier = Modifier.size(36.dp)) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back", tint = Color.White, modifier = Modifier.padding(6.dp))
                }
            }
        }

        // Movie Info
        if (m != null) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("🎬 PHIM GỐC", fontSize = 10.sp, fontWeight = FontWeight.ExtraBold, color = Color(0xFFE50914), letterSpacing = 2.sp)
                Spacer(Modifier.height(4.dp))
                Text(m.title ?: "", fontSize = 22.sp, fontWeight = FontWeight.Black, color = Color.White)
                Text("${m.releaseYear ?: ""} • ${m.durationSec?.let { "${it/60}h ${it%60}m" } ?: ""}", fontSize = 12.sp, color = Color(0xFF888888))
                Spacer(Modifier.height(12.dp))
                Text(m.description ?: "", fontSize = 13.sp, color = Color(0xFFAAAAAA), lineHeight = 20.sp, maxLines = 4)
            }
        }

        Divider(color = Color(0xFF1A1A1A), modifier = Modifier.padding(horizontal = 16.dp))

        // Rating section
        Column(modifier = Modifier.padding(16.dp)) {
            Text("Bình Luận & Đánh Giá (${ratings.size})", fontSize = 17.sp, fontWeight = FontWeight.ExtraBold, color = Color.White)
            Spacer(Modifier.height(14.dp))

            if (sessionManager.isLoggedIn()) {
                // Rating form
                Surface(shape = RoundedCornerShape(12.dp), color = Color(0xFF111111), modifier = Modifier.fillMaxWidth()) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Text("CHỌN ĐIỂM", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color(0xFF888888), letterSpacing = 1.5.sp)
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            (1..5).forEach { s ->
                                IconButton(onClick = { myScore = s }) {
                                    Icon(
                                        if (myScore >= s) Icons.Default.Star else Icons.Default.StarOutline,
                                        null,
                                        tint = if (myScore >= s) Color(0xFFF5A623) else Color(0xFF444444),
                                        modifier = Modifier.size(32.dp)
                                    )
                                }
                            }
                        }
                        OutlinedTextField(
                            value = myReview,
                            onValueChange = { myReview = it },
                            modifier = Modifier.fillMaxWidth(),
                            placeholder = { Text("Viết cảm nghĩ...", color = Color(0xFF555555)) },
                            shape = RoundedCornerShape(10.dp),
                            minLines = 3,
                            colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Color(0xFFE50914), unfocusedBorderColor = Color(0xFF2A2A2A), focusedContainerColor = Color(0xFF0A0A0A), unfocusedContainerColor = Color(0xFF0A0A0A))
                        )
                        Button(
                            onClick = {
                                watchViewModel.submitRating(movieId, myScore, myReview) {
                                    myScore = 0; myReview = ""
                                }
                            },
                            enabled = !isSubmitting && myScore > 0,
                            shape = RoundedCornerShape(10.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFE50914)),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(if (isSubmitting) "Đang gửi..." else "Đăng Đánh Giá", fontWeight = FontWeight.ExtraBold)
                        }
                    }
                }
            } else {
                Surface(shape = RoundedCornerShape(12.dp), color = Color(0xFF111111), modifier = Modifier.fillMaxWidth()) {
                    Text("Đăng nhập để bình luận", color = Color(0xFFE50914), fontWeight = FontWeight.Bold, fontSize = 14.sp, modifier = Modifier.padding(20.dp))
                }
            }

            Spacer(Modifier.height(16.dp))

            // Ratings list
            ratings.forEach { r ->
                Surface(shape = RoundedCornerShape(12.dp), color = Color(0xFF111111), modifier = Modifier.fillMaxWidth().padding(bottom = 10.dp)) {
                    Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            Box(Modifier.size(36.dp).clip(CircleShape).background(Color(0xFF222222)), contentAlignment = Alignment.Center) {
                                Text(r.userFullName?.firstOrNull()?.uppercase() ?: "U", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                            }
                            Column(Modifier.weight(1f)) {
                                Text(r.userFullName ?: "Ẩn danh", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color.White)
                                Row(horizontalArrangement = Arrangement.spacedBy(2.dp)) {
                                    (1..5).forEach { s ->
                                        Icon(
                                            if ((r.score ?: 0) >= s) Icons.Default.Star else Icons.Default.StarOutline,
                                            null, tint = if ((r.score ?: 0) >= s) Color(0xFFF5A623) else Color(0xFF444444), modifier = Modifier.size(12.dp)
                                        )
                                    }
                                    Text("${r.score}.0", fontSize = 11.sp, color = Color(0xFFF5A623), fontWeight = FontWeight.Bold, modifier = Modifier.padding(start = 4.dp))
                                }
                            }
                            Text(r.createdAt?.take(10) ?: "", fontSize = 10.sp, color = Color(0xFF555555))
                        }
                        if (!r.review.isNullOrBlank()) {
                            Text(r.review, fontSize = 13.sp, color = Color(0xFFAAAAAA), lineHeight = 20.sp, modifier = Modifier.background(Color(0xFF0A0A0A), RoundedCornerShape(8.dp)).padding(10.dp))
                        }
                    }
                }
            }

            if (ratings.isEmpty()) {
                Box(Modifier.fillMaxWidth().padding(20.dp), contentAlignment = Alignment.Center) {
                    Text("Chưa có đánh giá. Hãy là người đầu tiên!", color = Color(0xFF555555), fontSize = 13.sp)
                }
            }
        }

        Spacer(Modifier.height(32.dp))
    }
}
