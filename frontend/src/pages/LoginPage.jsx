import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'

export default function LoginPage() {
    const [account, setAccount] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const { login } = useAuthStore()
    const navigate = useNavigate()

    const isPhone = /^\d+$/.test(account)

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await login(account, password)
            navigate('/')
        } catch (err) { setError(err.response?.data?.message || 'Đăng nhập thất bại') }
    }

    return (
        <div className="bg-surface text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container min-h-screen flex flex-col">
            <nav className="fixed top-0 w-full z-50 bg-transparent backdrop-blur-xl dark:bg-[#131313]/70 flex justify-between items-center px-6 py-4 max-w-none shadow-2xl shadow-black/50">
                <Link to="/" className="text-2xl font-black tracking-tighter text-[#E50914] uppercase font-['Manrope']">RimCinema</Link>
                <div className="hidden md:flex gap-8 items-center">
                    <Link className="text-gray-400 hover:text-white transition-colors font-['Manrope'] font-bold tracking-tight" to="/">Phim</Link>
                </div>
            </nav>

            <main className="flex-grow flex items-center justify-center pt-24 pb-12 cinematic-bg relative">
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-surface/80 pointer-events-none"></div>
                <section className="relative z-10 w-full max-w-md px-6">
                    <div className="glass-panel p-8 md:p-10 rounded-xl shadow-2xl border border-white/5">
                        <header className="mb-10 space-y-2">
                            <span className="text-primary font-label text-xs uppercase tracking-widest font-semibold">Chào Mừng Trở Lại</span>
                            <h1 className="text-4xl font-headline font-extrabold tracking-tight text-on-surface">Đăng Nhập</h1>
                            <p className="text-on-surface-variant text-sm font-light">Tiếp tục hành trình điện ảnh của bạn.</p>
                        </header>
                        {error && <p className="text-error text-xs mb-4">{error}</p>}
                        <form className="space-y-6" onSubmit={handleSubmit}>
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
                                        value={account} 
                                        onChange={e => setAccount(e.target.value)}
                                        autoComplete="off"
                                    />
                                    {!isPhone && account.length > 0 && !account.includes('@') && (
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant/50 pointer-events-none text-sm font-medium">
                                            @gmail.com
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-2 ml-1" htmlFor="password">Mật Khẩu</label>
                                <input className="w-full bg-surface-container-lowest border-0 border-b border-outline-variant focus:border-primary focus:ring-0 text-on-surface placeholder:text-surface-container-highest transition-all duration-300 py-3 px-1" id="password" placeholder="••••••••" type="password" value={password} onChange={e => setPassword(e.target.value)}/>
                            </div>
                            <button className="w-full bg-primary-container text-on-primary-container font-headline font-extrabold uppercase tracking-widest py-4 mt-4 shadow-lg shadow-primary-container/20 hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2" type="submit">
                                Đăng Nhập
                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </button>
                            <div className="text-center pt-4">
                                <p className="text-xs text-on-surface-variant uppercase tracking-widest">
                                    Chưa có tài khoản? <Link className="text-primary font-bold hover:text-on-surface transition-colors" to="/register">Đăng Ký</Link>
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
                </div>
                <div className="font-['Inter'] text-xs uppercase tracking-widest text-gray-500">© 2024 RIMCINEMA. MỌc QUYỀN ĐƯỢC BẢO LƯU.</div>
            </footer>
        </div>
    )
}
