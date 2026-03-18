import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import useAuthStore from '../store/useAuthStore'

export default function Navbar() {
    const navigate = useNavigate()
    const { logout, isAuthenticated, isAdmin } = useAuthStore()
    const [searchQuery, setSearchQuery] = useState('')

    const handleSearchSubmit = (e) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
        }
    }

    return (
        <header className="sticky top-0 z-50 bg-background border-b-[4px] border-foreground">
            <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-start">
                    <h1 
                        className="text-2xl md:text-3xl font-serif font-black tracking-tighter cursor-pointer lowercase"
                        onClick={() => navigate('/')}
                    >
                        moviestream<span className="text-[#000] inline-block w-3 h-3 bg-black ml-1"></span>
                    </h1>
                    <nav className="hidden md:flex items-center gap-6">
                        <button onClick={() => navigate('/browse')} className="font-mono text-sm uppercase font-bold hover:underline tracking-widest">
                            Phim Lẻ / Phân loại
                        </button>
                    </nav>
                </div>

                <div className="flex flex-col md:flex-row items-center w-full md:w-auto gap-4">
                    <form onSubmit={handleSearchSubmit} className="relative w-full md:w-64">
                        <label className="sr-only" htmlFor="search-nav">Tìm kiếm</label>
                        <Search className="absolute left-0 bottom-2 w-4 h-4 text-mutedForeground" />
                        <input
                            id="search-nav"
                            type="text"
                            placeholder="Tìm kiếm phim..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-transparent border-b-2 border-foreground pl-6 pr-2 py-1 font-mono text-sm focus:outline-none focus:border-b-[4px] transition-all"
                        />
                    </form>

                    <nav className="flex items-center gap-4 w-full md:w-auto justify-between">
                        <button onClick={() => navigate('/browse')} className="md:hidden font-mono text-xs uppercase font-bold hover:underline tracking-widest">
                            Phân loại
                        </button>
                        
                        <div className="flex items-center gap-4">
                            {isAuthenticated() ? (
                                <>
                                    {isAdmin() && (
                                        <button 
                                            onClick={() => navigate('/admin')}
                                            className="border-2 border-foreground px-3 py-1 text-xs md:text-sm font-medium uppercase tracking-widest hover:bg-foreground hover:text-background transition-none"
                                        >
                                            Admin
                                        </button>
                                    )}
                                    <button 
                                        onClick={logout}
                                        className="border-none bg-transparent hover:underline text-xs md:text-sm font-medium uppercase tracking-widest"
                                    >
                                        Đăng xuất
                                    </button>
                                </>
                            ) : (
                                <button 
                                    onClick={() => navigate('/login')}
                                    className="bg-foreground text-background px-4 py-2 text-xs md:text-sm font-medium uppercase tracking-widest hover:bg-background hover:text-foreground border-2 border-transparent hover:border-foreground transition-none"
                                >
                                    Đăng nhập
                                </button>
                            )}
                        </div>
                    </nav>
                </div>
            </div>
        </header>
    )
}
