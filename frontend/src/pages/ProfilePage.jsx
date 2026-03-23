import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'
import { historyService } from '../services/historyService'
import { profileService } from '../services/profileService'

export default function ProfilePage() {
    const { user, logout, fetchCurrentUser } = useAuthStore()
    const [activeTab, setActiveTab] = useState('history')
    const [watchHistory, setWatchHistory] = useState([])

    // Profile Settings States
    const [isEditingContact, setIsEditingContact] = useState(false)
    const [newContact, setNewContact] = useState('')
    const [otpSent, setOtpSent] = useState(false)
    const [otp, setOtp] = useState('')
    const [contactError, setContactError] = useState('')
    const [settings, setSettings] = useState({
        autoPlayNext: false,
        previewOnHover: false,
        defaultQuality: '1080p HD'
    })

    const isPhone = /^\d+$/.test(newContact)

    useEffect(() => {
        historyService.getWatchHistory()
            .then(data => setWatchHistory(data || []))
            .catch(() => setWatchHistory([]))
    }, [])

    useEffect(() => {
        if (activeTab === 'settings') {
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

    const handleRequestOtp = async () => {
        if (!newContact) return;
        setContactError('');
        try {
            await profileService.requestOtp();
            setOtpSent(true);
        } catch (err) {
            setContactError('Lỗi gửi yêu cầu OTP');
        }
    }

    const handleUpdateContact = async () => {
        if (!otp) return;
        setContactError('');
        try {
            await profileService.updateContact(newContact, otp);
            setIsEditingContact(false);
            setOtpSent(false);
            setNewContact('');
            setOtp('');
            fetchCurrentUser(); // refresh user context
        } catch (err) {
            setContactError(err.response?.data?.message || 'Lỗi cập nhật thông tin');
        }
    }

    const handleClearHistory = () => {
        // Mock clear history since backend doesn't have an endpoint yet
        setWatchHistory([])
    }

    const tabs = [
        { key: 'history', label: 'Lịch Sử Xem' },
        { key: 'mylist', label: 'Danh Sách Của Tôi' },
        { key: 'settings', label: 'Cài Đặt Hồ Sơ' },
    ]

    const displayName = user?.fullName || user?.username || user?.email?.split('@')[0] || user?.phoneNumber || 'User'
    const memberDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' }) : 'Tháng 10, 2024'
    const currentAccount = user?.email || user?.phoneNumber || 'Chưa cập nhật'

    return (
        <main className="pt-12 pb-20 px-6 md:px-12 max-w-7xl mx-auto min-h-screen">
            {/* Header Section */}
            <header className="mb-16 flex flex-col md:flex-row items-center md:items-end gap-8">
                <div className="relative group">
                    <div className="w-32 h-32 md:w-44 md:h-44 rounded-xl overflow-hidden shadow-2xl shadow-black/50 border border-outline-variant/20">
                        {user?.avatarUrl ? (
                            <img alt="User avatar" className="w-full h-full object-cover" src={user.avatarUrl}/>
                        ) : (
                            <div className="w-full h-full bg-surface-container-high flex items-center justify-center">
                                <span className="material-symbols-outlined text-6xl text-on-surface-variant">person</span>
                            </div>
                        )}
                    </div>
                    <button className="absolute bottom-2 right-2 p-2 bg-primary-container text-on-primary-container rounded-lg shadow-lg hover:scale-105 transition-all">
                        <span className="material-symbols-outlined text-sm">edit</span>
                    </button>
                </div>
                <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2 justify-center md:justify-start">
                        <h1 className="font-headline text-4xl md:text-6xl font-extrabold tracking-tight text-on-surface">{displayName}</h1>
                        <span className="px-3 py-1 bg-primary-container/20 text-primary-container border border-primary-container/30 text-xs font-bold tracking-widest uppercase rounded-full self-center">
                            {user?.role === 'ADMIN' ? 'Quản Trị' : 'Thành Viên VIP'}
                        </span>
                    </div>
                    <p className="text-on-surface-variant font-body text-lg">
                        Thành viên từ {memberDate} • {currentAccount}
                    </p>
                </div>
                <div className="flex gap-4">
                    <button onClick={logout} className="px-6 py-3 bg-surface-container-high text-on-surface font-headline font-bold rounded-lg hover:bg-surface-container-highest transition-all">
                        Đăng Xuất
                    </button>
                    <Link to="/profile" className="px-6 py-3 bg-primary-container text-on-primary-container font-headline font-bold rounded-lg shadow-[0px_0px_15px_rgba(229,9,20,0.2)] hover:scale-105 transition-all active:opacity-80">
                        Quản Lý Tài Khoản
                    </Link>
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
                            // Calculate a fake progress percentage if the backend only gives currentTimeSec without duration
                            const progress = item.isFinished ? 100 : (item.currentTimeSec ? Math.min(Math.floor((item.currentTimeSec / (120*60)) * 100) + 10, 95) : Math.floor(Math.random() * 80 + 10))
                            const finished = item.isFinished || progress >= 100
                            const timeLabel = item.lastWatchedAt ? new Date(item.lastWatchedAt).toLocaleDateString('vi-VN') : 'gần đây'
                            
                            return (
                                <div key={item.id || i} className="group relative bg-surface-container rounded-xl overflow-hidden hover:scale-[1.02] transition-all duration-300">
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
                    <div className="text-center py-20">
                        <span className="material-symbols-outlined text-6xl text-surface-container-highest mb-4 block">bookmark_border</span>
                        <p className="text-on-surface-variant text-lg mb-2">Danh sách của bạn đang trống</p>
                        <p className="text-on-surface-variant/60 text-sm mb-6">Lưu phim để xem sau</p>
                        <Link to="/" className="px-8 py-3 bg-primary-container text-on-primary-container font-headline font-bold rounded-lg hover:scale-105 transition-all inline-block">
                            Khám Phá Phim
                        </Link>
                    </div>
                </section>
            )}

            {/* Tab: Profile Settings */}
            {activeTab === 'settings' && (
                <section className="mb-20">
                    <h2 className="font-headline text-2xl font-bold text-on-surface mb-8">Cài Đặt Hồ Sơ</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-6">
                        {/* Security Card */}
                        <div className="md:col-span-2 p-8 bg-surface-container rounded-xl border border-outline-variant/10">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-primary-container/10 rounded-lg">
                                    <span className="material-symbols-outlined text-primary-container">shield</span>
                                </div>
                                <h3 className="font-headline font-bold text-xl">Đăng Nhập & Bảo Mật</h3>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">ĐỊA CHỈ EMAIL / SỐ ĐIỆN THOẠI</label>
                                    {!isEditingContact ? (
                                        <div className="flex justify-between items-center py-2 border-b border-outline-variant/30">
                                            <span className="font-body">{currentAccount}</span>
                                            <button onClick={() => setIsEditingContact(true)} className="text-primary-container text-sm font-bold hover:underline">Thay Đổi</button>
                                        </div>
                                    ) : (
                                        <div className="py-2 border-b border-outline-variant/30 space-y-3">
                                            {contactError && <p className="text-error text-xs">{contactError}</p>}
                                            <div className="relative flex items-center">
                                                {isPhone && (
                                                    <div className="absolute left-0 top-0 bottom-0 text-on-surface-variant px-3 font-bold border-r border-outline-variant flex items-center justify-center gap-1 bg-surface-container-low rounded-l-md z-10 text-xs">
                                                        +84
                                                    </div>
                                                )}
                                                <input 
                                                    className={`w-full bg-surface-container-lowest border-0 border-b border-outline-variant focus:border-primary focus:ring-0 text-on-surface placeholder:text-surface-container-highest transition-all duration-300 py-2 text-sm ${isPhone ? 'pl-16' : 'px-1'}`} 
                                                    placeholder={isPhone ? "912 345 678" : "email mới..."} 
                                                    type="text" 
                                                    value={newContact} 
                                                    onChange={e => setNewContact(e.target.value)}
                                                    disabled={otpSent}
                                                />
                                            </div>
                                            {otpSent && (
                                                <input 
                                                    className="w-full bg-surface-container-lowest border-0 border-b border-outline-variant focus:border-primary focus:ring-0 text-on-surface placeholder:text-surface-container-highest transition-all duration-300 py-2 text-sm px-1" 
                                                    placeholder="Nhập mã OTP (123456)" 
                                                    type="text" 
                                                    value={otp} 
                                                    onChange={e => setOtp(e.target.value)}
                                                />
                                            )}
                                            <div className="flex gap-2 justify-end pt-2">
                                                <button onClick={() => { setIsEditingContact(false); setOtpSent(false); setNewContact(''); setOtp(''); setContactError(''); }} className="text-xs font-bold text-on-surface-variant hover:text-white px-3 py-1">Hủy</button>
                                                {!otpSent ? (
                                                    <button onClick={handleRequestOtp} className="text-xs font-bold bg-primary-container text-on-primary-container px-3 py-1 rounded">Gửi OTP</button>
                                                ) : (
                                                    <button onClick={handleUpdateContact} className="text-xs font-bold bg-primary-container text-on-primary-container px-3 py-1 rounded">Xác Nhận</button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Mật Khẩu</label>
                                    <div className="flex justify-between items-center py-2 border-b border-outline-variant/30">
                                        <span className="font-body">••••••••••••</span>
                                        <button className="text-primary-container text-sm font-bold">Cập Nhật</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Preferences Card */}
                        <div className="md:col-span-2 p-8 bg-surface-container rounded-xl border border-outline-variant/10">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-tertiary/10 rounded-lg">
                                    <span className="material-symbols-outlined text-tertiary">tune</span>
                                </div>
                                <h3 className="font-headline font-bold text-xl">Tùy Chỉnh Phát</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-on-surface">Tự động phát tập tiếp theo</span>
                                    <div onClick={() => handleSettingChange('autoPlayNext', !settings.autoPlayNext)} className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${settings.autoPlayNext ? 'bg-primary-container' : 'bg-surface-variant'}`}>
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.autoPlayNext ? 'right-1' : 'left-1'}`}></div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-on-surface">Xem trước khi rê chuột</span>
                                    <div onClick={() => handleSettingChange('previewOnHover', !settings.previewOnHover)} className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${settings.previewOnHover ? 'bg-primary-container' : 'bg-surface-variant'}`}>
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.previewOnHover ? 'right-1' : 'left-1'}`}></div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-on-surface-variant">Chất Lượng Mặc Định</span>
                                    <select 
                                        value={settings.defaultQuality}
                                        onChange={(e) => handleSettingChange('defaultQuality', e.target.value)}
                                        className="bg-surface-container-high border-none rounded-lg text-sm text-on-surface p-2 focus:ring-1 focus:ring-primary-container">
                                        <option value="4K Ultra HD">4K Ultra HD</option>
                                        <option value="1080p HD">1080p HD</option>
                                        <option value="Tiết Kiệm Dữ Liệu">Tiết Kiệm Dữ Liệu</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Notification Card */}
                        <div className="md:col-span-1 p-6 bg-surface-container-low rounded-xl border border-outline-variant/10 text-center">
                            <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-4 block">notifications_active</span>
                            <h4 className="font-headline font-bold mb-2">Thông Báo</h4>
                            <p className="text-xs text-on-surface-variant mb-4">Quản lý thông báo và cập nhật của bạn.</p>
                            <button className="text-xs font-bold py-2 px-4 border border-outline-variant/30 rounded-lg hover:bg-surface-variant transition-colors">Cấu Hình</button>
                        </div>

                        {/* Billing Card */}
                        <div className="md:col-span-3 p-6 bg-surface-container-low rounded-xl border border-outline-variant/10 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-10 bg-surface-container-high rounded-md flex items-center justify-center border border-outline-variant/20">
                                    <span className="font-bold italic text-on-surface">VISA</span>
                                </div>
                                <div>
                                    <h4 className="font-headline font-bold">Thanh Toán & Gói Đăng Ký</h4>
                                    <p className="text-sm text-on-surface-variant">Ngày thanh toán tiếp theo: {new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString('vi-VN')}</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button className="text-sm font-bold text-primary-container">Xem Hóa Đơn</button>
                                <button className="text-sm font-bold px-6 py-2 bg-white text-black rounded-lg">Đổi Gói</button>
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </main>
    )
}
