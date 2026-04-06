package com.rimcinema.viewmodel

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.rimcinema.data.api.ApiClient
import com.rimcinema.data.model.LoginRequest
import com.rimcinema.util.SessionManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class AuthViewModel : ViewModel() {
    private val _isLoading = MutableStateFlow(false)
    val isLoading = _isLoading.asStateFlow()

    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage = _errorMessage.asStateFlow()

    private val _isLoggedIn = MutableStateFlow(false)
    val isLoggedIn = _isLoggedIn.asStateFlow()

    private var sessionManager: SessionManager? = null

    fun init(sessionManager: SessionManager) {
        this.sessionManager = sessionManager
        _isLoggedIn.value = sessionManager.isLoggedIn()
    }

    fun login(account: String, password: String) {
        viewModelScope.launch {
            _isLoading.value = true
            _errorMessage.value = null
            try {
                Log.d("AuthVM", "Đang login với account=$account...")
                val response = ApiClient.authApi.login(LoginRequest(account, password))
                Log.d("AuthVM", "Response code=${response.code()}")
                if (response.isSuccessful && response.body() != null) {
                    val auth = response.body()!!
                    Log.d("AuthVM", "Login OK: ${auth.fullName}, role=${auth.role}")
                    sessionManager?.saveAuthSession(
                        token = auth.token,
                        fullName = auth.fullName,
                        email = auth.email,
                        role = auth.role
                    )
                    _isLoggedIn.value = true
                } else {
                    val errorBody = response.errorBody()?.string()
                    Log.e("AuthVM", "Login failed: code=${response.code()}, body=$errorBody")
                    _errorMessage.value = "Sai email/SĐT hoặc mật khẩu"
                }
            } catch (e: Exception) {
                Log.e("AuthVM", "Login exception: ${e.javaClass.simpleName}: ${e.message}", e)
                _errorMessage.value = "Lỗi kết nối: ${e.message?.take(80)}"
            }
            _isLoading.value = false
        }
    }

    fun logout() {
        sessionManager?.clearSession()
        _isLoggedIn.value = false
    }
}
