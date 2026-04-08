import { Component } from 'react'
import { Link } from 'react-router-dom'

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6">
                    <div className="text-center max-w-lg">
                        {/* Icon */}
                        <div className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-[#E50914]/10 border border-[#E50914]/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[#E50914] text-5xl">error</span>
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl font-black text-white font-headline mb-3 tracking-tight">
                            Đã Xảy Ra Lỗi
                        </h1>
                        <p className="text-gray-400 font-body mb-8 leading-relaxed">
                            Ứng dụng gặp sự cố không mong muốn. Vui lòng thử tải lại trang.
                        </p>

                        {/* Error details (dev only) */}
                        {this.state.error && (
                            <div className="mb-8 p-4 bg-[#1A1A1A] border border-[#333] rounded-xl text-left">
                                <p className="text-xs text-gray-500 font-mono break-all">
                                    {this.state.error.toString()}
                                </p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-3 bg-[#E50914] text-white font-headline font-bold text-sm rounded-xl hover:bg-[#F6121D] transition-colors"
                            >
                                Tải Lại Trang
                            </button>
                            <a
                                href="/"
                                className="px-6 py-3 bg-white/5 text-white font-headline font-bold text-sm rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
                            >
                                Về Trang Chủ
                            </a>
                        </div>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}
