import { Link } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'

export default function Navbar() {
    const { user, isAuthenticated, logout } = useAuthStore()
    return (
        <nav className="fixed top-0 w-full z-50 bg-[#131313]/80 backdrop-blur-xl flex justify-between items-center px-12 h-20">
            <div className="flex items-center gap-12">
                <Link to="/" className="text-2xl font-black text-[#E50914] uppercase tracking-tighter font-headline">RimCinema</Link>
                <div className="hidden md:flex gap-6 items-center">
                    <Link className="font-headline font-bold tracking-tight text-white border-b-2 border-[#E50914] pb-1" to="/">Trang Chủ</Link>
                    <Link className="font-headline font-bold tracking-tight text-gray-400 hover:text-white transition-colors" to="/search">Phim Bộ</Link>
                    <Link className="font-headline font-bold tracking-tight text-gray-400 hover:text-white transition-colors" to="/search">Phim Lẻ</Link>
                    <Link className="font-headline font-bold tracking-tight text-gray-400 hover:text-white transition-colors" to="/search">Mới & Phổ Biến</Link>
                    <Link className="font-headline font-bold tracking-tight text-gray-400 hover:text-white transition-colors" to="/profile">Danh Sách</Link>
                </div>
            </div>
            <div className="flex items-center gap-6">
                <Link to="/search"><span className="material-symbols-outlined cursor-pointer hover:scale-105 transition-transform duration-300">search</span></Link>
                <span className="material-symbols-outlined cursor-pointer hover:scale-105 transition-transform duration-300">notifications</span>
                {isAuthenticated ? (
                    <div className="relative group">
                        <div className="w-8 h-8 rounded-lg overflow-hidden border border-outline-variant/30 active:opacity-80 transition-all cursor-pointer">
                            <span className="material-symbols-outlined text-on-surface-variant text-xl flex items-center justify-center w-full h-full bg-surface-container-high">person</span>
                        </div>
                        <div className="absolute right-0 mt-2 w-48 bg-[#201F1F] border border-outline-variant/20 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                            <div className="p-3 border-b border-outline-variant/10">
                                <p className="text-sm font-bold text-white">{user?.username}</p>
                                <p className="text-[10px] text-gray-500">{user?.email}</p>
                            </div>
                            <Link to="/profile" className="block px-3 py-2 text-xs text-gray-400 hover:text-white hover:bg-[#2A2A2A] transition-colors">Hồ Sơ Của Tôi</Link>
                            {user?.role === 'ADMIN' && (
                                <Link to="/admin" className="block px-3 py-2 text-xs text-gray-400 hover:text-white hover:bg-[#2A2A2A] transition-colors">Bảng Quản Trị</Link>
                            )}
                            <button onClick={logout} className="w-full text-left px-3 py-2 text-xs text-gray-400 hover:text-white hover:bg-[#2A2A2A] transition-colors">Đăng Xuất</button>
                        </div>
                    </div>
                ) : (
                    <Link to="/login" className="text-sm font-headline font-bold text-gray-400 hover:text-white transition-colors">Đăng Nhập</Link>
                )}
            </div>
        </nav>
    )
}
