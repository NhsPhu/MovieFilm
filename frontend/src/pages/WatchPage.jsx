import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import Hls from 'hls.js'
import { movieService } from '../services/movieService'

export default function WatchPage() {
    const { id } = useParams()
    const [movie, setMovie] = useState(null)
    const [related, setRelated] = useState([])
    const [streamError, setStreamError] = useState(false)
    const videoRef = useRef(null)
    const hlsRef = useRef(null)

    useEffect(() => {
        movieService.getMovie(id).then(setMovie).catch(console.error)
        movieService.getMovies(0, 10).then(data => {
            const all = data.content || data || []
            setRelated(all.filter(m => String(m.id) !== String(id)).slice(0, 4))
        }).catch(() => {})
    }, [id])

    // HLS player setup — always try the stream URL
    useEffect(() => {
        if (!videoRef.current) return

        const streamUrl = movieService.getStreamUrl(id)
        setStreamError(false)

        // Cleanup previous HLS instance
        if (hlsRef.current) {
            hlsRef.current.destroy()
            hlsRef.current = null
        }

        if (Hls.isSupported()) {
            // Chrome, Firefox, etc. — use hls.js
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: false,
                startLevel: -1, // auto quality
            })
            hlsRef.current = hls

            hls.loadSource(streamUrl)
            hls.attachMedia(videoRef.current)

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                videoRef.current.play().catch(() => {})
            })

            hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            // Stream not available — show fallback
                            setStreamError(true)
                            hls.destroy()
                            break
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            hls.recoverMediaError()
                            break
                        default:
                            setStreamError(true)
                            hls.destroy()
                            break
                    }
                }
            })
        } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
            // Safari — native HLS support
            videoRef.current.src = streamUrl
            videoRef.current.addEventListener('loadedmetadata', () => {
                videoRef.current.play().catch(() => {})
            })
            videoRef.current.addEventListener('error', () => {
                setStreamError(true)
            })
        } else {
            setStreamError(true)
        }

        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy()
                hlsRef.current = null
            }
        }
    }, [id])

    const m = movie || {}

    return (
        <main className="pt-4 px-6 md:px-12 max-w-[1920px] mx-auto pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Video Player Column */}
                <div className="lg:col-span-8 flex flex-col gap-8">
                    {/* Video Player */}
                    <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
                        {/* Always render the video element — hls.js attaches to it */}
                        <video
                            ref={videoRef}
                            className={`w-full h-full ${streamError ? 'hidden' : 'block'}`}
                            controls
                            poster={m.posterUrl || m.backdropUrl}
                        />
                        {/* Fallback when stream fails */}
                        {streamError && (
                            <div className="relative w-full h-full">
                                <img alt={m.title || 'Movie Scene'} className="w-full h-full object-cover" src={m.posterUrl || m.backdropUrl || ""}/>
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                    <div className="text-center space-y-4">
                                        <div className="w-20 h-20 rounded-full bg-primary-container/80 flex items-center justify-center mx-auto animate-pulse">
                                            <span className="material-symbols-outlined text-4xl text-white" style={{fontVariationSettings: "'FILL' 1"}}>play_arrow</span>
                                        </div>
                                        <div>
                                            <p className="text-base font-bold text-white">Không Thể Phát Video</p>
                                            <p className="text-sm text-gray-400 mt-1">Video chưa được chuyển mã hoặc tệp nguồn bị thiếu.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Info Section */}
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-4">
                                    <span className="bg-primary-container/10 text-primary px-2 py-1 rounded text-[10px] font-bold tracking-widest uppercase">Phim Gốc</span>
                                    <span className="text-on-surface-variant text-sm font-medium">{m.releaseYear || '2024'} • TV-MA</span>
                                </div>
                                <h1 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tighter line-clamp-2">{m.title || 'Movie Title'}</h1>
                            </div>
                            <div className="flex gap-3 shrink-0">
                                <button className="h-10 px-5 rounded-full bg-surface-container-high text-on-surface font-headline font-bold text-sm hover:bg-surface-bright transition-all flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg">add</span>
                                    Danh Sách
                                </button>
                                <button className="h-10 px-5 rounded-full bg-tertiary-container text-white font-headline font-bold text-sm hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-tertiary-container/20">
                                    <span className="material-symbols-outlined text-lg" style={{fontVariationSettings: "'FILL' 1"}}>thumb_up</span>
                                    Đánh Giá
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-surface-container rounded-xl">
                            <div className="md:col-span-2 space-y-3">
                                <p className="text-base leading-relaxed text-on-surface-variant font-light line-clamp-4">
                                    {m.description || 'Chưa có mô tả cho phim này.'}
                                </p>
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {(m.genres || []).map((g,i) => (
                                        <span key={i} className="px-3 py-1 bg-surface-container-high rounded-full text-xs font-medium text-on-surface-variant">{g.name || g}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-3 md:border-l md:border-outline-variant/20 md:pl-6">
                                <div>
                                    <h4 className="text-xs uppercase tracking-widest text-primary font-bold mb-1">Đạo Diễn</h4>
                                    <p className="text-sm text-on-surface">{m.director || 'Chưa rõ'}</p>
                                </div>
                                <div>
                                    <h4 className="text-xs uppercase tracking-widest text-primary font-bold mb-1">Năm</h4>
                                    <p className="text-sm text-on-surface">{m.releaseYear || 'Chưa rõ'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Comment Section */}
                    <section className="mt-6 space-y-6">
                        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
                            <h3 className="font-headline text-xl font-bold flex items-center gap-3">
                                Bình Luận <span className="text-on-surface-variant font-light text-base">(0)</span>
                            </h3>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-bold text-sm shrink-0">U</div>
                            <div className="flex-1 space-y-3">
                                <textarea className="w-full bg-surface-container-lowest border-0 border-b border-outline-variant/30 focus:ring-0 focus:border-primary-container transition-all resize-none font-body py-2 px-0 text-on-surface text-sm" placeholder="Chia sẻ suy nghĩ của bạn..." rows="2"></textarea>
                                <div className="flex justify-end gap-3">
                                    <button className="px-4 py-2 text-sm font-bold text-on-surface-variant hover:text-white transition-colors">Hủy</button>
                                    <button className="px-6 py-2 bg-primary-container text-white text-sm font-bold rounded-full hover:scale-105 transition-all">Bình Luận</button>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Sidebar Column */}
                <div className="lg:col-span-4 space-y-8">
                    {/* More Like This — from real data */}
                    {related.length > 0 && (
                        <div>
                            <h3 className="font-headline text-xl font-bold mb-6">Phim Tương Tự</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {related.map((rec,i) => (
                                    <Link key={rec.id || i} to={`/watch/${rec.id}`} className="group relative aspect-[2/3] rounded-lg overflow-hidden cursor-pointer shadow-lg hover:ring-2 ring-outline-variant/50 transition-all">
                                        <img alt={rec.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src={rec.posterUrl || rec.backdropUrl || 'https://via.placeholder.com/200x300?text=No+Img'}/>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex flex-col justify-end p-3">
                                            <span className="text-[10px] font-bold text-primary uppercase mb-1">{rec.releaseYear || '2024'}</span>
                                            <h5 className="text-xs font-bold text-white line-clamp-2">{rec.title}</h5>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {related.length === 0 && (
                        <div>
                            <h3 className="font-headline text-xl font-bold mb-6 flex items-center gap-2">
                                Gợi Ý <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                            </h3>
                            <p className="text-sm text-on-surface-variant">Chưa có gợi ý phù hợp.</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}
