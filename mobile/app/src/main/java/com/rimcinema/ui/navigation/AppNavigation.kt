package com.rimcinema.ui.navigation

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.navigation.NavType
import androidx.navigation.compose.*
import androidx.navigation.navArgument
import com.rimcinema.ui.screens.*
import com.rimcinema.util.SessionManager
import com.rimcinema.viewmodel.AuthViewModel

@Composable
fun AppNavigation(
    sessionManager: SessionManager,
    authViewModel: AuthViewModel
) {
    val navController = rememberNavController()
    val isLoggedIn by authViewModel.isLoggedIn.collectAsState()
    val currentRoute = navController.currentBackStackEntryAsState().value?.destination?.route

    val bottomBarRoutes = listOf("home", "search", "profile")
    val showBottomBar = currentRoute in bottomBarRoutes

    // Xử lý chuyển hướng khi trạng thái đăng nhập thay đổi (tránh crash recomposition)
    LaunchedEffect(isLoggedIn) {
        val current = navController.currentDestination?.route
        if (isLoggedIn && current == "login") {
            navController.navigate("home") {
                popUpTo("login") { inclusive = true }
            }
        } else if (!isLoggedIn && current != "login") {
            navController.navigate("login") {
                popUpTo(0) { inclusive = true }
            }
        }
    }

    Scaffold(
        bottomBar = {
            if (showBottomBar) {
                NavigationBar(containerColor = MaterialTheme.colorScheme.surface) {
                    NavigationBarItem(
                        selected = currentRoute == "home",
                        onClick = { navController.navigate("home") { popUpTo("home") { inclusive = true } } },
                        icon = { Icon(Icons.Default.Home, "Trang Chủ") },
                        label = { Text("Trang Chủ", style = MaterialTheme.typography.labelSmall) }
                    )
                    NavigationBarItem(
                        selected = currentRoute == "search",
                        onClick = { navController.navigate("search") { popUpTo("home") } },
                        icon = { Icon(Icons.Default.Search, "Tìm Kiếm") },
                        label = { Text("Tìm Kiếm", style = MaterialTheme.typography.labelSmall) }
                    )
                    NavigationBarItem(
                        selected = currentRoute == "profile",
                        onClick = { navController.navigate("profile") { popUpTo("home") } },
                        icon = { Icon(Icons.Default.Person, "Cá Nhân") },
                        label = { Text("Cá Nhân", style = MaterialTheme.typography.labelSmall) }
                    )
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = "login",  // Luôn bắt đầu từ login, LaunchedEffect xử lý redirect
            modifier = Modifier.padding(innerPadding)
        ) {
            composable("login") {
                LoginScreen(authViewModel = authViewModel, onLoginSuccess = {
                    // Navigation đã được xử lý bởi LaunchedEffect
                })
            }
            composable("home") {
                HomeScreen(
                    onMovieClick = { movieId ->
                        navController.navigate("movie/$movieId")
                    }
                )
            }
            composable("search") {
                SearchScreen(
                    onMovieClick = { movieId ->
                        navController.navigate("movie/$movieId")
                    }
                )
            }
            composable("profile") {
                ProfileScreen(
                    sessionManager = sessionManager,
                    authViewModel = authViewModel,
                    onLogout = {
                        // Navigation đã được xử lý bởi LaunchedEffect
                    }
                )
            }
            composable(
                "movie/{id}",
                arguments = listOf(navArgument("id") { type = NavType.LongType })
            ) { backStack ->
                val movieId = backStack.arguments?.getLong("id") ?: return@composable
                MovieDetailScreen(
                    movieId = movieId,
                    onBack = { navController.popBackStack() },
                    onWatch = { navController.navigate("watch/$it") },
                    onRelatedClick = { navController.navigate("movie/$it") }
                )
            }
            composable(
                "watch/{id}",
                arguments = listOf(navArgument("id") { type = NavType.LongType })
            ) { backStack ->
                val movieId = backStack.arguments?.getLong("id") ?: return@composable
                WatchScreen(
                    movieId = movieId,
                    sessionManager = sessionManager,
                    onBack = { navController.popBackStack() }
                )
            }
        }
    }
}
