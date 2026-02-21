import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../context/AuthContext'
import { motion } from 'framer-motion'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import { Loader2, Upload, AlertCircle, Check, X } from 'lucide-react'
import { BrandLogo } from '../../components/common/BrandLogo'
import toast from '../../lib/toast'
import { validatePassword } from '../../utils/validators'
import { FILE_SIZE_LIMITS } from '../../lib/constants'



export default function SignUpPage() {
    const [avatar, setAvatar] = useState(null)
    const [avatarPreview, setAvatarPreview] = useState(null)
    const [passwordStrength, setPasswordStrength] = useState({ isValid: false, strength: 'weak', errors: [] })

    const { register: authRegister, getGoogleAuthUrl } = useAuth()
    const navigate = useNavigate()
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
        watch,
        formState: { errors, isSubmitting }
    } = useForm({
        mode: 'onChange'
    })

    const passwordValue = watch('password', '')

    // Update password strength as user types
    useState(() => {
        if (passwordValue) {
            const strength = validatePassword(passwordValue)
            setPasswordStrength(strength)
        }
    }, [passwordValue])

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            if (file.size > FILE_SIZE_LIMITS.AVATAR) {
                toast.error('Avatar size must be less than 5MB')
                return
            }
            if (!file.type.startsWith('image/')) {
                toast.error('Please upload an image file')
                return
            }
            setAvatar(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setAvatarPreview(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const onSubmit = async (data) => {
        try {
            // Create FormData for multipart upload
            const formData = new FormData()
            formData.append('fullName', data.fullName)
            formData.append('username', data.username)
            formData.append('email', data.email)
            formData.append('password', data.password)
            if (avatar) {
                formData.append('avatar', avatar)
            }

            await authRegister(formData)

            toast.success('Account created successfully! Please verify your email.')

            // Navigate to verify email page with email in state
            navigate('/verify-email', {
                state: { email: data.email, from: 'register' }
            })
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.'
            toast.error(errorMessage)
        }
    }

    const getPasswordStrengthColor = () => {
        switch (passwordStrength.strength) {
            case 'strong': return 'bg-green-500'
            case 'medium': return 'bg-yellow-500'
            default: return 'bg-red-500'
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full space-y-8"
        >
            <div className="text-center space-y-2">
                <Link to="/" className="inline-flex items-center gap-2 group">
                    <BrandLogo size="lg" className="group-hover:scale-105 transition-transform" />
                    <span className="text-2xl font-display font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">Vixora</span>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight mt-4">Create an account</h1>
                <p className="text-muted-foreground">Join the Vixora community today</p>
            </div>

            <motion.div
                className="glass-card rounded-2xl p-6 sm:p-8 shadow-glass-heavy"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative group cursor-pointer">
                            <div className={`w-24 h-24 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden hover:border-primary transition-colors glass-panel ${avatarPreview ? 'border-solid border-primary' : ''}`}>
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/png, image/jpeg, image/jpg, image/webp"
                                onChange={handleFileChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            {!avatarPreview && <div className="absolute -bottom-6 w-full text-center text-xs text-muted-foreground">Upload Avatar (Optional)</div>}
                        </div>
                    </div>

                    {/* Full Name */}
                    <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                            id="fullName"
                            placeholder="John Doe"
                            {...register('fullName', {
                                required: 'Full name is required',
                                minLength: { value: 3, message: 'Name must be at least 3 characters' },
                                maxLength: { value: 50, message: 'Name must be at most 50 characters' }
                            })}
                            className={errors.fullName ? 'glass-input border-red-500' : 'glass-input'}
                        />
                        {errors.fullName && (
                            <p className="text-xs text-red-500 flex items-center gap-1">
                                <X className="w-3 h-3" />
                                {errors.fullName.message}
                            </p>
                        )}
                    </div>

                    {/* Username */}
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                            id="username"
                            placeholder="johndoe_123"
                            {...register('username', {
                                required: 'Username is required',
                                minLength: { value: 3, message: 'Username must be at least 3 characters' },
                                maxLength: { value: 30, message: 'Username must be at most 30 characters' },
                                pattern: {
                                    value: /^[a-zA-Z0-9_]+$/,
                                    message: 'Username can only contain letters, numbers, and underscores'
                                }
                            })}
                            className={errors.username ? 'glass-input border-red-500' : 'glass-input'}
                        />
                        {errors.username && (
                            <p className="text-xs text-red-500 flex items-center gap-1">
                                <X className="w-3 h-3" />
                                {errors.username.message}
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Invalid email address'
                                }
                            })}
                            className={errors.email ? 'glass-input border-red-500' : 'glass-input'}
                        />
                        {errors.email && (
                            <p className="text-xs text-red-500 flex items-center gap-1">
                                <X className="w-3 h-3" />
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            {...register('password', {
                                required: 'Password is required',
                                minLength: { value: 6, message: 'Password must be at least 6 characters' },
                                validate: (value) => {
                                    const result = validatePassword(value)
                                    return result.isValid || result.errors[0]
                                }
                            })}
                            onChange={(e) => {
                                const strength = validatePassword(e.target.value)
                                setPasswordStrength(strength)
                            }}
                            className={errors.password ? 'glass-input border-red-500' : 'glass-input'}
                        />

                        {/* Password Strength Indicator */}
                        {passwordValue && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`}
                                            style={{ width: passwordStrength.strength === 'strong' ? '100%' : passwordStrength.strength === 'medium' ? '66%' : '33%' }}
                                        />
                                    </div>
                                    <span className={`text-xs font-medium ${passwordStrength.strength === 'strong' ? 'text-green-500' :
                                        passwordStrength.strength === 'medium' ? 'text-yellow-500' :
                                            'text-red-500'
                                        }`}>
                                        {passwordStrength.strength.charAt(0).toUpperCase() + passwordStrength.strength.slice(1)}
                                    </span>
                                </div>

                                {/* Password Requirements */}
                                <div className="text-xs space-y-1">
                                    <PasswordRequirement met={passwordValue.length >= 6} text="At least 6 characters" />
                                    <PasswordRequirement met={/[a-z]/.test(passwordValue)} text="One lowercase letter" />
                                    <PasswordRequirement met={/[A-Z]/.test(passwordValue)} text="One uppercase letter" />
                                    <PasswordRequirement met={/\d/.test(passwordValue)} text="One number" />
                                    <PasswordRequirement met={/[@$!%*?&]/.test(passwordValue)} text="One special character" />
                                </div>
                            </div>
                        )}

                        {errors.password && (
                            <p className="text-xs text-red-500 flex items-center gap-1">
                                <X className="w-3 h-3" />
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-medium py-2.5 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/50"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating Account...
                            </>
                        ) : (
                            'Create Account'
                        )}
                    </Button>
                </form>

                {/* Divider */}
                <div className="mt-6 relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-glass-border"></span>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="glass-panel px-2 text-muted-foreground rounded-full border border-glass-border py-0.5">
                            Or continue with
                        </span>
                    </div>
                </div>

                {/* Google Login */}
                <div className="mt-6 flex justify-center">
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full flex items-center justify-center gap-2 hover:bg-white/10 transition-colors bg-white/5 border-white/10 text-white"
                        onClick={() => window.location.href = getGoogleAuthUrl()}
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

                <p className="text-center text-sm text-muted-foreground mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold text-primary hover:text-red-400 hover:underline transition-all duration-200 hover:bg-primary/10 py-1 px-2 rounded">
                        Sign in
                    </Link>
                </p>
            </motion.div>
        </motion.div>
    )
}

// Helper component for password requirements
function PasswordRequirement({ met, text }) {
    return (
        <div className="flex items-center gap-2 text-muted-foreground">
            {met ? (
                <Check className="w-3 h-3 text-green-500" />
            ) : (
                <X className="w-3 h-3" />
            )}
            <span className={met ? 'text-green-500' : ''}>{text}</span>
        </div>
    )
}
