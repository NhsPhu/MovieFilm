import api from './api';

export const watchlistService = {
  getWatchlist: () => api.get('/watchlist').then(r => r.data),
  addToWatchlist: (movieId) => api.post(`/watchlist/${movieId}`).then(r => r.data),
  removeFromWatchlist: (movieId) => api.delete(`/watchlist/${movieId}`).then(r => r.data),
  checkInWatchlist: (movieId) => api.get(`/watchlist/check/${movieId}`).then(r => r.data),
  // Alias
  checkStatus: (movieId) => api.get(`/watchlist/check/${movieId}`).then(r => r.data),
};
