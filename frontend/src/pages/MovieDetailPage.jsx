import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Play, ArrowLeft, Clock, Calendar, Star } from 'lucide-react'
import { movieService } from '../services/movieService'
import useAuthStore from '../store/useAuthStore'
import ReviewSection from '../components/ReviewSection'

export default function MovieDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { isAuthenticated } = useAuthStore()
    const [movie, setMovie] = useState(null)
    const [ratings, setRatings] = useState([])
    const [userScore, setUserScore] = useState(0)
    const [review, setReview] = useState('')
    const [ratingMsg, setRatingMsg] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        movieService.getMovieById(id)
            .then(m => setMovie(m))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [id])

    const handleReviewSubmitted = async () => {
        // Refresh movie data to show updated avgRating
        try {
            const m = await movieService.getMovieById(id)
            setMovie(m)
        } catch (error) {
            console.error(error)
        }
    }

    const formatDuration = (secs) => {
        if (!secs) return 'N/A'
        const h = Math.floor(secs / 3600)
        const m = Math.floor((secs % 3600) / 60)
        return h > 0 ? `${h}h ${m}m` : `${m}m`
    }

    if (loading) return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center">
            <div className="text-4xl font-serif font-black animate-pulse">ĐANG TẢI...</div>
        </div>
    )

    if (!movie) return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center">
            <div className="text-4xl font-serif font-black">KHÔNG TÌM THẤY PHIM.</div>
            <button onClick={() => navigate('/')} className="mt-8 border-b-2 border-foreground hover:bg-foreground hover:text-background font-mono px-2 py-1 transition-none uppercase">
                Về Trang Chủ
            </button>
        </div>
    )

    return (
        <div className="min-h-screen bg-background text-foreground texture-lines-opacity">
            {/* Minimal Navbar / Back Button */}
            <header className="border-b-[4px] border-foreground sticky top-0 bg-background z-50">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <button 
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 font-mono uppercase text-sm font-bold border-2 border-transparent hover:border-foreground px-3 py-2 transition-none"
                    >
                        <ArrowLeft className="w-4 h-4" /> Quay Lại
                    </button>
                    <span className="font-serif font-black tracking-tighter text-xl">MovieStream.</span>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-12 md:py-24">
                
                {/* Hero Section */}
                <div className="flex flex-col md:flex-row gap-12 md:gap-24 mb-24">
                    {/* Poster */}
                    <div className="w-full md:w-1/3 shrink-0">
                        <div className="aspect-[2/3] border-[4px] border-foreground relative overflow-hidden group">
                            <img 
                                src={movie.posterUrl || `https://picsum.photos/seed/${movie.id}/600/900`} 
                                alt={movie.title}
                                className="w-full h-full object-cover grayscale brightness-90 contrast-125 transition-all duration-0 group-hover:grayscale-0"
                            />
                            {/* Decorative corner accents */}
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-8 border-l-8 border-background mix-blend-difference"></div>
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-8 border-r-8 border-background mix-blend-difference"></div>
                        </div>
                    </div>

                    {/* Movie Info */}
                    <div className="w-full md:w-2/3 flex flex-col justify-center">
                        <h1 className="text-6xl md:text-8xl font-serif font-black leading-[0.9] uppercase tracking-tighter mb-8 break-words text-wrap">
                            {movie.title}
                        </h1>
                        
                        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 mb-8 font-mono text-sm font-bold uppercase border-y-2 border-foreground py-4">
                            <div className="flex items-center gap-2">
                                <Star className="w-4 h-4" />
                                <span>{movie.avgRating?.toFixed(1) || '0.0'} / 5</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{movie.releaseYear}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>{formatDuration(movie.durationSec)}</span>
                            </div>
                            <div>
                                <span>Lượt xem: {movie.viewsCount?.toLocaleString() || 0}</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-8">
                            {movie.genres?.map(g => (
                                <span key={g} className="border border-foreground px-3 py-1 font-mono text-xs uppercase bg-foreground text-background">
                                    {g}
                                </span>
                            ))}
                        </div>

                        <p className="font-body text-lg md:text-xl leading-relaxed mb-12 max-w-2xl">
                            {movie.description}
                        </p>

                        <div>
                            <button 
                                onClick={() => navigate(`/watch/${movie.id}`)}
                                className="inline-flex items-center justify-center gap-4 bg-foreground text-background px-8 py-5 text-xl font-bold font-mono tracking-widest uppercase border-[4px] border-foreground hover:bg-background hover:text-foreground transition-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)]"
                            >
                                <Play className="w-6 h-6 fill-current" /> XEM PHIM NGAY
                            </button>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="w-full h-2 bg-foreground mb-12"></div>

                <ReviewSection movieId={movie.id} onReviewSubmitted={handleReviewSubmitted} />
            </main>
        </div>
    )
}
