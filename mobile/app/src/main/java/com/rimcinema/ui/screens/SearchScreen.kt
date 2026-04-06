package com.rimcinema.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Search
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
import com.rimcinema.data.model.MovieDTO
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SearchScreen(onMovieClick: (Long) -> Unit) {
    var query by remember { mutableStateOf("") }
    var results by remember { mutableStateOf<List<MovieDTO>>(emptyList()) }
    var searched by remember { mutableStateOf(false) }
    var loading by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()

    fun doSearch() {
        if (query.isBlank()) return
        scope.launch {
            loading = true
            searched = true
            try {
                val res = ApiClient.movieApi.searchMovies(query)
                results = if (res.isSuccessful) res.body()?.content ?: emptyList() else emptyList()
            } catch (_: Exception) { results = emptyList() }
            loading = false
        }
    }

    Column(
        modifier = Modifier.fillMaxSize().background(Color(0xFF0A0A0A)).padding(top = 48.dp)
    ) {
        // Search bar
        OutlinedTextField(
            value = query,
            onValueChange = { query = it },
            placeholder = { Text("Tìm kiếm phim, diễn viên...", color = Color(0xFF555555)) },
            modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
            shape = RoundedCornerShape(12.dp),
            leadingIcon = { Icon(Icons.Default.Search, null, tint = Color(0xFF666666)) },
            trailingIcon = {
                if (query.isNotEmpty()) IconButton(onClick = { query = ""; results = emptyList(); searched = false }) {
                    Icon(Icons.Default.Close, null, tint = Color(0xFF666666))
                }
            },
            colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Color(0xFFE50914), unfocusedBorderColor = Color(0xFF2A2A2A), focusedContainerColor = Color(0xFF1A1A1A), unfocusedContainerColor = Color(0xFF1A1A1A)),
            singleLine = true,
            keyboardOptions = androidx.compose.foundation.text.KeyboardOptions(imeAction = androidx.compose.ui.text.input.ImeAction.Search),
            keyboardActions = androidx.compose.foundation.text.KeyboardActions(onSearch = { doSearch() })
        )

        Spacer(Modifier.height(8.dp))

        when {
            loading -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { CircularProgressIndicator(color = Color(0xFFE50914)) }
            searched && results.isEmpty() -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("🎬", fontSize = 48.sp)
                    Text("Không tìm thấy kết quả", color = Color(0xFF555555), fontSize = 14.sp)
                }
            }
            else -> LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                items(results) { movie ->
                    Row(modifier = Modifier.fillMaxWidth().clickable { onMovieClick(movie.id) }, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        AsyncImage(
                            model = movie.posterUrl,
                            contentDescription = movie.title,
                            modifier = Modifier.width(70.dp).height(100.dp).clip(RoundedCornerShape(8.dp)).background(Color(0xFF1A1A1A)),
                            contentScale = ContentScale.Crop
                        )
                        Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Text(movie.title ?: "", fontWeight = FontWeight.Bold, fontSize = 15.sp, color = Color.White, maxLines = 2, overflow = TextOverflow.Ellipsis)
                            Text("${movie.releaseYear ?: ""}${movie.durationSec?.let { "  •  ${it/60}h ${it%60}m" } ?: ""}", fontSize = 12.sp, color = Color(0xFF888888))
                            movie.genres?.let { Text(it.joinToString(" • "), fontSize = 11.sp, color = Color(0xFFE50914), fontWeight = FontWeight.SemiBold, maxLines = 1) }
                            if ((movie.avgRating ?: 0.0) > 0) Text("⭐ ${"%.1f".format(movie.avgRating)}", fontSize = 12.sp, color = Color(0xFFF5A623), fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}
