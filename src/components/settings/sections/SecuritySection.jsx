import { useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { userService } from '../../../services/api'
import { toast } from 'sonner'
import { SettingCard, SettingSectionHeader, SettingDivider } from '../SettingCard'
import { PasswordStrengthMeter } from '../PasswordStrengthMeter'
import { Button } from '../../ui/Button'
import { Lock, Eye, EyeOff, Loader2, AlertTriangle, Shield, Smartphone } from 'lucide-react'
import { cn } from '../../../lib/utils'

export function SecuritySection() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    // Password state
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    // Delete account state
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [mathQuestion, setMathQuestion] = useState({ num1: 0, num2: 0, operator: '+', answer: 0 })
    const [userMathAnswer, setUserMathAnswer] = useState('')

    // Mutations
    const changePasswordMutation = useMutation({
        mutationFn: (data) => userService.changePassword(data),
        onSuccess: () => {
            toast.success('Password updated successfully')
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
        },
        onError: (error) => toast.error(error.response?.data?.message || 'Failed to change password')
    })

    const deleteAccountMutation = useMutation({
        mutationFn: () => userService.deleteAccount(),
        onSuccess: () => {
            toast.success('Account deleted. You can restore within 7 days.')
            logout()
            navigate('/login')
        },
        onError: () => toast.error('Failed to delete account')
    })

    const handlePasswordChange = (e) => {
        const { name, value } = e.target
        setPasswords(prev => ({ ...prev, [name]: value }))
    }

    const submitPasswordChange = (e) => {
        e.preventDefault()
        if (passwords.newPassword !== passwords.confirmPassword) {
            return toast.error("New passwords don't match")
        }
        if (passwords.newPassword.length < 8) {
            return toast.error("New password must be at least 8 characters")
        }
        changePasswordMutation.mutate({
            oldPassword: passwords.currentPassword,
            newPassword: passwords.newPassword
        })
    }

    const generateMathQuestion = () => {
        const operators = ['+', '-', '*']
        const operator = operators[Math.floor(Math.random() * operators.length)]
        let num1 = Math.floor(Math.random() * 10) + 1
        let num2 = Math.floor(Math.random() * 10) + 1
        let answer = 0

        if (operator === '-' && num2 > num1) {
            [num1, num2] = [num2, num1]
        }

        switch (operator) {
            case '+': answer = num1 + num2; break
            case '-': answer = num1 - num2; break
            case '*': answer = num1 * num2; break
        }

        setMathQuestion({ num1, num2, operator, answer })
        setUserMathAnswer('')
    }

    const handleDeleteAccount = () => {
        if (parseInt(userMathAnswer) !== mathQuestion.answer) {
            toast.error('Incorrect answer. Please try again.')
            generateMathQuestion()
            return
        }
        deleteAccountMutation.mutate()
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Password Change */}
            <SettingCard>
                <SettingSectionHeader
                    icon={Lock}
                    title="Change Password"
                    description="Update your password to keep your account secure"
                />

                {/* Login Method Info */}
                <div className="flex items-center gap-3 p-3 bg-accent/30 rounded-xl mb-6">
                    <div className="p-2 rounded-lg bg-primary/10">
                        {user?.authProvider === 'GOOGLE' ? (
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                        ) : (
                            <Lock className="w-5 h-5 text-primary" />
                        )}
                    </div>
                    <div className="flex-1">
                        <p className="font-medium text-foreground">
                            {user?.authProvider === 'GOOGLE' ? 'Google Account' :
                                user?.authProvider === 'GITHUB' ? 'GitHub Account' :
                                    'Email & Password'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {user?.authProvider === 'LOCAL'
                                ? 'You can change your password below'
                                : `Password is managed by ${user?.authProvider}`
                            }
                        </p>
                    </div>
                </div>

                {user?.authProvider === 'LOCAL' && (
                    <form onSubmit={submitPasswordChange} className="space-y-4">
                        {/* Current Password */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Current Password *</label>
                            <div className="relative">
                                <input
                                    type={showCurrentPassword ? "text" : "password"}
                                    name="currentPassword"
                                    value={passwords.currentPassword}
                                    onChange={handlePasswordChange}
                                    required
                                    className={cn(
                                        "w-full bg-secondary/50 border border-border rounded-lg px-4 py-3 pr-12",
                                        "focus:ring-2 focus:ring-primary focus:outline-none focus:border-transparent",
                                        "transition-all duration-200"
                                    )}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div>
                            <label className="block text-sm font-medium mb-1">New Password *</label>
                            <div className="relative">
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    name="newPassword"
                                    value={passwords.newPassword}
                                    onChange={handlePasswordChange}
                                    required
                                    minLength={8}
                                    className={cn(
                                        "w-full bg-secondary/50 border border-border rounded-lg px-4 py-3 pr-12",
                                        "focus:ring-2 focus:ring-primary focus:outline-none focus:border-transparent",
                                        "transition-all duration-200"
                                    )}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            <PasswordStrengthMeter password={passwords.newPassword} className="mt-3" />
                        </div>

                        {/* Confirm New Password */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Confirm New Password *</label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={passwords.confirmPassword}
                                    onChange={handlePasswordChange}
                                    required
                                    className={cn(
                                        "w-full bg-secondary/50 border border-border rounded-lg px-4 py-3 pr-12",
                                        "focus:ring-2 focus:ring-primary focus:outline-none focus:border-transparent",
                                        "transition-all duration-200",
                                        passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword && "border-red-500 focus:ring-red-500"
                                    )}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword && (
                                <p className="text-xs text-red-500 mt-1">Passwords don't match</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={
                                changePasswordMutation.isPending ||
                                !passwords.currentPassword ||
                                !passwords.newPassword ||
                                !passwords.confirmPassword ||
                                passwords.newPassword !== passwords.confirmPassword
                            }
                        >
                            {changePasswordMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Update Password
                        </Button>
                    </form>
                )}
            </SettingCard>

            {/* Two-Factor Authentication (Placeholder) */}
            <SettingCard>
                <SettingSectionHeader
                    icon={Shield}
                    title="Two-Factor Authentication"
                    description="Add an extra layer of security to your account"
                />

                <div className="flex items-center justify-between p-3 bg-accent/30 rounded-xl">
                    <div className="flex items-center gap-3">
                        <Smartphone className="w-5 h-5 text-muted-foreground" />
                        <div>
                            <p className="font-medium">2FA Status</p>
                            <p className="text-sm text-muted-foreground">Not enabled</p>
                        </div>
                    </div>
                    <Button variant="outline" disabled>
                        Coming Soon
                    </Button>
                </div>
            </SettingCard>

            {/* Danger Zone - Delete Account */}
            <SettingCard className="border-yellow-500/20 bg-yellow-500/5">
                <SettingSectionHeader
                    icon={AlertTriangle}
                    title="Delete Account"
                    description="Permanently delete your account and all associated content"
                />

                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg mb-6 space-y-2">
                    <p className="font-semibold text-yellow-600 dark:text-yellow-500 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Warning: This action is serious
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800 dark:text-yellow-200/80 ml-1">
                        <li>Your profile, videos, shorts, tweets, and playlists will be deactivated immediately</li>
                        <li>You have <span className="font-bold text-yellow-600 dark:text-yellow-500">7 days</span> to restore your account by logging in</li>
                        <li>After 7 days, all your data will be <span className="font-bold text-red-600 dark:text-red-500">permanently deleted</span></li>
                    </ul>
                </div>

                {!showDeleteConfirm ? (
                    <Button
                        variant="outline"
                        onClick={() => {
                            generateMathQuestion()
                            setShowDeleteConfirm(true)
                        }}
                        className="bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-400 border-red-500/20"
                    >
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Delete My Account
                    </Button>
                ) : (
                    <div className="space-y-4 max-w-sm animate-fade-in">
                        <div className="space-y-2">
                            <p className="text-sm font-medium">Security Check</p>
                            <p className="text-xs text-muted-foreground">
                                Solve this equation to confirm:
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="bg-secondary px-4 py-2 rounded-lg font-mono text-lg font-bold border border-border">
                                    {mathQuestion.num1} {mathQuestion.operator} {mathQuestion.num2} = ?
                                </div>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={userMathAnswer}
                                    onChange={(e) => setUserMathAnswer(e.target.value.replace(/[^0-9-]/g, ''))}
                                    className="w-20 bg-secondary/50 border border-border rounded-lg px-3 py-2 text-center font-mono font-bold focus:ring-2 focus:ring-primary focus:outline-none"
                                    placeholder="?"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="danger"
                                onClick={handleDeleteAccount}
                                disabled={deleteAccountMutation.isPending || !userMathAnswer}
                            >
                                {deleteAccountMutation.isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    'Confirm Delete'
                                )}
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    setShowDeleteConfirm(false)
                                    setUserMathAnswer('')
                                }}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}
            </SettingCard>
        </div>
    )
}

export default SecuritySection
