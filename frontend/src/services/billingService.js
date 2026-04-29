import api from './api'

export const billingService = {
    getPlans: async () => {
        const response = await api.get('/billing/plans')
        return response.data
    },

    createOrder: async (planId, paymentMethod = 'QR_BANK_TRANSFER') => {
        const response = await api.post('/billing/orders', { planId, paymentMethod })
        return response.data
    },

    getOrderHistory: async () => {
        const response = await api.get('/billing/orders')
        return response.data
    }
}
