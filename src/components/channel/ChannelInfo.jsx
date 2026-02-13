
import { Button } from '../ui/Button'
import { CheckCircle2, Bell } from 'lucide-react'
import { useState, useEffect } from 'react'
import { subscriptionService } from '../../services/api'
import { toast } from 'sonner'
import { Avatar } from '../ui/Avatar'
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
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 py-6 px-4 max-w-7xl mx-auto">
            <div className="shrink-0 rounded-full border-4 border-background overflow-hidden">
                <Avatar
                    src={channel.avatar}
                    alt={channel.name}
                    fallback={channel.name?.[0]}
                    // We'll use '2xl' which is h-32 w-32. Tailwind merge will let our className override if needed for responsiveness?
                    // Let's rely on '2xl' for now, it's a good default for channel page.
                    size="2xl"
                    className="flex"
                />
            </div>

            <div className="flex-1 text-center sm:text-left space-y-3">
                <div className="flex flex-col sm:flex-row items-center sm:items-end gap-2 sm:gap-4">
                    <h1 className="text-3xl font-bold font-display flex items-center gap-2">
                        {channel.name}
                        {channel.isVerified && ( // Changed from verified to isVerified to match typical schema, will verify
                            <CheckCircle2 className="w-6 h-6 text-gray-400 fill-current" />
                        )}
                    </h1>
                </div>

                <div className="text-gray-400 flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1 text-sm sm:text-base">
                    <span className="font-medium">@{channel.username}</span>
                    <span>{formatSubscribers(subscribersCount)} subscribers</span>
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
    )
}
