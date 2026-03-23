import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { useForm as useRHForm } from 'react-hook-form'
import api from '../services/api'
import useAuthStore from '../store/useAuthStore'

export default function ReviewSection({ movieId, onReviewSubmitted }) {
    const { isAuthenticated, user } = useAuthStore()
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
            if (onReviewSubmitted) onReviewSubmitted() // trigger parent refresh
        } catch (error) {
            console.error('Failed to submit review', error)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="mt-12">
            <h3 className="text-2xl font-headline font-bold mb-8 text-white border-b border-outline-variant/30 pb-4">Audience Reviews</h3>
            
            {/* Review Form */}
            {isAuthenticated() ? (
                <div className="mb-12 bg-surface-container rounded-xl p-6 border border-outline-variant/30">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-lg">
                            {user?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                            <h4 className="font-headline font-bold text-white">Rate and Review</h4>
                            <p className="text-xs text-gray-400 font-body">Share your thoughts on this movie</p>
                        </div>
                    </div>
                    
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                    key={star}
                                    className={`material-symbols-outlined cursor-pointer text-3xl transition-transform hover:scale-110 ${
                                        star <= (hoverScore || score) ? 'text-primary drop-shadow-[0_0_8px_rgba(255,180,170,0.6)]' : 'text-gray-600'
                                    }`}
                                    style={{fontVariationSettings: star <= (hoverScore || score) ? "'FILL' 1" : "'FILL' 0"}}
                                    onMouseEnter={() => setHoverScore(star)}
                                    onMouseLeave={() => setHoverScore(0)}
                                    onClick={() => setValue('score', star, { shouldValidate: true })}
                                >
                                    star
                                </span>
                            ))}
                        </div>
                        {score === 0 && hoverScore === 0 && <p className="text-red-400 text-xs font-body mt-1">Please select a rating.</p>}

                        <div>
                            <textarea
                                {...register('review')}
                                rows="4"
                                placeholder="What did you think about the movie?"
                                className="w-full bg-surface-variant/50 border border-outline-variant/50 rounded-lg p-4 font-body text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none placeholder-gray-500"
                            ></textarea>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={submitting || score === 0}
                                className="bg-primary-container text-on-primary-container px-6 py-2 rounded-lg font-headline font-bold tracking-wide hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
                            >
                                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                Post Review
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="mb-12 bg-surface-container/50 rounded-xl p-8 border border-outline-variant/30 text-center">
                    <span className="material-symbols-outlined text-4xl text-gray-500 mb-2">lock</span>
                    <h4 className="font-headline font-bold text-white mb-2">Sign in to Review</h4>
                    <p className="font-body text-sm text-gray-400">You must be logged in to leave a rating and review.</p>
                </div>
            )}

            {/* Reviews List */}
            <div>
                <h4 className="font-headline font-bold text-lg mb-6 text-gray-300">Recent Comments ({reviews.length})</h4>
                
                {loading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="bg-surface-container/30 rounded-xl p-8 text-center border border-outline-variant/20">
                        <p className="font-body text-gray-500">No reviews yet. Be the first to review!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reviews.map((r) => (
                            <div key={r.id} className="bg-surface-container rounded-xl p-5 border border-outline-variant/30 flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center font-bold text-white shrink-0">
                                    {r.userName?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h5 className="font-bold font-headline text-white text-sm">{r.userName}</h5>
                                        <span className="font-body text-xs text-gray-500">
                                            {new Date(r.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                    <div className="flex gap-0.5 mb-2">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <span 
                                                key={star} 
                                                className={`material-symbols-outlined text-sm ${star <= r.score ? 'text-primary' : 'text-gray-600'}`}
                                                style={{fontVariationSettings: star <= r.score ? "'FILL' 1" : "'FILL' 0"}}
                                            >star</span>
                                        ))}
                                    </div>
                                    {r.review && (
                                        <p className="font-body text-sm text-gray-300 leading-relaxed">{r.review}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
