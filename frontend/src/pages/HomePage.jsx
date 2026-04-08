import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { movieService } from '../services/movieService'
import { historyService } from '../services/historyService'
import useAuthStore from '../store/useAuthStore'

export default function HomePage() {
    const { user } = useAuthStore()
    const [movies, setMovies] = useState([])
    const [watchHistory, setWatchHistory] = useState([])

    useEffect(() => {
        movieService.getMovies(0, 20).then(data => setMovies(data.content || data || [])).catch(() => setMovies([]))
        
        if (user) {
            historyService.getWatchHistory()
                .then(data => {
                    // Filter out finished movies for continue watching
                    const inProgress = (data || []).filter(item => !item.isFinished && item.currentTimeSec > 0)
                    setWatchHistory(inProgress.slice(0, 3)) // top 3
                })
                .catch(() => setWatchHistory([]))
        } else {
            setWatchHistory([])
        }
    }, [user])

    const hero = movies[0]
    const trending = movies.slice(0, 5)
    const topRated = movies.slice(0, 6)

    // Fallback if no real history
    const continueWatching = watchHistory.length > 0 
        ? watchHistory 
        : movies.filter(m => m.id !== hero?.id).slice(3, 6).map(m => ({
            movieId: m.id,
            movieTitle: m.title,
            posterUrl: m.posterUrl,
            backdropUrl: m.backdropUrl,
            currentTimeSec: Math.random() * 2000, 
            isFinished: false,
            // Add a mock property to distinguish mock from real
            isMock: true 
        }))

    const getProgressPercent = (item) => {
        return item.isFinished ? 100 : Math.min(Math.floor((item.currentTimeSec / (120*60)) * 100) + 5, 95)
    }

    return (
        <>
            {/* Hero Section */}
            <section className="relative min-h-[600px] md:h-[870px] w-full overflow-hidden -mt-16 md:-mt-20">
                <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: `url('${hero?.backdropUrl || hero?.posterUrl || ""}')`}}>
                    <div className="absolute inset-0 hero-gradient"></div>
                </div>
                <div className="absolute bottom-12 left-4 md:bottom-24 md:left-12 max-w-2xl space-y-4 md:space-y-6 px-2 md:px-0">
                    <div className="flex items-center gap-3">
                        <span className="bg-primary-container text-on-primary-container px-3 py-1 text-[10px] font-black tracking-widest uppercase rounded-sm">Nổi Bật</span>
                        <span className="text-tertiary font-label text-[10px] md:text-xs font-bold uppercase tracking-tighter">{hero?.director ? `Đạo diễn: ${hero.director}` : ''}</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-headline font-extrabold tracking-tighter text-white leading-tight line-clamp-2 md:line-clamp-3">{hero?.title || ''}</h1>
                    <p className="text-on-surface-variant font-body text-sm md:text-base leading-relaxed max-w-lg line-clamp-3 md:line-clamp-4">
                        {hero?.description || ''}
                    </p>
                    <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 pt-4 w-full sm:w-auto">
                        <Link to={hero ? `/watch/${hero.id}` : '#'} className="bg-primary-container text-on-primary-container w-full sm:w-auto px-8 py-3 md:py-4 rounded-lg font-headline font-bold flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-[0_0_15px_rgba(229,9,20,0.2)]">
                            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>play_arrow</span>
                            Xem Ngay
                        </Link>
                        <Link to={hero ? `/movie/${hero.id}` : '#'} className="bg-surface-container/70 backdrop-blur-md text-white w-full sm:w-auto border border-outline-variant/30 px-8 py-3 md:py-4 rounded-lg font-headline font-bold flex items-center justify-center gap-2 hover:bg-surface-container transition-colors">
                            <span className="material-symbols-outlined">info</span>
                            Chi Tiết
                        </Link>
                    </div>
                </div>
            </section>

            {/* Content Rows */}
            <div className="px-4 md:px-12 -mt-10 md:-mt-16 relative z-10 space-y-12 md:space-y-20 pb-20">
                {/* Trending Now */}
                <section>
                    <div className="flex justify-between items-end mb-4 md:mb-6">
                        <div>
                            <span className="text-[10px] font-black tracking-[0.2em] text-primary uppercase block mb-1">Chọn Lọc</span>
                            <h2 className="text-xl md:text-2xl font-headline font-bold tracking-tight text-on-surface">Thịnh Hành</h2>
                        </div>
                        <Link className="text-[10px] md:text-xs font-bold text-outline hover:text-white transition-colors" to="/search">XEM TẤT CẢ</Link>
                    </div>
                    <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory">
                        {(trending.length > 0 ? trending : []).map((movie, i) => (
                            <Link key={movie?.id || i} to={movie ? `/movie/${movie.id}` : '#'} className="group relative flex-none w-[65vw] sm:w-60 md:w-72 aspect-video bg-surface-container rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:ring-2 ring-outline-variant/40 snap-center">
                                <img alt={movie?.title || ''} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" src={movie?.posterUrl || movie?.backdropUrl || ''}/>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-3 md:p-4">
                                    <h4 className="text-xs md:text-sm font-bold font-headline text-white line-clamp-1">{movie?.title || ''}</h4>
                                    <div className="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-[10px] text-primary font-bold">{movie?.releaseYear || ''}</span>
                                        <span className="text-[10px] text-gray-400 hidden md:inline">{movie?.duration ? `${Math.floor(movie.duration/60)}h ${movie.duration%60}m` : ''}</span>
                                    </div>
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary-container flex items-center justify-center text-white">
                                        <span className="material-symbols-outlined md:text-2xl" style={{fontVariationSettings: "'FILL' 1"}}>play_arrow</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Continue Watching (Bento Layout) */}
                {continueWatching.length > 0 && (
                <section>
                    <div className="mb-4 md:mb-6">
                        <h2 className="text-xl md:text-2xl font-headline font-bold tracking-tight text-on-surface">Đang Xem</h2>
                    </div>
                    <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 md:gap-6 lg:min-h-[450px]">
                        {continueWatching[0] && (
                        <Link to={`/watch/${continueWatching[0].movieId}`} className="group relative col-span-1 lg:col-span-2 aspect-[16/10] lg:aspect-auto lg:h-full bg-surface-container rounded-xl overflow-hidden hover:ring-2 ring-outline-variant/40 transition-all cursor-pointer block">
                            <img alt={continueWatching[0].movieTitle || "Movie"} className="w-full h-full object-cover" src={continueWatching[0].backdropUrl || continueWatching[0].posterUrl || ""}/>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 md:p-8 flex flex-col justify-end">
                                <span className="text-primary text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1 md:mb-2">Tiếp Tục</span>
                                <h3 className="text-xl md:text-3xl font-headline font-bold text-white mb-3 md:mb-4 line-clamp-1">{continueWatching[0].movieTitle || ''}</h3>
                                <div className="w-full h-1 bg-surface-variant rounded-full overflow-hidden">
                                    <div className="h-full bg-primary shadow-[0_0_10px_rgba(255,180,170,0.5)]" style={{width: `${getProgressPercent(continueWatching[0])}%`}}></div>
                                </div>
                            </div>
                        </Link>
                        )}
                        <div className="flex flex-col gap-4 md:gap-6 h-full">
                            {continueWatching[1] && (
                            <Link to={`/watch/${continueWatching[1].movieId}`} className="group relative aspect-video lg:aspect-auto lg:flex-1 min-h-[160px] bg-surface-container rounded-xl overflow-hidden hover:ring-2 ring-outline-variant/40 transition-all cursor-pointer block">
                                <img alt={continueWatching[1].movieTitle || "Series"} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" src={continueWatching[1].backdropUrl || continueWatching[1].posterUrl || ""}/>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-3 md:p-4 flex flex-col justify-end">
                                    <h4 className="text-white font-headline text-xs md:text-base font-bold line-clamp-1">{continueWatching[1].movieTitle || ''}</h4>
                                    <div className="w-full h-1 bg-surface-variant rounded-full overflow-hidden mt-1.5 md:mt-2"><div className="h-full bg-primary" style={{width: `${getProgressPercent(continueWatching[1])}%`}}></div></div>
                                </div>
                            </Link>
                            )}
                            {continueWatching[2] && (
                            <Link to={`/watch/${continueWatching[2].movieId}`} className="group relative aspect-video lg:aspect-auto lg:flex-1 min-h-[160px] bg-surface-container rounded-xl overflow-hidden hover:ring-2 ring-outline-variant/40 transition-all cursor-pointer block">
                                <img alt={continueWatching[2].movieTitle || "Series"} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" src={continueWatching[2].backdropUrl || continueWatching[2].posterUrl || ""}/>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-3 md:p-4 flex flex-col justify-end">
                                    <h4 className="text-white font-headline text-xs md:text-base font-bold line-clamp-1">{continueWatching[2].movieTitle || ''}</h4>
                                    <div className="w-full h-1 bg-surface-variant rounded-full overflow-hidden mt-1.5 md:mt-2"><div className="h-full bg-primary" style={{width: `${getProgressPercent(continueWatching[2])}%`}}></div></div>
                                </div>
                            </Link>
                            )}
                        </div>
                    </div>
                </section>
                )}

                {/* Top Rated (Portrait Posters) */}
                <section>
                    <div className="mb-4 md:mb-6">
                        <h2 className="text-xl md:text-2xl font-headline font-bold tracking-tight text-on-surface">Đánh Giá Cao</h2>
                    </div>
                    <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory">
                        {(topRated.length > 0 ? topRated : []).map((movie, i) => (
                            <Link key={movie?.id || i} to={movie ? `/movie/${movie.id}` : '#'} className="group relative flex-none w-[35vw] sm:w-36 md:w-48 aspect-[2/3] bg-surface-container rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:z-20 snap-start">
                                <img alt={movie?.title || ''} className="w-full h-full object-cover" src={movie?.posterUrl || ''}/>
                                {movie?.avgRating && <div className="absolute top-2 right-2 bg-primary-container text-on-primary-container font-black text-[10px] px-1.5 py-0.5 rounded shadow-xl">{movie.avgRating.toFixed(1)}</div>}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2 md:p-3">
                                    <h4 className="text-[10px] md:text-xs font-bold text-white line-clamp-2 leading-tight">{movie?.title || ''}</h4>
                                </div>
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                                    <button className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-primary transition-colors">
                                        <span className="material-symbols-outlined text-sm md:text-base" style={{fontVariationSettings: "'FILL' 1"}}>play_arrow</span>
                                    </button>
                                    <span className="text-white text-[8px] md:text-[10px] font-bold uppercase tracking-widest hidden md:block">XEM NGAY</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            </div>
        </>
    )
}
