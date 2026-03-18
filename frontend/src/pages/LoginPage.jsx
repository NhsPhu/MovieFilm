import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Loader2 } from 'lucide-react'
import useAuthStore from '../store/useAuthStore'

export default function LoginPage() {
    const navigate = useNavigate()
    const { login } = useAuthStore()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await login(email, password)
            navigate('/')
        } catch {
            setError('EMAIL HOẶC MẬT KHẨU KHÔNG ĐÚNG.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 texture-lines-opacity">
            <div className="w-full max-w-md bg-background border-[4px] border-foreground p-8 md:p-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative">
                
                {/* Decorative Elements */}
                <div className="absolute top-4 right-4 w-4 h-4 bg-foreground"></div>
                
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-serif font-black uppercase tracking-tighter leading-none mb-2">
                        Đăng Nhập.
                    </h1>
                    <p className="font-mono text-sm uppercase tracking-widest text-mutedForeground">
                        MovieStream Portal
                    </p>
                </div>

                {error && (
                    <div className="mb-8 border-l-[4px] border-foreground bg-[#f5f5f5] p-4 text-sm font-mono font-bold uppercase">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                    <div className="relative">
                        <input
                            id="login-email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-transparent border-b-[4px] border-[#ccc] focus:border-foreground py-2 px-0 text-lg font-mono placeholder:text-mutedForeground focus:outline-none transition-colors peer"
                            placeholder="Email"
                        />
                    </div>
                    
                    <div className="relative">
                        <input
                            id="login-password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-transparent border-b-[4px] border-[#ccc] focus:border-foreground py-2 px-0 text-lg font-mono placeholder:text-mutedForeground focus:outline-none transition-colors peer"
                            placeholder="Mật khẩu"
                        />
                    </div>

                    <button
                        id="login-submit"
                        type="submit"
                        disabled={loading}
                        className="mt-4 flex items-center justify-between w-full bg-foreground text-background font-mono font-bold text-lg uppercase tracking-widest px-6 py-4 border-[2px] border-foreground hover:bg-background hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-none overflow-hidden group"
                    >
                        <span>{loading ? 'Đang Xử Lý...' : 'Tiến Hành'}</span>
                        {!loading && <ArrowRight className="w-6 h-6 transform group-hover:translate-x-2 transition-transform" />}
                        {loading && <Loader2 className="w-6 h-6 animate-spin" />}
                    </button>
                </form>

                <div className="mt-12 pt-8 border-t-[2px] border-foreground">
                    <p className="font-serif text-lg italic">
                        Chưa có tài khoản?{' '}
                        <Link to="/register" className="font-serif font-black text-xl hover:underline uppercase not-italic">
                            Đăng ký
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
