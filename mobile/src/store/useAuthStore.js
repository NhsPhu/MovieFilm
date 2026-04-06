import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { authService } from '../services/movieService';

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: false,

  login: async (identifier, password) => {
    set({ isLoading: true });
    try {
      const data = await authService.login(identifier, password);
      const token = data.token || data.accessToken;
      await SecureStore.setItemAsync('auth_token', token);
      const profile = await authService.getProfile();
      set({ user: profile, token, isLoading: false });
      return true;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('auth_token');
    set({ user: null, token: null });
  },

  loadUser: async () => {
    const token = await SecureStore.getItemAsync('auth_token');
    if (token) {
      try {
        const profile = await authService.getProfile();
        set({ user: profile, token });
      } catch {
        await SecureStore.deleteItemAsync('auth_token');
      }
    }
  },
}));

export default useAuthStore;
