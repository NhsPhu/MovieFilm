import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { movieService } from '../services/movieService'

export default function SearchPage() {
    const [searchParams] = useSearchParams()
    const [movies, setMovies] = useState([])
    const [genres, setGenres] = useState([])
    const [activeGenre, setActiveGenre] = useState(searchParams.get('genre') || null)
    const [query, setQuery] = useState('')

    const fallbackGenres = [
        { id: 1, name: 'Action' }, { id: 2, name: 'Comedy' }, { id: 3, name: 'Drama' },
        { id: 4, name: 'Sci-Fi' }, { id: 5, name: 'Horror' }, { id: 6, name: 'Romance' },
        { id: 7, name: 'Thriller' }, { id: 8, name: 'Animation' }
    ]

    useEffect(() => {
        movieService.getGenres()
            .then(data => setGenres(Array.isArray(data) && data.length > 0 ? data : fallbackGenres))
            .catch(() => setGenres(fallbackGenres))
    }, [])

    useEffect(() => {
        if (activeGenre) {
            movieService.getMoviesByGenre(activeGenre, 30).then(data => setMovies(Array.isArray(data) ? data : data.content || [])).catch(() => setMovies([]))
        } else {
            movieService.getMovies(0, 30, false).then(data => setMovies(data.content || data || [])).catch(() => setMovies([]))
        }
    }, [activeGenre])

    const filteredMovies = query
        ? movies.filter(m => m.title?.toLowerCase().includes(query.toLowerCase()))
        : movies

    return (
        <div className="flex min-h-screen -mt-20 pt-20">
            {/* Filter Sidebar */}
            <aside className="w-72 fixed left-0 top-0 pt-24 h-screen bg-[#201F1F] shadow-2xl shadow-black/50 overflow-y-auto hidden xl:block z-40">
                <div className="flex flex-col gap-8 py-8 px-6">
                    <div>
                        <h3 className="font-headline font-extrabold text-xs tracking-widest text-on-surface-variant uppercase mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">filter_list</span> Bộ Lọc
                        </h3>
                        <div className="mb-8">
                            <span className="text-xs font-bold text-primary mb-3 block uppercase tracking-tighter">Thể Loại</span>
                            <div className="flex flex-col gap-1">
                                <button onClick={() => setActiveGenre(null)}
                                    className={!activeGenre
                                        ? "flex items-center gap-3 py-2 px-3 text-sm font-bold text-[#FFB4AA] bg-[#2A2A2A] rounded-r-full -ml-6 pl-9 transition-all text-left"
                                        : "flex items-center gap-3 py-2 px-3 text-sm font-medium text-gray-500 hover:text-gray-200 hover:bg-[#2A2A2A] rounded-r-full transition-all text-left"
                                    }>
                                    <span className="material-symbols-outlined text-[20px]">apps</span> Tất Cả
                                </button>
                                {genres.map(genre => (
                                    <button key={genre.id} onClick={() => setActiveGenre(genre.id)}
                                        className={String(activeGenre) === String(genre.id)
                                            ? "flex items-center gap-3 py-2 px-3 text-sm font-bold text-[#FFB4AA] bg-[#2A2A2A] rounded-r-full -ml-6 pl-9 transition-all translate-x-1 text-left"
                                            : "flex items-center gap-3 py-2 px-3 text-sm font-medium text-gray-500 hover:text-gray-200 hover:bg-[#2A2A2A] rounded-r-full transition-all text-left"
                                        }>
                                        <span className="material-symbols-outlined text-[20px]">category</span> {genre.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="mb-8">
                            <span className="text-xs font-bold text-on-surface/60 mb-3 block uppercase tracking-tighter">Năm Phát Hành</span>
                            <div className="grid grid-cols-2 gap-2">
                                {['2024','2023','2022','Trước'].map(y => (
                                    <button key={y} className="py-1.5 px-3 text-xs bg-surface-container-lowest text-on-surface-variant rounded border border-outline-variant/10 hover:border-primary/50 transition-all">{y}</button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="xl:ml-72 flex-1 p-8 md:p-12 bg-surface">
                <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <h1 className="text-4xl font-black font-headline tracking-tighter mb-2">Duyệt Phim</h1>
                        <p className="text-on-surface-variant font-medium text-sm">
                            {filteredMovies.length} phim có sẵn
                            {activeGenre && genres.find(g => String(g.id) === String(activeGenre)) && (
                                <> trong <span className="text-primary italic">{genres.find(g => String(g.id) === String(activeGenre))?.name}</span></>
                            )}
                        </p>
                    </div>
                    <div className="relative w-full md:w-72">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 text-sm">search</span>
                        <input className="w-full bg-surface-container-lowest border-none focus:ring-0 text-sm py-2.5 pl-10 pr-4 rounded-xl border-b-2 border-transparent focus:border-primary transition-all" placeholder="Tìm kiếm phim..." value={query} onChange={e => setQuery(e.target.value)}/>
                    </div>
                </div>

                {filteredMovies.length === 0 ? (
                    <div className="text-center py-20">
                        <span className="material-symbols-outlined text-6xl text-surface-container-highest mb-4 block">movie</span>
                        <p className="text-on-surface-variant text-lg">Không tìm thấy phim nào</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                        {filteredMovies.map((movie, i) => (
                            <Link key={movie.id || i} to={`/movie/${movie.id}`} className="group relative aspect-[2/3] bg-surface-container-high overflow-hidden rounded-lg hover:scale-[1.03] transition-transform duration-500 shadow-xl">
                                <img className="w-full h-full object-cover" alt={movie.title} src={movie.posterUrl || movie.backdropUrl || 'https://via.placeholder.com/200x300?text=No+Image'}/>
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                                <div className="absolute bottom-0 left-0 p-4 z-10 w-full">
                                    <h4 className="font-headline font-bold text-sm leading-tight mb-1 line-clamp-2 text-white">{movie.title}</h4>
                                    <div className="flex items-center gap-3 text-[10px] text-on-surface-variant font-medium">
                                        <span>{movie.releaseYear || '—'}</span>
                                        {movie.rating && (
                                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[12px]" style={{fontVariationSettings: "'FILL' 1"}}>star</span> {movie.rating}</span>
                                        )}
                                        <span className="px-1.5 py-0.5 border border-outline-variant/30 rounded text-[9px]">HD</span>
                                    </div>
                                </div>
                                {/* Hover play overlay */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                                    <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center">
                                        <span className="material-symbols-outlined text-white" style={{fontVariationSettings: "'FILL' 1"}}>play_arrow</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
