package com.rimcinema.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.rimcinema.util.SessionManager

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PersonalInfoScreen(
    sessionManager: SessionManager,
    onBack: () -> Unit
) {
    var fullName by remember { mutableStateOf(sessionManager.getUserName() ?: "") }
    val email = sessionManager.getUserEmail() ?: ""

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Thông Tin Cá Nhân", fontWeight = FontWeight.ExtraBold, color = Color.White) },
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
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Info card
            Surface(shape = RoundedCornerShape(16.dp), color = Color(0xFF111111), modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {

                    // Full name field
                    Column {
                        Text("HỌ VÀ TÊN", fontSize = 10.sp, fontWeight = FontWeight.ExtraBold, color = Color(0xFF888888), letterSpacing = 1.5.sp)
                        Spacer(Modifier.height(8.dp))
                        OutlinedTextField(
                            value = fullName,
                            onValueChange = { fullName = it },
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(10.dp),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = Color(0xFFE50914),
                                unfocusedBorderColor = Color(0xFF2A2A2A),
                                focusedContainerColor = Color(0xFF0A0A0A),
                                unfocusedContainerColor = Color(0xFF0A0A0A),
                                focusedTextColor = Color.White,
                                unfocusedTextColor = Color(0xFFCCCCCC)
                            )
                        )
                    }

                    // Email field (read only)
                    Column {
                        Text("EMAIL", fontSize = 10.sp, fontWeight = FontWeight.ExtraBold, color = Color(0xFF888888), letterSpacing = 1.5.sp)
                        Spacer(Modifier.height(8.dp))
                        OutlinedTextField(
                            value = email,
                            onValueChange = {},
                            modifier = Modifier.fillMaxWidth(),
                            readOnly = true,
                            shape = RoundedCornerShape(10.dp),
                            trailingIcon = {
                                Icon(Icons.Default.Lock, null, tint = Color(0xFF444444), modifier = Modifier.size(18.dp))
                            },
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = Color(0xFF2A2A2A),
                                unfocusedBorderColor = Color(0xFF2A2A2A),
                                focusedContainerColor = Color(0xFF0A0A0A),
                                unfocusedContainerColor = Color(0xFF0A0A0A),
                                focusedTextColor = Color(0xFF777777),
                                unfocusedTextColor = Color(0xFF777777)
                            )
                        )
                        Text("Email không thể thay đổi", fontSize = 11.sp, color = Color(0xFF555555), modifier = Modifier.padding(top = 4.dp))
                    }
                }
            }

            // Save button
            Button(
                onClick = { /* TODO: API call to update profile */ onBack() },
                modifier = Modifier.fillMaxWidth().height(52.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFE50914))
            ) {
                Text("Lưu Thay Đổi", fontWeight = FontWeight.ExtraBold, fontSize = 15.sp)
            }

            // Change password card
            Surface(shape = RoundedCornerShape(16.dp), color = Color(0xFF111111), modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier.size(36.dp).background(Color(0x1A22C55E), RoundedCornerShape(8.dp)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.Lock, null, tint = Color(0xFF22C55E), modifier = Modifier.size(18.dp))
                        }
                        Spacer(Modifier.width(12.dp))
                        Text("Đổi Mật Khẩu", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = Color.White)
                    }
                    Spacer(Modifier.height(12.dp))
                    Text("Đảm bảo an toàn tài khoản bằng cách sử dụng mật khẩu mạnh.", fontSize = 12.sp, color = Color(0xFF666666), lineHeight = 18.sp)
                    Spacer(Modifier.height(14.dp))
                    OutlinedButton(
                        onClick = { /* TODO */ },
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFF22C55E)),
                        border = ButtonDefaults.outlinedButtonBorder
                    ) {
                        Icon(Icons.Default.Key, null, modifier = Modifier.size(16.dp))
                        Spacer(Modifier.width(6.dp))
                        Text("Đổi Mật Khẩu", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}


// ─── Settings Screen ──────────────────────────────────────────────────────────
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(onBack: () -> Unit) {
    var autoPlay by remember { mutableStateOf(true) }
    var preview by remember { mutableStateOf(true) }
    var notifications by remember { mutableStateOf(true) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Cài Đặt", fontWeight = FontWeight.ExtraBold, color = Color.White) },
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
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            SettingSection(title = "Phát Lại") {
                SettingSwitch("Tự động phát tập tiếp", "Tự chuyển sang tập kế tiếp", autoPlay) { autoPlay = it }
                HorizontalDivider(color = Color(0xFF1A1A1A))
                SettingSwitch("Xem trước khi chọn", "Hiển thị trailer khi hover", preview) { preview = it }
                HorizontalDivider(color = Color(0xFF1A1A1A))
                SettingRow("Chất lượng mặc định", "1080p HD")
                HorizontalDivider(color = Color(0xFF1A1A1A))
                SettingRow("Chế độ tải xuống", "Chỉ Wi-Fi")
            }

            SettingSection(title = "Thông Báo") {
                SettingSwitch("Thông báo đề xuất", "Gợi ý phim mới", notifications) { notifications = it }
                HorizontalDivider(color = Color(0xFF1A1A1A))
                SettingRow("Ngôn ngữ ứng dụng", "Tiếng Việt")
            }

            SettingSection(title = "Về Ứng Dụng") {
                SettingRow("Phiên bản", "1.0.0")
                HorizontalDivider(color = Color(0xFF1A1A1A))
                SettingRow("Chính sách bảo mật", "")
                HorizontalDivider(color = Color(0xFF1A1A1A))
                SettingRow("Điều khoản dịch vụ", "")
            }
        }
    }
}

