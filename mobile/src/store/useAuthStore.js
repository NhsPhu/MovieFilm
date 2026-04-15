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
      const profile = await authService.getCurrentUser();
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
        const profile = await authService.getCurrentUser();
        set({ user: profile, token });
      } catch {
        await SecureStore.deleteItemAsync('auth_token');
        set({ user: null, token: null });
      }
    }
  },

  updateProfile: async (fullName, phoneNumber) => {
    await authService.updateProfile(fullName, phoneNumber);
    const updatedUser = await authService.getCurrentUser();
    set({ user: updatedUser });
  },

  uploadAvatar: async (imageUri) => {
    try {
      const formData = new FormData();
      // Infer the type of the image
      let filename = imageUri.split('/').pop();
      let match = /\.(\w+)$/.exec(filename);
      let type = match ? `image/${match[1]}` : `image`;

      formData.append('file', {
        uri: imageUri,
        name: filename,
        type,
      });

      await authService.uploadAvatar(formData);
      const updatedUser = await authService.getCurrentUser();
      set({ user: updatedUser });
    } catch (err) {
      console.error("Lỗi uploadAvatar:", err);
      throw err;
    }
  },
}));

export default useAuthStore;
