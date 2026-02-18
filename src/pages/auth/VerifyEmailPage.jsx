import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { authService } from '../../services/api'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Video, CheckCircle2, Loader2, Mail, RefreshCw, ArrowRight, AlertCircle, Clock } from 'lucide-react'
import toast from '../../lib/toast'

export default function VerifyEmailPage() {
    const location = useLocation()
    const navigate = useNavigate()
    const { checkAuth } = useAuth()

    // Steps: 'IDENTIFIER_INPUT' -> 'OTP_INPUT'
    const [step, setStep] = useState(location.state?.email ? 'OTP_INPUT' : 'IDENTIFIER_INPUT')

    // Identifier state
    const [identifier, setIdentifier] = useState(location.state?.email || '')

    // OTP state
    const [otp, setOtp] = useState(['', '', '', '', '', ''])
    const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)]

    // Status states
    const [loading, setLoading] = useState(false)
    const [resendLoading, setResendLoading] = useState(false)
    const [countdown, setCountdown] = useState(0) // 120s cooldown

    // Attempts tracking (User requested limit: 3 attempts visible UI)
    const [attempts, setAttempts] = useState(0)
    const MAX_ATTEMPTS = 3

    // Countdown timer effect
    useEffect(() => {
        let timer
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(c => c - 1), 1000)
        }
        return () => clearTimeout(timer)
    }, [countdown])

    // Auto-focus logic
    useEffect(() => {
        if (step === 'OTP_INPUT' && inputRefs[0].current) {
            // Small delay to ensure render
            setTimeout(() => inputRefs[0].current?.focus(), 100)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step])

    // Initialize from location state if available
    useEffect(() => {
        if (location.state?.email) {
            setIdentifier(location.state.email)
            setStep('OTP_INPUT')
            // Trigger OTP send if not already sent? 
            // Usually landing here means we just signed up, so backend sent it.
        }
    }, [location.state])

    const handleGetOtp = async (e) => {
        e.preventDefault()
        if (!identifier.trim()) {
            toast.error('Please enter your email or username')
            return
        }

        setLoading(true)
        try {
            await authService.resendOtp(identifier)
            toast.success('OTP sent successfully!')
            setStep('OTP_INPUT')
            setCountdown(120) // 2 minutes cooldown
            setAttempts(0) // Reset attempts on new OTP
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to send OTP'
            toast.error(msg)

            // If email is already verified, offer to login
            if (msg.includes('already verified')) {
                setTimeout(() => navigate('/login'), 2000)
            }
        } finally {
            setLoading(false)
        }
    }

    const handleResendOtp = async () => {
        if (countdown > 0) return

        setResendLoading(true)
        try {
            await authService.resendOtp(identifier)
            toast.success('New OTP sent!')
            setCountdown(120) // 2 minutes per spec
            setAttempts(0)
            setOtp(['', '', '', '', '', '']) // Clear inputs
            inputRefs[0].current?.focus()
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to resend OTP'
            if (error.response?.status === 429) {
                // Backend might say "Please wait..."
                toast.error(msg)
            } else {
                toast.error(msg)
            }
        } finally {
            setResendLoading(false)
        }
    }

    const handleOtpChange = (index, value) => {
        if (value && !/^\d$/.test(value)) return

        const newOtp = [...otp]
        newOtp[index] = value
        setOtp(newOtp)

        if (value && index < 5) {
            inputRefs[index + 1].current?.focus()
        }

        if (index === 5 && value && newOtp.every(d => d !== '')) {
            handleVerify(newOtp.join(''))
        }
    }

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs[index - 1].current?.focus()
        }
        if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs[index - 1].current?.focus()
        }
        if (e.key === 'ArrowRight' && index < 5) {
            inputRefs[index + 1].current?.focus()
        }
    }

    const handlePaste = (e) => {
        e.preventDefault()
        const pastedData = e.clipboardData.getData('text').trim()
        if (/^\d{6}$/.test(pastedData)) {
            const newOtp = pastedData.split('')
            setOtp(newOtp)
            inputRefs[5].current?.focus()
            handleVerify(pastedData)
        } else {
            toast.error('Please paste a valid 6-digit OTP')
        }
    }

    const handleVerify = async (otpCode = null) => {
        const otpString = otpCode || otp.join('')
        if (otpString.length !== 6) return

        setLoading(true)
        try {
            await authService.verifyEmail({
                identifier,
                otp: otpString
            })

            toast.success('Email verified! Redirecting...')
            await checkAuth()
            navigate('/', { replace: true })
        } catch (error) {
            const msg = error.response?.data?.message || 'Invalid OTP'
            toast.error(msg)

            // Increment local attempts
            const newAttempts = attempts + 1
            setAttempts(newAttempts)

            // Clear inputs
            setOtp(['', '', '', '', '', ''])
            inputRefs[0].current?.focus()

            // Handle backend "Too many attempts" (429) or local check
            if (error.response?.status === 429 || msg.includes('Too many')) {
                setStep('IDENTIFIER_INPUT') // Force restart
                setIdentifier('') // Optional: clear identifier to force re-entry? Or keep it.
                // Actually keeping it is better UX, but we need them to request new OTP
            }
        } finally {
            setLoading(false)
        }
    }

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m}:${s < 10 ? '0' : ''}${s} `
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full space-y-8"
        >
            <div className="text-center space-y-2">
                <Link to="/" className="inline-flex items-center gap-2 text-primary hover:text-green-500 transition-colors">
                    <div className="p-2 bg-green-500/10 rounded-xl">
                        <Video className="w-8 h-8" />
                    </div>
                    <span className="text-2xl font-display font-bold tracking-tight">Vixora</span>
                </Link>
                <div className="absolute top-0 right-0 p-4">
                    {/* Theme toggle could go here */}
                </div>
            </div>

            <motion.div
                className="glass-card rounded-2xl p-6 sm:p-8 shadow-glass-heavy"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
            >
                <AnimatePresence mode="wait">
                    {step === 'IDENTIFIER_INPUT' ? (
                        <motion.div
                            key="identifier-step"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-6"
                        >
                            <div className="text-center">
                                <h1 className="text-2xl font-bold mb-2">Verify Email</h1>
                                <p className="text-sm text-muted-foreground">
                                    Enter your email or username to receive a verification code.
                                </p>
                            </div>

                            <form onSubmit={handleGetOtp} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Email or Username</label>
                                    <Input
                                        autoFocus
                                        type="text"
                                        placeholder="name@example.com"
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        disabled={loading}
                                        className="h-11 glass-input"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full h-11 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold transition-all duration-300 shadow-lg shadow-green-600/25"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending OTP...</>
                                    ) : (
                                        <>Get OTP <ArrowRight className="w-4 h-4 ml-2" /></>
                                    )}
                                </Button>
                            </form>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="otp-step"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="text-center">
                                <h1 className="text-2xl font-bold mb-2">Enter Verification Code</h1>
                                <p className="text-sm text-muted-foreground">
                                    We've sent a 6-digit code to <span className="font-semibold text-foreground">{identifier}</span>
                                </p>
                                <button
                                    onClick={() => setStep('IDENTIFIER_INPUT')}
                                    className="text-xs text-primary hover:underline mt-2 hover:text-primary/80 transition-colors"
                                >
                                    Change email/username
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                                    {otp.map((digit, index) => (
                                        <Input
                                            key={index}
                                            ref={inputRefs[index]}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                            className={`w-12 h-12 text-center text-lg font-semibold glass-input ${attempts > 0 ? 'border-destructive/50 ring-destructive/10' : ''
                                                }`}
                                            disabled={loading}
                                        />
                                    ))}
                                </div>

                                {/* Attempts & Status UI */}
                                <div className="flex flex-col items-center gap-2 text-sm">
                                    {attempts > 0 && attempts < MAX_ATTEMPTS && (
                                        <div className="flex items-center gap-2 text-destructive animate-pulse">
                                            <AlertCircle className="w-4 h-4" />
                                            <span>Incorrect OTP. {MAX_ATTEMPTS - attempts} attempts remaining.</span>
                                        </div>
                                    )}

                                    {countdown > 0 ? (
                                        <div className="flex items-center gap-2 text-muted-foreground bg-secondary/30 px-3 py-1 rounded-full glass-panel">
                                            <Clock className="w-3 h-3" />
                                            <span>Resend available in {formatTime(countdown)}</span>
                                        </div>
                                    ) : (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleResendOtp}
                                            className="text-primary hover:text-primary/80"
                                            disabled={resendLoading}
                                        >
                                            {resendLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Resend OTP"}
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <Button
                                onClick={() => handleVerify()}
                                className="w-full h-11 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold transition-all duration-300 shadow-lg shadow-green-600/25"
                                disabled={loading || otp.some(d => d === '')}
                            >
                                {loading ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying...</>
                                ) : (
                                    <>Verify Email <CheckCircle2 className="w-4 h-4 ml-2" /></>
                                )}
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Footer Links */}
            <div className="text-center space-y-2">
                <Link to="/login" className="text-sm font-medium text-primary hover:underline hover:text-primary/80 transition-colors">
                    Back to Login
                </Link>
            </div>
        </motion.div>
    )
}
