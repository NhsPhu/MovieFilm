import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { movieService } from '../services/movieService'

export default function HomePage() {
    const [movies, setMovies] = useState([])
    useEffect(() => {
        movieService.getMovies(0, 20).then(data => setMovies(data.content || data || [])).catch(() => setMovies([]))
    }, [])
    const hero = movies[0]
    const trending = movies.slice(0, 5)
    const topRated = movies.slice(0, 6)
    const continueWatching = movies.filter(m => m.id !== hero?.id).slice(3, 6)

    return (
        <>
            {/* Hero Section */}
            <section className="relative h-[870px] w-full overflow-hidden -mt-20">
                <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: `url('${hero?.backdropUrl || hero?.posterUrl || ""}')`}}>
                    <div className="absolute inset-0 hero-gradient"></div>
                </div>
                <div className="absolute bottom-24 left-12 max-w-2xl space-y-6">
                    <div className="flex items-center gap-3">
                        <span className="bg-primary-container text-on-primary-container px-3 py-1 text-[10px] font-black tracking-widest uppercase rounded-sm">Nổi Bật</span>
                        <span className="text-tertiary font-label text-xs font-bold uppercase tracking-tighter">{hero?.director ? `Đạo diễn: ${hero.director}` : ''}</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-extrabold tracking-tighter text-white leading-tight line-clamp-2">{hero?.title || ''}</h1>
                    <p className="text-on-surface-variant font-body text-base leading-relaxed max-w-lg line-clamp-3">
                        {hero?.description || ''}
                    </p>
                    <div className="flex items-center gap-4 pt-4">
                        <Link to={hero ? `/watch/${hero.id}` : '#'} className="bg-primary-container text-on-primary-container px-8 py-3 rounded-lg font-headline font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-[0_0_15px_rgba(229,9,20,0.2)]">
                            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>play_arrow</span>
                            Xem Ngay
                        </Link>
                        <Link to={hero ? `/movie/${hero.id}` : '#'} className="bg-surface-container/70 backdrop-blur-md text-white border border-outline-variant/30 px-8 py-3 rounded-lg font-headline font-bold flex items-center gap-2 hover:bg-surface-container transition-colors">
                            <span className="material-symbols-outlined">info</span>
                            Chi Tiết
                        </Link>
                    </div>
                </div>
            </section>

            {/* Content Rows */}
            <div className="px-12 -mt-16 relative z-10 space-y-20 pb-20">
                {/* Trending Now */}
                <section>
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <span className="text-[10px] font-black tracking-[0.2em] text-primary uppercase block mb-1">Chọn Lọc</span>
                            <h2 className="text-2xl font-headline font-bold tracking-tight text-on-surface">Thịnh Hành</h2>
                        </div>
                        <Link className="text-xs font-bold text-outline hover:text-white transition-colors" to="/search">XEM TẤT CẢ</Link>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
                        {(trending.length > 0 ? trending : []).map((movie, i) => (
                            <Link key={movie?.id || i} to={movie ? `/movie/${movie.id}` : '#'} className="group relative flex-none w-72 h-44 bg-surface-container rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:ring-2 ring-outline-variant/40">
                                <img alt={movie?.title || ''} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" src={movie?.posterUrl || movie?.backdropUrl || ''}/>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-4">
                                    <h4 className="text-sm font-bold font-headline text-white line-clamp-1">{movie?.title || ''}</h4>
                                    <div className="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-[10px] text-primary font-bold">{movie?.releaseYear || ''}</span>
                                        <span className="text-[10px] text-gray-400">{movie?.duration ? `${Math.floor(movie.duration/60)}h ${movie.duration%60}m` : ''}</span>
                                    </div>
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                                    <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-white">
                                        <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>play_arrow</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Continue Watching (Bento Layout) */}
                {continueWatching.length > 0 && (
                <section>
                    <div className="mb-6">
                        <h2 className="text-2xl font-headline font-bold tracking-tight text-on-surface">Đang Xem</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{height: '400px'}}>
                        {continueWatching[0] && (
                        <Link to={`/watch/${continueWatching[0].id}`} className="group relative col-span-1 md:col-span-2 bg-surface-container rounded-xl overflow-hidden hover:ring-2 ring-outline-variant/40 transition-all cursor-pointer h-full block">
                            <img alt={continueWatching[0].title || "Movie"} className="w-full h-full object-cover" src={continueWatching[0].posterUrl || continueWatching[0].backdropUrl || ""}/>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-8 flex flex-col justify-end">
                                <span className="text-primary text-xs font-bold uppercase tracking-widest mb-2">Tiếp Tục</span>
                                <h3 className="text-2xl md:text-3xl font-headline font-bold text-white mb-4 line-clamp-1">{continueWatching[0].title || ''}</h3>
                                <div className="w-full h-1 bg-surface-variant rounded-full overflow-hidden">
                                    <div className="w-2/3 h-full bg-primary shadow-[0_0_10px_rgba(255,180,170,0.5)]"></div>
                                </div>
                            </div>
                        </Link>
                        )}
                        <div className="flex flex-col gap-6 h-full">
                            {continueWatching[1] && (
                            <Link to={`/watch/${continueWatching[1].id}`} className="group relative flex-1 bg-surface-container rounded-xl overflow-hidden hover:ring-2 ring-outline-variant/40 transition-all cursor-pointer block">
                                <img alt={continueWatching[1].title || "Series"} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" src={continueWatching[1].backdropUrl || continueWatching[1].posterUrl || ""}/>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-4 flex flex-col justify-end">
                                    <h4 className="text-white font-headline font-bold line-clamp-1">{continueWatching[1].title || ''}</h4>
                                    <div className="w-full h-1 bg-surface-variant rounded-full overflow-hidden mt-2"><div className="w-1/4 h-full bg-primary"></div></div>
                                </div>
                            </Link>
                            )}
                            {continueWatching[2] && (
                            <Link to={`/watch/${continueWatching[2].id}`} className="group relative flex-1 bg-surface-container rounded-xl overflow-hidden hover:ring-2 ring-outline-variant/40 transition-all cursor-pointer block">
                                <img alt={continueWatching[2].title || "Series"} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" src={continueWatching[2].backdropUrl || continueWatching[2].posterUrl || ""}/>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-4 flex flex-col justify-end">
                                    <h4 className="text-white font-headline font-bold line-clamp-1">{continueWatching[2].title || ''}</h4>
                                    <div className="w-full h-1 bg-surface-variant rounded-full overflow-hidden mt-2"><div className="w-5/6 h-full bg-primary"></div></div>
                                </div>
                            </Link>
                            )}
                        </div>
                    </div>
                </section>
                )}

                {/* Top Rated (Portrait Posters) */}
                <section>
                    <div className="mb-6">
                        <h2 className="text-2xl font-headline font-bold tracking-tight text-on-surface">Đánh Giá Cao</h2>
                    </div>
                    <div className="flex gap-6 overflow-x-auto pb-4 hide-scrollbar">
                        {(topRated.length > 0 ? topRated : []).map((movie, i) => (
                            <Link key={movie?.id || i} to={movie ? `/movie/${movie.id}` : '#'} className="group relative flex-none w-48 h-72 bg-surface-container rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-110 hover:z-20">
                                <img alt={movie?.title || ''} className="w-full h-full object-cover" src={movie?.posterUrl || ''}/>
                                {movie?.rating && <div className="absolute top-2 right-2 bg-primary-container text-on-primary-container font-black text-[10px] p-1 rounded-sm shadow-xl">{movie.rating}</div>}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3">
                                    <h4 className="text-xs font-bold text-white line-clamp-2">{movie?.title || ''}</h4>
                                </div>
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
                                    <button className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-primary transition-colors">
                                        <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>play_arrow</span>
                                    </button>
                                    <span className="text-white text-[10px] font-bold uppercase tracking-widest">XEM NGAY</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            </div>
        </>
    )
}
