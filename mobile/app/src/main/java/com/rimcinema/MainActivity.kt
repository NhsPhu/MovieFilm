package com.rimcinema

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import com.rimcinema.data.api.ApiClient
import com.rimcinema.ui.navigation.AppNavigation
import com.rimcinema.ui.theme.RimCinemaTheme
import com.rimcinema.util.SessionManager
import com.rimcinema.viewmodel.AuthViewModel

class MainActivity : ComponentActivity() {
    private val authViewModel: AuthViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        val sessionManager = SessionManager(this)
        ApiClient.init(sessionManager)
        authViewModel.init(sessionManager)

        setContent {
            RimCinemaTheme {
                AppNavigation(
                    sessionManager = sessionManager,
                    authViewModel = authViewModel
                )
            }
        }
    }
}
