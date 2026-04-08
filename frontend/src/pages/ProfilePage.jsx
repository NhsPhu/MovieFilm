import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'
import { historyService } from '../services/historyService'
import { profileService } from '../services/profileService'
import { watchlistService } from '../services/watchlistService'
import { Loader2 } from 'lucide-react'

export default function ProfilePage() {
    const { user, logout, fetchCurrentUser, updateProfile, uploadAvatar } = useAuthStore()
    const [activeTab, setActiveTab] = useState('history')
    const [watchHistory, setWatchHistory] = useState([])
    const [myList, setMyList] = useState([])

    // Profile Settings States
    const [isEditingContact, setIsEditingContact] = useState(false)
    const [editForm, setEditForm] = useState({ fullName: '', phoneNumber: '' })
    const [contactError, setContactError] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [isUploading, setIsUploading] = useState(false)

    const fileInputRef = useRef(null)

    const [settings, setSettings] = useState({
        autoPlayNext: false,
        previewOnHover: false,
        defaultQuality: '1080p HD'
    })

    useEffect(() => {
        if (user) {
            setEditForm({
                fullName: user.fullName || '',
                phoneNumber: user.phoneNumber || ''
            })
        }
    }, [user])

    useEffect(() => {
        if (activeTab === 'history') {
            historyService.getWatchHistory()
                .then(data => setWatchHistory(data || []))
                .catch(() => setWatchHistory([]))
        } else if (activeTab === 'mylist') {
            watchlistService.getWatchlist()
                .then(data => setMyList(data || []))
                .catch(() => setMyList([]))
        } else if (activeTab === 'settings') {
            profileService.getSettings()
                .then(data => setSettings(data))
                .catch(console.error)
        }
    }, [activeTab])

    const handleSettingChange = async (key, value) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        try {
            await profileService.updateSettings(newSettings);
        } catch (err) {
            console.error("Lỗi cập nhật cài đặt", err);
        }
    }

    const handleUpdateProfile = async () => {
        if (!editForm.fullName) {
            setContactError('Tên không được để trống');
            return;
        }
        setContactError('');
        setIsSaving(true);
        try {
            await updateProfile(editForm.fullName, editForm.phoneNumber);
            setIsEditingContact(false);
        } catch (err) {
            setContactError(err.response?.data?.message || err.response?.data?.error || 'Lỗi cập nhật thông tin');
        } finally {
            setIsSaving(false);
        }
    }

    const handleAvatarClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert('File ảnh quá lớn! Vui lòng chọn ảnh dưới 5MB.');
            return;
        }

        setIsUploading(true);
        try {
            await uploadAvatar(file);
        } catch (err) {
            alert(err.response?.data?.message || 'Lỗi tải ảnh lên');
        } finally {
            setIsUploading(false);
            e.target.value = null;
        }
    }

    const handleClearHistory = async () => {
        try {
            await historyService.clearHistory()
            setWatchHistory([])
        } catch (error) {
            console.error("Failed to clear history", error)
        }
    }

    const tabs = [
        { key: 'history', label: 'Lịch Sử Xem' },
        { key: 'mylist', label: 'Danh Sách Của Tôi' },
        { key: 'settings', label: 'Cài Đặt Hồ Sơ' },
    ]

    const displayName = user?.fullName || user?.email?.split('@')[0] || user?.phoneNumber || 'User'
    
    // Format Created Date
    const memberDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' }) : 'Vừa mới tham gia'
    
    const renderRankBadge = () => {
        if (user?.membershipRank === 'VIP') {
            return (
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 text-xs font-bold tracking-widest uppercase rounded-full self-center flex items-center gap-1 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                    <span className="material-symbols-outlined text-[14px]">stars</span>
                    VIP
                </span>
            )
        }
        if (user?.membershipRank === 'CLOSE') {
            return (
                <span className="px-3 py-1 bg-blue-500/20 text-blue-500 border border-blue-500/30 text-xs font-bold tracking-widest uppercase rounded-full self-center">
                    Thân Thiết
                </span>
            )
        }
        return (
            <span className="px-3 py-1 bg-surface-container-high text-on-surface-variant border border-outline-variant/30 text-xs font-bold tracking-widest uppercase rounded-full self-center">
                Thành Viên
            </span>
        )
    }

    return (
        <main className="pt-12 pb-20 px-6 md:px-12 max-w-7xl mx-auto min-h-screen">
            {/* Header Section */}
            <header className="mb-16 flex flex-col md:flex-row items-center md:items-end gap-8">
                <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/jpeg, image/png, image/webp" 
                        onChange={handleFileChange} 
                    />
                    <div className="w-32 h-32 md:w-44 md:h-44 rounded-xl overflow-hidden shadow-2xl shadow-black/50 border border-outline-variant/20 relative">
                        {isUploading && (
                            <div className="absolute inset-0 z-10 bg-black/60 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            </div>
                        )}
                        {user?.avatarUrl ? (
                            <img alt="User avatar" className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" src={user.avatarUrl.startsWith('http') ? user.avatarUrl : `http://localhost:8080${user.avatarUrl}`}/>
                        ) : (
                            <div className="w-full h-full bg-surface-container-high flex items-center justify-center group-hover:bg-surface-container-highest transition-colors">
                                <span className="material-symbols-outlined text-6xl text-on-surface-variant">person</span>
                            </div>
                        )}
                    </div>
                    <button className="absolute bottom-2 right-2 p-2 bg-primary-container text-on-primary-container rounded-lg shadow-lg group-hover:scale-110 transition-all z-20">
                        <span className="material-symbols-outlined text-sm">photo_camera</span>
                    </button>
                </div>
                
                <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2 justify-center md:justify-start">
                        <h1 className="font-headline text-4xl md:text-6xl font-extrabold tracking-tight text-on-surface">{displayName}</h1>
                        {renderRankBadge()}
                    </div>
                    <p className="text-on-surface-variant font-body text-lg">
                        Tham gia từ {memberDate} • {user?.email || 'Chưa liên kết Email'}
                    </p>
                </div>
                <div className="flex gap-4">
                    <button onClick={logout} className="px-6 py-3 bg-surface-container-high text-on-surface font-headline font-bold rounded-lg hover:bg-surface-container-highest transition-all">
                        Đăng Xuất
                    </button>
                    <button onClick={() => setActiveTab('settings')} className="px-6 py-3 bg-primary-container text-on-primary-container font-headline font-bold rounded-lg shadow-[0px_0px_15px_rgba(229,9,20,0.2)] hover:scale-105 transition-all active:opacity-80">
                        Quản Lý Hồ Sơ
                    </button>
                </div>
            </header>

            {/* Tabs Navigation */}
            <div className="flex gap-12 border-b border-surface-variant mb-12">
                {tabs.map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                        className={activeTab === tab.key
                            ? "pb-4 text-white border-b-2 border-primary-container font-headline font-bold text-lg"
                            : "pb-4 text-on-surface-variant hover:text-white transition-colors font-headline font-bold text-lg"
                        }>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab: Watch History */}
            {activeTab === 'history' && (
                <section className="mb-20">
                    <div className="flex justify-between items-end mb-8">
                        <h2 className="font-headline text-2xl font-bold text-on-surface">Đã Xem Gần Đây</h2>
                        {watchHistory.length > 0 && (
                            <button onClick={handleClearHistory} className="text-primary-container font-bold text-sm hover:underline">Xóa Lịch Sử</button>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {watchHistory.length > 0 ? watchHistory.map((item, i) => {
                            const progress = item.isFinished ? 100 : (item.currentTimeSec ? Math.min(Math.floor((item.currentTimeSec / (120*60)) * 100) + 10, 95) : Math.floor(Math.random() * 80 + 10))
                            const finished = item.isFinished || progress >= 100
                            const timeLabel = item.lastWatchedAt ? new Date(item.lastWatchedAt).toLocaleDateString('vi-VN') : 'gần đây'
                            
                            return (
                                <div key={item.id || i} className="group relative bg-surface-container rounded-xl overflow-hidden hover:scale-[1.02] transition-all duration-300 pointer-events-auto">
                                    <div className="aspect-video relative">
                                        <img alt={item.movieTitle || 'Movie'} className="w-full h-full object-cover" src={item.posterUrl || 'https://via.placeholder.com/400x225?text=No+Image'}/>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                                        <div className="absolute bottom-0 left-0 w-full h-1 bg-surface-variant">
                                            <div className="bg-primary-container h-full" style={{width: `${progress}%`}}></div>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-headline font-bold text-lg text-on-surface line-clamp-1">{item.movieTitle}</h3>
                                            {finished ? (
                                                <span className="material-symbols-outlined text-primary-container text-sm" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                                            ) : (
                                                <span className="text-xs text-on-surface-variant font-medium">Phim</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-on-surface-variant mb-4">
                                            Đã xem {timeLabel} • {finished ? 'Hoàn thành' : `${progress}% hoàn tất`}
                                        </p>
                                        <Link to={`/watch/${item.movieId}`} className="w-full py-2 bg-surface-container-high hover:bg-surface-container-highest transition-colors flex items-center justify-center gap-2 rounded-lg text-sm font-bold">
                                            <span className="material-symbols-outlined text-sm">{finished ? 'replay' : 'play_arrow'}</span>
                                            {finished ? 'Xem Lại' : 'Tiếp Tục'}
                                        </Link>
                                    </div>
                                </div>
                            )
                        }) : (
                            <div className="col-span-full text-center py-12">
                                <span className="material-symbols-outlined text-5xl text-surface-container-highest mb-3 block">history</span>
                                <p className="text-on-surface-variant">Chưa có lịch sử xem.</p>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* Tab: My List */}
            {activeTab === 'mylist' && (
                <section className="mb-20">
                    <h2 className="font-headline text-2xl font-bold text-on-surface mb-8">Danh Sách Của Tôi</h2>
                    {myList.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {myList.map((movie) => (
                                <Link key={movie.id} to={`/movie/${movie.id}`} className="group relative rounded-xl overflow-hidden bg-surface-container hover:scale-105 transition-all">
                                    <div className="aspect-[2/3]">
                                        <img src={movie.posterUrl || 'https://via.placeholder.com/400x600?text=No+Image'} alt={movie.title} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                                        <h3 className="font-headline font-bold text-on-surface line-clamp-1">{movie.title}</h3>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="material-symbols-outlined text-primary-container text-sm" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                                            <span className="text-xs font-bold text-on-surface">{movie.rating || 'N/A'}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <span className="material-symbols-outlined text-6xl text-surface-container-highest mb-4 block">bookmark_border</span>
                            <p className="text-on-surface-variant text-lg mb-2">Danh sách của bạn đang trống</p>
                            <p className="text-on-surface-variant/60 text-sm mb-6">Lưu phim để xem sau</p>
                            <Link to="/" className="px-8 py-3 bg-primary-container text-on-primary-container font-headline font-bold rounded-lg hover:scale-105 transition-all inline-block">
                                Khám Phá Phim
                            </Link>
                        </div>
                    )}
                </section>
            )}

            {/* Tab: Profile Settings */}
            {activeTab === 'settings' && (
                <section className="mb-20">
                    <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-6">
                        {/* Information Card */}
                        <div className="md:col-span-2 p-8 bg-surface-container rounded-xl border border-outline-variant/10">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-primary-container/10 rounded-lg">
                                    <span className="material-symbols-outlined text-primary-container">badge</span>
                                </div>
                                <h3 className="font-headline font-bold text-xl">Thông Tin Cá Nhân</h3>
                            </div>
                            <div className="space-y-6">
                                {!isEditingContact ? (
                                    <>
                                        <div className="border-b border-outline-variant/30 pb-4">
                                            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">HỌ VÀ TÊN</label>
                                            <div className="flex justify-between items-center mt-1">
                                                <span className="font-body font-medium">{user?.fullName}</span>
                                            </div>
                                        </div>
                                        <div className="border-b border-outline-variant/30 pb-4">
                                            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">SỐ ĐIỆN THOẠI</label>
                                            <div className="flex justify-between items-center mt-1">
                                                <span className="font-body font-medium">{user?.phoneNumber || 'Chưa cung cấp'}</span>
                                            </div>
                                        </div>
                                        <div className="pt-2 text-right">
                                            <button onClick={() => setIsEditingContact(true)} className="px-4 py-2 bg-surface-container-highest text-on-surface text-sm font-bold rounded-lg hover:bg-white/10 transition">
                                                Cập Nhật Thông Tin
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-4">
                                        {contactError && <p className="text-error text-xs bg-error/10 p-2 rounded">{contactError}</p>}
                                        <div>
                                            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">HỌ VÀ TÊN</label>
                                            <input 
                                                className="w-full bg-surface-container-lowest border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-on-surface px-4 py-2.5 text-sm transition-all outline-none" 
                                                placeholder="VD: Nguyễn Văn A" 
                                                type="text" 
                                                value={editForm.fullName} 
                                                onChange={e => setEditForm({...editForm, fullName: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">SỐ ĐIỆN THOẠI</label>
                                            <input 
                                                className="w-full bg-surface-container-lowest border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-on-surface px-4 py-2.5 text-sm transition-all outline-none" 
                                                placeholder="Nhập số điện thoại..." 
                                                type="text" 
                                                value={editForm.phoneNumber} 
                                                onChange={e => setEditForm({...editForm, phoneNumber: e.target.value})}
                                            />
                                        </div>
                                        <div className="flex gap-3 justify-end pt-4 border-t border-outline-variant/20 mt-6">
                                            <button 
                                                onClick={() => { 
                                                    setIsEditingContact(false); 
                                                    setContactError(''); 
                                                    setEditForm({fullName: user?.fullName || '', phoneNumber: user?.phoneNumber || ''})
                                                }} 
                                                className="px-5 py-2 text-sm font-bold text-on-surface-variant hover:bg-surface-variant rounded-lg transition"
                                            >
                                                Hủy
                                            </button>
                                            <button 
                                                onClick={handleUpdateProfile} 
                                                disabled={isSaving}
                                                className="px-5 py-2 text-sm font-bold bg-primary-container text-on-primary-container rounded-lg hover:opacity-90 flex flex-items-center gap-2 transition"
                                            >
                                                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                                                Lưu Thay Đổi
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Preferences Card */}
                        <div className="md:col-span-2 p-8 bg-surface-container rounded-xl border border-outline-variant/10">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-tertiary/10 rounded-lg">
                                    <span className="material-symbols-outlined text-tertiary">tune</span>
                                </div>
                                <h3 className="font-headline font-bold text-xl">Tùy Chỉnh Lõi</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-3 hover:bg-surface-container-highest rounded-lg transition-colors cursor-pointer" onClick={() => handleSettingChange('autoPlayNext', !settings.autoPlayNext)}>
                                    <span className="text-on-surface text-sm font-bold">Tự động phát tập tiếp theo</span>
                                    <div className={`w-12 h-6 rounded-full relative transition-colors ${settings.autoPlayNext ? 'bg-primary-container' : 'bg-surface-variant'}`}>
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.autoPlayNext ? 'right-1' : 'left-1'}`}></div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center p-3 hover:bg-surface-container-highest rounded-lg transition-colors cursor-pointer" onClick={() => handleSettingChange('previewOnHover', !settings.previewOnHover)}>
                                    <span className="text-on-surface text-sm font-bold">Xem trước khi rê chuột</span>
                                    <div className={`w-12 h-6 rounded-full relative transition-colors ${settings.previewOnHover ? 'bg-primary-container' : 'bg-surface-variant'}`}>
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.previewOnHover ? 'right-1' : 'left-1'}`}></div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center p-3">
                                    <span className="text-on-surface-variant text-sm font-bold">Chất Lượng Mặc Định</span>
                                    <select 
                                        value={settings.defaultQuality}
                                        onChange={(e) => handleSettingChange('defaultQuality', e.target.value)}
                                        className="bg-surface-container-lowest border border-outline-variant/50 rounded-lg text-sm text-on-surface px-4 py-2 focus:ring-1 focus:ring-primary-container outline-none">
                                        <option value="4K Ultra HD">4K Ultra HD</option>
                                        <option value="1080p HD">1080p HD</option>
                                        <option value="Tiết Kiệm Dữ Liệu">Tiết Kiệm Dữ Liệu</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Security Card */}
                        <div className="md:col-span-1 p-6 bg-surface-container-low rounded-xl border border-outline-variant/10 text-center flex flex-col items-center justify-center">
                            <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-4 block">password</span>
                            <h4 className="font-headline font-bold mb-2">Bảo Mật</h4>
                            <p className="text-xs text-on-surface-variant mb-4">Đổi mật khẩu để đảm bảo an toàn.</p>
                            <button className="text-xs font-bold py-2 px-4 border border-outline-variant/30 rounded-lg hover:bg-surface-variant transition-colors">Đổi Mật Khẩu</button>
                        </div>

                        {/* Billing Card */}
                        <div className="md:col-span-3 p-6 bg-surface-container-low rounded-xl border border-outline-variant/10 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-10 bg-surface-container-high rounded-md flex items-center justify-center border border-outline-variant/20">
                                    <span className="font-bold italic text-on-surface">VISA</span>
                                </div>
                                <div>
                                    <h4 className="font-headline font-bold">Thanh Toán & Hạng Thành Viên</h4>
                                    <p className="text-sm text-on-surface-variant">Ngày thanh toán tiếp theo: {new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString('vi-VN')}</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button className="text-sm font-bold text-primary-container">Xem Hóa Đơn</button>
                                <button className="text-sm font-bold px-6 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition">Nâng Cấp Gói</button>
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </main>
    )
}
