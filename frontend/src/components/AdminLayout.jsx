import { Outlet } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'

export default function AdminLayout() {
    return (
        <div className="bg-background text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container">
            <AdminSidebar />
            <main className="ml-64 min-h-screen">
                {/* TopNavBar */}
                <header className="flex justify-between items-center px-8 py-4 w-full sticky top-0 z-40 bg-[#131313]/80 backdrop-blur-xl">
                    <div className="flex items-center flex-1 max-w-xl">
                        <div className="relative w-full group">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 group-focus-within:text-primary transition-colors">search</span>
                            <input className="w-full bg-surface-container-lowest border-none focus:ring-0 text-sm py-3 pl-12 pr-4 rounded-xl border-b-2 border-transparent focus:border-[#E50914] transition-all" placeholder="Search..." type="text"/>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 ml-8">
                        <button className="text-stone-400 hover:text-white transition-colors relative">
                            <span className="material-symbols-outlined">notifications</span>
                            <span className="absolute top-0 right-0 w-2 h-2 bg-primary-container rounded-full border-2 border-[#131313]"></span>
                        </button>
                        <button className="text-stone-400 hover:text-white transition-colors">
                            <span className="material-symbols-outlined">help</span>
                        </button>
                    </div>
                </header>
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}
