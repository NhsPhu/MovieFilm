import api from './api';

export const movieService = {
  getMovies: (page = 0, size = 20) => api.get(`/movies?page=${page}&size=${size}`).then(r => r.data),
  getMovie: (id) => api.get(`/movies/${id}`).then(r => r.data),
  searchMovies: (query) => api.get(`/movies/search?q=${query}`).then(r => r.data),
  getTrending: () => api.get('/movies/trending').then(r => r.data),
  getStreamUrl: (id) => `${api.defaults.baseURL}/movies/${id}/stream`,
};

export const authService = {
  login: (identifier, password) =>
    api.post('/auth/login', { identifier, password }).then(r => r.data),
  register: (data) => api.post('/auth/register', data).then(r => r.data),
  getProfile: () => api.get('/users/profile').then(r => r.data),
};

export const ratingService = {
  getMovieRatings: (movieId) => api.get(`/movies/${movieId}/ratings`).then(r => r.data),
  rateMovie: (movieId, score, review) =>
    api.post(`/movies/${movieId}/rate`, { score, review }).then(r => r.data),
};
