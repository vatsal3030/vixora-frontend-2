import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import { authService } from '../../services/api'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import { Video, Loader2, ArrowLeft, KeyRound, CheckCircle2, ShieldCheck, Mail } from 'lucide-react'
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
        formState: { errors: emailErrors, isSubmitting: emailSubmitting }
    } = useForm()

    const requestOtpMutation = useMutation({
        mutationFn: (data) => authService.forgotPassword(data.email),
        onSuccess: (data, variables) => {
            setEmail(variables.email)
            toast.success('Reset code sent to your email')
            setStep(2)
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to send reset code')
        }
    })

    const onEmailSubmit = (data) => requestOtpMutation.mutate(data)


    // --- Step 2: Verify OTP ---
    const [otp, setOtp] = useState(['', '', '', '', '', ''])
    const otpInputRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)]

    const verifyOtpMutation = useMutation({
        mutationFn: (data) => authService.forgotPasswordVerify(data),
        onSuccess: (response) => {
            // Assuming the response contains the resetToken directly or in data
            // Adjust based on actual API response structure. 
            // Previous code used: response.data.data.resetToken
            const token = response.data?.data?.resetToken || response.data?.resetToken
            if (token) {
                setResetToken(token)
                setStep(3)
                toast.success('Code verified successfully')
            } else {
                toast.error('Verification successful but no token received')
            }
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Invalid code')
            setOtp(['', '', '', '', '', ''])
            otpInputRefs[0].current?.focus()
        }
    })

    const handleOtpChange = (index, value) => {
        if (value && !/^\d$/.test(value)) return
        const newOtp = [...otp]
        newOtp[index] = value
        setOtp(newOtp)
        if (value && index < 5) otpInputRefs[index + 1].current?.focus()
        if (index === 5 && value && newOtp.every(d => d !== '')) {
            verifyOtpMutation.mutate({ email, otp: newOtp.join('') })
        }
    }

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) otpInputRefs[index - 1].current?.focus()
    }

    const handleOtpPaste = (e) => {
        e.preventDefault()
        const pastedData = e.clipboardData.getData('text').trim()
        if (/^\d{6}$/.test(pastedData)) {
            const newOtp = pastedData.split('')
            setOtp(newOtp)
            otpInputRefs[5].current?.focus()
            verifyOtpMutation.mutate({ email, otp: pastedData })
        } else {
            toast.error('Please paste a valid 6-digit code')
        }
    }


    // --- Step 3: Reset Password ---
    const {
        register: registerPassword,
        handleSubmit: handleSubmitPassword,
        watch: watchPassword,
        formState: { errors: passwordErrors, isSubmitting: passwordSubmitting }
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
        <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-900/20 via-background to-background pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-2xl relative z-10"
            >
                <Link to="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                </Link>

                <div className="text-center space-y-2 mb-8">
                    <div className="inline-flex p-3 bg-blue-500/10 rounded-xl mb-2">
                        {step === 1 && <Mail className="w-8 h-8 text-blue-500" />}
                        {step === 2 && <ShieldCheck className="w-8 h-8 text-blue-500" />}
                        {step === 3 && <KeyRound className="w-8 h-8 text-blue-500" />}
                    </div>
                    <h1 className="text-2xl font-bold">
                        {step === 1 && 'Forgot Password?'}
                        {step === 2 && 'Verify Code'}
                        {step === 3 && 'Set New Password'}
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        {step === 1 && 'Enter your email address and we\'ll send you a code to reset your password.'}
                        {step === 2 && `Enter the 6-digit code sent to ${email}`}
                        {step === 3 && 'Create a strong password for your account'}
                    </p>
                </div>

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
                                    className={emailErrors.email ? 'border-red-500' : ''}
                                />
                                {emailErrors.email && <p className="text-xs text-red-500">{emailErrors.email.message}</p>}
                            </div>
                            <Button type="submit" className="w-full" disabled={requestOtpMutation.isPending}>
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
                                        className="w-12 h-12 text-center text-lg font-semibold"
                                        maxLength={1}
                                        disabled={verifyOtpMutation.isPending}
                                    />
                                ))}
                            </div>
                            <Button
                                className="w-full"
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
                                    className="text-sm text-primary hover:underline"
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
                                    className={passwordErrors.password ? 'border-red-500' : ''}
                                />
                                {passwordValue && (
                                    <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${getStrengthColor()} transition-all duration-300`}
                                            style={{ width: passwordStrength.strength === 'strong' ? '100%' : passwordStrength.strength === 'medium' ? '66%' : '33%' }}
                                        />
                                    </div>
                                )}
                                {passwordErrors.password && <p className="text-xs text-red-500">{passwordErrors.password.message}</p>}
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
                                    className={passwordErrors.confirmPassword ? 'border-red-500' : ''}
                                />
                                {passwordErrors.confirmPassword && <p className="text-xs text-red-500">{passwordErrors.confirmPassword.message}</p>}
                            </div>

                            <Button type="submit" className="w-full" disabled={resetPasswordMutation.isPending}>
                                {resetPasswordMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Reset Password
                            </Button>
                        </motion.form>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    )
}
