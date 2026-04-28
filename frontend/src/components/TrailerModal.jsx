import { useEffect, useState } from 'react'

export default function TrailerModal({ isOpen, onClose, trailerUrl, movieTitle }) {
    const [isIframe, setIsIframe] = useState(false)
    const [videoUrl, setVideoUrl] = useState('')

    useEffect(() => {
        if (!isOpen) return
        
        if (trailerUrl) {
            // Check if it's a YouTube URL
            if (trailerUrl.includes('youtube.com') || trailerUrl.includes('youtu.be')) {
                setIsIframe(true)
                // Extract video ID
                let videoId = ''
                if (trailerUrl.includes('youtu.be')) {
                    videoId = trailerUrl.split('/').pop().split('?')[0]
                } else {
                    const urlParams = new URL(trailerUrl).searchParams
                    videoId = urlParams.get('v')
                }
                setVideoUrl(`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0`)
            } else {
                setIsIframe(false)
                setVideoUrl(trailerUrl)
            }
        }
    }, [isOpen, trailerUrl])

    // Close on ESC
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [onClose])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-[fadeIn_0.2s_ease-out]">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose}></div>
            
            {/* Modal Content */}
            <div className="relative w-full max-w-5xl bg-surface-container rounded-2xl shadow-2xl overflow-hidden border border-outline-variant/20 animate-[scaleIn_0.2s_ease-out]">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-outline-variant/10">
                    <h3 className="font-headline font-bold text-lg text-white">Trailer: {movieTitle}</h3>
                    <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                
                {/* Video Area */}
                <div className="relative aspect-video bg-black w-full">
                    {trailerUrl ? (
                        isIframe ? (
                            <iframe 
                                className="w-full h-full"
                                src={videoUrl}
                                title={`${movieTitle} Trailer`}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                            ></iframe>
                        ) : (
                            <video 
                                className="w-full h-full"
                                controls 
                                autoPlay
                                src={videoUrl}
                            />
                        )
                    ) : (
                        <div className="flex flex-col items-center justify-center w-full h-full text-on-surface-variant">
                            <span className="material-symbols-outlined text-5xl mb-4">videocam_off</span>
                            <p className="text-lg font-bold">Chưa có trailer cho phim này</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
