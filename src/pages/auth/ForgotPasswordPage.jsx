import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { AnimatePresence, motion } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import { authService } from '../../services/api'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import { Loader2, ArrowLeft, KeyRound, CheckCircle2, ShieldCheck, Mail } from 'lucide-react'
import { BrandLogo } from '../../components/common/BrandLogo'
import toast from '../../lib/toast'
import { validatePassword } from '../../utils/validators'

export default function ForgotPasswordPage() {
    const [step, setStep] = useState(1) // 1: Email, 2: OTP, 3: New Password
    const [email, setEmail] = useState('')
    const [resetToken, setResetToken] = useState(null)
    const navigate = useNavigate()

    // --- Step 1: Request OTP ---
    const {
        register: registerEmail,
        handleSubmit: handleSubmitEmail,
        formState: { errors: emailErrors }
    } = useForm()

    const requestOtpMutation = useMutation({
        mutationFn: (data) => authService.forgotPassword(data.email),
        onSuccess: () => {
            setStep(2)
            toast.success("Reset code sent to your email")
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to send reset code")
        }
    })

    const onEmailSubmit = (data) => {
        setEmail(data.email)
        requestOtpMutation.mutate({ email: data.email })
    }


    // --- Step 2: Verify OTP ---
    const [otp, setOtp] = useState(['', '', '', '', '', ''])
    const otpInputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()]

    const verifyOtpMutation = useMutation({
        mutationFn: (data) => authService.verifyResetOtp(data.email, data.otp),
        onSuccess: (data) => {
            setResetToken(data.resetToken)
            setStep(3)
            toast.success("Code verified successfully")
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Invalid code")
            setOtp(['', '', '', '', '', ''])
            otpInputRefs[0].current?.focus()
        }
    })

    const handleOtpChange = (index, value) => {
        if (value.length > 1) {
            value = value.slice(0, 1)
        }
        const newOtp = [...otp]
        newOtp[index] = value
        setOtp(newOtp)

        if (value && index < 5) {
            otpInputRefs[index + 1].current.focus()
        }
        if (index === 5 && value && newOtp.every(d => d !== '')) {
            verifyOtpMutation.mutate({ email, otp: newOtp.join('') })
        }
    }

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpInputRefs[index - 1].current.focus()
        }
    }

    const handleOtpPaste = (e) => {
        e.preventDefault()
        const pastedData = e.clipboardData.getData('text').slice(0, 6).split('')
        const newOtp = [...otp]
        pastedData.forEach((digit, index) => {
            if (index < 6) newOtp[index] = digit
        })
        setOtp(newOtp)
        if (pastedData.length > 0) {
            const focusIndex = Math.min(pastedData.length, 5)
            otpInputRefs[focusIndex].current.focus()
        }
        if (pastedData.length === 6 && newOtp.every(d => d !== '')) {
            verifyOtpMutation.mutate({ email, otp: newOtp.join('') })
        }
    }


    // --- Step 3: Reset Password ---
    const {
        register: registerPassword,
        handleSubmit: handleSubmitPassword,
        watch: watchPassword,
        formState: { errors: passwordErrors }
    } = useForm()

    const passwordValue = watchPassword('password', '')
    const [passwordStrength, setPasswordStrength] = useState({ strength: 'weak' })

    useEffect(() => {
        if (passwordValue) {
            setPasswordStrength(validatePassword(passwordValue))
        }
    }, [passwordValue])

    const resetPasswordMutation = useMutation({
        mutationFn: (data) => authService.resetPassword({
            resetToken,
            newPassword: data.password,
            confirmPassword: data.confirmPassword
        }),
        onSuccess: () => {
            toast.success('Password reset successfully! Please login.')
            navigate('/login')
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to reset password')
        }
    })

    const onPasswordSubmit = (data) => {
        if (data.password !== data.confirmPassword) {
            toast.error('Passwords do not match')
            return
        }
        resetPasswordMutation.mutate(data)
    }

    const getStrengthColor = () => {
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
                <Link to="/login" className="inline-flex items-center text-sm text-primary hover:text-primary/80 mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                </Link>

                <div className="flex justify-center mb-6">
                    <BrandLogo size="xl" />
                </div>

                <h1 className="text-3xl font-bold tracking-tight">
                    {step === 1 && 'Forgot Password?'}
                    {step === 2 && 'Verify Code'}
                    {step === 3 && 'Set New Password'}
                </h1>
                <p className="text-muted-foreground">
                    {step === 1 && 'Enter your email address and we\'ll send you a code to reset your password.'}
                    {step === 2 && `Enter the 6-digit code sent to ${email}`}
                    {step === 3 && 'Create a strong password for your account'}
                </p>
            </div>

            <motion.div
                className="glass-card rounded-2xl p-6 sm:p-8 shadow-glass-heavy"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
            >
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.form
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onSubmit={handleSubmitEmail(onEmailSubmit)}
                            className="space-y-4"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    {...registerEmail('email', {
                                        required: 'Email is required',
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: 'Invalid email address'
                                        }
                                    })}
                                    className={emailErrors.email ? 'glass-input border-destructive focus-visible:ring-destructive' : 'glass-input'}
                                />
                                {emailErrors.email && (
                                    <p className="text-xs text-destructive flex items-center gap-1">
                                        <Loader2 className="w-3 h-3" />
                                        {emailErrors.email.message}
                                    </p>
                                )}
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-600 text-white font-medium py-2.5 transition-all duration-300 shadow-lg shadow-primary/20"
                                disabled={requestOtpMutation.isPending}
                            >
                                {requestOtpMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Send Reset Code
                            </Button>
                        </motion.form>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-6"
                        >
                            <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                                {otp.map((digit, index) => (
                                    <Input
                                        key={index}
                                        ref={otpInputRefs[index]}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                        className="w-12 h-12 text-center text-lg font-semibold glass-input"
                                        maxLength={1}
                                        disabled={verifyOtpMutation.isPending}
                                    />
                                ))}
                            </div>
                            <Button
                                className="w-full bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-600 text-white font-medium py-2.5 transition-all duration-300 shadow-lg shadow-primary/20"
                                onClick={() => verifyOtpMutation.mutate({ email, otp: otp.join('') })}
                                disabled={verifyOtpMutation.isPending || otp.some(d => !d)}
                            >
                                {verifyOtpMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Verify Code
                            </Button>
                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="text-sm text-primary hover:underline hover:text-primary/80 transition-colors"
                                >
                                    Change Email
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.form
                            key="step3"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onSubmit={handleSubmitPassword(onPasswordSubmit)}
                            className="space-y-4"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="password">New Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    {...registerPassword('password', {
                                        required: 'Password is required',
                                        minLength: { value: 8, message: 'At least 8 characters' }
                                    })}
                                    className={passwordErrors.password ? 'glass-input border-destructive focus-visible:ring-destructive' : 'glass-input'}
                                />
                                {passwordValue && (
                                    <div className="h-1 w-full bg-muted/50 rounded-full overflow-hidden mt-2">
                                        <div
                                            className={`h-full ${getStrengthColor()} transition-all duration-300`}
                                            style={{ width: passwordStrength.strength === 'strong' ? '100%' : passwordStrength.strength === 'medium' ? '66%' : '33%' }}
                                        />
                                    </div>
                                )}
                                {passwordErrors.password && (
                                    <p className="text-xs text-destructive flex items-center gap-1">
                                        <Loader2 className="w-3 h-3" />
                                        {passwordErrors.password.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    {...registerPassword('confirmPassword', {
                                        required: 'Please confirm your password',
                                        validate: value => value === passwordValue || 'Passwords do not match'
                                    })}
                                    className={passwordErrors.confirmPassword ? 'glass-input border-destructive focus-visible:ring-destructive' : 'glass-input'}
                                />
                                {passwordErrors.confirmPassword && (
                                    <p className="text-xs text-destructive flex items-center gap-1">
                                        <Loader2 className="w-3 h-3" />
                                        {passwordErrors.confirmPassword.message}
                                    </p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-600 text-white font-medium py-2.5 transition-all duration-300 shadow-lg shadow-primary/20"
                                disabled={resetPasswordMutation.isPending}
                            >
                                {resetPasswordMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Reset Password
                            </Button>
                        </motion.form>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    )
}
