package com.rimcinema.data.model

data class MovieDTO(
    val id: Long,
    val title: String?,
    val description: String?,
    val posterUrl: String?,
    val releaseYear: Int?,
    val durationSec: Int?,
    val viewsCount: Long?,
    val avgRating: Double?,
    val status: String?,
    val genres: List<String>?,
    val createdAt: String?
)

data class PageResponse<T>(
    val content: List<T>,
    val totalElements: Long,
    val totalPages: Int,
    val number: Int,
    val size: Int
)
