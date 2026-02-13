import { useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { userService, watchHistoryService } from '../../../services/api'
import { toast } from 'sonner'
import { SettingCard, SettingSectionHeader, SettingDivider } from '../SettingCard'
import { Button } from '../../ui/Button'
import {
    Trash2,
    Download,
    History,
    Search,
    HardDrive,
    AlertTriangle,
    Loader2,
    Calendar,
    Video,
    MessageSquare,
    Heart
} from 'lucide-react'

export function AccountManagementSection() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    // Delete account state
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [mathQuestion, setMathQuestion] = useState({ num1: 0, num2: 0, operator: '+', answer: 0 })
    const [userMathAnswer, setUserMathAnswer] = useState('')

    // Mutations
    const clearHistoryMutation = useMutation({
        mutationFn: () => watchHistoryService.clearHistory(),
        onSuccess: () => toast.success('Watch history cleared'),
        onError: () => toast.error('Failed to clear watch history')
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

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown'
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Account Data Summary */}
            <SettingCard>
                <SettingSectionHeader
                    icon={HardDrive}
                    title="Your Vixora Data"
                    description="Overview of your account and content"
                />

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    <div className="p-3 bg-secondary/30 rounded-xl text-center">
                        <Video className="w-6 h-6 text-primary mx-auto mb-2" />
                        <p className="text-2xl font-bold">-</p>
                        <p className="text-xs text-muted-foreground">Videos</p>
                    </div>
                    <div className="p-3 bg-secondary/30 rounded-xl text-center">
                        <MessageSquare className="w-6 h-6 text-primary mx-auto mb-2" />
                        <p className="text-2xl font-bold">-</p>
                        <p className="text-xs text-muted-foreground">Comments</p>
                    </div>
                    <div className="p-3 bg-secondary/30 rounded-xl text-center">
                        <Heart className="w-6 h-6 text-primary mx-auto mb-2" />
                        <p className="text-2xl font-bold">-</p>
                        <p className="text-xs text-muted-foreground">Likes Given</p>
                    </div>
                    <div className="p-3 bg-secondary/30 rounded-xl text-center">
                        <Calendar className="w-6 h-6 text-primary mx-auto mb-2" />
                        <p className="text-sm font-medium">{formatDate(user?.createdAt)}</p>
                        <p className="text-xs text-muted-foreground">Member Since</p>
                    </div>
                </div>

                <Button variant="outline" disabled className="w-full sm:w-auto">
                    <Download className="w-4 h-4 mr-2" />
                    Download My Data (Coming Soon)
                </Button>
            </SettingCard>

            {/* Clear History & Data */}
            <SettingCard>
                <SettingSectionHeader
                    icon={History}
                    title="Clear History & Data"
                    description="Remove your activity data from Vixora"
                />

                <div className="space-y-3">
                    {/* Clear Watch History */}
                    <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
                        <div className="flex items-center gap-3">
                            <History className="w-5 h-5 text-muted-foreground" />
                            <div>
                                <p className="font-medium text-sm">Clear Watch History</p>
                                <p className="text-xs text-muted-foreground">Remove all videos from your watch history</p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                if (confirm('Are you sure you want to clear your watch history?')) {
                                    clearHistoryMutation.mutate()
                                }
                            }}
                            disabled={clearHistoryMutation.isPending}
                        >
                            {clearHistoryMutation.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Clear
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Clear Search History */}
                    <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
                        <div className="flex items-center gap-3">
                            <Search className="w-5 h-5 text-muted-foreground" />
                            <div>
                                <p className="font-medium text-sm">Clear Search History</p>
                                <p className="text-xs text-muted-foreground">Delete all your search queries</p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" disabled>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Clear
                        </Button>
                    </div>
                </div>
            </SettingCard>

            {/* Danger Zone */}
            <SettingCard className="border-red-500/20 bg-red-500/5">
                <SettingSectionHeader
                    icon={AlertTriangle}
                    title="Danger Zone"
                    description="Irreversible and destructive actions"
                />

                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg mb-6">
                    <p className="font-semibold text-red-500 flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4" />
                        Delete Account
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-red-800 dark:text-red-300/80 ml-1">
                        <li>Your profile, videos, and playlists will be deactivated</li>
                        <li>You have <span className="font-bold text-yellow-600 dark:text-yellow-500">7 days</span> to restore your account</li>
                        <li>After 7 days, all data is <span className="font-bold text-red-500">permanently deleted</span></li>
                    </ul>
                </div>

                {!showDeleteConfirm ? (
                    <Button
                        variant="outline"
                        onClick={() => {
                            generateMathQuestion()
                            setShowDeleteConfirm(true)
                        }}
                        className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete My Account
                    </Button>
                ) : (
                    <div className="space-y-4 max-w-sm animate-fade-in">
                        <div className="space-y-2">
                            <p className="text-sm font-medium">Security Check</p>
                            <p className="text-xs text-muted-foreground">Solve to confirm:</p>
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

export default AccountManagementSection
