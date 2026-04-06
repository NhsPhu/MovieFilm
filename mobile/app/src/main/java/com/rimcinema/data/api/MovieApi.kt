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
}
