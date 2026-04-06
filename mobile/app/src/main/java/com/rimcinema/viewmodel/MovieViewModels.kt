package com.rimcinema.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.rimcinema.data.api.ApiClient
import com.rimcinema.data.model.MovieDTO
import com.rimcinema.data.model.RatingDTO
import com.rimcinema.data.model.RatingRequest
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class MovieDetailViewModel : ViewModel() {
    private val _movie = MutableStateFlow<MovieDTO?>(null)
    val movie = _movie.asStateFlow()

    private val _related = MutableStateFlow<List<MovieDTO>>(emptyList())
    val related = _related.asStateFlow()

    private val _isLoading = MutableStateFlow(true)
    val isLoading = _isLoading.asStateFlow()

    fun loadMovie(movieId: Long) {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val res = ApiClient.movieApi.getMovie(movieId)
                if (res.isSuccessful) _movie.value = res.body()

                val all = ApiClient.movieApi.getMovies(0, 20)
                if (all.isSuccessful) {
                    _related.value = (all.body()?.content ?: emptyList())
                        .filter { it.id != movieId }.take(8)
                }
            } catch (e: Exception) { e.printStackTrace() }
            _isLoading.value = false
        }
    }
}

class WatchViewModel : ViewModel() {
    private val _movie = MutableStateFlow<MovieDTO?>(null)
    val movie = _movie.asStateFlow()

    private val _ratings = MutableStateFlow<List<RatingDTO>>(emptyList())
    val ratings = _ratings.asStateFlow()

    private val _isSubmitting = MutableStateFlow(false)
    val isSubmitting = _isSubmitting.asStateFlow()

    fun loadData(movieId: Long) {
        viewModelScope.launch {
            try {
                val mRes = ApiClient.movieApi.getMovie(movieId)
                if (mRes.isSuccessful) _movie.value = mRes.body()
                loadRatings(movieId)
            } catch (e: Exception) { e.printStackTrace() }
        }
    }

    fun loadRatings(movieId: Long) {
        viewModelScope.launch {
            try {
                val rRes = ApiClient.movieApi.getMovieRatings(movieId)
                if (rRes.isSuccessful) _ratings.value = rRes.body() ?: emptyList()
            } catch (_: Exception) {}
        }
    }

    fun submitRating(movieId: Long, score: Int, review: String, onDone: () -> Unit) {
        viewModelScope.launch {
            _isSubmitting.value = true
            try {
                ApiClient.movieApi.rateMovie(movieId, RatingRequest(score, review))
                loadRatings(movieId)
                onDone()
            } catch (_: Exception) {}
            _isSubmitting.value = false
        }
    }
}
