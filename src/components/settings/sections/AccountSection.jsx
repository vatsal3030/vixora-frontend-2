import { useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { userService } from '../../../services/api'
import { toast } from 'sonner'
import { SettingCard, SettingSectionHeader, SettingDivider } from '../SettingCard'
import { Button } from '../../ui/Button'
import { User, Mail, AtSign, ExternalLink, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { cn } from '../../../lib/utils'

export function AccountSection() {
    const { user } = useAuth()
    const navigate = useNavigate()

    const [email, setEmail] = useState(user?.email || '')

    const requestEmailChangeMutation = useMutation({
        mutationFn: (email) => userService.requestEmailChange({ email }),
        onSuccess: () => {
            toast.success('Verification email sent. Please check your inbox.')
            setEmail(user?.email || '')
        },
        onError: (error) => toast.error(error.response?.data?.message || 'Failed to request email change')
    })

    const updateAvatarMutation = useMutation({
        mutationFn: (type) => userService.updateDefaultAvatar(type),
        onSuccess: (data) => {
            toast.success('Default avatar updated successfully')
            // Optimistically or force refresh auth context if needed.
            // Assuming AuthContext automatically updates or we reload user details
            window.location.reload() // simple way to refresh the global user context
        },
        onError: (error) => toast.error(error.response?.data?.message || 'Failed to update avatar')
    })

    const handleDefaultAvatarChange = (type) => {
        updateAvatarMutation.mutate(type)
    }

    const updateCoverImageMutation = useMutation({
        mutationFn: (type) => userService.updateDefaultCoverImage(type),
        onSuccess: (data) => {
            toast.success('Default cover image updated successfully')
            window.location.reload()
        },
        onError: (error) => toast.error(error.response?.data?.message || 'Failed to update cover image')
    })

    const handleDefaultCoverImageChange = (type) => {
        updateCoverImageMutation.mutate(type)
    }

    // Username checking removed as there is no backend route for changing it.

    const handleEmailChange = (e) => {
        e.preventDefault()
        if (email === user?.email) {
            return toast.error('Email is the same as current')
        }
        requestEmailChangeMutation.mutate(email)
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

                {/* Avatar Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-medium">Default Avatar Style</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Choose a default generated avatar style. (Custom uploaded avatars will be replaced)
                    </p>
                    <div className="flex gap-4 overflow-x-auto pb-2 snap-x scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                        {['adventurer', 'avataaars', 'bottts', 'fun-emoji', 'micah', 'notionists', 'shapes'].map((type) => {
                            const previewUrl = `https://api.dicebear.com/7.x/${type}/svg?seed=${user?.username || 'vixora'}`
                            const isCurrent = user?.avatar?.includes(`/${type}/`)
                            return (
                                <button
                                    key={type}
                                    onClick={() => handleDefaultAvatarChange(type)}
                                    disabled={updateAvatarMutation.isPending}
                                    className={cn(
                                        "relative shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 snap-center group bg-secondary/50",
                                        isCurrent ? "border-primary shadow-[0_0_15px_rgba(239,68,68,0.3)] scale-105" : "border-transparent hover:border-white/20 hover:scale-105"
                                    )}
                                >
                                    <img src={previewUrl} alt={type} className="w-full h-full object-cover p-2" />
                                    {isCurrent && (
                                        <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                                            <CheckCircle className="w-6 h-6 text-primary drop-shadow-md" />
                                        </div>
                                    )}
                                    <div className="absolute inset-x-0 bottom-0 bg-black/60 translate-y-full group-hover:translate-y-0 transition-transform">
                                        <p className="text-[10px] font-medium text-center py-1 capitalize text-white truncate px-1">{type}</p>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </div>

                <SettingDivider />

                {/* Cover Image Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <ExternalLink className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-medium">Default Cover Image Style</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Choose a default generated cover image style. (Custom uploaded cover images will be replaced)
                    </p>
                    <div className="flex gap-4 overflow-x-auto pb-2 snap-x scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                        {['identicon', 'initials', 'rings', 'shapes', 'thumbs'].map((type) => {
                            const previewUrl = `https://api.dicebear.com/7.x/${type}/svg?seed=${user?.username || 'vixora'}cover&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`
                            const isCurrent = user?.coverImage?.includes(`/${type}/`)
                            return (
                                <button
                                    key={`cover-${type}`}
                                    onClick={() => handleDefaultCoverImageChange(type)}
                                    disabled={updateCoverImageMutation.isPending}
                                    className={cn(
                                        "relative shrink-0 w-32 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 snap-center group bg-secondary/50",
                                        isCurrent ? "border-primary shadow-[0_0_15px_rgba(239,68,68,0.3)] scale-105" : "border-transparent hover:border-white/20 hover:scale-105"
                                    )}
                                >
                                    <img src={previewUrl} alt={type} className="w-full h-full object-cover" />
                                    {isCurrent && (
                                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                            <CheckCircle className="w-6 h-6 text-white drop-shadow-md" />
                                        </div>
                                    )}
                                    <div className="absolute inset-x-0 bottom-0 bg-black/60 translate-y-full group-hover:translate-y-0 transition-transform">
                                        <p className="text-[10px] font-medium text-center py-1 capitalize text-white truncate px-1">{type}</p>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
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
                            disabled={requestEmailChangeMutation.isPending || email === user?.email}
                        >
                            {requestEmailChangeMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
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

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">
                                Current Username
                            </label>
                            <p className="text-foreground flex items-center gap-2">
                                <span>@{user?.username}</span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">Read-only</span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">Username cannot be changed after registration.</p>
                        </div>
                    </div>
                </div>
            </SettingCard>
        </div>
    )
}

export default AccountSection
