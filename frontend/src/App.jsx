import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import MovieDetailPage from './pages/MovieDetailPage'
import WatchPage from './pages/WatchPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AdminPage from './pages/AdminPage'
import SearchPage from './pages/SearchPage'
import BrowsePage from './pages/BrowsePage'
import Navbar from './components/Navbar'

function App() {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/browse" element={<BrowsePage />} />
                <Route path="/movie/:id" element={<MovieDetailPage />} />
                <Route path="/watch/:id" element={<WatchPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/admin" element={<AdminPage />} />
            </Routes>
        </Router>
    )
}

export default App
