/* eslint-disable react-refresh/only-export-components */
// @refresh reset
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService, userService, accountService } from '../services/api'
import { toast } from 'sonner'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [availableAccounts, setAvailableAccounts] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('vixora_accounts')) || []
        } catch { return [] }
    })

    const saveAccountLocal = useCallback((userData, accountSwitchToken) => {
        if (!userData || !accountSwitchToken) return;
        setAvailableAccounts(prev => {
            const filtered = prev.filter(acc => acc.id !== userData.id && acc.id !== userData._id)
            const updated = [...filtered, {
                id: userData.id || userData._id,
                username: userData.username,
                fullName: userData.fullName,
                email: userData.email,
                avatar: userData.avatar,
                accountSwitchToken
            }]
            localStorage.setItem('vixora_accounts', JSON.stringify(updated))
            return updated
        })
    }, [])

    const removeAccountLocal = useCallback((userId) => {
        setAvailableAccounts(prev => {
            const updated = prev.filter(acc => acc.id !== userId)
            localStorage.setItem('vixora_accounts', JSON.stringify(updated))
            return updated
        })
    }, [])

    // Check auth status on mount
    useEffect(() => {
        checkAuth()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const checkAuth = async () => {
        try {
            const response = await authService.getCurrentUser()
            if (response.data.success) {
                // Handle potentially nested user object
                const userData = response.data.data.user || response.data.data
                setUser(userData)

                // Fetch current token to keep local storage fresh
                try {
                    const tokenRes = await accountService.getAccountSwitchToken()
                    if (tokenRes.data?.data?.accountSwitchToken) {
                        saveAccountLocal(userData, tokenRes.data.data.accountSwitchToken)
                    }
                } catch (e) {
                    console.error("Failed to fetch switch token", e)
                }
            }
        } catch {
            setUser(null)
        } finally {
            setLoading(false)
        }
    }

    const login = async (credentials) => {
        try {
            const response = await authService.login(credentials)
            if (response.data.success) {
                const userData = response.data.data.user
                const switchTokenPayload = response.data.data.accountSwitch || response.data.data.accountSwitchToken

                setUser(userData)
                if (switchTokenPayload) {
                    // It might be a direct string or an object depending on backend shape
                    const tokenString = typeof switchTokenPayload === 'string' ? switchTokenPayload : switchTokenPayload.token
                    if (tokenString) saveAccountLocal(userData, tokenString)
                }

                toast.success('Login successful!')
                return response
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed')
            throw error
        }
    }

    const switchAccount = async (accountSwitchToken) => {
        setLoading(true)
        try {
            const response = await accountService.switchAccount(accountSwitchToken)
            if (response.data.success) {
                toast.success('Account switched!')
                await checkAuth()
                return true
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to switch account')
            // If the token is invalid/expired, remove it
            const tokenAccount = availableAccounts.find(a => a.accountSwitchToken === accountSwitchToken)
            if (tokenAccount) removeAccountLocal(tokenAccount.id)
        } finally {
            setLoading(false)
        }
        return false
    }

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
            const currentUser = user;
            await authService.logout()
            setUser(null)
            if (currentUser) {
                removeAccountLocal(currentUser.id || currentUser._id)
            }
            toast.success('Logged out successfully')
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error('Logout error:', error)
            }
            if (user) removeAccountLocal(user.id || user._id)
            setUser(null)
        }
    }

    const updateProfile = (updatedUser) => {
        setUser(prev => {
            const merged = { ...prev, ...updatedUser }
            // Update local storage representation too if matching
            const switchTokenItem = availableAccounts.find(a => a.id === merged.id || a.id === merged._id)
            if (switchTokenItem) {
                saveAccountLocal(merged, switchTokenItem.accountSwitchToken)
            }
            return merged
        })
    }

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            availableAccounts,
            login,
            logout,
            register,
            checkAuth,
            switchAccount,
            removeAccountLocal,
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
