import { useState } from 'react'
import { Link } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'

export default function Navbar() {
    const { user, token, logout } = useAuthStore()
    const isAuthenticated = !!token
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    return (
        <>
            <nav className="fixed top-0 w-full z-50 bg-[#131313]/80 backdrop-blur-xl flex justify-between items-center px-4 md:px-12 h-16 md:h-20 border-b border-outline-variant/10">
                <div className="flex items-center gap-4 md:gap-12">
                    {/* Hamburger Button (Mobile Only) */}
                    <button 
                        className="md:hidden text-white flex items-center justify-center p-1"
                        onClick={() => setIsMobileMenuOpen(true)}
                    >
                        <span className="material-symbols-outlined text-2xl">menu</span>
                    </button>

                    <Link to="/" className="text-xl md:text-2xl font-black text-[#E50914] uppercase tracking-tighter font-headline">RimCinema</Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex gap-6 items-center">
                        <Link className="font-headline font-bold tracking-tight text-white border-b-2 border-[#E50914] pb-1" to="/">Trang Chủ</Link>
                        <Link className="font-headline font-bold tracking-tight text-gray-400 hover:text-white transition-colors" to="/browse">Duyệt Phim</Link>
                        <Link className="font-headline font-bold tracking-tight text-gray-400 hover:text-white transition-colors" to="/search">Phim Bộ</Link>
                        <Link className="font-headline font-bold tracking-tight text-gray-400 hover:text-white transition-colors" to="/search">Phim Lẻ</Link>
                        <Link className="font-headline font-bold tracking-tight text-gray-400 hover:text-white transition-colors" to="/search">Mới & Phổ Biến</Link>
                        <Link className="font-headline font-bold tracking-tight text-gray-400 hover:text-white transition-colors" to="/profile">Danh Sách</Link>
                    </div>
                </div>

                <div className="flex items-center gap-4 md:gap-6">
                    <Link to="/search"><span className="material-symbols-outlined cursor-pointer hover:scale-105 transition-transform duration-300 text-xl md:text-2xl">search</span></Link>
                    <span className="material-symbols-outlined cursor-pointer hover:scale-105 transition-transform duration-300 text-xl md:text-2xl hidden sm:block">notifications</span>
                    {isAuthenticated ? (
                        <div className="relative group">
                            <div className="w-8 h-8 rounded-lg overflow-hidden border border-outline-variant/30 active:opacity-80 transition-all cursor-pointer bg-surface-container-high flex items-center justify-center">
                                <span className="material-symbols-outlined text-on-surface-variant text-xl">person</span>
                            </div>
                            <div className="absolute right-0 mt-2 w-48 bg-[#201F1F] border border-outline-variant/20 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                <div className="p-3 border-b border-outline-variant/10">
                                    <p className="text-sm font-bold text-white line-clamp-1">{user?.fullName || user?.username}</p>
                                    <p className="text-[10px] text-gray-500 line-clamp-1">{user?.email || user?.phoneNumber}</p>
                                </div>
                                <Link to="/profile" className="block px-3 py-2 text-xs text-gray-400 hover:text-white hover:bg-[#2A2A2A] transition-colors">Hồ Sơ Của Tôi</Link>
                                {user?.role === 'ADMIN' && (
                                    <Link to="/admin" className="block px-3 py-2 text-xs text-gray-400 hover:text-white hover:bg-[#2A2A2A] transition-colors">Bảng Quản Trị</Link>
                                )}
                                <button onClick={logout} className="w-full text-left px-3 py-2 text-xs text-gray-400 hover:text-white hover:bg-[#2A2A2A] transition-colors">Đăng Xuất</button>
                            </div>
                        </div>
                    ) : (
                        <Link to="/login" className="text-xs md:text-sm font-headline font-bold text-gray-400 hover:text-white transition-colors bg-white/5 py-1.5 md:py-2 px-3 md:px-4 rounded-full border border-white/10 hover:bg-white/10">Đăng Nhập</Link>
                    )}
                </div>
            </nav>

            {/* Mobile Off-Canvas Menu */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-[100] md:hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
                    <div className="absolute top-0 left-0 w-64 h-full bg-surface-container-lowest shadow-2xl flex flex-col transform transition-transform border-r border-outline-variant/10 animate-[slideIn_0.3s_ease-out]">
                        <div className="p-5 border-b border-outline-variant/10 flex justify-between items-center">
                            <span className="text-xl font-black text-[#E50914] uppercase tracking-tighter font-headline">RimCinema</span>
                            <button onClick={() => setIsMobileMenuOpen(false)} className="text-on-surface-variant hover:text-white">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-2">
                            <Link onClick={() => setIsMobileMenuOpen(false)} to="/" className="px-4 py-3 rounded-xl bg-surface-container-low text-white font-headline font-bold text-sm tracking-wide">Trang Chủ</Link>
                            <Link onClick={() => setIsMobileMenuOpen(false)} to="/browse" className="px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container-low hover:text-white font-headline font-bold text-sm tracking-wide transition-all">Duyệt Phim</Link>
                            <Link onClick={() => setIsMobileMenuOpen(false)} to="/search" className="px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container-low hover:text-white font-headline font-bold text-sm tracking-wide transition-all">Phim Bộ</Link>
                            <Link onClick={() => setIsMobileMenuOpen(false)} to="/search" className="px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container-low hover:text-white font-headline font-bold text-sm tracking-wide transition-all">Phim Lẻ</Link>
                            <Link onClick={() => setIsMobileMenuOpen(false)} to="/search" className="px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container-low hover:text-white font-headline font-bold text-sm tracking-wide transition-all">Mới & Phổ Biến</Link>
                            <Link onClick={() => setIsMobileMenuOpen(false)} to="/profile" className="px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container-low hover:text-white font-headline font-bold text-sm tracking-wide transition-all">Danh Sách Của Tôi</Link>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
