import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Film, UploadCloud, Trash2, Loader2, Check } from 'lucide-react'
import { movieService } from '../services/movieService'
import useAuthStore from '../store/useAuthStore'
import api from '../services/api'

export default function AdminPage() {
    const navigate = useNavigate()
    const { isAdmin, isAuthenticated } = useAuthStore()
    const [tab, setTab] = useState(0) // 0: list, 1: upload
    const [movies, setMovies] = useState([])
    const [genres, setGenres] = useState([])
    const [progressMap, setProgressMap] = useState({}) // { movieId: progressPercent }
    const [loading, setLoading] = useState(false)
    const [msg, setMsg] = useState({ text: '', type: 'success' })
    const [form, setForm] = useState({ title: '', description: '', releaseYear: '', durationSec: '', posterUrl: '', genreIds: [] })
    const [videoFile, setVideoFile] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [deleteDialog, setDeleteDialog] = useState({ open: false, movie: null })

    useEffect(() => {
        if (!isAuthenticated() || !isAdmin()) {
            navigate('/')
            return
        }
        loadData()
    }, [])

    useEffect(() => {
        // Poll for progress for movies that are 'PROCESSING'
        const processingMovies = movies.filter(m => m.status === 'PROCESSING')
        if (processingMovies.length === 0) return

        const interval = setInterval(async () => {
            let changes = false
            const newProgress = { ...progressMap }
            let needsReload = false

            for (const m of processingMovies) {
                try {
                    const res = await api.get(`/admin/movies/${m.id}/progress`)
                    const p = res.data.progress
                    if (p !== -1 && p !== newProgress[m.id]) {
                        newProgress[m.id] = p
                        changes = true
                    }
                    if (p === 100) {
                        needsReload = true
                    }
                } catch (e) {
                    console.error("Failed fetching progress for movie", m.id)
                }
            }

            if (changes) setProgressMap(newProgress)
            if (needsReload) loadData()
        }, 3000)

        return () => clearInterval(interval)
    }, [movies, progressMap])

    const loadData = async () => {
        setLoading(true)
        try {
            const [moviesData, genresData] = await Promise.all([
                movieService.getMovies(0, 50, false), // Pass readyOnly=false for Admin
                movieService.getGenres()
            ])
            setMovies(moviesData.content || [])
            setGenres(genresData)
        } catch (e) {
            setMsg({ text: 'LỖI TẢI DỮ LIỆU', type: 'error' })
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async (e) => {
        e.preventDefault()
        if (!videoFile) { setMsg({ text: 'VUI LÒNG CHỌN FILE VIDEO.', type: 'error' }); return }
        setUploading(true)
        setMsg({ text: '', type: 'success' })
        try {
            const movieData = {
                title: form.title,
                description: form.description,
                releaseYear: Number(form.releaseYear),
                durationSec: Number(form.durationSec) || null,
                posterUrl: form.posterUrl,
                genreIds: form.genreIds
            }
            const created = await api.post('/admin/movies', movieData)
            const movieId = created.data.id

            const fd = new FormData()
            fd.append('file', videoFile)
            fd.append('movieId', movieId)
            await api.post('/admin/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })

            setMsg({ text: `ĐÃ TẠO PHIM "${form.title}" THÀNH CÔNG VÀ ĐANG BẮT ĐẦU XỬ LÝ.`, type: 'success' })
            setForm({ title: '', description: '', releaseYear: '', durationSec: '', posterUrl: '', genreIds: [] })
            setVideoFile(null)
            await loadData()
        } catch {
            setMsg({ text: 'LỖI TẠO PHIM.', type: 'error' })
        } finally {
            setUploading(false)
        }
    }

    const handleDelete = async () => {
        try {
            await api.delete(`/admin/movies/${deleteDialog.movie.id}`)
            setMsg({ text: `ĐÃ XÓA PHIM "${deleteDialog.movie.title}".`, type: 'success' })
            setDeleteDialog({ open: false, movie: null })
            await loadData()
        } catch {
            setMsg({ text: 'LỖI XÓA PHIM.', type: 'error' })
        }
    }

    const toggleGenre = (id) => {
        const current = form.genreIds
        if (current.includes(id)) {
            setForm({ ...form, genreIds: current.filter(gId => gId !== id) })
        } else {
            setForm({ ...form, genreIds: [...current, id] })
        }
    }

    return (
        <div className="min-h-screen bg-background text-foreground font-body texture-lines-opacity">
            {/* Header */}
            <header className="border-b-[4px] border-foreground sticky top-0 bg-background z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center gap-4 justify-between">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate('/')}
                            className="bg-transparent border-[2px] border-transparent hover:border-foreground p-2 transition-none"
                            title="Quay lại"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-2">
                            <Film className="w-6 h-6" />
                            <h1 className="font-serif font-black text-2xl uppercase tracking-tighter">
                                Admin Dashboard.
                            </h1>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-12">
                
                {msg.text && (
                    <div className={`mb-8 p-4 border-[2px] border-foreground font-mono text-sm font-bold uppercase tracking-widest ${msg.type === 'error' ? 'bg-[#f5f5f5]' : 'bg-foreground text-background'}`}>
                        {msg.text}
                    </div>
                )}

                {/* Tabs Minimal */}
                <div className="flex border-b-[4px] border-foreground mb-12">
                    <button 
                        onClick={() => setTab(0)}
                        className={`px-8 py-4 font-mono font-bold uppercase tracking-widest text-lg transition-none ${tab === 0 ? 'bg-foreground text-background' : 'bg-transparent text-foreground hover:bg-[#e5e5e5]'}`}
                    >
                        Danh Mục
                    </button>
                    <button 
                        onClick={() => setTab(1)}
                        className={`px-8 py-4 font-mono font-bold uppercase tracking-widest text-lg transition-none ${tab === 1 ? 'bg-foreground text-background' : 'bg-transparent text-foreground hover:bg-[#e5e5e5]'}`}
                    >
                        Thêm Mới
                    </button>
                </div>

                {/* TAB 0: List */}
                {tab === 0 && (
                    <div>
                        {loading ? (
                            <div className="flex justify-center p-12">
                                <Loader2 className="w-12 h-12 animate-spin text-foreground" />
                            </div>
                        ) : (
                            <div className="w-full overflow-x-auto border-[2px] border-foreground bg-background shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                                <table className="w-full text-left font-mono text-sm">
                                    <thead className="bg-[#f0f0f0] border-b-[2px] border-foreground uppercase">
                                        <tr>
                                            <th className="p-4 border-r border-[#ccc]">ID</th>
                                            <th className="p-4 border-r border-[#ccc]">Tên Phim</th>
                                            <th className="p-4 border-r border-[#ccc]">Năm</th>
                                            <th className="p-4 border-r border-[#ccc]">Trạng Thái</th>
                                            <th className="p-4 border-r border-[#ccc]">Lượt Xem</th>
                                            <th className="p-4 border-r border-[#ccc]">Đánh Giá</th>
                                            <th className="p-4 text-center">Thao Tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {movies.map((m, idx) => (
                                            <tr key={m.id} className={`border-b border-[#ccc] hover:bg-foreground hover:text-background group transition-colors duration-100 ${idx % 2 === 0 ? 'bg-transparent' : 'bg-[#fafafa]'}`}>
                                                <td className="p-4 border-r border-[#ccc] group-hover:border-[#333]">{m.id}</td>
                                                <td className="p-4 border-r border-[#ccc] group-hover:border-[#333] font-bold min-w-[200px]">{m.title}</td>
                                                <td className="p-4 border-r border-[#ccc] group-hover:border-[#333]">{m.releaseYear}</td>
                                                <td className="p-4 border-[1px] border-foreground">
                                                    {m.status === 'READY' && <span className="text-green-600 font-bold uppercase block text-center text-xs">READY</span>}
                                                    {m.status === 'FAILED' && <span className="text-red-600 font-bold uppercase block text-center text-xs">FAILED</span>}
                                                    {m.status === 'PROCESSING' && (
                                                        <div className="w-full bg-background border-[1px] border-foreground h-4 relative overflow-hidden group">
                                                            <div 
                                                                className="h-full bg-foreground transition-all duration-300"
                                                                style={{ width: `${progressMap[m.id] || 0}%` }}
                                                            />
                                                            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold uppercase mix-blend-difference text-white">
                                                                {progressMap[m.id] !== undefined ? `${progressMap[m.id]}%` : 'WAIT'}
                                                            </span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-4 border-r border-[#ccc] group-hover:border-[#333]">{m.viewsCount?.toLocaleString()}</td>
                                                <td className="p-4 border-r border-[#ccc] group-hover:border-[#333]">{m.avgRating?.toFixed(1) || '0.0'}</td>
                                                <td className="p-4 text-center">
                                                    <button 
                                                        onClick={() => setDeleteDialog({ open: true, movie: m })}
                                                        className="text-foreground border border-transparent hover:border-background p-1 group-hover:text-background"
                                                        title="Xóa"
                                                    >
                                                        <Trash2 className="w-5 h-5 mx-auto" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {movies.length === 0 && (
                                            <tr>
                                                <td colSpan="7" className="p-8 text-center italic font-serif">Chưa có bộ phim nào.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 1: Upload */}
                {tab === 1 && (
                    <div className="w-full max-w-4xl border-[4px] border-foreground bg-background p-8 md:p-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative">
                        <div className="absolute top-0 right-0 w-8 h-8 bg-foreground"></div>
                        <h2 className="text-3xl font-serif font-black uppercase mb-10 border-b-[2px] border-foreground inline-block pb-2">
                            Khởi tạo thông tin
                        </h2>

                        <form onSubmit={handleCreate} className="flex flex-col gap-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="md:col-span-2">
                                    <label className="block font-mono text-sm font-bold uppercase mb-2">Tên phim *</label>
                                    <input 
                                        type="text" required
                                        value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                                        className="w-full border-b-[4px] border-[#ccc] focus:border-foreground py-2 font-mono bg-transparent outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block font-mono text-sm font-bold uppercase mb-2">Năm ra mắt</label>
                                    <input 
                                        type="number" 
                                        value={form.releaseYear} onChange={e => setForm({...form, releaseYear: e.target.value})}
                                        className="w-full border-b-[4px] border-[#ccc] focus:border-foreground py-2 font-mono bg-transparent outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block font-mono text-sm font-bold uppercase mb-2">Thời lượng (giây)</label>
                                    <input 
                                        type="number" 
                                        value={form.durationSec} onChange={e => setForm({...form, durationSec: e.target.value})}
                                        className="w-full border-b-[4px] border-[#ccc] focus:border-foreground py-2 font-mono bg-transparent outline-none transition-colors"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block font-mono text-sm font-bold uppercase mb-2">Ảnh Poster URL</label>
                                    <input 
                                        type="text" 
                                        value={form.posterUrl} onChange={e => setForm({...form, posterUrl: e.target.value})}
                                        className="w-full border-b-[4px] border-[#ccc] focus:border-foreground py-2 font-mono bg-transparent outline-none transition-colors"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block font-mono text-sm font-bold uppercase mb-2">Mô tả tóm tắt</label>
                                    <textarea 
                                        rows="4"
                                        value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                                        className="w-full border-[2px] border-[#ccc] focus:border-foreground p-3 font-body bg-transparent outline-none transition-colors resize-y shadow-[4px_4px_0px_0px_#ccc] focus:shadow-[4px_4px_0px_0px_#000]"
                                    />
                                </div>

                                {/* Genre Selection */}
                                <div className="md:col-span-2">
                                    <label className="block font-mono text-sm font-bold uppercase mb-4">Thể loại</label>
                                    <div className="flex flex-wrap gap-3">
                                        {genres.map(g => {
                                            const isSelected = form.genreIds.includes(g.id);
                                            return (
                                                <button
                                                    key={g.id} type="button"
                                                    onClick={() => toggleGenre(g.id)}
                                                    className={`px-4 py-2 text-sm font-mono uppercase tracking-widest border-2 transition-none flex items-center gap-2 ${
                                                        isSelected 
                                                        ? 'bg-foreground text-background border-foreground' 
                                                        : 'bg-transparent text-foreground border-[#ccc] hover:border-foreground'
                                                    }`}
                                                >
                                                    {isSelected && <Check className="w-4 h-4" />}
                                                    {g.name}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Video Upload */}
                                <div className="md:col-span-2 mt-4">
                                    <label htmlFor="video-upload" className={`
                                        w-full flex flex-col items-center justify-center p-12 border-[4px] border-dashed cursor-pointer transition-colors
                                        ${videoFile ? 'border-green-600 bg-[#f0fdf4] text-green-900' : 'border-[#ccc] hover:border-foreground bg-transparent'}
                                    `}>
                                        <UploadCloud className={`w-12 h-12 mb-4 ${videoFile ? 'text-green-600' : 'text-foreground'}`} />
                                        <span className="font-mono font-bold uppercase text-lg text-center">
                                            {videoFile ? videoFile.name : 'Nhấn để chọn Video File (MP4, MKV)'}
                                        </span>
                                        <input 
                                            id="video-upload" type="file" className="hidden" accept="video/*"
                                            onChange={e => setVideoFile(e.target.files[0])}
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit" disabled={uploading}
                                className="mt-8 flex items-center justify-center w-full bg-foreground text-background font-mono font-bold text-xl uppercase tracking-widest p-6 border-[2px] border-foreground hover:bg-background hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)]"
                            >
                                {uploading ? (
                                    <span className="flex items-center gap-3"><Loader2 className="w-6 h-6 animate-spin" /> ĐANG TẢI LÊN... VUI LÒNG ĐỢI</span>
                                ) : (
                                    <span>TẠO PHIM VÀ TẢI LÊN VIDEO</span>
                                )}
                            </button>
                        </form>
                    </div>
                )}
            </main>

            {/* Modal Xóa Phim (Minimal) */}
            {deleteDialog.open && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/80 backdrop-blur-sm p-4">
                    <div className="bg-background border-[4px] border-foreground p-8 max-w-lg w-full shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
                        <h3 className="font-serif font-black text-3xl uppercase mb-6 border-b-[2px] border-foreground pb-2">
                            XÓA BỘ PHIM NÀY?
                        </h3>
                        <p className="font-body text-xl mb-12">
                            Mọi dữ liệu bao gồm phim, đánh giá, bình luận của <strong className="font-bold underline">{deleteDialog.movie?.title}</strong> sẽ bị xóa vĩnh viễn. Không thể hoàn tác.
                        </p>
                        <div className="flex gap-4 font-mono uppercase font-bold text-lg">
                            <button 
                                onClick={() => setDeleteDialog({ open: false, movie: null })}
                                className="flex-1 py-4 border-[2px] border-foreground bg-transparent hover:bg-[#e5e5e5] transition-none"
                            >
                                Hủy Bỏ
                            </button>
                            <button 
                                onClick={handleDelete}
                                className="flex-1 py-4 border-[2px] border-foreground bg-foreground text-background hover:bg-background hover:text-foreground transition-none shrink-0 border-black"
                            >
                                Xóa Ngay
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
