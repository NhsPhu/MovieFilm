import { Link } from 'react-router-dom'

export default function NotFoundPage() {
    return (
        <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6">
            <div className="text-center max-w-lg">
                {/* Large 404 */}
                <div className="relative mb-8">
                    <h1 className="text-[160px] md:text-[200px] font-black text-[#1A1A1A] leading-none font-headline select-none">
                        404
                    </h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 rounded-2xl bg-[#E50914]/10 border border-[#E50914]/20 flex items-center justify-center backdrop-blur-sm">
                            <span className="material-symbols-outlined text-[#E50914] text-4xl">movie_off</span>
                        </div>
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl md:text-3xl font-black text-white font-headline mb-3 tracking-tight">
                    Không Tìm Thấy Trang
                </h2>
                <p className="text-gray-400 font-body mb-8 leading-relaxed max-w-sm mx-auto">
                    Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển. Hãy quay lại và tiếp tục khám phá phim.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#E50914] text-white font-headline font-bold text-sm rounded-xl hover:bg-[#F6121D] transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">home</span>
                        Về Trang Chủ
                    </Link>
                    <Link
                        to="/browse"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/5 text-white font-headline font-bold text-sm rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">movie_filter</span>
                        Duyệt Phim
                    </Link>
                </div>

                {/* Decorative line */}
                <div className="mt-12 flex items-center gap-4 justify-center opacity-20">
                    <div className="h-px w-16 bg-white"></div>
                    <span className="text-xs text-white font-mono uppercase tracking-widest">RimCinema</span>
                    <div className="h-px w-16 bg-white"></div>
                </div>
            </div>
        </div>
    )
}
