import api from './api'

export const authService = {
    login: async (account, password) => {
        const response = await api.post('/auth/login', { account, password })
        if (response.data.token) {
            localStorage.setItem('token', response.data.token)
        }
        return response.data
    },

    register: async (account, password, fullName) => {
        const response = await api.post('/auth/register', { account, password, fullName })
        return response.data
    },

    logout: () => {
        localStorage.removeItem('token')
    },

    getCurrentUser: async () => {
        const response = await api.get('/auth/me')
        return response.data
    },

    updateProfile: async (fullName, phoneNumber) => {
        const response = await api.put('/users/profile/info', { fullName, phoneNumber })
        return response.data
    },

    uploadAvatar: async (file) => {
        const formData = new FormData()
        formData.append('file', file)
        const response = await api.post('/users/profile/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        return response.data
    }
}
