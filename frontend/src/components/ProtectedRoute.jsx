import { Navigate } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'

export default function ProtectedRoute({ children, requireAdmin = false }) {
    const { token, isAdmin } = useAuthStore()
    const isAuthenticated = !!token

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    if (requireAdmin && !isAdmin()) {
        return <Navigate to="/" replace />
    }

    return children
}
