import api from './api';

export const movieService = {
  getMovies: (page = 0, size = 20, readyOnly = true) =>
    api.get('/movies', { params: { page, size, readyOnly } }).then(r => r.data),

  getMovie: (id) => api.get(`/movies/${id}`).then(r => r.data),

  searchMovies: (query, page = 0, size = 20) =>
    api.get('/movies/search', { params: { q: query, page, size } }).then(r => r.data),

  getTrending: () => api.get('/movies/trending').then(r => r.data),

  getPopularMovies: (limit = 10) =>
    api.get('/movies/popular', { params: { limit } }).then(r => r.data),

  getGenres: () => api.get('/genres').then(r => r.data),

  getMoviesByGenre: (genreId, limit = 20) =>
    api.get(`/movies/genre/${genreId}`, { params: { limit } }).then(r => r.data),

  filterMovies: (params) =>
    api.get('/movies/filter', { params }).then(r => r.data),

  getStreamUrl: (id) => `${api.defaults.baseURL}/movies/${id}/stream`,
};

export const authService = {
  login: (identifier, password) =>
    api.post('/auth/login', { account: identifier, password }).then(r => r.data),
  register: (data) => api.post('/auth/register', data).then(r => r.data),
  getCurrentUser: () => api.get('/auth/me').then(r => r.data),
  updateProfile: (fullName, phoneNumber) =>
    api.put('/users/profile/info', { fullName, phoneNumber }).then(r => r.data),
  uploadAvatar: (formData) =>
    api.post('/users/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data),
};

export const ratingService = {
  getMovieRatings: (movieId) => api.get(`/movies/${movieId}/ratings`).then(r => r.data),
  rateMovie: (movieId, score, review) =>
    api.post(`/movies/${movieId}/rate`, { score, review }).then(r => r.data),
};
