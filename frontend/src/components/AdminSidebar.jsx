import { Link, useLocation } from 'react-router-dom'

const navItems = [
    { path: '/admin', icon: 'dashboard', label: 'Tổng Quan' },
    { path: '/admin/movies', icon: 'movie', label: 'Phim' },
    { path: '/admin/users', icon: 'group', label: 'Người Dùng' },
    { path: '/admin/analytics', icon: 'monitoring', label: 'Thống Kê' },
    { path: '/admin/settings', icon: 'settings', label: 'Cài Đặt' },
]

export default function AdminSidebar({ isOpen, setIsOpen }) {
    const location = useLocation()
    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsOpen(false)}></div>
            )}
            
            <aside className={`bg-stone-900 dark:bg-[#131313] h-screen w-64 fixed left-0 top-0 flex flex-col py-6 px-4 shadow-[20px_0_40px_rgba(0,0,0,0.5)] z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
            <div className="mb-10 px-2 flex justify-between items-center">
                <div>
                    <Link to="/"><span className="text-2xl font-black text-[#E50914] tracking-tighter">RimCinema</span></Link>
                    <p className="text-stone-500 text-[10px] uppercase tracking-[0.2em] font-bold mt-1">Bảng Quản Trị</p>
                </div>
                <button className="md:hidden text-stone-400 hover:text-white" onClick={() => setIsOpen(false)}>
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>
            <nav className="space-y-2 flex-grow">
                {navItems.map(item => {
                    const isActive = location.pathname === item.path
                    return (
                        <Link key={item.path} to={item.path}
                            className={isActive
                                ? "flex items-center gap-4 px-4 py-3 rounded-lg text-[#FFB4AA] font-bold border-r-4 border-[#E50914] bg-stone-800/50 scale-105 transition-transform"
                                : "flex items-center gap-4 px-4 py-3 rounded-lg text-stone-400 font-medium hover:bg-stone-800/80 hover:text-white transition-all duration-300"
                            }>
                            <span className="material-symbols-outlined">{item.icon}</span>
                            <span className="font-manrope">{item.label}</span>
                        </Link>
                    )
                })}
            </nav>
            <div className="mt-auto pt-6 border-t border-stone-800/50 flex items-center gap-3 px-2">
                <div className="w-10 h-10 rounded-full bg-surface-container-high overflow-hidden border border-outline-variant/30 shrink-0">
                    <span className="material-symbols-outlined text-on-surface-variant text-2xl flex items-center justify-center w-full h-full">admin_panel_settings</span>
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-bold text-on-surface truncate">Quản Trị Viên</p>
                    <p className="text-[10px] text-stone-500 uppercase tracking-wider truncate">Quản Trị Viên Cao Cấp</p>
                </div>
            </div>
        </aside>
        </>
    )
}
