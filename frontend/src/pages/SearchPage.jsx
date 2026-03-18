import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, Loader2 } from 'lucide-react'
import { movieService } from '../services/movieService'

export default function SearchPage() {
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()
    
    const query = searchParams.get('q') || ''
    
    const [movies, setMovies] = useState([])
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!query.trim()) {
            setMovies([])
            setTotalPages(0)
            setLoading(false)
            return
        }

        const fetchResults = async () => {
            setLoading(true)
            try {
                const data = await movieService.searchMovies(query, page - 1, 20)
                setMovies(data.content || [])
                setTotalPages(data.totalPages || 0)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchResults()
    }, [query, page])

    const formatDuration = (secs) => {
        if (!secs) return ''
        const h = Math.floor(secs / 3600)
        const m = Math.floor((secs % 3600) / 60)
        return h > 0 ? `${h}h ${m}m` : `${m}m`
    }

    return (
        <div className="min-h-screen bg-background text-foreground font-body texture-lines-opacity">
            <main className="max-w-6xl mx-auto px-6 py-12">
                <div className="mb-12 border-b-4 border-foreground pb-6">
                    <h2 className="text-4xl md:text-5xl font-serif font-black tracking-tighter">
                        Tìm kiếm: <span className="font-light italic">{query || '...'}</span>
                    </h2>
                    <p className="font-mono text-sm mt-4 uppercase tracking-widest">
                        {movies.length > 0 ? `Hiển thị ${movies.length} kết quả` : 'Không có kết quả'}
                    </p>
                </div>

                {/* Movie Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
                    {loading ? (
                        <div className="col-span-full flex justify-center py-20">
                            <Loader2 className="w-12 h-12 animate-spin text-foreground" />
                        </div>
                    ) : movies.length === 0 ? (
                        <div className="col-span-full text-center py-20">
                            <Search className="w-16 h-16 mx-auto mb-4 text-mutedForeground opacity-50" />
                            <p className="font-serif text-2xl italic text-mutedForeground">
                                {query ? 'Không tìm thấy bộ phim nào phù hợp.' : 'Nhập từ khóa để bắt đầu tìm kiếm.'}
                            </p>
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
                                        {movie.durationSec && (
                                            <span className="font-mono text-xs">{formatDuration(movie.durationSec)}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-20 border-t-[4px] border-foreground pt-8 flex justify-center gap-2">
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