@Composable
fun SettingSection(title: String, content: @Composable ColumnScope.() -> Unit) {
    Column {
        Text(title.uppercase(), fontSize = 10.sp, fontWeight = FontWeight.ExtraBold, color = Color(0xFF888888), letterSpacing = 1.5.sp, modifier = Modifier.padding(bottom = 8.dp, start = 4.dp))
        Surface(shape = RoundedCornerShape(16.dp), color = Color(0xFF111111), modifier = Modifier.fillMaxWidth()) {
            Column(modifier = Modifier.padding(4.dp)) { content() }
        }
    }
}

@Composable
fun SettingSwitch(label: String, desc: String, value: Boolean, onToggle: (Boolean) -> Unit) {
    Row(
        modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(Modifier.weight(1f)) {
            Text(label, fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFFDDDDDD))
            if (desc.isNotEmpty()) Text(desc, fontSize = 11.sp, color = Color(0xFF666666))
        }
        Switch(value, onCheckedChange = onToggle, colors = SwitchDefaults.colors(checkedThumbColor = Color.White, checkedTrackColor = Color(0xFFE50914)))
    }
}

@Composable
fun SettingRow(label: String, value: String) {
    Row(
        modifier = Modifier.padding(horizontal = 16.dp, vertical = 14.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(label, fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFFDDDDDD), modifier = Modifier.weight(1f))
        Text(value, fontSize = 13.sp, color = Color(0xFF888888))
        Spacer(Modifier.width(8.dp))
        Icon(Icons.Default.ChevronRight, null, tint = Color(0xFF444444), modifier = Modifier.size(18.dp))
    }
}


// ─── Help Screen ──────────────────────────────────────────────────────────────
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HelpScreen(onBack: () -> Unit) {
    val faqs = listOf(
        "Làm sao để nâng cấp VIP?" to "Vào trang Cá Nhân → Nâng Cấp VIP và chọn gói phù hợp.",
        "Phim không phát được?" to "Hãy kiểm tra kết nối mạng. Phim demo cần file HLS được upload.",
        "Xem phim offline như thế nào?" to "Tính năng tải phim offline dành riêng cho thành viên VIP.",
        "Quên mật khẩu?" to "Liên hệ email hỗ trợ hoặc dùng chức năng đặt lại mật khẩu.",
        "Có bao nhiêu thiết bị đăng nhập?" to "Tài khoản thường: 1 thiết bị. Tài khoản VIP: 3 thiết bị."
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Trợ Giúp & Hỗ Trợ", fontWeight = FontWeight.ExtraBold, color = Color.White) },
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
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Text("Câu Hỏi Thường Gặp", fontSize = 10.sp, fontWeight = FontWeight.ExtraBold, color = Color(0xFF888888), letterSpacing = 1.5.sp)

            faqs.forEach { (q, a) ->
                var expanded by remember { mutableStateOf(false) }
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = Color(0xFF111111),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(q, fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = Color.White, modifier = Modifier.weight(1f))
                            IconButton(onClick = { expanded = !expanded }, modifier = Modifier.size(24.dp)) {
                                Icon(
                                    if (expanded) Icons.Default.ExpandLess else Icons.Default.ExpandMore,
                                    null, tint = Color(0xFF888888)
                                )
                            }
                        }
                        if (expanded) {
                            HorizontalDivider(color = Color(0xFF1A1A1A))
                            Text(a, fontSize = 13.sp, color = Color(0xFFAAAAAA), lineHeight = 20.sp, modifier = Modifier.padding(16.dp))
                        }
                    }
                }
            }

            Spacer(Modifier.height(8.dp))

            // Contact card
            Surface(shape = RoundedCornerShape(16.dp), color = Color(0xFF111111), modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Text("LIÊN HỆ HỖ TRỢ", fontSize = 10.sp, fontWeight = FontWeight.ExtraBold, color = Color(0xFF888888), letterSpacing = 1.5.sp)
                    Spacer(Modifier.height(12.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Email, null, tint = Color(0xFFE50914), modifier = Modifier.size(20.dp))
                        Spacer(Modifier.width(10.dp))
                        Text("support@rimcinema.app", fontSize = 14.sp, color = Color(0xFFCCCCCC))
                    }
                    Spacer(Modifier.height(10.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.AccessTime, null, tint = Color(0xFF888888), modifier = Modifier.size(20.dp))
                        Spacer(Modifier.width(10.dp))
                        Text("Hỗ trợ 8:00 – 22:00 hàng ngày", fontSize = 13.sp, color = Color(0xFF888888))
                    }
                }
            }
        }
    }
}
