import api from './api'

export const movieService = {
    getMovies: async (page = 0, size = 20, readyOnly = true) => {
        const response = await api.get('/movies', { params: { page, size, readyOnly } })
        return response.data
    },

    getMovie: async (id) => {
        const response = await api.get(`/movies/${id}`)
        return response.data
    },

    getStreamUrl: (movieId) => {
        return `/api/stream/${movieId}/master.m3u8`
    },

    searchMovies: async (query, page = 0, size = 20) => {
        const response = await api.get('/movies/search', { params: { q: query, page, size } })
        return response.data
    },

    getPopularMovies: async (limit = 10) => {
        const response = await api.get('/movies/popular', { params: { limit } })
        return response.data
    },

    // AI-powered personalized recommendations (falls back to popular for guests)
    getRecommendations: async (limit = 10) => {
        const response = await api.get('/movies/recommended', { params: { limit } })
        return response.data
    },

    filterMovies: async (params) => {
        const response = await api.get('/movies/filter', { params })
        return response.data
    },

    getRelatedMovies: async (movieId, limit = 6) => {
        const response = await api.get(`/movies/${movieId}/related`, { params: { limit } })
        return response.data
    },

    getMoviesByGenre: async (genreId, limit = 10) => {
        const response = await api.get(`/movies/genre/${genreId}`, { params: { limit } })
        return response.data
    },

    getGenres: async () => {
        const response = await api.get('/genres')
        return response.data
    },

    createMovie: async (formData) => {
        const response = await api.post('/admin/movies', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
        return response.data
    },

    deleteMovie: async (id) => {
        const response = await api.delete(`/admin/movies/${id}`)
        return response.data
    },

    rateMovie: async (movieId, score, review) => {
        const response = await api.post(`/movies/${movieId}/rate`, { score, review })
        return response.data
    },

    getMovieRatings: async (movieId) => {
        const response = await api.get(`/movies/${movieId}/ratings`)
        return response.data
    }
}
