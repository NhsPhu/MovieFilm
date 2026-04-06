package com.rimcinema.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ExitToApp
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
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
    onLogout: () -> Unit
) {
    if (!sessionManager.isLoggedIn()) {
        // Not logged in
        Box(Modifier.fillMaxSize().background(Color(0xFF0A0A0A)), contentAlignment = Alignment.Center) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Icon(Icons.Default.Person, null, tint = Color(0xFF333333), modifier = Modifier.size(80.dp))
                Spacer(Modifier.height(16.dp))
                Text("Đăng nhập để trải nghiệm đầy đủ", color = Color(0xFF666666), fontSize = 15.sp)
            }
        }
        return
    }

    val avatar = sessionManager.getUserName()?.firstOrNull()?.uppercase() ?: "U"

    Column(
        modifier = Modifier.fillMaxSize().background(Color(0xFF0A0A0A)).verticalScroll(rememberScrollState())
    ) {
        // Header
        Column(
            modifier = Modifier.fillMaxWidth().padding(top = 60.dp, bottom = 32.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Box(
                modifier = Modifier.size(80.dp).clip(CircleShape).background(Color(0xFFE50914)),
                contentAlignment = Alignment.Center
            ) {
                Text(avatar, fontSize = 32.sp, fontWeight = FontWeight.Black, color = Color.White)
            }
            Spacer(Modifier.height(12.dp))
            Text(sessionManager.getUserName() ?: "User", fontSize = 22.sp, fontWeight = FontWeight.ExtraBold, color = Color.White)
            Text(sessionManager.getUserEmail() ?: "", fontSize = 13.sp, color = Color(0xFF888888))
            if (sessionManager.getUserRole() == "ADMIN") {
                Spacer(Modifier.height(8.dp))
                Surface(shape = RoundedCornerShape(20.dp), color = Color(0xFFE50914)) {
                    Text("ADMIN", fontSize = 10.sp, fontWeight = FontWeight.Black, color = Color.White, letterSpacing = 1.5.sp, modifier = Modifier.padding(horizontal = 12.dp, vertical = 3.dp))
                }
            }
        }

        Divider(color = Color(0xFF1A1A1A))

        // Menu items
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(2.dp)) {
            ProfileMenuItem(Icons.Default.Person, "Thông Tin Cá Nhân")
            ProfileMenuItem(Icons.Default.Favorite, "Phim Yêu Thích")
            ProfileMenuItem(Icons.Default.History, "Lịch Sử Xem")
            ProfileMenuItem(Icons.Default.Settings, "Cài Đặt")
            ProfileMenuItem(Icons.Default.Info, "Trợ Giúp")
        }

        Spacer(Modifier.height(20.dp))

        // Logout
        OutlinedButton(
            onClick = { authViewModel.logout(); onLogout() },
            modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp).height(52.dp),
            shape = RoundedCornerShape(12.dp),
            colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFFE50914)),
            border = ButtonDefaults.outlinedButtonBorder.copy(brush = androidx.compose.ui.graphics.SolidColor(Color(0xFF2A1010)))
        ) {
            Icon(Icons.AutoMirrored.Filled.ExitToApp, null, Modifier.size(20.dp))
            Spacer(Modifier.width(10.dp))
            Text("Đăng Xuất", fontWeight = FontWeight.ExtraBold, fontSize = 15.sp)
        }

        Spacer(Modifier.height(30.dp))
    }
}

@Composable
fun ProfileMenuItem(icon: ImageVector, label: String) {
    Surface(
        shape = RoundedCornerShape(10.dp),
        color = Color(0xFF111111),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            Icon(icon, null, tint = Color(0xFFAAAAAA), modifier = Modifier.size(22.dp))
            Text(label, fontSize = 15.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFFDDDDDD), modifier = Modifier.weight(1f))
            Icon(Icons.Default.ChevronRight, null, tint = Color(0xFF444444), modifier = Modifier.size(18.dp))
        }
    }
}
