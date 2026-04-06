import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Change this to your machine's local IP when testing on a real device
// For Android emulator: http://10.0.2.2:8080/api
// For iOS simulator or Expo Go on same network: http://<YOUR_LOCAL_IP>:8080/api
const BASE_URL = 'http://10.0.2.2:8080/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
