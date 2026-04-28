import { useState, useRef, useEffect } from 'react'

export default function NotificationPanel() {
    const [isOpen, setIsOpen] = useState(false)
    const [notifications, setNotifications] = useState([
        { id: 1, title: 'Phim Mới Phát Hành', message: 'Avengers: Endgame đã có mặt trên hệ thống với chất lượng 4K.', isRead: false, time: '2 giờ trước' },
        { id: 2, title: 'Gợi Ý Cho Bạn', message: 'Dựa trên phim bạn đã xem, chúng tôi đề xuất "Inception".', isRead: false, time: '1 ngày trước' },
        { id: 3, title: 'Tính Năng Mới', message: 'Bây giờ bạn có thể chia sẻ phim trực tiếp lên mạng xã hội.', isRead: true, time: '3 ngày trước' },
    ])
    
    const panelRef = useRef(null)

    const unreadCount = notifications.filter(n => !n.isRead).length

    // Handle click outside to close
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (panelRef.current && !panelRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })))
    }

    const handleNotificationClick = (id) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n))
    }

    return (
        <div className="relative" ref={panelRef}>
            {/* Bell Icon */}
            <div 
                className="relative cursor-pointer hover:scale-105 transition-transform duration-300 hidden sm:flex items-center justify-center p-1"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="material-symbols-outlined text-xl md:text-2xl text-on-surface-variant hover:text-white transition-colors">notifications</span>
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-primary text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-background">
                        {unreadCount}
                    </span>
                )}
            </div>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-surface-container-high border border-outline-variant/20 rounded-2xl shadow-2xl overflow-hidden z-[100] animate-[scaleIn_0.2s_ease-out] origin-top-right">
                    <div className="p-4 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container/50">
                        <h3 className="font-headline font-bold text-base text-white">Thông Báo</h3>
                        {unreadCount > 0 && (
                            <button onClick={markAllAsRead} className="text-xs text-primary font-bold hover:text-primary/80 transition-colors">
                                Đánh dấu đã đọc
                            </button>
                        )}
                    </div>
                    
                    <div className="max-h-[400px] overflow-y-auto hide-scrollbar">
                        {notifications.length > 0 ? (
                            <div className="flex flex-col">
                                {notifications.map(notification => (
                                    <div 
                                        key={notification.id} 
                                        onClick={() => handleNotificationClick(notification.id)}
                                        className={`p-4 border-b border-outline-variant/5 hover:bg-surface-container-highest cursor-pointer transition-colors flex gap-4 ${notification.isRead ? 'opacity-70' : 'bg-primary/5'}`}
                                    >
                                        <div className="mt-1">
                                            {notification.isRead ? (
                                                <span className="material-symbols-outlined text-on-surface-variant text-xl">notifications</span>
                                            ) : (
                                                <span className="material-symbols-outlined text-primary text-xl" style={{fontVariationSettings: "'FILL' 1"}}>notifications_active</span>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className={`text-sm font-bold mb-1 ${notification.isRead ? 'text-on-surface' : 'text-white'}`}>
                                                {notification.title}
                                            </h4>
                                            <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <span className="text-[10px] text-on-surface-variant/70 font-medium mt-2 block">
                                                {notification.time}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center flex flex-col items-center">
                                <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-3">notifications_paused</span>
                                <p className="text-sm font-medium text-on-surface-variant">Bạn không có thông báo nào</p>
                            </div>
                        )}
                    </div>
                    
                    {notifications.length > 0 && (
                        <div className="p-3 border-t border-outline-variant/10 text-center bg-surface-container/50 hover:bg-surface-container cursor-pointer transition-colors">
                            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Xem Tất Cả</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
