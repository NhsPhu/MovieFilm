import api from './api'

export const profileService = {
    requestOtp: async () => {
        const response = await api.post('/users/profile/request-otp')
        return response.data
    },

    updateContact: async (newAccount, otp) => {
        const response = await api.put('/users/profile/contact', { newAccount, otp })
        return response.data
    },

    getSettings: async () => {
        const response = await api.get('/users/profile/settings')
        return response.data
    },

    updateSettings: async (settings) => {
        const response = await api.put('/users/profile/settings', settings)
        return response.data
    },

    changePassword: async (oldPassword, newPassword) => {
        const response = await api.put('/users/profile/change-password', { oldPassword, newPassword })
        return response.data
    }
}
