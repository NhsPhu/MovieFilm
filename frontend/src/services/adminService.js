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

    getMovies: async (page = 0, size = 50) => {
        try {
            const response = await api.get(`/admin/movies?page=${page}&size=${size}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching admin movies:", error);
            return { content: [] };
        }
    },

    getStats: async () => {
        try {
            const response = await api.get('/admin/analytics/dashboard');
            return response.data;
        } catch (error) {
            console.error("Error fetching stats:", error);
            return { totalUsers: 0, totalMovies: 0, totalViews: 0, activeNow: 0 };
        }
    },

    getRecentMovies: async () => {
        try {
            const response = await api.get('/admin/analytics/recent-movies');
            return response.data;
        } catch (error) {
            console.error("Error fetching recent movies:", error);
            return [];
        }
    },

    getRecentActivities: async () => {
        try {
            const response = await api.get('/admin/analytics/recent-activities');
            return response.data;
        } catch (error) {
            console.error("Error fetching recent activities:", error);
            return [];
        }
    }
};
