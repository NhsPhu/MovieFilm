import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { movieService } from '../services/movieService'

export default function MovieDetailPage() {
    const { id } = useParams()
    const [movie, setMovie] = useState(null)
    const [recommended, setRecommended] = useState([])

    useEffect(() => {
        movieService.getMovie(id).then(setMovie).catch(console.error)
        movieService.getMovies(0, 10).then(data => {
            const all = data.content || data || []
            setRecommended(all.filter(m => String(m.id) !== String(id)).slice(0, 5))
        }).catch(() => {})
    }, [id])

    const m = movie || {}

    return (
        <main className="relative min-h-screen -mt-20">
            {/* Hero Background */}
            <div className="absolute inset-0 z-0 h-screen">
                <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent z-10"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10"></div>
                <img alt="Hero Movie Banner" className="w-full h-full object-cover object-center" src={m.backdropUrl || m.posterUrl || ""}/>
            </div>

            {/* Movie Details Content */}
            <div className="relative z-20 pt-32 px-6 md:px-12 pb-20 max-w-7xl mx-auto flex flex-col md:flex-row gap-12">
                {/* Left Side: Core Info */}
                <div className="flex-1 space-y-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <span className="px-2 py-0.5 border border-outline-variant text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">ĐANG HOT</span>
                            <div className="flex items-center gap-1 text-primary">
                                <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                                <span className="text-sm font-bold font-label">{m.rating || '—'} <span className="text-on-surface-variant/60 font-medium">IMDb</span></span>
                            </div>
                        </div>
                        <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter text-on-surface leading-tight line-clamp-3">{m.title || ''}</h1>
                        <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-on-surface-variant font-label">
                            {m.releaseYear && <span>{m.releaseYear}</span>}
                            {m.releaseYear && m.duration && <span className="w-1 h-1 rounded-full bg-outline-variant"></span>}
                            {m.duration && <span>{`${Math.floor(m.duration/60)}h ${m.duration%60}m`}</span>}
                            {(m.genres || []).length > 0 && (
                                <>
                                    <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                                    <div className="flex gap-2 flex-wrap">
                                        {m.genres.map((g,i) => (
                                            <span key={i} className="px-3 py-1 bg-surface-container rounded-full border border-outline-variant/20 text-xs">{g.name || g}</span>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    <p className="text-base md:text-lg text-on-surface-variant leading-relaxed max-w-2xl font-body">
                        {m.description || 'Chưa có mô tả.'}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 pt-2">
                        <Link to={`/watch/${id}`} className="flex items-center gap-3 bg-primary-container text-on-primary-container px-8 py-4 rounded-xl font-headline font-bold text-lg hover:scale-105 active:opacity-80 transition-all shadow-[0_0_20px_rgba(229,9,20,0.3)]">
                            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>play_arrow</span>
                            Xem Ngay
                        </Link>
                        <button className="flex items-center gap-3 bg-surface-container-high/60 backdrop-blur-md border border-outline-variant/30 text-on-surface px-8 py-4 rounded-xl font-headline font-bold text-lg hover:bg-surface-container-highest transition-all">
                            <span className="material-symbols-outlined">smart_display</span>
                            Xem Trailer
                        </button>
                        <button className="flex items-center justify-center w-14 h-14 bg-tertiary-container text-on-tertiary-container rounded-xl hover:scale-105 active:opacity-80 transition-all">
                            <span className="material-symbols-outlined">add</span>
                        </button>
                    </div>

                    {/* Cast & Crew - chỉ hiển thị khi có dữ liệu */}
                </div>

                {/* Right Side: Metadata Panel */}
                <aside className="md:w-72 lg:w-80 flex flex-col gap-8 pt-8">
                    <div className="p-6 bg-surface-container/80 backdrop-blur-sm rounded-2xl border border-outline-variant/10 space-y-6">
                        <div>
                            <h4 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-2">Đạo Diễn</h4>
                            <p className="text-on-surface font-medium text-sm">{m.director || 'Chưa rõ'}</p>
                        </div>
                        <div>
                            <h4 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-2">Biên Kịch</h4>
                            <p className="text-on-surface font-medium text-sm">{m.writers || ''}</p>
                        </div>
                        <div className="pt-4 border-t border-outline-variant/10">
                            <div className="flex items-center justify-between">
                                <h4 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Phân Loại</h4>
                                <span className="px-2 py-1 bg-surface-container-highest rounded text-xs font-bold border border-outline-variant">12+</span>
                            </div>
                            <p className="text-xs text-on-surface-variant mt-2 leading-relaxed italic">Phù hợp với trẻ em từ 12 tuổi trở lên.</p>
                        </div>
                        <div className="pt-4 border-t border-outline-variant/10">
                            <h4 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-3">Âm Thanh / Phụ Đề</h4>
                            <div className="flex gap-4">
                                <span className="material-symbols-outlined text-on-surface-variant text-xl" title="Audio Descriptions">audio_description</span>
                                <span className="material-symbols-outlined text-on-surface-variant text-xl" title="Subtitles">closed_caption</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3">
                        <button className="w-full py-3 text-center border border-outline-variant/30 rounded-xl hover:bg-surface-container transition-all font-label text-xs font-bold uppercase tracking-widest">Chia Sẻ Phim</button>
                        <button className="w-full py-3 text-center border border-outline-variant/30 rounded-xl hover:bg-surface-container transition-all font-label text-xs font-bold uppercase tracking-widest">Báo Lỗi</button>
                    </div>
                </aside>
            </div>

            {/* Recommended Movies Carousel */}
            {recommended.length > 0 && (
                <section className="relative z-20 px-6 md:px-12 pb-24 max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="font-headline text-2xl font-bold tracking-tight">Phim Đề Xuất</h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {recommended.map((rec, i) => (
                            <Link key={rec.id || i} to={`/movie/${rec.id}`} className="group relative aspect-[2/3] rounded-lg overflow-hidden bg-surface-container-high cursor-pointer hover:scale-105 transition-all duration-300">
                                <img alt={rec.title} className="w-full h-full object-cover" src={rec.posterUrl || rec.backdropUrl || 'https://via.placeholder.com/200x300?text=No+Image'}/>
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                                <div className="absolute bottom-0 p-3 w-full">
                                    <p className="text-sm font-bold leading-tight line-clamp-2">{rec.title}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] text-primary font-bold">{rec.rating || '—'}</span>
                                        <span className="text-[10px] text-on-surface-variant">{rec.releaseYear || ''}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </main>
    )
}
