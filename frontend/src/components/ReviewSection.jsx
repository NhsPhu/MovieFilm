import { useState, useEffect } from 'react'
import { Star, Loader2 } from 'lucide-react'
import { useForm as useRHForm } from 'react-hook-form'
import api from '../services/api'
import useAuthStore from '../store/useAuthStore'

export default function ReviewSection({ movieId, onReviewSubmitted }) {
    const { isAuthenticated } = useAuthStore()
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [hoverScore, setHoverScore] = useState(0)

    const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useRHForm({
        defaultValues: { score: 0, review: '' }
    })
    const score = watch('score')

    const fetchReviews = async () => {
        try {
            const res = await api.get(`/movies/${movieId}/ratings`)
            setReviews(res.data)
        } catch (error) {
            console.error('Failed to fetch reviews', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (movieId) {
            fetchReviews()
        }
    }, [movieId])

    const onSubmit = async (data) => {
        if (data.score === 0) return
        setSubmitting(true)
        try {
            await api.post(`/movies/${movieId}/rate`, data)
            reset({ score: 0, review: '' })
            await fetchReviews()
            if (onReviewSubmitted) onReviewSubmitted() // trigger parent refresh (update avg rating)
        } catch (error) {
            console.error('Failed to submit review', error)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="mt-16 border-t-4 border-foreground pt-12">
            <h3 className="text-3xl font-serif font-black tracking-tighter mb-8 uppercase">Đánh giá & Nhận xét</h3>
            
            {/* Review Form */}
            {isAuthenticated() ? (
                <div className="mb-12 bg-background border-2 border-foreground p-6">
                    <h4 className="font-mono text-sm uppercase font-bold mb-4 tracking-widest">Viết nhận xét của bạn</h4>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`w-8 h-8 cursor-pointer transition-colors ${
                                            star <= (hoverScore || score) ? 'fill-foreground text-foreground' : 'text-mutedForeground'
                                        }`}
                                        onMouseEnter={() => setHoverScore(star)}
                                        onMouseLeave={() => setHoverScore(0)}
                                        onClick={() => setValue('score', star, { shouldValidate: true })}
                                    />
                                ))}
                            </div>
                            {score === 0 && <p className="text-red-500 font-mono text-xs mt-2">Vui lòng chọn số sao.</p>}
                        </div>

                        <div>
                            <textarea
                                {...register('review')}
                                rows="3"
                                placeholder="Chia sẻ cảm nghĩ của bạn về bộ phim này..."
                                className="w-full bg-transparent border-2 border-foreground p-3 font-mono text-sm focus:outline-none focus:bg-foreground focus:text-background transition-colors resize-none"
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting || score === 0}
                            className="bg-foreground text-background px-6 py-2 pb-1 font-mono text-sm uppercase font-bold tracking-widest hover:bg-background hover:text-foreground border-2 border-foreground transition-none disabled:opacity-50 flex items-center gap-2"
                        >
                            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            Gửi đánh giá
                        </button>
                    </form>
                </div>
            ) : (
                <div className="mb-12 bg-muted p-6 border border-dashed border-foreground text-center">
                    <p className="font-mono text-sm tracking-widest uppercase">Vui lòng đăng nhập để đánh giá phim.</p>
                </div>
            )}

            {/* Reviews List */}
            <div>
                <h4 className="font-mono text-sm uppercase font-bold mb-6 tracking-widest">Khán giả nói gì ({reviews.length})</h4>
                
                {loading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="w-8 h-8 animate-spin text-foreground" />
                    </div>
                ) : reviews.length === 0 ? (
                    <p className="font-serif italic text-mutedForeground">Chưa có đánh giá nào cho phim này.</p>
                ) : (
                    <div className="space-y-6">
                        {reviews.map((r) => (
                            <div key={r.id} className="border-b-[1px] border-foreground pb-6">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="font-bold font-mono text-sm uppercase">{r.userName}</p>
                                        <div className="flex gap-1 mt-1">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <Star 
                                                    key={star} 
                                                    className={`w-3 h-3 ${star <= r.score ? 'fill-foreground text-foreground' : 'text-mutedForeground opacity-30'}`} 
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <span className="font-mono text-xs text-mutedForeground">
                                        {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                                    </span>
                                </div>
                                {r.review && (
                                    <p className="font-body text-sm mt-3 border-l-2 border-foreground pl-3 italic">"{r.review}"</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
