import { useState, useEffect } from 'react'

export default function ShareModal({ isOpen, onClose, movieTitle }) {
    const [copied, setCopied] = useState(false)
    const shareUrl = window.location.href

    // Close on ESC
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [onClose])

    if (!isOpen) return null

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const shareToFacebook = () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank', 'width=600,height=400')
    }

    const shareToTwitter = () => {
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`Xem phim ${movieTitle} cực hay trên RimCinema!`)}`, '_blank', 'width=600,height=400')
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
            
            {/* Modal Content */}
            <div className="relative w-full max-w-md bg-surface-container-high rounded-2xl shadow-2xl p-6 border border-outline-variant/20 animate-[scaleIn_0.2s_ease-out]">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-headline font-bold text-xl text-white">Chia Sẻ Phim</h3>
                    <button onClick={onClose} className="p-1.5 rounded-full hover:bg-surface-container-highest transition-colors text-on-surface-variant hover:text-white">
                        <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                </div>

                <div className="flex gap-4 justify-center mb-8">
                    <button onClick={shareToFacebook} className="flex flex-col items-center gap-2 group">
                        <div className="w-14 h-14 rounded-full bg-[#1877F2] flex items-center justify-center text-white group-hover:-translate-y-1 transition-transform shadow-lg shadow-blue-500/30">
                            <i className="fa-brands fa-facebook-f text-2xl"></i>
                            <span className="material-symbols-outlined text-3xl">facebook</span>
                        </div>
                        <span className="text-xs font-bold text-on-surface-variant">Facebook</span>
                    </button>
                    <button onClick={shareToTwitter} className="flex flex-col items-center gap-2 group">
                        <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center text-white border border-outline-variant/30 group-hover:-translate-y-1 transition-transform shadow-lg">
                            <span className="material-symbols-outlined text-2xl">close</span>
                        </div>
                        <span className="text-xs font-bold text-on-surface-variant">X (Twitter)</span>
                    </button>
                </div>

                <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Hoặc sao chép liên kết</p>
                    <div className="flex bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-1 pl-4">
                        <input 
                            type="text" 
                            readOnly 
                            value={shareUrl} 
                            className="bg-transparent flex-1 outline-none text-sm text-on-surface min-w-0"
                        />
                        <button 
                            onClick={handleCopy}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                                copied ? 'bg-green-500 text-white' : 'bg-primary-container text-on-primary-container hover:bg-primary hover:text-white'
                            }`}
                        >
                            <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>
                                {copied ? 'check' : 'content_copy'}
                            </span>
                            {copied ? 'Đã Copy' : 'Copy'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
