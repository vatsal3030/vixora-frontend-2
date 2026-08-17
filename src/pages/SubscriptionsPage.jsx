import { useState, useMemo, useEffect } from 'react'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { VideoCard } from '../components/video/VideoCard'
import { VideoCardSkeleton } from '../components/ui/Skeleton'
import { subscriptionService, channelService } from '../services/api'
import { Disc, AlertCircle, ListVideo, Loader2 } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useInView } from 'react-intersection-observer'
import { SubscribedChannelsBar } from '../components/subscriptions/SubscribedChannelsBar'
import { useAuth } from '../context/AuthContext'

export default function SubscriptionsPage() {
    useDocumentTitle('Subscriptions - Vixora')
    const { user: currentUser } = useAuth()
    const [selectedChannelId, setSelectedChannelId] = useState(null)

    // Fetch Subscribed Videos (Feed) or Channel-specific videos when filtered
    const {
        data,
        isLoading: loadingVideos,
        error: videosError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch
    } = useInfiniteQuery({
        queryKey: ['subscriptionsFeed', selectedChannelId || 'all'],
        queryFn: async ({ pageParam = 1 }) => {
            if (selectedChannelId) {
                const response = await channelService.getChannelVideos(selectedChannelId, {
                    page: pageParam,
                    limit: 20
                })
                return response.data
            }
            const response = await subscriptionService.getSubscribedVideos({
                page: pageParam,
                limit: 20
            })
            return response.data
        },
        getNextPageParam: (lastPage) => {
            const pagination = lastPage?.data?.pagination
            if (!pagination) return undefined
            return pagination.hasNextPage ? (pagination.currentPage || 1) + 1 : undefined
        },
        staleTime: 1000 * 60 * 3,
        initialPageParam: 1
    })

    const { ref: loadMoreRef, inView } = useInView({
        threshold: 0.1,
        rootMargin: '200px',
    })

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage()
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

    // Fetch Subscribed Channels List
    const { data: channelsData = [], isLoading: loadingChannels } = useQuery({
        queryKey: ['subscribedChannels'],
        queryFn: async () => {
            const response = await subscriptionService.getSubscribedChannels({ limit: 100 })
            const data = response.data.data
            const items = data?.channels || data?.items || (Array.isArray(data) ? data : [])
            return items.map(item => item.channel ? item.channel : item)
        },
        staleTime: 1000 * 60 * 5
    })
    const channels = channelsData

    const rawVideos = useMemo(() => data?.pages.flatMap(page => page.data?.items || page.data?.videos || []) || [], [data])

    // Filter out self-videos
    const videos = useMemo(() => {
        return rawVideos.filter(v => {
            const ownerObj = v.owner || v.channel
            const ownerId = typeof ownerObj === 'object' ? (ownerObj?._id || ownerObj?.id) : ownerObj
            return ownerId !== currentUser?._id && ownerId !== currentUser?.id
        })
    }, [rawVideos, currentUser])

    return (
        <div className="min-h-screen pb-24 pt-6 px-4 sm:px-6 lg:px-8 container mx-auto max-w-[1600px] animate-in fade-in duration-500 bg-gradient-to-br from-background via-background to-primary/5">
            {/* Header Section */}
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-primary/10 rounded-xl relative group">
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <ListVideo className="w-6 h-6 text-primary relative z-10" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white font-display">Subscriptions</h1>
                    <p className="text-sm text-zinc-400 mt-1">Latest videos from creators you follow</p>
                </div>
            </div>

            {/* Subscribed Channels Bar */}
            <SubscribedChannelsBar
                channels={channels}
                isLoading={loadingChannels}
                selectedChannelId={selectedChannelId}
                onSelectChannel={setSelectedChannelId}
            />

            {videosError ? (
                <div className="text-center py-20 bg-destructive/5 rounded-xl border border-destructive/20 max-w-lg mx-auto p-6">
                    <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-4" />
                    <p className="text-destructive font-semibold text-lg">Failed to load subscriptions</p>
                    <p className="text-sm text-zinc-400 mt-1">Make sure you are logged in and subscribed to channels!</p>
                    <Button variant="outline" className="mt-4 rounded-full" onClick={() => refetch()}>Try Again</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                    {(loadingVideos || (isFetchingNextPage && videos.length === 0)) && Array.from({ length: 12 }).map((_, i) => (
                        <VideoCardSkeleton key={i} />
                    ))}

                    {!loadingVideos && videos.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center py-24 text-center glass-card rounded-xl border border-white/5 relative overflow-hidden">
                            <div className="relative z-10 flex flex-col items-center">
                                <div className="p-4 bg-secondary/30 rounded-full mb-6 relative">
                                    <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full animate-pulse" />
                                    <Disc className="w-12 h-12 text-muted-foreground/50 mx-auto animate-[spin_10s_linear_infinite]" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-2">
                                    {selectedChannelId ? "No videos from this channel" : "No videos from your subscriptions"}
                                </h3>
                                <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                                    {selectedChannelId
                                        ? "This channel hasn't uploaded any videos yet, or they have been removed."
                                        : "You haven't subscribed to any active channels yet, or they haven't uploaded anything recently."}
                                </p>
                                {selectedChannelId && (
                                    <Button onClick={() => setSelectedChannelId(null)} variant="outline" className="rounded-full">
                                        View All Subscriptions
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}

                    {videos.map((video, index) => (
                        <div
                            key={video._id || video.id || index}
                            className="animate-in fade-in slide-in-from-bottom-4 duration-400"
                            style={{ animationDelay: `${(index % 20) * 40}ms` }}
                        >
                            <VideoCard video={video} />
                        </div>
                    ))}

                    {/* Infinite Scroll Trigger */}
                    <div ref={loadMoreRef} className="col-span-full h-10 w-full flex items-center justify-center mt-8">
                        {isFetchingNextPage && <Loader2 className="w-6 h-6 animate-spin text-primary" />}
                        {!hasNextPage && videos.length > 0 && (
                            <p className="text-muted-foreground text-sm">You've reached the end</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
