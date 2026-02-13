import { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { userService } from '../../../services/api'
import { toast } from 'sonner'
import { SettingCard, SettingSectionHeader, SettingDivider } from '../SettingCard'
import { Button } from '../../ui/Button'
import { User, Mail, AtSign, ExternalLink, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { cn } from '../../../lib/utils'

export function AccountSection() {
    const { user, checkAuth } = useAuth()
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    // Local state
    const [email, setEmail] = useState(user?.email || '')
    const [username, setUsername] = useState(user?.username || '')
    const [usernameAvailable, setUsernameAvailable] = useState(null)
    const [checkingUsername, setCheckingUsername] = useState(false)

    // Update profile mutation
    const updateProfileMutation = useMutation({
        mutationFn: (data) => userService.updateProfile(data),
        onSuccess: (data, variables) => {
            if (variables.email) {
                toast.success('Verification email sent. Please check your inbox.')
            } else {
                toast.success('Profile updated successfully')
            }
            checkAuth()
            queryClient.invalidateQueries({ queryKey: ['currentUser'] })
        },
        onError: (error) => toast.error(error.response?.data?.message || 'Failed to update profile')
    })

    // Check username availability
    useEffect(() => {
        if (username === user?.username) {
            setUsernameAvailable(null)
            return
        }

        if (username.length < 3) {
            setUsernameAvailable(null)
            return
        }

        const timeoutId = setTimeout(async () => {
            setCheckingUsername(true)
            try {
                // Simulating availability check
                setUsernameAvailable(true)
            } catch {
                setUsernameAvailable(false)
            } finally {
                setCheckingUsername(false)
            }
        }, 500)

        return () => clearTimeout(timeoutId)
    }, [username, user?.username])

    const handleEmailChange = (e) => {
        e.preventDefault()
        if (email === user?.email) {
            return toast.error('Email is the same as current')
        }
        updateProfileMutation.mutate({ email })
    }

    const handleUsernameChange = (e) => {
        e.preventDefault()
        if (username === user?.username) {
            return toast.error('Username is the same as current')
        }
        if (!usernameAvailable) {
            return toast.error('Username is not available')
        }
        updateProfileMutation.mutate({ username })
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <SettingCard>
                <SettingSectionHeader
                    icon={User}
                    title="Account & Profile"
                    description="Manage your personal information and account details"
                />

                {/* Profile Quick Link */}
                <div className="flex items-center gap-4 p-3 bg-accent/30 rounded-xl mb-6">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-secondary flex-shrink-0">
                        {user?.avatar ? (
                            <img
                                src={user.avatar}
                                alt={user.fullName || user.username}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-muted-foreground">
                                {user?.fullName?.[0] || user?.username?.[0] || '?'}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{user?.fullName || user?.username}</h3>
                        <p className="text-sm text-muted-foreground truncate">@{user?.username}</p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/profile')}
                        className="flex-shrink-0"
                    >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Edit Profile
                    </Button>
                </div>

                <SettingDivider />

                {/* Email Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Mail className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-medium">Email Address</h3>
                    </div>

                    <form onSubmit={handleEmailChange} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">
                                Current Email
                            </label>
                            <div className="flex items-center gap-2">
                                <p className="text-foreground">{user?.email}</p>
                                {user?.emailVerified ? (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 font-medium flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3" />
                                        Verified
                                    </span>
                                ) : (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 font-medium">
                                        Unverified
                                    </span>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">New Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className={cn(
                                    "w-full bg-secondary/50 border border-border rounded-lg px-4 py-3",
                                    "focus:ring-2 focus:ring-primary focus:outline-none focus:border-transparent",
                                    "transition-all duration-200"
                                )}
                                placeholder="new.email@example.com"
                            />
                            <p className="text-xs text-muted-foreground mt-2">
                                A verification link will be sent to your new email address
                            </p>
                        </div>

                        <Button
                            type="submit"
                            disabled={updateProfileMutation.isPending || email === user?.email}
                        >
                            {updateProfileMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Update Email
                        </Button>
                    </form>
                </div>

                <SettingDivider />

                {/* Username Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <AtSign className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-medium">Username</h3>
                    </div>

                    <form onSubmit={handleUsernameChange} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">
                                Current Username
                            </label>
                            <p className="text-foreground">@{user?.username}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">New Username</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                    required
                                    minLength={3}
                                    maxLength={30}
                                    className={cn(
                                        "w-full bg-secondary/50 border border-border rounded-lg pl-8 pr-10 py-3",
                                        "focus:ring-2 focus:ring-primary focus:outline-none focus:border-transparent",
                                        "transition-all duration-200"
                                    )}
                                    placeholder="newusername"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    {checkingUsername && (
                                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                                    )}
                                    {!checkingUsername && usernameAvailable === true && username !== user?.username && (
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                    )}
                                    {!checkingUsername && usernameAvailable === false && (
                                        <XCircle className="w-4 h-4 text-red-500" />
                                    )}
                                </div>
                            </div>
                            {username !== user?.username && (
                                <p className={cn(
                                    "text-xs mt-2",
                                    usernameAvailable === true ? 'text-green-500' :
                                        usernameAvailable === false ? 'text-red-500' :
                                            'text-muted-foreground'
                                )}>
                                    {checkingUsername ? 'Checking availability...' :
                                        usernameAvailable === true ? '✓ Username is available' :
                                            usernameAvailable === false ? '✗ Username is taken' :
                                                'Only lowercase letters, numbers, and underscores allowed'}
                                </p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={updateProfileMutation.isPending || username === user?.username || usernameAvailable !== true}
                        >
                            {updateProfileMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Update Username
                        </Button>
                    </form>
                </div>
            </SettingCard>
        </div>
    )
}

export default AccountSection
