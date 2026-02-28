
import { Button } from '../ui/Button'
import { CheckCircle2, Bell, MoreVertical, Flag } from 'lucide-react'
import { useState, useEffect } from 'react'
import { subscriptionService } from '../../services/api'
import { toast } from 'sonner'
import { Avatar } from '../ui/Avatar'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../ui/DropdownMenu'
import { ReportDialog } from '../common/ReportDialog'
import { ConfirmationDialog } from '../common/ConfirmationDialog'
import { formatSubscribers } from '../../lib/utils'

export default function ChannelInfo({ channel }) {
    const [isSubscribed, setIsSubscribed] = useState(channel.isSubscribed || false)
    const [subscribersCount, setSubscribersCount] = useState(channel.subscribers || 0)
    const [loading, setLoading] = useState(false)

    // Sync state if channel prop updates
    useEffect(() => {
        setIsSubscribed(channel.isSubscribed)
        setSubscribersCount(channel.subscribers)
    }, [channel])

    const [showUnsubscribeDialog, setShowUnsubscribeDialog] = useState(false)

    const handleSubscribeClick = () => {
        if (isSubscribed) {
            setShowUnsubscribeDialog(true)
        } else {
            handleSubscribeToggle()
        }
    }

    const handleSubscribeToggle = async () => {
        if (!channel._id) return
        setLoading(true)
        try {
            const response = await subscriptionService.toggleSubscription(channel._id)
            if (response.data?.data) {
                const { subscribed } = response.data.data
                setIsSubscribed(subscribed)
                setSubscribersCount(prev => subscribed ? prev + 1 : prev - 1)
                toast.success(subscribed ? 'Subscribed' : 'Unsubscribed')
            } else {
                setIsSubscribed(!isSubscribed)
                setSubscribersCount(prev => isSubscribed ? prev - 1 : prev + 1)
                toast.success(isSubscribed ? 'Unsubscribed' : 'Subscribed')
            }
        } catch (error) {
            console.error(error)
            toast.error('Failed to update subscription')
        } finally {
            setLoading(false)
        }
    }

    if (!channel) return null

    return (
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 relative">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 pb-6 relative z-10">
                <div className="shrink-0 p-1 bg-background rounded-full -mt-12 sm:-mt-20">
                    <Avatar
                        src={channel.avatar}
                        alt={channel.name}
                        fallback={channel.name?.[0]}
                        size="w-full h-full"
                        className="flex w-24 h-24 sm:w-32 sm:h-32 border-4 border-background shadow-xl text-3xl sm:text-4xl"
                    />
                </div>

                <div className="flex-1 text-center sm:text-left space-y-2 pt-2 sm:pt-0">
                    <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-4">
                        <h1 className="text-3xl font-bold font-display flex items-center gap-2">
                            {channel.name}
                            {channel.isVerified && (
                                <CheckCircle2 className="w-6 h-6 text-primary fill-current" />
                            )}
                        </h1>
                    </div>

                    <div className="text-gray-400 flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1 text-sm sm:text-base">
                        <span className="font-medium">@{channel.username}</span>
                        <span>{formatSubscribers(subscribersCount)}</span>
                        <span>{channel.videosCount || 0} videos</span>
                    </div>

                    <p className="text-gray-400 max-w-2xl text-sm leading-relaxed line-clamp-2">
                        {channel.description}
                    </p>

                    <div className="flex items-center gap-3 justify-center sm:justify-start pt-1">
                        <Button
                            variant={isSubscribed ? "secondary" : "default"}
                            onClick={handleSubscribeClick}
                            disabled={loading}
                            className={`rounded-full px-6 transition-all duration-300 ${isSubscribed
                                ? 'bg-secondary text-foreground hover:bg-secondary/80 hover:scale-105'
                                : 'hover:scale-105 shadow-lg shadow-primary/25'
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

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:bg-white/10">
                                    <MoreVertical className="w-5 h-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 glass-panel border-white/5 text-white bg-black/60 backdrop-blur-xl rounded-xl shadow-premium">
                                <ReportDialog targetType="CHANNEL" targetId={channel._id} trigger={
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="hover:bg-white/10 cursor-pointer focus:bg-white/10 focus:text-white py-3">
                                        <Flag className="w-4 h-4 mr-3" /> Report Channel
                                    </DropdownMenuItem>
                                } />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <ConfirmationDialog
                    open={showUnsubscribeDialog}
                    onOpenChange={setShowUnsubscribeDialog}
                    title={`Unsubscribe from ${channel.name}?`}
                    description="This will stop notifications from this channel."
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
