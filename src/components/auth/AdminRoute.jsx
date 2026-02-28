import { useState, useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { adminService } from '../../services/api'
import { AppSkeleton } from '../skeletons/AppSkeleton'
import { toast } from 'sonner'

export default function AdminRoute({ children }) {
    const { user, loading: authLoading } = useAuth()
    const location = useLocation()

    const [isAdmin, setIsAdmin] = useState(false)
    const [adminLoading, setAdminLoading] = useState(true)

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                setAdminLoading(false)
                return
            }

            const checkAdmin = async () => {
                try {
                    await adminService.getMe()
                    setIsAdmin(true)
                } catch (error) {
                    setIsAdmin(false)
                    if (error.response?.status === 404) {
                        toast.error('Admin panel is currently disabled.')
                    } else if (error.response?.status === 403) {
                        // Silently reject or show brief toast
                    }
                } finally {
                    setAdminLoading(false)
                }
            }

            checkAdmin()
        }
    }, [authLoading, user])

    if (authLoading || adminLoading) {
        return <AppSkeleton />
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    if (!isAdmin) {
        return <Navigate to="/" replace />
    }

    return children
}
