package com.rimcinema.data.model

data class LoginRequest(
    val account: String,
    val password: String
)

data class AuthResponse(
    val token: String,
    val type: String = "Bearer",
    val email: String?,
    val fullName: String?,
    val role: String?
)

data class UserDTO(
    val id: Long?,
    val username: String?,
    val email: String?,
    val phoneNumber: String?,
    val fullName: String?,
    val role: String?
)
