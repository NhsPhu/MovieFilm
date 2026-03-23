import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'

export default function RegisterPage() {
    const [formData, setFormData] = useState({ username: '', account: '', password: '', confirmPassword: '' })
    const [error, setError] = useState('')
    const { register } = useAuthStore()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (formData.password !== formData.confirmPassword) { setError('Mật khẩu không khớp'); return }
        try {
            await register(formData.account, formData.password, formData.username)
            navigate('/')
        } catch (err) { setError(err.response?.data?.message || 'Đăng ký thất bại') }
    }

    const isPhone = /^\d+$/.test(formData.account)

    return (
        <div className="bg-surface text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container min-h-screen flex flex-col">
            {/* TopNavBar */}
            <nav className="fixed top-0 w-full z-50 bg-transparent backdrop-blur-xl dark:bg-[#131313]/70 flex justify-between items-center px-6 py-4 max-w-none shadow-2xl shadow-black/50">
                <Link to="/" className="text-2xl font-black tracking-tighter text-[#E50914] uppercase font-['Manrope']">RimCinema</Link>
                <div className="hidden md:flex gap-8 items-center">
                    <Link className="text-gray-400 hover:text-white transition-colors font-['Manrope'] font-bold tracking-tight hover:scale-105 transition-transform duration-300" to="/">Phim</Link>
                </div>
                <div className="flex items-center gap-4">
                    <Link to="/login" className="text-gray-400 hover:text-white transition-colors font-['Manrope'] font-bold tracking-tight px-4 py-2 hover:scale-105 transition-transform duration-300">Đăng Nhập</Link>
                </div>
            </nav>

            <main className="flex-grow flex items-center justify-center pt-24 pb-12 cinematic-bg relative">
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-surface/80 pointer-events-none"></div>
                <section className="relative z-10 w-full max-w-md px-6">
                    <div className="glass-panel p-8 md:p-10 rounded-xl shadow-2xl border border-white/5">
                        <header className="mb-10 space-y-2">
                            <span className="text-primary font-label text-xs uppercase tracking-widest font-semibold">Tham Gia Ngay</span>
                            <h1 className="text-4xl font-headline font-extrabold tracking-tight text-on-surface">Đăng Ký</h1>
                            <p className="text-on-surface-variant text-sm font-light">Trải nghiệm điện ảnh đỉnh cao như bạn xứng đáng.</p>
                        </header>
                        {error && <p className="text-error text-xs mb-4">{error}</p>}
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-2 ml-1" htmlFor="name">Họ Và Tên</label>
                                <input className="w-full bg-surface-container-lowest border-0 border-b border-outline-variant focus:border-primary focus:ring-0 text-on-surface placeholder:text-surface-container-highest transition-all duration-300 py-3 px-1" id="name" placeholder="Nguyễn Văn A" type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})}/>
                            </div>
                            <div>
                                <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-2 ml-1" htmlFor="account">Email hoặc Số điện thoại</label>
                                <div className="relative flex items-center">
                                    {isPhone && (
                                        <div className="absolute left-0 top-0 bottom-0 text-on-surface-variant px-3 font-bold border-r border-outline-variant flex items-center justify-center gap-1 bg-surface-container-low rounded-l-md z-10">
                                            +84 <span className="material-symbols-outlined text-[10px]">expand_more</span>
                                        </div>
                                    )}
                                    <input 
                                        className={`w-full bg-surface-container-lowest border-0 border-b border-outline-variant focus:border-primary focus:ring-0 text-on-surface placeholder:text-surface-container-highest transition-all duration-300 py-3 ${isPhone ? 'pl-20' : 'px-1'}`} 
                                        id="account" 
                                        placeholder={isPhone ? "912 345 678" : "email@rimcinema.com"} 
                                        type="text" 
                                        value={formData.account} 
                                        onChange={e => setFormData({...formData, account: e.target.value})}
                                        autoComplete="off"
                                    />
                                    {!isPhone && formData.account.length > 0 && !formData.account.includes('@') && (
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant/50 pointer-events-none text-sm font-medium">
                                            @gmail.com
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-2 ml-1" htmlFor="password">Mật Khẩu</label>
                                    <input className="w-full bg-surface-container-lowest border-0 border-b border-outline-variant focus:border-primary focus:ring-0 text-on-surface placeholder:text-surface-container-highest transition-all duration-300 py-3 px-1" id="password" placeholder="••••••••" type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}/>
                                </div>
                                <div>
                                    <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-2 ml-1" htmlFor="confirm-password">Xác Nhận</label>
                                    <input className="w-full bg-surface-container-lowest border-0 border-b border-outline-variant focus:border-primary focus:ring-0 text-on-surface placeholder:text-surface-container-highest transition-all duration-300 py-3 px-1" id="confirm-password" placeholder="••••••••" type="password" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})}/>
                                </div>
                            </div>
                            <button className="w-full bg-primary-container text-on-primary-container font-headline font-extrabold uppercase tracking-widest py-4 mt-4 shadow-lg shadow-primary-container/20 hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2" type="submit">
                                Đăng Ký
                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </button>
                            <div className="text-center pt-4">
                                <p className="text-xs text-on-surface-variant uppercase tracking-widest">
                                    Đã có tài khoản? <Link className="text-primary font-bold hover:text-on-surface transition-colors" to="/login">Đăng Nhập</Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </section>
            </main>

            <footer className="bg-[#0E0E0E] w-full py-12 border-t border-white/5 flex flex-col items-center gap-6 px-10">
                <div className="flex flex-wrap justify-center gap-8 md:gap-12">
                    <a className="font-['Inter'] text-xs uppercase tracking-widest text-gray-500 hover:text-[#FFB4AA] transition-colors opacity-80 hover:opacity-100" href="#">Chính Sách Bảo Mật</a>
                    <a className="font-['Inter'] text-xs uppercase tracking-widest text-gray-500 hover:text-[#FFB4AA] transition-colors opacity-80 hover:opacity-100" href="#">Điều Khoản Dịch Vụ</a>
                    <a className="font-['Inter'] text-xs uppercase tracking-widest text-gray-500 hover:text-[#FFB4AA] transition-colors opacity-80 hover:opacity-100" href="#">Trung Tâm Trợ Giúp</a>
                </div>
                <div className="font-['Inter'] text-xs uppercase tracking-widest text-gray-500">© 2024 RIMCINEMA. MỌc QUYỀN ĐƯỢC BẢO LƯU.</div>
            </footer>
        </div>
    )
}
