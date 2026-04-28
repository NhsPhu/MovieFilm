import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Footer from './components/Footer'
import AdminLayout from './components/AdminLayout'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'

import HomePage from './pages/HomePage'
import MovieDetailPage from './pages/MovieDetailPage'
import WatchPage from './pages/WatchPage'
import SearchPage from './pages/SearchPage'
import BrowsePage from './pages/BrowsePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AdminDashboard from './pages/AdminDashboard'
import AdminUsersPage from './pages/AdminUsersPage'
import AdminMoviesPage from './pages/AdminMoviesPage'
import AdminAnalyticsPage from './pages/AdminAnalyticsPage'
import ProfilePage from './pages/ProfilePage'
import NotFoundPage from './pages/NotFoundPage'

function PublicLayout() {
    return (
        <div className="bg-background text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container min-h-screen">
            <Navbar />
            <div className="flex">
                <Sidebar />
                <main className="flex-1 xl:ml-64 pt-20">
                    <Outlet />
                    <Footer />
                </main>
            </div>
        </div>
    )
}

function PlayerLayout() {
    return (
        <div className="bg-background text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container min-h-screen">
            <Navbar />
            <main className="pt-20">
                <Outlet />
            </main>
            <Footer />
        </div>
    )
}

export default function App() {
    return (
        <ErrorBoundary>
            <BrowserRouter>
                <Routes>
                    {/* Auth pages — own layout */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    {/* Player layout (no sidebar) */}
                    <Route element={<PlayerLayout />}>
                        <Route path="/watch/:id" element={<WatchPage />} />
                        <Route path="/movie/:id" element={<MovieDetailPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                    </Route>

                    {/* Admin layout — protected, requires ADMIN role */}
                    <Route path="/admin" element={
                        <ProtectedRoute requireAdmin>
                            <AdminLayout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<AdminDashboard />} />
                        <Route path="users" element={<AdminUsersPage />} />
                        <Route path="movies" element={<AdminMoviesPage />} />
                        <Route path="analytics" element={<AdminAnalyticsPage />} />
                    </Route>

                    {/* Public layout (sidebar + navbar + footer) */}
                    <Route element={<PublicLayout />}>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/search" element={<SearchPage />} />
                        <Route path="/browse" element={<BrowsePage />} />
                        <Route path="/series" element={<BrowsePage movieType="SERIES" title="Phim Bộ" />} />
                        <Route path="/films" element={<BrowsePage movieType="SINGLE" title="Phim Lẻ" />} />
                        <Route path="/new-popular" element={<BrowsePage title="Mới & Phổ Biến" />} />
                    </Route>

                    {/* 404 catch-all */}
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </BrowserRouter>
        </ErrorBoundary>
    )
}
