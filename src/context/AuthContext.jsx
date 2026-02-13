import { createContext, useContext, useState, useEffect } from 'react'
import { authService, userService } from '../services/api'
import { toast } from 'sonner'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    // Check auth status on mount
    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        try {
            const response = await authService.getCurrentUser()
            if (response.data.success) {
                // Handle potentially nested user object (consistent with login vs current-user differences)
                const userData = response.data.data.user || response.data.data
                setUser(userData)
            }
        } catch (error) {
            console.error('Auth check failed:', error)
            setUser(null)
        } finally {
            setLoading(false)
        }
    }

    const login = async (credentials) => {
        try {
            const response = await authService.login(credentials)
            if (response.data.success) {
                setUser(response.data.data.user)
                toast.success('Login successful!')
                return response
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed')
            throw error
        }
    }

    // googleLogin removed - handled via server redirection

    const register = async (formData) => {
        try {
            const response = await authService.register(formData)
            if (response.data.success) {
                toast.success('Registration successful! Please verify your email.')
                return response
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed')
            throw error
        }
    }

    const forgotPassword = async (email) => {
        try {
            await authService.forgotPassword(email)
            toast.success('Reset code sent!')
        } catch (error) {
            toast.error(error.response?.data?.message || 'Request failed')
            throw error
        }
    }

    const forgotPasswordVerify = (data) => authService.forgotPasswordVerify(data)
    const resetPassword = (data) => authService.resetPassword(data)

    const verifyEmail = async (data) => {
        try {
            const response = await authService.verifyEmail(data)
            toast.success('Email verified!')
            return response
        } catch (error) {
            toast.error(error.response?.data?.message || 'Verification failed')
            throw error
        }
    }

    const restoreAccountRequest = (identifier) => userService.restoreAccountRequest({ identifier })
    const restoreAccountConfirm = (data) => userService.restoreAccountConfirm(data)

    const logout = async () => {
        try {
            await authService.logout()
            setUser(null)
            toast.success('Logged out successfully')
        } catch (error) {
            console.error('Logout error:', error)
            // Force logout on client even if server fails
            setUser(null)
        }
    }

    const updateProfile = (updatedUser) => {
        setUser(prev => ({ ...prev, ...updatedUser }))
    }

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            logout,
            register,
            checkAuth,
            updateProfile,
            forgotPassword,
            forgotPasswordVerify,
            resetPassword,
            verifyEmail,
            restoreAccountRequest,
            restoreAccountConfirm,
            getGoogleAuthUrl: authService.getGoogleAuthUrl
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
