import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'

export default function AdminLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    return (
        <div className="bg-background text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container flex">
            <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <main className="flex-1 md:ml-64 min-h-screen max-w-full overflow-hidden">
                {/* TopNavBar */}
                <header className="flex justify-between items-center px-4 md:px-8 py-4 w-full sticky top-0 z-30 bg-[#131313]/80 backdrop-blur-xl gap-4 border-b border-outline-variant/10">
                    <div className="flex items-center gap-4 flex-1 max-w-xl">
                        <button className="md:hidden text-white hover:text-primary transition-colors flex items-center shrink-0" onClick={() => setIsSidebarOpen(true)}>
                            <span className="material-symbols-outlined text-2xl">menu</span>
                        </button>
                        <div className="relative w-full group">
                            <span className="material-symbols-outlined absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-stone-500 group-focus-within:text-primary transition-colors text-lg md:text-xl">search</span>
                            <input className="w-full bg-surface-container-lowest border-none focus:ring-0 text-xs md:text-sm py-2.5 md:py-3 pl-10 md:pl-12 pr-4 rounded-xl border-b-2 border-transparent focus:border-[#E50914] transition-all" placeholder="Tìm kiếm..." type="text"/>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 md:gap-6 shrink-0">
                        <button className="text-stone-400 hover:text-white transition-colors relative">
                            <span className="material-symbols-outlined">notifications</span>
                            <span className="absolute top-0 right-0 w-2 h-2 bg-primary-container rounded-full border-2 border-[#131313]"></span>
                        </button>
                        <button className="text-stone-400 hover:text-white transition-colors">
                            <span className="material-symbols-outlined">help</span>
                        </button>
                    </div>
                </header>
                <div className="p-4 md:p-8 overflow-x-hidden">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}
