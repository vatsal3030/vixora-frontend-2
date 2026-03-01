import { useState } from 'react'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

import { VideoCard } from '../components/video/VideoCard'
import { VideoCardSkeleton } from '../components/ui/Skeleton'
import { subscriptionService } from '../services/api'
import { Disc, AlertCircle } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { useQuery } from '@tanstack/react-query'
import { SubscribedChannelsBar } from '../components/subscriptions/SubscribedChannelsBar'

export default function SubscriptionsPage() {
    useDocumentTitle('Subscriptions - Vixora')
    const [selectedChannelId, setSelectedChannelId] = useState(null)

    // Fetch Subscribed Videos (Feed) - uses /feed/subscriptions
    const { data: videos = [], isLoading: loadingVideos, error: videosError } = useQuery({
        queryKey: ['subscriptionsFeed'],
        queryFn: async () => {
            const response = await subscriptionService.getSubscribedVideos()
            return response.data.data?.items || []
        }
    })

    // Fetch Subscribed Channels List
    const { data: channels = [], isLoading: loadingChannels } = useQuery({
        queryKey: ['subscribedChannels'],
        queryFn: async () => {
            const response = await subscriptionService.getSubscriptions()
            return response.data.data?.items || []
        }
    })

    // Filter logic dynamically checking if backend populated the owner object or just sent the ID string
    const filteredVideos = selectedChannelId
        ? videos.filter(v => {
            const ownerId = typeof v.owner === 'object' ? (v.owner?._id || v.owner?.id) : v.owner
            return ownerId === selectedChannelId
        })
        : videos

    // Loading state for feed
    const isLoading = loadingVideos

    return (
        <div className="space-y-2 py-2">
            {/* Subscribed Channels Bar */}
            <SubscribedChannelsBar
                channels={channels}
                isLoading={loadingChannels}
                selectedChannelId={selectedChannelId}
                onSelectChannel={setSelectedChannelId}
            />

            {videosError ? (
                <div className="text-center py-20 bg-destructive/5 rounded-xl border border-destructive/20">
                    <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-4" />
                    <p className="text-destructive font-medium">Failed to load subscriptions</p>
                    <p className="text-sm text-destructive/80 mt-1">Make sure you are subscribed to channels!</p>
                    <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>Try Again</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8">
                    {isLoading && Array.from({ length: 8 }).map((_, i) => (
                        <VideoCardSkeleton key={i} />
                    ))}

                    {!isLoading && filteredVideos.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground glass-panel rounded-xl border border-dashed border-white/10">
                            <Disc className="w-16 h-16 opacity-20 mb-4" />
                            <p className="text-lg font-medium">
                                {selectedChannelId ? "No videos from this channel" : "No videos from your subscriptions yet"}
                            </p>
                            <p className="text-sm">
                                {selectedChannelId ? "Check back later or select another channel" : "Subscribe to channels to see their videos here"}
                            </p>
                        </div>
                    )}

                    {Array.isArray(filteredVideos) && filteredVideos.map((video, index) => (
                        <div
                            key={video._id || index}
                            className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <VideoCard video={video} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
