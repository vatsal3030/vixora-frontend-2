import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import { userService } from '../../services/api'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import { Video, Loader2, RefreshCw, AlertTriangle, ArrowLeft } from 'lucide-react'
import toast from '../../lib/toast'

export default function RestoreAccountPage() {
    const [step, setStep] = useState(1) // 1: Request, 2: Confirm
    const [identifier, setIdentifier] = useState('')
    const navigate = useNavigate()

    // --- Step 1: Request Restoration ---
    const {
        register: registerIdentifier,
        handleSubmit: handleSubmitIdentifier,
        formState: { errors: identifierErrors }
    } = useForm()

    const requestRestoreMutation = useMutation({
        mutationFn: (data) => {
            const isEmail = data.identifier.includes('@')
            const payload = isEmail ? { email: data.identifier } : { username: data.identifier }
            return userService.restoreAccountRequest(payload)
        },
        onSuccess: (data, variables) => {
            setIdentifier(variables.identifier)
            toast.success('Restoration code sent to your email')
            setStep(2)
        },
        onError: (error) => {
            const msg = error.response?.data?.message || 'Failed to request restoration'
            toast.error(msg)
        }
    })

    const onRequestSubmit = (data) => requestRestoreMutation.mutate(data)


    // --- Step 2: Confirm Restoration ---
    const [otp, setOtp] = useState(['', '', '', '', '', ''])
    const otpInputRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)]
    const [resendTimer, setResendTimer] = useState(0)
    const [expiryTimer, setExpiryTimer] = useState(0)
    const [resendLoading, setResendLoading] = useState(false)

    // Timers logic
    useEffect(() => {
        let timer
        if (resendTimer > 0) {
            timer = setTimeout(() => setResendTimer(c => c - 1), 1000)
        }
        return () => clearTimeout(timer)
    }, [resendTimer])

    useEffect(() => {
        let timer
        if (expiryTimer > 0) {
            timer = setTimeout(() => setExpiryTimer(c => c - 1), 1000)
        }
        return () => clearTimeout(timer)
    }, [expiryTimer])

    // Start timers when entering step 2
    useEffect(() => {
        if (step === 2) {
            setExpiryTimer(300) // 5 minutes code validity
            setResendTimer(120) // 2 minutes before resend allowed
        }
    }, [step])

    const confirmRestoreMutation = useMutation({
        mutationFn: (data) => {
            const isEmail = data.identifier.includes('@')
            const payload = {
                otp: data.otp,
                [isEmail ? 'email' : 'username']: data.identifier
            }
            return userService.restoreAccountConfirm(payload)
        },
        onSuccess: () => {
            toast.success('Account restored successfully! Please login.')
            navigate('/login')
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Invalid code or restoration failed')
            setOtp(['', '', '', '', '', ''])
            otpInputRefs[0].current?.focus()
        }
    })

    const handleResendCode = async () => {
        if (resendTimer > 0) return
        setResendLoading(true)
        try {
            const isEmail = identifier.includes('@')
            const payload = isEmail ? { email: identifier } : { username: identifier }
            await userService.restoreAccountRequest(payload)
            toast.success('New restoration code sent')
            setResendTimer(120) // Reset resend timer only
            setExpiryTimer(300) // Reset expiry timer as we have a new code
        } catch {
            toast.error('Failed to resend code')
        } finally {
            setResendLoading(false)
        }
    }

    const handleOtpChange = (index, value) => {
        if (value && !/^\d$/.test(value)) return
        const newOtp = [...otp]
        newOtp[index] = value
        setOtp(newOtp)
        if (value && index < 5) otpInputRefs[index + 1].current?.focus()
        if (index === 5 && value && newOtp.every(d => d !== '')) {
            confirmRestoreMutation.mutate({ identifier, otp: newOtp.join('') })
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
            confirmRestoreMutation.mutate({ identifier, otp: pastedData })
        } else {
            toast.error('Please paste a valid 6-digit code')
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
                <Link to="/login" className="inline-flex items-center text-sm text-primary hover:text-primary/80 mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                </Link>

                <div className="flex justify-center mb-6">
                    <div className="inline-flex p-4 bg-amber-500/10 rounded-2xl">
                        <RefreshCw className="w-10 h-10 text-amber-500" />
                    </div>
                </div>

                <h1 className="text-2xl font-bold">Restore Account</h1>
                <p className="text-muted-foreground text-sm">
                    {step === 1
                        ? 'Recover your deleted or deactivated account data.'
                        : `Enter the code sent to ${identifier} to confirm restoration.`}
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
                            onSubmit={handleSubmitIdentifier(onRequestSubmit)}
                            className="space-y-4"
                        >
                            <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 flex items-start gap-3 glass-panel">
                                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-muted-foreground">
                                    Account restoration will recover your profile, videos, playlists, and subscribers. Some data may be permanently lost if the deletion grace period has expired (7 days).
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="identifier">Email or Username</Label>
                                <Input
                                    id="identifier"
                                    placeholder="name@example.com"
                                    {...registerIdentifier('identifier', { required: 'Email or Username is required' })}
                                    className={identifierErrors.identifier ? 'glass-input border-destructive focus-visible:ring-destructive' : 'glass-input'}
                                />
                                {identifierErrors.identifier && (
                                    <p className="text-xs text-destructive flex items-center gap-1">
                                        <Loader2 className="w-3 h-3" />
                                        {identifierErrors.identifier.message}
                                    </p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-medium py-2.5 transition-all duration-300 shadow-lg shadow-amber-600/25"
                                disabled={requestRestoreMutation.isPending}
                            >
                                {requestRestoreMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Send Recovery Code
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
                                        disabled={confirmRestoreMutation.isPending}
                                    />
                                ))}
                            </div>

                            <div className="flex flex-col items-center gap-3">
                                {/* Expiry Timer Display */}
                                {expiryTimer > 0 && (
                                    <div className="text-xs text-muted-foreground flex items-center gap-1.5 bg-secondary/30 px-3 py-1.5 rounded-full glass-panel">
                                        <Loader2 className="w-3 h-3 animate-spin duration-[3s]" />
                                        Code expires in <span className="font-mono font-medium text-foreground">{formatTime(expiryTimer)}</span>
                                    </div>
                                )}

                                {/* Resend Button with Timer */}
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleResendCode}
                                    className="text-primary hover:text-primary/80 disabled:opacity-50"
                                    disabled={resendLoading || resendTimer > 0}
                                >
                                    {resendLoading ? (
                                        <Loader2 className="w-3 h-3 animate-spin mr-2" />
                                    ) : (
                                        <RefreshCw className={`w-3 h-3 mr-2 ${resendTimer === 0 ? '' : 'opacity-50'}`} />
                                    )}
                                    {resendTimer > 0 ? `Resend OTP in ${formatTime(resendTimer)}` : "Resend OTP"}
                                </Button>
                            </div>

                            <Button
                                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-medium py-2.5 transition-all duration-300 shadow-lg shadow-amber-600/25 border-0"
                                onClick={() => confirmRestoreMutation.mutate({ identifier, otp: otp.join('') })}
                                disabled={confirmRestoreMutation.isPending || otp.some(d => !d)}
                            >
                                {confirmRestoreMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Restore Account Data
                            </Button>
                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="text-sm text-primary hover:underline hover:text-primary/80 transition-colors"
                                >
                                    Change Email/Username
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    )
}
