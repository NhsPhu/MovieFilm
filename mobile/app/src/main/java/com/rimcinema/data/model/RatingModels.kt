package com.rimcinema.data.model

data class RatingDTO(
    val id: Long?,
    val userId: Long?,
    val userFullName: String?,
    val movieId: Long?,
    val score: Int?,
    val review: String?,
    val createdAt: String?
)

data class RatingRequest(
    val score: Int,
    val review: String?
)
