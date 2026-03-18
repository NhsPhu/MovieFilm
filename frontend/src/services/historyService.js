import api from './api'

export const historyService = {
    updateWatchHistory: async (movieId, currentTime, device = 'WEB') => {
        const response = await api.post('/history', {
            movieId,
            currentTime,
            device
        })
        return response.data
    },

    getWatchHistory: async () => {
        const response = await api.get('/history')
        return response.data
    },

    getMovieProgress: async (movieId) => {
        const response = await api.get(`/history/movie/${movieId}`)
        return response.data
    }
}
