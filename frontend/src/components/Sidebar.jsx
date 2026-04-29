import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { movieService } from '../services/movieService'

const genreIcons = {
    'Action': 'bolt', 'Comedy': 'mood', 'Drama': 'theater_comedy',
    'Sci-Fi': 'rocket_launch', 'Horror': 'skull', 'Romance': 'favorite',
    'Thriller': 'flash_on', 'Animation': 'animation', 'Documentary': 'videocam',
    'Adventure': 'explore', 'Fantasy': 'auto_awesome', 'Mystery': 'psychology',
    'Music': 'music_note', 'War': 'shield', 'Crime': 'gavel',
    'History': 'history_edu', 'Family': 'family_restroom', 'Western': 'landscape',
}

export default function Sidebar() {
    const [genres, setGenres] = useState([])
    const [activeGenre, setActiveGenre] = useState(null)

    useEffect(() => {
        movieService.getGenres()
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    setGenres(data)
                } else {
                    // Fallback genres
                    setGenres([
                        { id: 1, name: 'Action' }, { id: 2, name: 'Comedy' }, { id: 3, name: 'Drama' },
                        { id: 4, name: 'Sci-Fi' }, { id: 5, name: 'Horror' }, { id: 6, name: 'Romance' },
                        { id: 7, name: 'Thriller' }, { id: 8, name: 'Animation' }
                    ])
                }
            })
            .catch(() => {
                setGenres([
                    { id: 1, name: 'Action' }, { id: 2, name: 'Comedy' }, { id: 3, name: 'Drama' },
                    { id: 4, name: 'Sci-Fi' }, { id: 5, name: 'Horror' }, { id: 6, name: 'Romance' },
                    { id: 7, name: 'Thriller' }, { id: 8, name: 'Animation' }
                ])
            })
    }, [])

    return (
        <aside className="h-full w-64 fixed left-0 top-0 pt-24 bg-[#201F1F] flex flex-col gap-4 py-8 pr-4 shadow-2xl shadow-black/50 z-40 hidden xl:flex">
            <div className="px-6 mb-4">

                <h3 className="font-headline font-bold text-[#FFB4AA] text-lg tracking-tight">Thể Loại</h3>
                <p className="text-xs text-gray-500 font-body">Duyệt theo thể loại</p>
            </div>
            <nav className="flex flex-col gap-1 overflow-y-auto flex-1 hide-scrollbar">
                {genres.map(genre => (
                    <Link
                        key={genre.id}
                        to={`/browse?genre=${genre.id}`}
                        onClick={() => setActiveGenre(genre.id)}
                        className={activeGenre === genre.id
                            ? "flex items-center gap-3 px-6 py-2.5 text-[#FFB4AA] font-bold bg-[#2A2A2A] rounded-r-full translate-x-1 duration-200"
                            : "flex items-center gap-3 px-6 py-2.5 text-gray-500 hover:text-gray-200 hover:bg-[#2A2A2A] rounded-r-full transition-all"
                        }
                    >
                        <span className="material-symbols-outlined text-lg">{genreIcons[genre.name] || 'category'}</span>
                        <span className="font-body text-sm font-medium">{genre.name}</span>
                    </Link>
                ))}
            </nav>
            <div className="mt-auto px-6 pt-4">
                <Link to="/browse" className="block w-full py-2 text-center border border-outline-variant/30 text-xs font-bold uppercase tracking-widest hover:bg-surface-container-highest transition-colors rounded">
                    Tất Cả Phim
                </Link>
            </div>
        </aside>
    )
}
