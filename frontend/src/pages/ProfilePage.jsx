import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'
import { historyService } from '../services/historyService'
import { profileService } from '../services/profileService'
import { watchlistService } from '../services/watchlistService'
import { billingService } from '../services/billingService'
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

    // Password State
    const [isChangingPassword, setIsChangingPassword] = useState(false)
    const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '' })
    const [passwordError, setPasswordError] = useState('')

    // Billing State
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false)
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)
    const [plans, setPlans] = useState([])
    const [orderHistory, setOrderHistory] = useState([])
    const [selectedPlan, setSelectedPlan] = useState(null)
    const [billingStep, setBillingStep] = useState('select') // 'select' | 'qr' | 'success'
    const [isProcessing, setIsProcessing] = useState(false)

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

    const handleChangePassword = async () => {
        if (!passwordForm.oldPassword || !passwordForm.newPassword) {
            setPasswordError('Vui lòng điền đủ thông tin');
            return;
        }
        setIsSaving(true);
        try {
            await profileService.changePassword(passwordForm.oldPassword, passwordForm.newPassword);
            setIsChangingPassword(false);
            setPasswordForm({ oldPassword: '', newPassword: '' });
            alert("Đổi mật khẩu thành công!");
        } catch (err) {
            setPasswordError(err.response?.data?.message || err.response?.data?.error || 'Lỗi đổi mật khẩu');
        } finally {
            setIsSaving(false);
        }
    }

    // Billing handlers
    const handleOpenUpgrade = async () => {
        setIsUpgradeModalOpen(true)
        setBillingStep('select')
        setSelectedPlan(null)
        try {
            const data = await billingService.getPlans()
            setPlans(data || [])
        } catch (err) {
            console.error('Failed to load plans', err)
        }
    }

    const handleOpenInvoice = async () => {
        setIsInvoiceModalOpen(true)
        try {
            const data = await billingService.getOrderHistory()
            setOrderHistory(data || [])
        } catch (err) {
            console.error('Failed to load order history', err)
        }
    }

    const handleSelectPlan = (rawPlan) => {
        setSelectedPlan(getPlanDisplay(rawPlan))
        setBillingStep('qr')
    }

    const handleConfirmPayment = async () => {
        if (!selectedPlan) return
        setIsProcessing(true)
        try {
            await billingService.createOrder(selectedPlan.id, 'QR_BANK_TRANSFER')
            setBillingStep('success')
            // Refresh user data to update rank badge
            await fetchCurrentUser()
        } catch (err) {
            alert(err.response?.data?.error || 'Lỗi khi xử lý thanh toán')
        } finally {
            setIsProcessing(false)
        }
    }

    const formatPrice = (val) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)
    }

    // Vietnamese display mapping for plan data (avoids DB encoding issues)
    const planDisplayMap = {
        'MEMBER': { name: 'Gói Thành Viên', features: ['Xem phim có quảng cáo', 'Chất lượng 720p', '1 thiết bị'] },
        'CLOSE': { name: 'Gói Thân Thiết', features: ['Không quảng cáo', 'Chất lượng 1080p', '2 thiết bị', 'Tải phim offline'] },
        'VIP': { name: 'Gói VIP', features: ['Không quảng cáo', 'Chất lượng 4K', '4 thiết bị', 'Tải phim offline', 'Xem phim sớm'] },
    }

    const getPlanDisplay = (plan) => {
        const mapped = planDisplayMap[plan.rankLevel]
        return {
            ...plan,
            name: mapped?.name || plan.name,
            features: mapped?.features || plan.features || [],
        }
    }

    const getQrCodeUrl = (amount) => {
        const amt = Math.round(amount).toString()
        return `https://img.vietqr.io/image/970436-1041228495-print.png?amount=${amt}&addInfo=RIMCINEMA%20UPGRADE&accountName=Nguyen%20Ho%20Sy%20Phu`
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
                            {!isChangingPassword ? (
                                <>
                                    <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-4 block">password</span>
                                    <h4 className="font-headline font-bold mb-2">Bảo Mật</h4>
                                    <p className="text-xs text-on-surface-variant mb-4">Đổi mật khẩu để đảm bảo an toàn.</p>
                                    <button onClick={() => setIsChangingPassword(true)} className="text-xs font-bold py-2 px-4 border border-outline-variant/30 rounded-lg hover:bg-surface-variant transition-colors">Đổi Mật Khẩu</button>
                                </>
                            ) : (
                                <div className="w-full text-left">
                                    <h4 className="font-headline font-bold mb-4 text-center">Đổi Mật Khẩu</h4>
                                    {passwordError && <p className="text-error text-xs bg-error/10 p-2 rounded mb-3 text-center">{passwordError}</p>}
                                    <input 
                                        type="password" 
                                        placeholder="Mật khẩu cũ" 
                                        className="w-full bg-surface-container-lowest border border-outline-variant/50 focus:border-primary rounded-lg text-on-surface px-3 py-2 text-xs mb-3 outline-none"
                                        value={passwordForm.oldPassword}
                                        onChange={e => setPasswordForm({...passwordForm, oldPassword: e.target.value})}
                                    />
                                    <input 
                                        type="password" 
                                        placeholder="Mật khẩu mới" 
                                        className="w-full bg-surface-container-lowest border border-outline-variant/50 focus:border-primary rounded-lg text-on-surface px-3 py-2 text-xs mb-4 outline-none"
                                        value={passwordForm.newPassword}
                                        onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                                    />
                                    <div className="flex gap-2">
                                        <button onClick={() => { setIsChangingPassword(false); setPasswordError(''); }} className="flex-1 py-2 bg-surface-container-highest rounded text-xs font-bold hover:bg-surface-variant transition">Hủy</button>
                                        <button onClick={handleChangePassword} disabled={isSaving} className="flex-1 py-2 bg-primary-container text-on-primary-container rounded text-xs font-bold hover:opacity-90 transition">
                                            {isSaving ? 'Đang lưu...' : 'Lưu'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Billing Card */}
                        <div className="md:col-span-3 p-6 bg-surface-container-low rounded-xl border border-outline-variant/10 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-10 bg-surface-container-high rounded-md flex items-center justify-center border border-outline-variant/20">
                                    <span className="material-symbols-outlined text-primary">credit_card</span>
                                </div>
                                <div>
                                    <h4 className="font-headline font-bold">Thanh Toán & Hạng Thành Viên</h4>
                                    <p className="text-sm text-on-surface-variant">Gói hiện tại: <span className="font-bold text-on-surface">{user?.membershipRank === 'VIP' ? 'VIP' : user?.membershipRank === 'CLOSE' ? 'Thân Thiết' : 'Thành Viên'}</span></p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button onClick={handleOpenInvoice} className="text-sm font-bold text-primary-container hover:underline">Xem Hóa Đơn</button>
                                <button onClick={handleOpenUpgrade} className="text-sm font-bold px-6 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition">Nâng Cấp Gói</button>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* ============ UPGRADE PLAN MODAL ============ */}
            {isUpgradeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => { setIsUpgradeModalOpen(false); setBillingStep('select'); }}></div>
                    <div className="relative bg-surface-container-high rounded-2xl max-w-3xl w-full border border-outline-variant/20 overflow-hidden" style={{animation: 'scaleIn 0.2s ease-out'}}>
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-outline-variant/10">
                            <h3 className="font-headline font-bold text-xl">
                                {billingStep === 'select' && 'Chọn Gói Thành Viên'}
                                {billingStep === 'qr' && 'Thanh Toán QR'}
                                {billingStep === 'success' && 'Thanh Toán Thành Công!'}
                            </h3>
                            <button onClick={() => { setIsUpgradeModalOpen(false); setBillingStep('select'); }} className="p-1 hover:bg-surface-variant rounded-lg transition">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Step: Select Plan */}
                        {billingStep === 'select' && (
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {plans.map(rawPlan => {
                                        const plan = getPlanDisplay(rawPlan)
                                        const isCurrentPlan = user?.membershipRank === plan.rankLevel
                                        const isBestValue = plan.rankLevel === 'VIP'
                                        return (
                                            <div key={plan.id} className={`relative p-5 rounded-xl border-2 transition-all flex flex-col ${
                                                isBestValue ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-outline-variant/20 bg-surface-container'
                                            } ${isCurrentPlan ? 'opacity-60' : 'hover:border-primary/50 hover:scale-[1.02] cursor-pointer'}`}>
                                                {isBestValue && (
                                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-yellow-500 text-black text-[10px] font-bold uppercase tracking-widest rounded-full">Phổ biến nhất</div>
                                                )}
                                                <div className="mb-4">
                                                    <h4 className="font-headline font-bold text-lg">{plan.name}</h4>
                                                    <div className="mt-2">
                                                        <span className="font-headline font-extrabold text-2xl">{plan.price > 0 ? formatPrice(plan.price) : 'Miễn Phí'}</span>
                                                        {plan.durationDays > 0 && <span className="text-xs text-on-surface-variant"> /{plan.durationDays} ngày</span>}
                                                    </div>
                                                </div>
                                                <ul className="space-y-2 mb-6 flex-1">
                                                    {(plan.features || []).map((f, i) => (
                                                        <li key={i} className="flex items-start gap-2 text-xs text-on-surface-variant">
                                                            <span className="material-symbols-outlined text-primary text-sm mt-0.5" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                                                            {f}
                                                        </li>
                                                    ))}
                                                </ul>
                                                {isCurrentPlan ? (
                                                    <div className="w-full py-2.5 text-center text-xs font-bold text-on-surface-variant bg-surface-container-highest rounded-lg">Gói Hiện Tại</div>
                                                ) : plan.price > 0 ? (
                                                    <button onClick={() => handleSelectPlan(plan)} className={`w-full py-2.5 rounded-lg font-bold text-sm transition-all ${
                                                        isBestValue ? 'bg-yellow-500 text-black hover:bg-yellow-400' : 'bg-primary-container text-on-primary-container hover:opacity-90'
                                                    }`}>Chọn Gói Này</button>
                                                ) : null}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Step: QR Payment */}
                        {billingStep === 'qr' && selectedPlan && (
                            <div className="p-6 flex flex-col items-center text-center">
                                <div className="mb-4 p-3 bg-surface-container rounded-xl">
                                    <p className="text-sm text-on-surface-variant mb-1">Gói đã chọn</p>
                                    <h4 className="font-headline font-bold text-lg">{selectedPlan.name}</h4>
                                    <p className="font-extrabold text-2xl text-primary mt-1">{formatPrice(selectedPlan.price)}</p>
                                </div>
                                <p className="text-sm text-on-surface-variant mb-4">Quét mã QR bên dưới để thanh toán</p>
                                <div className="bg-white p-3 rounded-xl mb-4 inline-block">
                                    <img src={getQrCodeUrl(selectedPlan.price)} alt="QR Code Thanh Toán" className="w-56 h-56 object-contain" />
                                </div>
                                <p className="text-xs text-on-surface-variant mb-6">Ngân hàng: <strong>Vietcombank</strong> • STK: <strong>1041228495</strong> • <strong>Nguyen Ho Sy Phu</strong></p>
                                <div className="flex gap-3 w-full max-w-sm">
                                    <button onClick={() => setBillingStep('select')} className="flex-1 py-3 bg-surface-container-highest hover:bg-surface-variant transition rounded-xl font-bold text-sm">Quay Lại</button>
                                    <button onClick={handleConfirmPayment} disabled={isProcessing} className="flex-1 py-3 bg-primary-container text-on-primary-container rounded-xl font-bold text-sm hover:opacity-90 transition flex items-center justify-center gap-2">
                                        {isProcessing ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang xử lý...</> : 'Đã Thanh Toán'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step: Success */}
                        {billingStep === 'success' && (
                            <div className="p-8 text-center">
                                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="material-symbols-outlined text-green-500 text-4xl" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                                </div>
                                <h4 className="font-headline font-bold text-2xl mb-2">Nâng Cấp Thành Công!</h4>
                                <p className="text-on-surface-variant mb-2">Bạn đã nâng cấp lên gói <strong>{selectedPlan?.name}</strong></p>
                                <p className="text-xs text-on-surface-variant mb-6">Hạng thành viên của bạn đã được cập nhật. Hãy tận hưởng các đặc quyền mới!</p>
                                <button onClick={() => { setIsUpgradeModalOpen(false); setBillingStep('select'); }} className="px-8 py-3 bg-primary-container text-on-primary-container rounded-xl font-bold hover:opacity-90 transition">Tuyệt Vời!</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ============ INVOICE HISTORY MODAL ============ */}
            {isInvoiceModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsInvoiceModalOpen(false)}></div>
                    <div className="relative bg-surface-container-high rounded-2xl max-w-2xl w-full border border-outline-variant/20 overflow-hidden" style={{animation: 'scaleIn 0.2s ease-out'}}>
                        <div className="flex items-center justify-between p-6 border-b border-outline-variant/10">
                            <h3 className="font-headline font-bold text-xl">Lịch Sử Hóa Đơn</h3>
                            <button onClick={() => setIsInvoiceModalOpen(false)} className="p-1 hover:bg-surface-variant rounded-lg transition">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            {orderHistory.length > 0 ? (
                                <div className="space-y-3">
                                    {orderHistory.map(order => (
                                        <div key={order.id} className="flex items-center justify-between p-4 bg-surface-container rounded-xl border border-outline-variant/10">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                                    order.status === 'COMPLETED' ? 'bg-green-500/20' : 'bg-yellow-500/20'
                                                }`}>
                                                    <span className={`material-symbols-outlined text-lg ${
                                                        order.status === 'COMPLETED' ? 'text-green-500' : 'text-yellow-500'
                                                    }`} style={{fontVariationSettings: "'FILL' 1"}}>
                                                        {order.status === 'COMPLETED' ? 'check_circle' : 'pending'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-sm">{order.planName}</h4>
                                                    <p className="text-xs text-on-surface-variant">
                                                        {new Date(order.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        {order.expiresAt && ` • HSD: ${new Date(order.expiresAt).toLocaleDateString('vi-VN')}`}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-sm">{formatPrice(order.amount)}</p>
                                                <p className={`text-[10px] font-bold uppercase tracking-widest ${
                                                    order.status === 'COMPLETED' ? 'text-green-500' : 'text-yellow-500'
                                                }`}>{order.status === 'COMPLETED' ? 'Đã thanh toán' : order.status}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <span className="material-symbols-outlined text-5xl text-surface-container-highest mb-3 block">receipt_long</span>
                                    <p className="text-on-surface-variant">Chưa có hóa đơn nào.</p>
                                    <p className="text-xs text-on-surface-variant/60 mt-1">Nâng cấp gói thành viên để bắt đầu.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}
