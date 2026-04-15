import api from './api';

export const historyService = {
  // Match web API exactly
  updateWatchHistory: (movieId, currentTime, device = 'MOBILE') =>
    api.post('/history', { movieId, currentTime, device }).then(r => r.data),

  getWatchHistory: () => api.get('/history').then(r => r.data),

  getMovieProgress: (movieId) => api.get(`/history/movie/${movieId}`).then(r => r.data),

  clearHistory: () => api.delete('/history').then(r => r.data),

  // Aliases for backwards compat
  getHistory: () => api.get('/history').then(r => r.data),
  updateProgress: (movieId, currentTime) =>
    api.post('/history', { movieId, currentTime, device: 'MOBILE' }).then(r => r.data),
};
