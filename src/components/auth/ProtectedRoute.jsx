import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { AppSkeleton } from '../skeletons/AppSkeleton'

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth()
    const location = useLocation()

    if (loading) {
        return <AppSkeleton />
    }

    if (!user) {
        // Redirect to login but save the attempted url
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    return children
}
