package com.rimcinema.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.rimcinema.data.api.ApiClient
import com.rimcinema.data.model.MovieDTO
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class HomeViewModel : ViewModel() {
    private val _movies = MutableStateFlow<List<MovieDTO>>(emptyList())
    val movies = _movies.asStateFlow()

    private val _popular = MutableStateFlow<List<MovieDTO>>(emptyList())
    val popular = _popular.asStateFlow()

    private val _isLoading = MutableStateFlow(true)
    val isLoading = _isLoading.asStateFlow()

    init { loadData() }

    private fun loadData() {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val moviesRes = ApiClient.movieApi.getMovies(0, 30)
                if (moviesRes.isSuccessful) {
                    _movies.value = moviesRes.body()?.content ?: emptyList()
                }
                val popularRes = ApiClient.movieApi.getPopularMovies(10)
                if (popularRes.isSuccessful) {
                    _popular.value = popularRes.body() ?: emptyList()
                }
            } catch (e: Exception) { e.printStackTrace() }
            _isLoading.value = false
        }
    }
}
