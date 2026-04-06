import api from './api';

export const ratingService = {
    rateMovie: async (movieId, score, review) => {
        const response = await api.post(`/movies/${movieId}/rate`, { score, review });
        return response.data;
    },

    getMovieRatings: async (movieId) => {
        try {
            const response = await api.get(`/movies/${movieId}/ratings`);
            return response.data;
        } catch (error) {
            console.error("Error fetching ratings:", error);
            return [];
        }
    }
};
