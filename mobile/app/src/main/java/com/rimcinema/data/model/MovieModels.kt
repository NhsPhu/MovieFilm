package com.rimcinema.data.model

data class MovieDTO(
    val id: Long,
    val title: String?,
    val description: String?,
    val posterUrl: String?,
    val backdropUrl: String?,
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

data class WatchHistoryDTO(
    val id: Long?,
    val movieId: Long,
    val movieTitle: String?,
    val posterUrl: String?,
    val currentTimeSec: Long?,
    val isFinished: Boolean?,
    val lastWatchedAt: String?,
    val deviceType: String?
)

data class WatchlistItemDTO(
    val id: Long,
    val title: String?,
    val posterUrl: String?,
    val backdropUrl: String?,
    val releaseYear: Int?,
    val avgRating: Double?,
    val genres: List<String>?
)

data class UpdateProgressRequest(
    val movieId: Long,
    val currentTime: Long,
    val device: String = "ANDROID"
)
