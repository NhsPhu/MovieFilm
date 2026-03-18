import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Loader2 } from 'lucide-react'
import useAuthStore from '../store/useAuthStore'

export default function RegisterPage() {
    const navigate = useNavigate()
    const { register } = useAuthStore()
    const [form, setForm] = useState({ fullName: '', email: '', password: '', confirm: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        if (form.password !== form.confirm) {
            setError('MẬT KHẨU KHÔNG KHỚP.')
            return
        }
        if (form.password.length < 6) {
            setError('MẬT KHẨU CẦN ÍT NHẤT 6 KÝ TỰ.')
            return
        }
        setLoading(true)
        try {
            await register(form.email, form.password, form.fullName)
            navigate('/')
        } catch {
            setError('ĐĂNG KÝ THẤT BẠI. EMAIL CÓ THỂ ĐÃ TỒN TẠI.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 texture-grid">
            <div className="w-full max-w-md bg-background border-[4px] border-foreground p-8 md:p-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative relative z-10">
                
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-2 bg-foreground"></div>
                
                <div className="mb-10 pt-4">
                    <h1 className="text-4xl md:text-5xl font-serif font-black uppercase tracking-tighter leading-none mb-2">
                        Đăng Ký.
                    </h1>
                    <p className="font-mono text-sm uppercase tracking-widest text-mutedForeground">
                        Gia nhập MovieStream
                    </p>
                </div>

                {error && (
                    <div className="mb-6 border-l-[4px] border-foreground bg-[#f5f5f5] p-3 text-sm font-mono font-bold uppercase shrink-0 min-w-0 break-words">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="relative">
                        <input
                            id="reg-name"
                            name="fullName"
                            type="text"
                            required
                            value={form.fullName}
                            onChange={handleChange}
                            className="w-full bg-transparent border-b-[4px] border-[#ccc] focus:border-foreground py-2 px-0 text-lg font-mono placeholder:text-mutedForeground focus:outline-none transition-colors"
                            placeholder="Họ và tên"
                        />
                    </div>

                    <div className="relative">
                        <input
                            id="reg-email"
                            name="email"
                            type="email"
                            required
                            value={form.email}
                            onChange={handleChange}
                            className="w-full bg-transparent border-b-[4px] border-[#ccc] focus:border-foreground py-2 px-0 text-lg font-mono placeholder:text-mutedForeground focus:outline-none transition-colors"
                            placeholder="Email"
                        />
                    </div>
                    
                    <div className="relative">
                        <input
                            id="reg-password"
                            name="password"
                            type="password"
                            required
                            value={form.password}
                            onChange={handleChange}
                            className="w-full bg-transparent border-b-[4px] border-[#ccc] focus:border-foreground py-2 px-0 text-lg font-mono placeholder:text-mutedForeground focus:outline-none transition-colors"
                            placeholder="Mật khẩu"
                        />
                    </div>

                    <div className="relative">
                        <input
                            id="reg-confirm"
                            name="confirm"
                            type="password"
                            required
                            value={form.confirm}
                            onChange={handleChange}
                            className="w-full bg-transparent border-b-[4px] border-[#ccc] focus:border-foreground py-2 px-0 text-lg font-mono placeholder:text-mutedForeground focus:outline-none transition-colors"
                            placeholder="Xác nhận mật khẩu"
                        />
                    </div>

                    <button
                        id="reg-submit"
                        type="submit"
                        disabled={loading}
                        className="mt-6 flex items-center justify-between w-full bg-foreground text-background font-mono font-bold text-lg uppercase tracking-widest px-6 py-4 border-[2px] border-foreground hover:bg-background hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-none overflow-hidden group"
                    >
                        <span>{loading ? 'Đang Xử Lý...' : 'Đăng Ký Nay'}</span>
                        {!loading && <ArrowRight className="w-6 h-6 transform group-hover:translate-x-2 transition-transform" />}
                        {loading && <Loader2 className="w-6 h-6 animate-spin" />}
                    </button>
                </form>

                <div className="mt-10 pt-6 border-t-[2px] border-foreground">
                    <p className="font-serif text-lg italic">
                        Đã có tài khoản?{' '}
                        <Link to="/login" className="font-serif font-black text-xl hover:underline uppercase not-italic">
                            Đăng nhập
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
