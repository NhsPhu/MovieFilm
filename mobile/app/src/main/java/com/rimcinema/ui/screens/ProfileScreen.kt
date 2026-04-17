package com.rimcinema.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ExitToApp
import androidx.compose.material.icons.automirrored.filled.List
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.rimcinema.util.SessionManager
import com.rimcinema.viewmodel.AuthViewModel

@Composable
fun ProfileScreen(
    sessionManager: SessionManager,
    authViewModel: AuthViewModel,
    onLogout: () -> Unit,
    onNavigateToHistory: () -> Unit = {},
    onNavigateToWatchlist: () -> Unit = {},
    onNavigateToPersonalInfo: () -> Unit = {},
    onNavigateToSettings: () -> Unit = {},
    onNavigateToHelp: () -> Unit = {}
) {
    if (!sessionManager.isLoggedIn()) {
        // Guest state
        Box(
            Modifier.fillMaxSize().background(Color(0xFF0A0A0A)),
            contentAlignment = Alignment.Center
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.padding(32.dp)
            ) {
                Box(
                    modifier = Modifier.size(80.dp).clip(CircleShape).background(Color(0xFF1A1A1A)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Default.Person, null, tint = Color(0xFF444444), modifier = Modifier.size(40.dp))
                }
                Spacer(Modifier.height(16.dp))
                Text("Chưa Đăng Nhập", fontSize = 20.sp, fontWeight = FontWeight.ExtraBold, color = Color.White)
                Spacer(Modifier.height(8.dp))
                Text(
                    "Đăng nhập để xem hồ sơ và lịch sử xem phim của bạn",
                    fontSize = 13.sp, color = Color(0xFF666666),
                    lineHeight = 20.sp
                )
            }
        }
        return
    }

    val userName = sessionManager.getUserName() ?: "Người Dùng"
    val userEmail = sessionManager.getUserEmail() ?: ""
    val isAdmin = sessionManager.getUserRole() == "ADMIN"
    val avatarLetter = userName.firstOrNull()?.uppercase() ?: "U"

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0A0A0A))
            .verticalScroll(rememberScrollState())
    ) {
        // ── Header ──────────────────────────────────────────────────────────
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 56.dp, bottom = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Avatar circle
            Box(
                modifier = Modifier
                    .size(88.dp)
                    .clip(CircleShape)
                    .background(Color(0xFFE50914)),
                contentAlignment = Alignment.Center
            ) {
                Text(avatarLetter, fontSize = 36.sp, fontWeight = FontWeight.Black, color = Color.White)
            }

            Spacer(Modifier.height(14.dp))
            Text(userName, fontSize = 22.sp, fontWeight = FontWeight.ExtraBold, color = Color.White)
            Spacer(Modifier.height(4.dp))

            // Role badge
            if (isAdmin) {
                Surface(shape = RoundedCornerShape(20.dp), color = Color(0xFFE50914)) {
                    Text(
                        "ADMIN", fontSize = 10.sp, fontWeight = FontWeight.Black,
                        color = Color.White, letterSpacing = 1.5.sp,
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 3.dp)
                    )
                }
                Spacer(Modifier.height(6.dp))
            }

            if (userEmail.isNotEmpty()) {
                Text(userEmail, fontSize = 13.sp, color = Color(0xFF888888))
            }
        }

        HorizontalDivider(color = Color(0xFF1A1A1A))
        Spacer(Modifier.height(8.dp))

        // ── Menu Items ───────────────────────────────────────────────────────
        Column(
            modifier = Modifier.padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            ProfileMenuItem(
                icon = Icons.Default.Person,
                label = "Thông Tin Cá Nhân",
                description = "Chỉnh sửa tên, số điện thoại",
                onClick = onNavigateToPersonalInfo
            )
            ProfileMenuItem(
                icon = Icons.Default.Favorite,
                label = "Phim Yêu Thích",
                description = "Danh sách phim đã lưu",
                tint = Color(0xFFE50914),
                onClick = onNavigateToWatchlist
            )
            ProfileMenuItem(
                icon = Icons.Default.History,
                label = "Lịch Sử Xem",
                description = "Phim đã xem gần đây",
                onClick = onNavigateToHistory
            )
            ProfileMenuItem(
                icon = Icons.Default.Settings,
                label = "Cài Đặt",
                description = "Thông báo, ngôn ngữ, chất lượng",
                onClick = onNavigateToSettings
            )
            ProfileMenuItem(
                icon = Icons.Default.Info,
                label = "Trợ Giúp & Hỗ Trợ",
                description = "Câu hỏi thường gặp, liên hệ",
                onClick = onNavigateToHelp
            )
        }

        Spacer(Modifier.height(20.dp))

        // ── Logout ───────────────────────────────────────────────────────────
        OutlinedButton(
            onClick = { authViewModel.logout(); onLogout() },
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp)
                .height(52.dp),
            shape = RoundedCornerShape(12.dp),
            colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFFE50914)),
            border = ButtonDefaults.outlinedButtonBorder
        ) {
            Icon(Icons.AutoMirrored.Filled.ExitToApp, null, Modifier.size(20.dp))
            Spacer(Modifier.width(10.dp))
            Text("Đăng Xuất Khỏi Tài Khoản", fontWeight = FontWeight.ExtraBold, fontSize = 15.sp)
        }

        Spacer(Modifier.height(40.dp))
    }
}

// ─── Menu Item Component ──────────────────────────────────────────────────────
@Composable
fun ProfileMenuItem(
    icon: ImageVector,
    label: String,
    description: String = "",
    tint: Color = Color(0xFFAAAAAA),
    onClick: () -> Unit
) {
    Surface(
        shape = RoundedCornerShape(12.dp),
        color = Color(0xFF111111),
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)  // ← FIX: now clickable
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Icon box
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(tint.copy(alpha = 0.1f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(icon, null, tint = tint, modifier = Modifier.size(20.dp))
            }

            Spacer(Modifier.width(14.dp))

            // Labels
            Column(modifier = Modifier.weight(1f)) {
                Text(label, fontSize = 15.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFFDDDDDD))
                if (description.isNotEmpty()) {
                    Spacer(Modifier.height(2.dp))
                    Text(description, fontSize = 11.sp, color = Color(0xFF666666))
                }
            }

            Icon(Icons.Default.ChevronRight, null, tint = Color(0xFF444444), modifier = Modifier.size(20.dp))
        }
    }
}
