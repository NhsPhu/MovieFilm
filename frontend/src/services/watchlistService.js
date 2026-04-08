import api from './api'

export const watchlistService = {
    getWatchlist: async () => {
        const response = await api.get('/watchlist')
        return response.data
    },

    addToWatchlist: async (movieId) => {
        const response = await api.post(`/watchlist/${movieId}`)
        return response.data
    },

    removeFromWatchlist: async (movieId) => {
        const response = await api.delete(`/watchlist/${movieId}`)
        return response.data
    },

    checkInWatchlist: async (movieId) => {
        const response = await api.get(`/watchlist/check/${movieId}`)
        return response.data
    }
}
