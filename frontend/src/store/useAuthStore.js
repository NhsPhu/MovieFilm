import { create } from 'zustand'
import { authService } from '../services/authService'

const useAuthStore = create((set) => ({
    token: localStorage.getItem('token') || null,
    user: null,
    isLoading: false,

    login: async (email, password) => {
        set({ isLoading: true })
        try {
            const data = await authService.login(email, password)
            set({ token: data.token, user: data, isLoading: false })
            return data
        } catch (error) {
            set({ isLoading: false })
            throw error
        }
    },

    register: async (email, password, fullName) => {
        set({ isLoading: true })
        try {
            const data = await authService.register(email, password, fullName)
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

    isAuthenticated: () => !!localStorage.getItem('token'),
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
