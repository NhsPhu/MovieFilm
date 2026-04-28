import api from './api'

export const reportService = {
    // For now we simulate an API call. In a real backend, this would be a POST to /api/reports
    submitReport: async (movieId, reportType, description) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Report submitted:', { movieId, reportType, description })
                resolve({ success: true, message: 'Báo cáo đã được gửi thành công' })
            }, 800)
        })
    }
}
