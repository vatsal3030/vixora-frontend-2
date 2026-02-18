import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../context/AuthContext'

import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import { Video, Loader2, X, Eye, EyeOff } from 'lucide-react'
import toast from '../../lib/toast'
import { useState, useEffect } from 'react'


import { motion } from 'framer-motion'

export default function LoginPage() {
    const { login, getGoogleAuthUrl } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [showPassword, setShowPassword] = useState(false)

    const from = location.state?.from?.pathname || '/'
    const [searchParams] = useSearchParams()

    useEffect(() => {
        const error = searchParams.get('error')
        if (error === 'oauth_state_mismatch') {
            toast.error('Google login expired or domain mismatch. Please try again.')
            // Optional: Clean up the URL
            window.history.replaceState({}, document.title, window.location.pathname)
        } else if (error) {
            toast.error('Authentication failed. Please try again.')
            window.history.replaceState({}, document.title, window.location.pathname)
        }
    }, [searchParams])

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm()

    const onSubmit = async (data) => {
        try {
            // Determine if input is email or username
            const isEmail = data.identifier.includes('@');
            const payload = {
                password: data.password,
                [isEmail ? 'email' : 'username']: data.identifier
            };

            await login(payload)
            toast.success('Welcome back!')
            navigate(from, { replace: true })
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Invalid credentials. Please try again.'

            // Check for deleted account message (generic check)
            if (errorMessage.toLowerCase().includes('deleted')) {
                toast.error(errorMessage, {
                    action: {
                        label: 'Restore',
                        onClick: () => navigate('/restore-account', { state: { identifier: data.identifier } })
                    },
                    duration: 8000
                })
            } else {
                toast.error(errorMessage)
            }
        }
    }

    const handleGoogleLogin = () => {
        window.location.href = getGoogleAuthUrl()
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full space-y-8"
        >
            <div className="text-center space-y-2">
                <Link to="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
                    <div className="p-2 bg-primary/10 rounded-xl">
                        <Video className="w-8 h-8" />
                    </div>
                    <span className="text-2xl font-display font-bold tracking-tight">Vixora</span>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight mt-4">Welcome back</h1>
                <p className="text-muted-foreground">Sign in to continue to your account</p>
            </div>

            <motion.div
                className="glass-card rounded-2xl p-6 shadow-glass-heavy"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Email or Username */}
                    <div className="space-y-2">
                        <Label htmlFor="identifier">Email or Username</Label>
                        <Input
                            id="identifier"
                            type="text"
                            placeholder="name@example.com"
                            {...register('identifier', {
                                required: 'Email or username is required'
                            })}
                            className={errors.identifier ? 'glass-input border-destructive focus-visible:ring-destructive' : 'glass-input'}
                        />
                        {errors.identifier && (
                            <p className="text-xs text-destructive flex items-center gap-1">
                                <X className="w-3 h-3" />
                                {errors.identifier.message}
                            </p>
                        )}
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="password">Password</Label>
                            <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                                Forgot password?
                            </Link>
                        </div>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                {...register('password', {
                                    required: 'Password is required',
                                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                                })}
                                className={`pr-10 glass-input ${errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                tabIndex={-1}
                            >
                                {showPassword ? (
                                    <EyeOff className="w-4 h-4" />
                                ) : (
                                    <Eye className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-xs text-destructive flex items-center gap-1">
                                <X className="w-3 h-3" />
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    {/* Sign In Button */}
                    <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-primary to-red-600 hover:from-primary/90 hover:to-red-600/90 text-primary-foreground font-medium py-2.5 transition-all duration-300 hover:shadow-lg hover:shadow-primary/25"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </Button>
                </form>

                {/* Divider */}
                <div className="mt-6 relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border"></span>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground rounded-full border border-border py-0.5">
                            Or continue with
                        </span>
                    </div>
                </div>

                {/* Google Login */}
                <div className="mt-6 flex justify-center">
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full flex items-center justify-center gap-2 hover:bg-secondary/80 transition-colors"
                        onClick={handleGoogleLogin}
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        Continue with Google
                    </Button>
                </div>

                {/* Additional Links */}
                <div className="mt-4 text-center space-y-2">
                    <Link to="/restore-account" className="text-xs text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200 block py-1.5 px-3 rounded-lg">
                        Restore deleted account?
                    </Link>
                    <Link to="/verify-email" className="text-xs text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200 block py-1.5 px-3 rounded-lg">
                        Verify email address?
                    </Link>
                </div>
            </motion.div>

            {/* Sign Up Link */}
            <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/register" className="font-semibold text-primary hover:text-primary/80 hover:underline transition-all duration-200 hover:bg-primary/10 py-1 px-2 rounded">
                    Sign up
                </Link>
            </p>
        </motion.div>
    )
}
