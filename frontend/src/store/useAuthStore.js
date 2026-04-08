import { create } from 'zustand'
import { authService } from '../services/authService'

const useAuthStore = create((set, get) => ({
    token: localStorage.getItem('token') || null,
    user: null,
    isLoading: false,

    isAuthenticated: () => !!localStorage.getItem('token'),

    login: async (account, password) => {
        set({ isLoading: true })
        try {
            const data = await authService.login(account, password)
            // authService.login() already saves token to localStorage
            set({ token: data.token, user: data, isLoading: false })
            return data
        } catch (error) {
            set({ isLoading: false })
            throw error
        }
    },

    register: async (account, password, fullName) => {
        set({ isLoading: true })
        try {
            const data = await authService.register(account, password, fullName)
            localStorage.setItem('token', data.token)
            set({ token: data.token, user: data, isLoading: false })
            return data
        } catch (error) {
            set({ isLoading: false })
            throw error
        }
    },

    logout: () => {
        authService.logout()
        set({ token: null, user: null })
        window.location.href = '/login'
    },

    fetchCurrentUser: async () => {
        if (!localStorage.getItem('token')) return
        try {
            const data = await authService.getCurrentUser()
            set({ user: data })
        } catch {
            set({ token: null, user: null })
            localStorage.removeItem('token')
        }
    },

    updateProfile: async (fullName, phoneNumber) => {
        await authService.updateProfile(fullName, phoneNumber);
        // Refresh the user profile to get the updated info
        const updatedUser = await authService.getCurrentUser();
        set({ user: updatedUser });
        return updatedUser;
    },

    uploadAvatar: async (file) => {
        const result = await authService.uploadAvatar(file);
        // Refresh the user profile
        const updatedUser = await authService.getCurrentUser();
        set({ user: updatedUser });
        return result;
    },

    isAdmin: () => {
        const token = localStorage.getItem('token')
        if (!token) return false
        try {
            const payload = JSON.parse(atob(token.split('.')[1]))
            return payload.role === 'ADMIN'
        } catch {
            return false
        }
    }
}))

export default useAuthStore
