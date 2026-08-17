import { Button } from '../ui/Button'
import { CheckCircle2, Bell, MoreVertical, Flag, Share2, Edit3, Film } from 'lucide-react'
import { useState, useEffect } from 'react'
import { subscriptionService } from '../../services/api'
import { toast } from 'sonner'
import { Avatar } from '../ui/Avatar'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../ui/DropdownMenu'
import { ReportDialog } from '../common/ReportDialog'
import { ConfirmationDialog } from '../common/ConfirmationDialog'
import { ShareDialog } from '../common/ShareDialog'
import { formatSubscribers } from '../../lib/utils'
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'

export default function ChannelInfo({ channel }) {
    const channelId = channel?.id || channel?._id

    const getSubscribers = () => {
        if (channel?.subscribersCount !== undefined) return channel.subscribersCount;
        if (channel?.subscribers !== undefined) return channel.subscribers;
        if (channel?._count?.subscribers !== undefined) return channel._count.subscribers;
        if (channel?.stats?.subscribers !== undefined) return channel.stats.subscribers;
        return 0;
    }

    const [isSubscribed, setIsSubscribed] = useState(channel?.isSubscribed || false)
    const [subscribersCount, setSubscribersCount] = useState(getSubscribers())
    const { user: currentUser } = useAuth()

    const isOwner = currentUser && (currentUser.id === channelId || currentUser._id === channelId || currentUser.username === channel?.username)

    // Sync state if channel prop updates
    useEffect(() => {
        setIsSubscribed(channel?.isSubscribed || false)
        setSubscribersCount(getSubscribers())
    }, [channel])

    const [showUnsubscribeDialog, setShowUnsubscribeDialog] = useState(false)

    const handleSubscribeClick = () => {
        if (!currentUser) return toast.error("Please login to subscribe")
        if (isSubscribed) {
            setShowUnsubscribeDialog(true)
        } else {
            handleSubscribeToggle()
        }
    }

    const handleSubscribeToggle = async () => {
        if (!channelId) return
        
        // Optimistic update
        const previousIsSubscribed = isSubscribed
        const previousSubscribersCount = subscribersCount
        
        setIsSubscribed(!previousIsSubscribed)
        setSubscribersCount(prev => previousIsSubscribed ? prev - 1 : prev + 1)
        
        try {
            const response = await subscriptionService.toggleSubscription(channelId)
            if (response.data?.data) {
                const { subscribed } = response.data.data
                setIsSubscribed(subscribed)
            }
            toast.success(!previousIsSubscribed ? 'Subscribed to channel' : 'Unsubscribed from channel')
        } catch (error) {
            console.error(error)
            // Revert on failure
            setIsSubscribed(previousIsSubscribed)
            setSubscribersCount(previousSubscribersCount)
            toast.error('Failed to update subscription')
        }
    }

    if (!channel) return null

    return (
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 relative">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 pb-6 relative z-10">
                <div className="shrink-0 p-1 bg-background rounded-full -mt-12 sm:-mt-20">
                    <Avatar
                        src={channel.avatar}
                        alt={channel.fullName || channel.username}
                        fallback={(channel.fullName || channel.username)?.[0]}
                        className="flex w-24 h-24 sm:w-32 sm:h-32 border-4 border-background shadow-xl text-3xl sm:text-4xl"
                    />
                </div>

                <div className="flex-1 text-center sm:text-left space-y-2 pt-2 sm:pt-0">
                    <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-4">
                        <h1 className="text-2xl sm:text-3xl font-bold font-display flex items-center gap-2 text-white">
                            {channel.fullName || channel.username}
                            {channel.isVerified && (
                                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary fill-current" />
                            )}
                        </h1>
                    </div>

                    <div className="text-zinc-400 flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1 text-xs sm:text-sm">
                        <span className="font-medium text-zinc-300">@{channel.username}</span>
                        <span>{formatSubscribers(subscribersCount)}</span>
                        <span>{channel.videosCount || channel.totalVideos || channel.stats?.totalVideos || 0} videos</span>
                    </div>

                    {channel.description && (
                        <p className="text-zinc-400 max-w-2xl text-xs sm:text-sm leading-relaxed line-clamp-2">
                            {channel.description}
                        </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2.5 justify-center sm:justify-start pt-1">
                        {!isOwner ? (
                            <Button
                                variant={isSubscribed ? "secondary" : "default"}
                                onClick={handleSubscribeClick}
                                className={`rounded-full px-6 text-xs sm:text-sm font-semibold transition-all duration-slow cursor-pointer ${isSubscribed
                                    ? 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                                    : 'bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/25'
                                    }`}
                            >
                                {isSubscribed ? (
                                    <div className="flex items-center gap-2">
                                        <Bell className="w-4 h-4 fill-current" />
                                        Subscribed
                                    </div>
                                ) : (
                                    "Subscribe"
                                )}
                            </Button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link to="/profile">
                                    <Button variant="secondary" size="sm" className="rounded-full text-xs font-semibold px-4 bg-white/10 hover:bg-white/20 text-white">
                                        <Edit3 className="w-3.5 h-3.5 mr-1.5" /> Customize Channel
                                    </Button>
                                </Link>
                                <Link to="/my-videos">
                                    <Button variant="secondary" size="sm" className="rounded-full text-xs font-semibold px-4 bg-white/10 hover:bg-white/20 text-white">
                                        <Film className="w-3.5 h-3.5 mr-1.5" /> Manage Videos
                                    </Button>
                                </Link>
                            </div>
                        )}

                        {/* Share Channel Button */}
                        <ShareDialog
                            title={`Check out ${channel.fullName || channel.username}'s channel on Vixora`}
                            url={typeof window !== 'undefined' ? window.location.href : ''}
                            trigger={
                                <Button variant="secondary" size="sm" className="rounded-full text-xs font-semibold px-3.5 bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white cursor-pointer">
                                    <Share2 className="w-3.5 h-3.5 mr-1.5" /> Share
                                </Button>
                            }
                        />

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-full text-zinc-400 hover:text-white hover:bg-white/10 h-8 w-8">
                                    <MoreVertical className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 glass-panel border-white/10 text-white bg-black/80 backdrop-blur-xl rounded-xl shadow-premium">
                                <ReportDialog targetType="CHANNEL" targetId={channel._id || channel.id} trigger={
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="hover:bg-white/10 cursor-pointer focus:bg-white/10 focus:text-white py-2.5 text-xs">
                                        <Flag className="w-3.5 h-3.5 mr-2.5 text-red-400" /> Report Channel
                                    </DropdownMenuItem>
                                } />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <ConfirmationDialog
                    open={showUnsubscribeDialog}
                    onOpenChange={setShowUnsubscribeDialog}
                    title={`Unsubscribe from ${channel.fullName || channel.username}?`}
                    description="This will remove updates and notifications from this channel."
                    confirmLabel="Unsubscribe"
                    onConfirm={() => {
                        handleSubscribeToggle()
                        setShowUnsubscribeDialog(false)
                    }}
                />
            </div>
        </div>
    )
}
