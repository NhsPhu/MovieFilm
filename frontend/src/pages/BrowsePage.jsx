import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Filter, Loader2, Play } from 'lucide-react'
import api from '../services/api'
import { movieService } from '../services/movieService'

export default function BrowsePage() {
    const [genres, setGenres] = useState([])
    const [movies, setMovies] = useState([])
    
    // Filters State
    const [selectedGenre, setSelectedGenre] = useState('')
    const [selectedYear, setSelectedYear] = useState('')
    const [sortBy, setSortBy] = useState('newest')
    
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(0)
    const [loading, setLoading] = useState(true)

    // Years for filter dropdown (e.g. 2026 to 2000)
    const currentYear = new Date().getFullYear();
    const yearsToFilter = Array.from({length: 27}, (_, i) => currentYear - i);

    useEffect(() => {
        movieService.getGenres().then(setGenres).catch(console.error)
    }, [])

    const fetchFilteredMovies = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (selectedGenre) params.append('genreId', selectedGenre)
            if (selectedYear) params.append('year', selectedYear)
            params.append('sortBy', sortBy)
            params.append('page', page - 1)
            params.append('size', 20)

            const response = await api.get(`/movies/filter?${params.toString()}`)
            const data = response.data
            setMovies(data.content || [])
            setTotalPages(data.totalPages || 0)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }, [selectedGenre, selectedYear, sortBy, page])

    useEffect(() => {
        setPage(1)
    }, [selectedGenre, selectedYear, sortBy])

    useEffect(() => {
        fetchFilteredMovies()
    }, [fetchFilteredMovies])

    return (
        <div className="px-4 md:px-12 py-8 relative z-10 w-full min-h-[80vh]">
            {/* Header & Filters */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                    <span className="text-[10px] font-black tracking-[0.2em] text-primary uppercase block mb-1">Khám Phá</span>
                    <h1 className="text-2xl md:text-4xl font-headline font-bold text-white tracking-tight">Tất Cả Phim</h1>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 text-on-surface-variant mr-2">
                        <Filter className="w-4 h-4" />
                        <span className="text-sm font-bold uppercase tracking-widest hidden sm:block">Bộ Lọc</span>
                    </div>

                    <select 
                        className="bg-surface-container/80 text-white text-sm font-bold border border-outline-variant/30 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none cursor-pointer"
                        value={selectedGenre}
                        onChange={(e) => setSelectedGenre(e.target.value)}
                    >
                        <option value="">Tất cả thể loại</option>
                        {genres.map(g => (
                            <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                    </select>

                    <select 
                        className="bg-surface-container/80 text-white text-sm font-bold border border-outline-variant/30 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none cursor-pointer"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                    >
                        <option value="">Mọi năm phát hành</option>
                        {yearsToFilter.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>

                    <select 
                        className="bg-surface-container/80 text-white text-sm font-bold border border-outline-variant/30 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none cursor-pointer"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="newest">Mới nhất</option>
                        <option value="oldest">Cũ nhất</option>
                        <option value="views">Lượt xem</option>
                        <option value="rating">Đánh giá cao</option>
                    </select>
                </div>
            </div>

            {/* Main Content Area */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 opacity-70">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                    <p className="text-sm font-bold tracking-widest text-on-surface-variant uppercase">Đang tải phim...</p>
                </div>
            ) : movies.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 bg-surface-container/30 rounded-2xl border border-outline-variant/20 border-dashed">
                    <span className="material-symbols-outlined text-6xl text-on-surface-variant/50 mb-4">movie_off</span>
                    <p className="font-headline text-xl text-on-surface-variant font-bold">Không tìm thấy bộ phim nào phù hợp</p>
                    <button onClick={() => {setSelectedGenre(''); setSelectedYear(''); setSortBy('newest');}} className="mt-6 text-primary hover:text-primary/80 font-bold uppercase tracking-wider text-sm transition-colors">Xóa bộ lọc</button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                        {movies.map(movie => (
                            <Link 
                                key={movie.id} 
                                to={`/movie/${movie.id}`}
                                className="group relative aspect-[2/3] bg-surface-container rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:z-20 hover:ring-2 ring-outline-variant/40 block"
                            >
                                <img
                                    src={movie.posterUrl || ''}
                                    alt={movie.title}
                                    className="object-cover w-full h-full opacity-90 group-hover:opacity-100 transition-opacity"
                                />
                                {movie.avgRating > 0 && (
                                    <div className="absolute top-2 right-2 bg-primary-container/90 backdrop-blur-sm text-on-primary-container font-black text-[10px] px-1.5 py-0.5 rounded shadow-xl">
                                        {(movie.avgRating).toFixed(1)}
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent flex flex-col justify-end p-3 md:p-4">
                                    <h3 className="font-headline font-bold text-white text-xs md:text-sm line-clamp-2 leading-snug mb-1">
                                        {movie.title}
                                    </h3>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-[10px] text-primary font-bold">{movie.releaseYear}</span>
                                    </div>
                                </div>
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-primary transition-colors hover:scale-110">
                                        <Play className="w-5 h-5 ml-1 fill-current" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-16 flex justify-center gap-2">
                            {Array.from({ length: totalPages }).map((_, idx) => {
                                const p = idx + 1;
                                return (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        className={`w-10 h-10 rounded-lg font-headline font-bold text-sm transition-all flex items-center justify-center ${
                                            page === p
                                            ? 'bg-primary-container text-on-primary-container scale-110 shadow-[0_0_15px_rgba(229,9,20,0.3)]'
                                            : 'bg-surface-container text-on-surface hover:bg-white/10'
                                        }`}
                                    >
                                        {p}
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
