import api from './api'

export const movieService = {
    getMovies: async (page = 0, size = 20, readyOnly = true) => {
        const response = await api.get('/movies', { params: { page, size, readyOnly } })
        return response.data
    },

    getMovieById: async (id) => {
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

    getMoviesByGenre: async (genreId, limit = 10) => {
        const response = await api.get(`/movies/genre/${genreId}`, { params: { limit } })
        return response.data
    },

    getGenres: async () => {
        const response = await api.get('/genres')
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
