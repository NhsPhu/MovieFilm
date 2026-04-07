import { useState, useEffect } from 'react'
import { movieService } from '../services/movieService'
import { adminService } from '../services/adminService'

export default function AdminMoviesPage() {
    const [movies, setMovies] = useState([])
    const [showUpload, setShowUpload] = useState(false)
    const [uploadData, setUploadData] = useState({ 
        title: '', 
        description: '', 
        director: '', 
        cast: '',
        releaseYear: '', 
        duration: '', 
        genreIds: '',
        trailerUrl: '',
        language: '',
        ageRating: ''
    })
    const [files, setFiles] = useState({ video: null, poster: null, backdrop: null })
    const [uploading, setUploading] = useState(false)

    useEffect(() => {
        loadMovies()
    }, [])

    const loadMovies = () => {
        adminService.getMovies(0, 50).then(data => setMovies(data.content || data || [])).catch(() => setMovies([]))
    }

    const handleUpload = async (e) => {
        e.preventDefault()
        setUploading(true)
        try {
            const formData = new FormData()
            formData.append('title', uploadData.title)
            formData.append('description', uploadData.description)
            formData.append('director', uploadData.director)
            formData.append('cast', uploadData.cast)
            formData.append('releaseYear', uploadData.releaseYear)
            formData.append('duration', uploadData.duration)
            formData.append('trailerUrl', uploadData.trailerUrl)
            formData.append('language', uploadData.language)
            formData.append('ageRating', uploadData.ageRating)
            
            if (uploadData.genreIds) uploadData.genreIds.split(',').forEach(id => formData.append('genreIds', id.trim()))
            if (files.video) formData.append('videoFile', files.video)
            if (files.poster) formData.append('posterFile', files.poster)
            if (files.backdrop) formData.append('backdropFile', files.backdrop)
            
            await movieService.createMovie(formData)
            setShowUpload(false)
            setUploadData({ title: '', description: '', director: '', cast: '', releaseYear: '', duration: '', genreIds: '', trailerUrl: '', language: '', ageRating: '' })
            setFiles({ video: null, poster: null, backdrop: null })
            loadMovies()
        } catch (err) { console.error('Upload failed:', err) }
        setUploading(false)
    }

    const handleDelete = async (id) => {
        if (!confirm('Xóa phim này?')) return
        try { await movieService.deleteMovie(id); loadMovies() } catch (err) { console.error(err) }
    }

    return (
        <div className="space-y-6 md:space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-headline font-extrabold tracking-tighter">Thư Viện Phim</h1>
                    <p className="text-stone-500 text-xs md:text-sm mt-1">Quản lý thư viện nội dung của bạn.</p>
                </div>
                <button onClick={() => setShowUpload(!showUpload)} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-container text-on-primary-container rounded-lg font-manrope font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary-container/20 w-full md:w-auto">
                    <span className="material-symbols-outlined text-sm">{showUpload ? 'close' : 'add'}</span> {showUpload ? 'Hủy' : 'Thêm Phim'}
                </button>
            </div>

            {/* Upload Form */}
            {showUpload && (
                <div className="glass-card p-8 rounded-xl border border-outline-variant/10 space-y-6">
                    <h3 className="text-xl font-headline font-bold">Tải Lên Phim Mới</h3>
                    <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-stone-500 font-bold mb-2">Tiêu Đề</label>
                            <input className="w-full bg-surface-container-lowest border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-3 px-1 text-sm" placeholder="Tên phim" value={uploadData.title} onChange={e => setUploadData({...uploadData, title: e.target.value})} required/>
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-stone-500 font-bold mb-2">Đạo Diễn</label>
                            <input className="w-full bg-surface-container-lowest border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-3 px-1 text-sm" placeholder="Tên đạo diễn" value={uploadData.director} onChange={e => setUploadData({...uploadData, director: e.target.value})}/>
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-stone-500 font-bold mb-2">Diễn Viên</label>
                            <input className="w-full bg-surface-container-lowest border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-3 px-1 text-sm" placeholder="Diễn viên 1, Diễn viên 2" value={uploadData.cast} onChange={e => setUploadData({...uploadData, cast: e.target.value})}/>
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-stone-500 font-bold mb-2">Năm Phát Hành</label>
                            <input className="w-full bg-surface-container-lowest border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-3 px-1 text-sm" type="number" placeholder="2024" value={uploadData.releaseYear} onChange={e => setUploadData({...uploadData, releaseYear: e.target.value})}/>
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-stone-500 font-bold mb-2">Thời Lượng (phút)</label>
                            <input className="w-full bg-surface-container-lowest border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-3 px-1 text-sm" type="number" placeholder="120" value={uploadData.duration} onChange={e => setUploadData({...uploadData, duration: e.target.value})}/>
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-stone-500 font-bold mb-2">Độ Tuổi (Age Rating)</label>
                            <input className="w-full bg-surface-container-lowest border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-3 px-1 text-sm" placeholder="13+, 18+, TV-MA" value={uploadData.ageRating} onChange={e => setUploadData({...uploadData, ageRating: e.target.value})}/>
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-stone-500 font-bold mb-2">Ngôn Ngữ</label>
                            <input className="w-full bg-surface-container-lowest border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-3 px-1 text-sm" placeholder="Tiếng Việt, English" value={uploadData.language} onChange={e => setUploadData({...uploadData, language: e.target.value})}/>
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-stone-500 font-bold mb-2">ID Thể Loại (cách bằng dấu phẩy)</label>
                            <input className="w-full bg-surface-container-lowest border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-3 px-1 text-sm" placeholder="1, 2, 3" value={uploadData.genreIds} onChange={e => setUploadData({...uploadData, genreIds: e.target.value})}/>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-[10px] uppercase tracking-widest text-stone-500 font-bold mb-2">Trailer URL (Youtube...)</label>
                            <input className="w-full bg-surface-container-lowest border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-3 px-1 text-sm" placeholder="https://youtube.com/..." value={uploadData.trailerUrl} onChange={e => setUploadData({...uploadData, trailerUrl: e.target.value})}/>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-[10px] uppercase tracking-widest text-stone-500 font-bold mb-2">Mô Tả</label>
                            <textarea className="w-full bg-surface-container-lowest border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-3 px-1 text-sm resize-none h-24" placeholder="Mô tả phim..." value={uploadData.description} onChange={e => setUploadData({...uploadData, description: e.target.value})}/>
                        </div>
                        
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-stone-500 font-bold mb-2">Tệp Video</label>
                            <input type="file" accept="video/*" className="text-sm text-stone-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-surface-container-high file:text-primary hover:file:bg-surface-container-highest" onChange={e => setFiles({...files, video: e.target.files[0]})}/>
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-stone-500 font-bold mb-2">Ảnh Bìa Phim (Poster)</label>
                            <input type="file" accept="image/*" className="text-sm text-stone-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-surface-container-high file:text-primary hover:file:bg-surface-container-highest" onChange={e => setFiles({...files, poster: e.target.files[0]})}/>
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-stone-500 font-bold mb-2">Ảnh Nền Phim (Backdrop)</label>
                            <input type="file" accept="image/*" className="text-sm text-stone-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-surface-container-high file:text-primary hover:file:bg-surface-container-highest" onChange={e => setFiles({...files, backdrop: e.target.files[0]})}/>
                        </div>
                        <div className="md:col-span-2 flex justify-end">
                            <button type="submit" disabled={uploading} className="flex items-center gap-2 px-8 py-3 bg-primary-container text-on-primary-container rounded-lg font-manrope font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary-container/20 disabled:opacity-50">
                                <span className="material-symbols-outlined text-sm">{uploading ? 'hourglass_top' : 'cloud_upload'}</span> {uploading ? 'Đang tải...' : 'Tải Lên Phim'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Movies Table */}
            <div className="glass-card rounded-xl border border-outline-variant/10 overflow-hidden">
                <div className="px-4 md:px-8 py-4 md:py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/10">
                    <h3 className="text-lg md:text-xl font-headline font-bold">Tất Cả Phim ({movies.length})</h3>
                    <div className="relative w-full md:w-auto">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 text-sm">search</span>
                        <input className="bg-surface-container-lowest border-none focus:ring-0 text-sm py-2 pl-10 pr-4 rounded-lg w-full md:w-64" placeholder="Tìm kiếm phim..."/>
                    </div>
                </div>
                <div className="overflow-x-auto w-full">
                    <table className="w-full min-w-[900px]">
                        <thead className="border-b border-outline-variant/10">
                        <tr>
                            <th className="text-left px-8 py-4 text-[10px] uppercase tracking-widest text-stone-500 font-bold">Phim</th>
                            <th className="text-left px-4 py-4 text-[10px] uppercase tracking-widest text-stone-500 font-bold">Đạo Diễn</th>
                            <th className="text-left px-4 py-4 text-[10px] uppercase tracking-widest text-stone-500 font-bold">Năm</th>
                            <th className="text-left px-4 py-4 text-[10px] uppercase tracking-widest text-stone-500 font-bold">Thời Lượng</th>
                            <th className="text-left px-4 py-4 text-[10px] uppercase tracking-widest text-stone-500 font-bold">Đánh Giá</th>
                            <th className="text-right px-8 py-4 text-[10px] uppercase tracking-widest text-stone-500 font-bold">Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {movies.map(movie => (
                            <tr key={movie.id} className="border-b border-outline-variant/5 hover:bg-surface-container-high/30 transition-colors group">
                                <td className="px-8 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-16 rounded overflow-hidden bg-surface-container-high shrink-0">
                                            <img className="w-full h-full object-cover" alt={movie.title} src={movie.posterUrl || 'https://via.placeholder.com/48x64'}/>
                                        </div>
                                        <span className="font-bold text-sm">{movie.title}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-4 text-sm text-stone-400">{movie.director || '—'}</td>
                                <td className="px-4 py-4 text-sm text-stone-400">{movie.releaseYear || '—'}</td>
                                <td className="px-4 py-4 text-sm text-stone-400">{movie.duration ? `${movie.duration}m` : '—'}</td>
                                <td className="px-4 py-4">
                                    <span className="text-sm text-primary font-bold">{movie.rating || '—'}</span>
                                </td>
                                <td className="px-8 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-1 text-stone-400 hover:text-tertiary transition-colors"><span className="material-symbols-outlined text-sm">edit</span></button>
                                        <button onClick={() => handleDelete(movie.id)} className="p-1 text-stone-400 hover:text-error transition-colors"><span className="material-symbols-outlined text-sm">delete</span></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            </div>
        </div>
    )
}
