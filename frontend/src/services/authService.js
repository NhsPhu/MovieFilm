import api from './api'

export const authService = {
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password })
        if (response.data.token) {
            localStorage.setItem('token', response.data.token)
        }
        return response.data
    },

    register: async (email, password, fullName) => {
        const response = await api.post('/auth/register', { email, password, fullName })
        return response.data
    },

    logout: () => {
        localStorage.removeItem('token')
    },

    getCurrentUser: async () => {
        const response = await api.get('/auth/me')
        return response.data
    }
}
