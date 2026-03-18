import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'
import { movieService } from '../services/movieService'
import { historyService } from '../services/historyService'

export default function WatchPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const videoRef = useRef(null)
    const playerRef = useRef(null)
    const saveIntervalRef = useRef(null)
    const [movie, setMovie] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let isMounted = true

        const init = async () => {
            try {
                const movieData = await movieService.getMovieById(id)
                if (!isMounted) return
                setMovie(movieData)

                // Load tiến trình cũ
                let startTime = 0
                try {
                    const progress = await historyService.getMovieProgress(id)
                    if (progress && !progress.isFinished && progress.currentTimeSec > 30) {
                        startTime = progress.currentTimeSec
                    }
                } catch { /* user chưa đăng nhập hoặc chưa xem */ }

                if (!isMounted) return
                setLoading(false)

                // Khởi tạo Video.js sau khi render xong thẻ video
                setTimeout(() => {
                    if (videoRef.current && !playerRef.current) {
                        const player = videojs(videoRef.current, {
                            controls: true,
                            autoplay: false,
                            fluid: true,
                            aspectRatio: '16:9',
                            html5: { vhs: { overrideNative: true } },
                            sources: [{
                                src: movieService.getStreamUrl(id),
                                type: 'application/x-mpegURL'
                            }]
                        })

                        playerRef.current = player

                        player.ready(() => {
                            if (startTime > 0) {
                                player.currentTime(startTime)
                            }
                        })

                        // Auto-save progress mỗi 10 giây
                        saveIntervalRef.current = setInterval(async () => {
                            if (!player.paused() && player.currentTime() > 0) {
                                try {
                                    await historyService.updateWatchHistory(Number(id), Math.floor(player.currentTime()), 'WEB')
                                } catch { /* user chưa đăng nhập */ }
                            }
                        }, 10000)

                        // Lưu khi kết thúc phim
                        player.on('ended', async () => {
                            try {
                                await historyService.updateWatchHistory(Number(id), Math.floor(player.currentTime()), 'WEB')
                            } catch { /* ignore */ }
                        })
                    }
                }, 100)
            } catch (err) {
                console.error(err)
            }
        }

        init()

        return () => {
            isMounted = false
            if (saveIntervalRef.current) clearInterval(saveIntervalRef.current)
            if (playerRef.current) {
                playerRef.current.dispose()
                playerRef.current = null
            }
        }
    }, [id])

    return (
        <div className="min-h-screen bg-black text-background flex flex-col font-body">
            {/* Header / Top Bar */}
            <header className="p-4 flex items-center justify-between border-b-[2px] border-[#333] shrink-0">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate(-1)}
                        className="p-2 border border-transparent hover:border-background transition-none flex items-center gap-2 font-mono text-sm uppercase tracking-widest text-background"
                        title="Quay lại"
                    >
                        <ArrowLeft className="w-5 h-5" /> 
                        <span className="hidden sm:inline">Trở Về</span>
                    </button>
                    {movie && (
                        <h1 className="font-serif font-bold text-xl md:text-2xl uppercase tracking-tighter truncate max-w-[200px] sm:max-w-md md:max-w-xl lg:max-w-3xl">
                            {movie.title}
                        </h1>
                    )}
                </div>
            </header>

            {/* Video Player Section */}
            <div className="w-full flex-grow flex items-center justify-center bg-black">
                {loading ? (
                    <div className="flex flex-col items-center justify-center gap-6">
                        <Loader2 className="w-12 h-12 animate-spin text-background" />
                        <span className="font-mono text-xs uppercase tracking-[0.3em]">Đang chuẩn bị luồng phát...</span>
                    </div>
                ) : (
                    <div className="w-full max-w-[1600px] mx-auto">
                        <div data-vjs-player className="relative group border-[1px] border-[#333]">
                            <video
                                ref={videoRef}
                                className="video-js vjs-big-play-centered"
                                playsInline
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Movie Info Below Player */}
            {movie && !loading && (
                <div className="max-w-[1600px] mx-auto w-full p-6 md:p-12 shrink-0 border-t-[2px] border-[#333]">
                    <h2 className="text-3xl md:text-5xl font-serif font-black uppercase mb-4 leading-none">
                        {movie.title}
                    </h2>
                    
                    <div className="flex items-center gap-4 font-mono text-sm uppercase mb-8 opacity-80">
                        {movie.releaseYear && <span>{movie.releaseYear}</span>}
                        {movie.durationSec && (
                            <>
                                <span>|</span>
                                <span>{Math.floor(movie.durationSec / 60)} PHÚT</span>
                            </>
                        )}
                    </div>

                    {movie.description && (
                        <p className="font-body text-base md:text-lg opacity-80 leading-relaxed max-w-4xl">
                            {movie.description}
                        </p>
                    )}
                </div>
            )}
            
            {/* Custom VideoJS Overrides for Minimalist look */}
            <style dangerouslySetInnerHTML={{__html: `
                .video-js {
                    font-family: 'JetBrains Mono', monospace !important;
                }
                .video-js .vjs-big-play-button {
                    border-radius: 0 !important;
                    background-color: rgba(255, 255, 255, 0.1) !important;
                    border: 2px solid white !important;
                    color: white !important;
                    transition: all 0s !important;
                }
                .video-js:hover .vjs-big-play-button,
                .video-js .vjs-big-play-button:focus {
                    background-color: white !important;
                    color: black !important;
                    border-color: white !important;
                }
                .video-js .vjs-control-bar {
                    background-color: rgba(0, 0, 0, 0.9) !important;
                    border-top: 1px solid #333 !important;
                }
                .video-js .vjs-play-progress {
                    background-color: white !important;
                }
                .video-js .vjs-volume-level {
                    background-color: white !important;
                }
            `}} />
        </div>
    )
}
