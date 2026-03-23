import api from './api';

export const adminService = {
    getUsers: async () => {
        try {
            const response = await api.get('/admin/users');
            return response.data;
        } catch (error) {
            console.error("Error fetching users:", error);
            return [];
        }
    },

    getStats: async () => {
        try {
            const response = await api.get('/admin/stats');
            return response.data;
        } catch (error) {
            console.error("Error fetching stats:", error);
            return { totalUsers: 0, totalMovies: 0, totalViews: 0, activeNow: 0 };
        }
    }
};
