import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import Hls from 'hls.js'
import { movieService } from '../services/movieService'
import { ratingService } from '../services/ratingService'
import { historyService } from '../services/historyService'
import { watchlistService } from '../services/watchlistService'
import useAuthStore from '../store/useAuthStore'

export default function WatchPage() {
    const { id } = useParams()
    const [movie, setMovie] = useState(null)
    const [related, setRelated] = useState([])
    const [streamError, setStreamError] = useState(false)
    const [ratings, setRatings] = useState([])
    const [myScore, setMyScore] = useState(0)
    const [myReview, setMyReview] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    
    // Watchlist state
    const [isInWatchlist, setIsInWatchlist] = useState(false)
    const [isWatchlistLoading, setIsWatchlistLoading] = useState(false)

    // Progress State
    const hasSeekedInitProgress = useRef(false)
    
    const { user } = useAuthStore()

    const videoRef = useRef(null)
    const hlsRef = useRef(null)
    const progressIntervalRef = useRef(null)

    const fetchRatings = () => {
        ratingService.getMovieRatings(id).then(setRatings).catch(console.error)
    }

    const checkWatchlistStatus = () => {
        if (!user) return
        watchlistService.checkInWatchlist(id)
            .then(data => setIsInWatchlist(data.inWatchlist))
            .catch(console.error)
    }

    const toggleWatchlist = async () => {
        if (!user) return alert("Vui lòng đăng nhập để thêm phim vào danh sách.")
        setIsWatchlistLoading(true)
        try {
            if (isInWatchlist) {
                await watchlistService.removeFromWatchlist(id)
                setIsInWatchlist(false)
            } else {
                await watchlistService.addToWatchlist(id)
                setIsInWatchlist(true)
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật danh sách", error)
        }
        setIsWatchlistLoading(false)
    }

    useEffect(() => {
        movieService.getMovie(id).then(setMovie).catch(console.error)
        movieService.getMovies(0, 10).then(data => {
            const all = data.content || data || []
            setRelated(all.filter(m => String(m.id) !== String(id)).slice(0, 4))
        }).catch(() => {})
        fetchRatings()
        checkWatchlistStatus()
    }, [id, user])

    const handleSubmitReview = async () => {
        if (!user) return alert('Vui lòng đăng nhập để đánh giá.')
        if (myScore === 0) return alert('Vui lòng chọn số sao điểm từ 1 đến 5.')
        setIsSubmitting(true)
        try {
            await ratingService.rateMovie(id, myScore, myReview)
            setMyScore(0)
            setMyReview('')
            fetchRatings()
        } catch (error) {
            alert('Có lỗi xảy ra khi gửi bình luận đánh giá.')
            console.error(error)
        }
        setIsSubmitting(false)
    }

    // Video Tracking hook
    useEffect(() => {
        const video = videoRef.current
        if (!video || !user) return

        const updateProgress = () => {
            const currentPosition = Math.floor(video.currentTime)
            if (currentPosition > 0 && !video.paused) {
                historyService.updateWatchHistory(id, currentPosition).catch(() => {})
            }
        }

        // Send progress every 10 seconds while playing
        video.addEventListener('play', () => {
            progressIntervalRef.current = setInterval(updateProgress, 10000)
        })

        video.addEventListener('pause', () => {
            clearInterval(progressIntervalRef.current)
            updateProgress() // Final update on pause
        })

        video.addEventListener('ended', () => {
            clearInterval(progressIntervalRef.current)
            updateProgress()
        })

        return () => {
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
            video.removeEventListener('play', updateProgress)
            video.removeEventListener('pause', updateProgress)
            video.removeEventListener('ended', updateProgress)
        }
    }, [id, user])

    // Fetch initial progress to seek
    useEffect(() => {
        if (!user || hasSeekedInitProgress.current) return
        historyService.getMovieProgress(id)
            .then(data => {
                const initTime = data.currentTimeSec
                if (initTime && initTime > 5 && videoRef.current) {
                    videoRef.current.currentTime = initTime
                    hasSeekedInitProgress.current = true
                }
            })
            .catch(() => {})
    }, [id, user])


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
        <main className="pt-0 md:pt-4 md:px-12 max-w-[1920px] mx-auto pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                {/* Video Player Column */}
                <div className="lg:col-span-8 flex flex-col gap-4 md:gap-8">
                    {/* Video Player */}
                    <div className="relative aspect-video bg-black md:rounded-xl overflow-hidden md:shadow-2xl">
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
                    <div className="flex flex-col gap-4 md:gap-6 px-4 md:px-0">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-4">
                                    <span className="bg-primary-container/10 text-primary px-2 py-1 rounded text-[10px] font-bold tracking-widest uppercase">Phim Gốc</span>
                                    <span className="text-on-surface-variant text-sm font-medium">{m.releaseYear || '2024'} • TV-MA</span>
                                </div>
                                <h1 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tighter line-clamp-2">{m.title || 'Movie Title'}</h1>
                            </div>
                            <div className="flex gap-3 shrink-0">
                                <button
                                    onClick={toggleWatchlist} 
                                    disabled={isWatchlistLoading}
                                    className={`h-10 px-5 rounded-full font-headline font-bold text-sm transition-all flex items-center gap-2 ${
                                        isInWatchlist 
                                            ? 'bg-primary text-white hover:bg-primary/90' 
                                            : 'bg-surface-container-high text-on-surface hover:bg-surface-bright'
                                    }`}>
                                    <span className="material-symbols-outlined text-lg" style={{fontVariationSettings: "'FILL' " + (isInWatchlist ? '1' : '0')}}>
                                        {isInWatchlist ? 'check' : 'add'}
                                    </span>
                                    {isInWatchlist ? 'Đã Thêm' : 'Danh Sách'}
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
                                    <h4 className="text-xs uppercase tracking-widest text-primary font-bold mb-1">Diễn Viên</h4>
                                    <p className="text-sm text-on-surface">{m.cast || 'Chưa rõ'}</p>
                                </div>
                                <div>
                                    <h4 className="text-xs uppercase tracking-widest text-primary font-bold mb-1">Năm</h4>
                                    <p className="text-sm text-on-surface">{m.releaseYear || 'Chưa rõ'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Comment Section */}
                    <section className="mt-2 md:mt-6 space-y-6 px-4 md:px-0">
                        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
                            <h3 className="font-headline text-xl font-bold flex items-center gap-3">
                                Bình Luận & Đánh Giá <span className="text-on-surface-variant font-light text-base">({ratings.length})</span>
                            </h3>
                        </div>

                        {/* Rating Form */}
                        {user ? (
                            <div className="flex gap-4 bg-surface-container-low p-6 rounded-xl border border-outline-variant/10 shadow-lg">
                                <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-primary font-bold text-lg shrink-0">
                                    {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest mb-2">Chấm điểm phim</p>
                                        <div className="flex gap-1">
                                            {[1,2,3,4,5].map(s => (
                                                <button key={s} onClick={() => setMyScore(s)} className="group focus:outline-none focus:ring-4 focus:ring-primary/20 rounded-full">
                                                    <span className={`material-symbols-outlined text-3xl transition-all ${myScore >= s ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]' : 'text-stone-600 group-hover:text-amber-400/50'}`} style={{fontVariationSettings: "'FILL' " + (myScore >= s ? '1' : '0')}}>star</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <textarea className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary transition-all resize-none font-body py-3 px-4 text-on-surface text-sm" placeholder="Viết cảm nghĩ của bạn về bộ phim..." rows="3" value={myReview} onChange={e => setMyReview(e.target.value)}></textarea>
                                    <div className="flex justify-end gap-3">
                                        <button onClick={() => {setMyScore(0); setMyReview('');}} className="px-5 py-2 text-sm font-bold text-on-surface-variant hover:text-white hover:bg-surface-container-high rounded-full transition-colors">Hủy</button>
                                        <button onClick={handleSubmitReview} disabled={isSubmitting || myScore === 0} className="px-6 py-2 bg-primary-container text-on-primary-container text-sm font-bold rounded-full hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-md">
                                            {isSubmitting ? 'Đang Gửi...' : 'Đăng Bình Luận'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-8 bg-surface-container-low rounded-xl border border-outline-variant/10 text-center shadow-lg">
                                <p className="text-stone-400 mb-4 font-medium">Vui lòng đăng nhập để tham gia bình luận và đánh giá phim.</p>
                                <Link to="/login" className="inline-block px-8 py-3 bg-primary-container text-on-primary-container font-headline font-bold rounded-full hover:brightness-110 transition-all hover:scale-105 active:scale-95">Đăng Nhập Ngay</Link>
                            </div>
                        )}

                        {/* Ratings List */}
                        <div className="space-y-4 pt-4">
                            {ratings.length > 0 ? ratings.map((r, i) => (
                                <div key={i} className="flex gap-4 p-5 bg-surface-container-lowest/50 rounded-xl border border-outline-variant/5 hover:bg-surface-container-low/50 transition-colors shadow-sm">
                                    <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface font-bold text-sm shrink-0 shadow-inner">
                                        {r.userFullName ? r.userFullName[0].toUpperCase() : 'U'}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                            <div className="flex items-center gap-3">
                                                <p className="text-sm font-bold text-on-surface">{r.userFullName}</p>
                                                <div className="flex items-center gap-[2px]">
                                                    {[1,2,3,4,5].map(s => (
                                                        <span key={s} className={`material-symbols-outlined text-[12px] ${r.score >= s ? 'text-amber-400 drop-shadow-md' : 'text-stone-700'}`} style={{fontVariationSettings: "'FILL' " + (r.score >= s ? '1' : '0')}}>star</span>
                                                    ))}
                                                    <span className="text-[10px] font-bold text-amber-400 ml-1 bg-amber-400/10 px-1.5 py-0.5 rounded">{r.score}.0</span>
                                                </div>
                                            </div>
                                            <p className="text-xs text-stone-500 font-medium">{new Date(r.createdAt).toLocaleString('vi-VN')}</p>
                                        </div>
                                        {r.review && (
                                            <p className="text-sm text-stone-300 leading-relaxed font-body whitespace-pre-line bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/10">{r.review}</p>
                                        )}
                                    </div>
                                </div>
                            )) : (
                                <div className="p-8 text-center bg-surface-container-lowest/30 rounded-xl border border-outline-variant/5 border-dashed">
                                    <span className="material-symbols-outlined text-4xl text-stone-600 mb-2">forum</span>
                                    <p className="text-sm text-stone-500 font-medium italic">Chưa có đánh giá nào. Hãy là người đầu tiên nêu cảm nghĩ!</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Sidebar Column */}
                <div className="lg:col-span-4 space-y-8 px-4 md:px-0 mt-4 md:mt-0">
                    {/* More Like This — from real data */}
                    {related.length > 0 && (
                        <div>
                            <h3 className="font-headline text-xl font-bold mb-6">Phim Tương Tự</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {related.map((rec,i) => (
                                    <Link key={rec.id || i} to={`/watch/${rec.id}`} className="group relative aspect-[2/3] rounded-lg overflow-hidden cursor-pointer shadow-lg hover:ring-2 ring-outline-variant/50 transition-all">
                                        <img alt={rec.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src={rec.posterUrl || rec.backdropUrl || 'https://via.placeholder.com/200x300?text=No+Img'}/>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex flex-col justify-end p-3">
                                            <span className="text-[10px] font-bold text-primary uppercase mb-1">{rec.avgRating ? rec.avgRating.toFixed(1) : '—'} • {rec.releaseYear || '2024'}</span>
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
