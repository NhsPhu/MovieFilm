package com.rimcinema.data.api

import com.rimcinema.data.model.*
import retrofit2.Response
import retrofit2.http.*

interface MovieApi {
    @GET("movies")
    suspend fun getMovies(
        @Query("page") page: Int = 0,
        @Query("size") size: Int = 20
    ): Response<PageResponse<MovieDTO>>

    @GET("movies/{id}")
    suspend fun getMovie(@Path("id") id: Long): Response<MovieDTO>

    @GET("movies/popular")
    suspend fun getPopularMovies(
        @Query("limit") limit: Int = 10
    ): Response<List<MovieDTO>>

    @GET("movies/search")
    suspend fun searchMovies(
        @Query("q") query: String,
        @Query("page") page: Int = 0,
        @Query("size") size: Int = 20
    ): Response<PageResponse<MovieDTO>>

    @GET("movies/{movieId}/ratings")
    suspend fun getMovieRatings(@Path("movieId") movieId: Long): Response<List<RatingDTO>>

    @POST("movies/{movieId}/rate")
    suspend fun rateMovie(
        @Path("movieId") movieId: Long,
        @Body request: RatingRequest
    ): Response<RatingDTO>

    // ── Watch History ────────────────────────────────────────────────────────
    @GET("history")
    suspend fun getWatchHistory(): Response<List<WatchHistoryDTO>>

    @POST("history")
    suspend fun updateProgress(@Body request: UpdateProgressRequest): Response<WatchHistoryDTO>

    @DELETE("history")
    suspend fun clearHistory(): Response<Map<String, String>>

    // ── Watchlist ────────────────────────────────────────────────────────────
    @GET("watchlist")
    suspend fun getWatchlist(): Response<List<WatchlistItemDTO>>

    @POST("watchlist/{movieId}")
    suspend fun addToWatchlist(@Path("movieId") movieId: Long): Response<Map<String, Any>>

    @DELETE("watchlist/{movieId}")
    suspend fun removeFromWatchlist(@Path("movieId") movieId: Long): Response<Map<String, Any>>

    @GET("watchlist/check/{movieId}")
    suspend fun checkInWatchlist(@Path("movieId") movieId: Long): Response<Map<String, Boolean>>
}
