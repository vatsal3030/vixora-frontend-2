import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../context/AuthContext'
import { motion } from 'framer-motion'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import { Video, Loader2, Upload, AlertCircle, Check, X } from 'lucide-react'
import toast from '../../lib/toast'
import { validatePassword } from '../../utils/validators'
import { FILE_SIZE_LIMITS } from '../../lib/constants'

import { ThemeToggle } from '../../components/common/ThemeToggle'

export default function SignUpPage() {
    const [avatar, setAvatar] = useState(null)
    const [avatarPreview, setAvatarPreview] = useState(null)
    const [passwordStrength, setPasswordStrength] = useState({ isValid: false, strength: 'weak', errors: [] })

    const { register: authRegister } = useAuth()
    const navigate = useNavigate()

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
        <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden py-10">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-red-900/20 via-background to-background pointer-events-none" />

            <div className="absolute top-4 right-4 z-50">
                <ThemeToggle />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-lg space-y-8 relative z-10"
            >
                <div className="text-center space-y-2">
                    <Link to="/" className="inline-flex items-center gap-2 text-primary hover:text-red-500 transition-colors">
                        <div className="p-2 bg-red-500/10 rounded-xl">
                            <Video className="w-8 h-8" />
                        </div>
                        <span className="text-2xl font-display font-bold tracking-tight">Vixora</span>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight mt-4">Create an account</h1>
                    <p className="text-muted-foreground">Join the Vixora community today</p>
                </div>

                <motion.div
                    className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 sm:p-8 shadow-2xl"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Avatar Upload */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative group cursor-pointer">
                                <div className={`w-24 h-24 rounded-full border-2 border-dashed border-border flex items-center justify-center overflow-hidden hover:border-primary transition-colors bg-background/50 ${avatarPreview ? 'border-solid border-primary' : ''}`}>
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
                                className={errors.fullName ? 'border-red-500' : ''}
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
                                className={errors.username ? 'border-red-500' : ''}
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
                                className={errors.email ? 'border-red-500' : ''}
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
                                className={errors.password ? 'border-red-500' : ''}
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

                    <p className="text-center text-sm text-muted-foreground mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-primary hover:text-red-400 hover:underline transition-all duration-200 hover:bg-primary/10 py-1 px-2 rounded">
                            Sign in
                        </Link>
                    </p>
                </motion.div>
            </motion.div>
        </div>
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
