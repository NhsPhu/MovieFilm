import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Filter, Loader2 } from 'lucide-react'
import api from '../services/api'
import { movieService } from '../services/movieService'

export default function BrowsePage() {
    const navigate = useNavigate()
    
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
            // using the new backend filter endpoint
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
        <div className="min-h-screen bg-background text-foreground font-body texture-lines-opacity flex flex-col md:flex-row">
            
            {/* Sidebar Filters */}
            <aside className="w-full md:w-64 border-b-4 md:border-b-0 md:border-r-4 border-foreground p-6 sticky top-[80px] h-auto md:h-[calc(100vh-[80px])] overflow-y-auto">
                <div className="flex items-center gap-2 mb-8 border-b-2 border-foreground pb-4">
                    <Filter className="w-5 h-5" />
                    <h3 className="font-serif font-bold text-xl uppercase tracking-wider">Lọc Phim</h3>
                </div>

                {/* Sort By */}
                <div className="mb-6">
                    <h4 className="font-mono text-sm uppercase tracking-widest font-bold mb-3">Sắp xếp theo</h4>
                    <select 
                        className="w-full bg-transparent border-2 border-foreground p-2 font-mono text-sm focus:outline-none focus:bg-foreground focus:text-background transition-colors"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="newest">Mới nhất</option>
                        <option value="oldest">Cũ nhất</option>
                        <option value="views">Lượt xem</option>
                        <option value="rating">Đánh giá cao</option>
                    </select>
                </div>

                {/* Genre Filter */}
                <div className="mb-6">
                    <h4 className="font-mono text-sm uppercase tracking-widest font-bold mb-3">Thể loại</h4>
                    <select 
                        className="w-full bg-transparent border-2 border-foreground p-2 font-mono text-sm focus:outline-none focus:bg-foreground focus:text-background transition-colors"
                        value={selectedGenre}
                        onChange={(e) => setSelectedGenre(e.target.value)}
                    >
                        <option value="">Tất cả thể loại</option>
                        {genres.map(g => (
                            <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                    </select>
                </div>

                {/* Year Filter */}
                <div className="mb-6">
                    <h4 className="font-mono text-sm uppercase tracking-widest font-bold mb-3">Năm phát hành</h4>
                    <select 
                        className="w-full bg-transparent border-2 border-foreground p-2 font-mono text-sm focus:outline-none focus:bg-foreground focus:text-background transition-colors"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                    >
                        <option value="">Mọi năm</option>
                        {yearsToFilter.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-6 md:p-12">
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
                    {loading ? (
                        <div className="col-span-full flex justify-center py-20">
                            <Loader2 className="w-12 h-12 animate-spin text-foreground" />
                        </div>
                    ) : movies.length === 0 ? (
                        <div className="col-span-full text-center py-20">
                            <p className="font-serif text-2xl italic text-mutedForeground">Không tìm thấy bộ phim nào phù hợp với bộ lọc.</p>
                        </div>
                    ) : (
                        movies.map(movie => (
                            <div 
                                key={movie.id} 
                                onClick={() => navigate(`/movie/${movie.id}`)}
                                className="group cursor-pointer flex flex-col h-full bg-background border-[1px] border-foreground p-3 transition-colors duration-100 hover:bg-foreground hover:text-background"
                            >
                                <div className="relative aspect-[2/3] w-full mb-4 border-[1px] border-foreground overflow-hidden">
                                    <img
                                        src={movie.posterUrl || `https://picsum.photos/seed/${movie.id}/400/600`}
                                        alt={movie.title}
                                        className="object-cover w-full h-full grayscale transition-all duration-300 group-hover:grayscale-0 group-hover:scale-105"
                                    />
                                    <div className="absolute top-2 right-2 bg-background border border-foreground px-2 py-1 flex items-center gap-1 transition-colors duration-100 group-hover:bg-foreground group-hover:border-background">
                                        <span className="font-mono text-xs font-bold text-foreground group-hover:text-background">{movie.avgRating?.toFixed(1) || '0.0'}</span>
                                    </div>
                                </div>
                                <div className="flex-grow flex flex-col justify-between">
                                    <h3 className="font-serif font-bold text-lg leading-tight mb-2 uppercase line-clamp-2">
                                        {movie.title}
                                    </h3>
                                    <div className="flex justify-between items-end border-t border-foreground pt-2 mt-2 group-hover:border-background">
                                        <span className="font-mono text-xs">{movie.releaseYear}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-16 border-t-[4px] border-foreground pt-8 flex justify-center gap-2">
                        {Array.from({ length: totalPages }).map((_, idx) => {
                            const p = idx + 1;
                            return (
                                <button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    className={`w-10 h-10 border-2 font-mono text-sm transition-none flex items-center justify-center ${
                                        page === p
                                        ? 'bg-foreground text-background border-foreground'
                                        : 'bg-transparent text-foreground border-foreground hover:bg-foreground hover:text-background'
                                    }`}
                                >
                                    {p}
                                </button>
                            )
                        })}
                    </div>
                )}
            </main>
        </div>
    )
}
