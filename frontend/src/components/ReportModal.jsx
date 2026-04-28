import { useState, useEffect } from 'react'
import { reportService } from '../services/reportService'
import useAuthStore from '../store/useAuthStore'

export default function ReportModal({ isOpen, onClose, movieId, movieTitle }) {
    const { user } = useAuthStore()
    const [reportType, setReportType] = useState('VIDEO_ERROR')
    const [description, setDescription] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [onClose])

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setReportType('VIDEO_ERROR')
            setDescription('')
            setIsSuccess(false)
        }
    }, [isOpen])

    if (!isOpen) return null

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!user) return alert('Vui lòng đăng nhập để gửi báo cáo.')
        
        setIsSubmitting(true)
        try {
            await reportService.submitReport(movieId, reportType, description)
            setIsSuccess(true)
            setTimeout(() => {
                onClose()
            }, 2000)
        } catch (error) {
            alert('Có lỗi xảy ra khi gửi báo cáo.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
            
            {/* Modal Content */}
            <div className="relative w-full max-w-lg bg-surface-container-high rounded-2xl shadow-2xl overflow-hidden border border-outline-variant/20 animate-[scaleIn_0.2s_ease-out]">
                <div className="flex justify-between items-center p-5 border-b border-outline-variant/10">
                    <h3 className="font-headline font-bold text-lg text-white">Báo Lỗi Phim</h3>
                    <button onClick={onClose} className="p-1.5 rounded-full hover:bg-surface-container-highest transition-colors text-on-surface-variant hover:text-white">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6">
                    {isSuccess ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center animate-[fadeIn_0.3s_ease-out]">
                            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-4xl text-green-500" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                            </div>
                            <h4 className="text-xl font-bold text-white mb-2">Cảm ơn bạn!</h4>
                            <p className="text-on-surface-variant text-sm">Báo cáo của bạn đã được gửi. Đội ngũ kỹ thuật sẽ kiểm tra và khắc phục sớm nhất.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <p className="text-sm text-on-surface-variant mb-4">
                                    Bạn đang báo lỗi cho phim: <strong className="text-white">{movieTitle}</strong>
                                </p>
                                <label className="block text-xs font-bold uppercase tracking-widest text-primary mb-2">Vấn Đề Gặp Phải</label>
                                <select 
                                    value={reportType}
                                    onChange={(e) => setReportType(e.target.value)}
                                    className="w-full bg-surface-container-lowest text-white text-sm border border-outline-variant/30 rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors appearance-none"
                                >
                                    <option value="VIDEO_ERROR">Không xem được video (Lỗi đen màn hình, quay vòng)</option>
                                    <option value="AUDIO_ERROR">Lỗi âm thanh (Mất tiếng, rè)</option>
                                    <option value="SUBTITLE_ERROR">Lỗi phụ đề (Sai lệch, thiếu phụ đề)</option>
                                    <option value="CONTENT_ERROR">Nội dung không phù hợp</option>
                                    <option value="OTHER">Vấn đề khác</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-primary mb-2">Mô Tả Thêm (Tùy Chọn)</label>
                                <textarea 
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Hãy mô tả rõ hơn để chúng tôi dễ dàng khắc phục..."
                                    rows="4"
                                    className="w-full bg-surface-container-lowest text-white text-sm border border-outline-variant/30 rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors resize-none"
                                ></textarea>
                            </div>

                            <div className="pt-2 flex justify-end gap-3">
                                <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-lg text-sm font-bold text-on-surface-variant hover:bg-surface-container-highest transition-colors">
                                    Hủy
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="px-6 py-2.5 rounded-lg text-sm font-bold bg-primary-container text-on-primary-container hover:bg-primary hover:text-white transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="material-symbols-outlined animate-spin text-lg">autorenew</span>
                                            Đang Gửi...
                                        </>
                                    ) : 'Gửi Báo Cáo'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
