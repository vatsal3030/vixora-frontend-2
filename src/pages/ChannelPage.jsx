import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { channelService, tweetService, videoService } from '../services/api'
import ChannelBanner from '../components/channel/ChannelBanner'
import ChannelInfo from '../components/channel/ChannelInfo'
import ChannelTabs from '../components/channel/ChannelTabs'
import { VideoCard } from '../components/video/VideoCard'
import { VideoCardSkeleton } from '../components/ui/Skeleton'
import { ChannelCardSkeleton } from '../components/ui/Skeleton'
import { Loader2, ListVideo, MessageSquare } from 'lucide-react'

import { Button } from '../components/ui/Button'
import { Avatar } from '../components/ui/Avatar'
import { formatTimeAgo } from '../lib/utils'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

// Helper to sanitize username from URL params
const sanitizeUsername = (raw) => {
    if (!raw) return ''
    return raw.startsWith('@') ? raw.slice(1) : raw
}


export default function ChannelPage() {
    const { username: rawUsername } = useParams()
    const username = sanitizeUsername(rawUsername)
    const [activeTab, setActiveTab] = useState('Videos')

    // 1. Fetch Channel Profile
    const { data: channel, isLoading: loadingChannel, error: channelError } = useQuery({
        queryKey: ['channel', username],
        queryFn: async () => {

            try {
                const res = await channelService.getChannelByUsername(username)

                return res.data.data
            } catch (err) {
                console.error('Channel fetch error:', err)
                throw err
            }
        },
        enabled: !!username,
        retry: 1
    })

    // 2. Fetch Channel Videos (Infinite)
    const {
        data: videosData,
        fetchNextPage: fetchNextVideos,
        hasNextPage: hasMoreVideos,
        isFetchingNextPage: loadingMoreVideos,
        isLoading: loadingVideos
    } = useInfiniteQuery({
        queryKey: ['channelVideos', channel?._id],
        queryFn: async ({ pageParam = 1 }) => {
            const res = await videoService.getUserVideos(channel._id, { page: pageParam })
            return res.data.data
        },
        enabled: !!channel?._id && activeTab === 'Videos',
        getNextPageParam: (lastPage) => lastPage?.hasNextPage ? lastPage.nextPage : undefined,
        initialPageParam: 1
    })

    const videos = videosData?.pages.flatMap(page => page.docs || page.videos || []) || []


    // 3. Fetch Channel Playlists
    const { data: playlists, isLoading: loadingPlaylists } = useQuery({
        queryKey: ['channelPlaylists', channel?._id],
        queryFn: async () => {
            const res = await channelService.getChannelPlaylists(channel._id)
            return res.data.data || []
        },
        enabled: !!channel?._id && activeTab === 'Playlists'
    })

    // 4. Fetch Channel Tweets/Community
    const { data: tweets, isLoading: loadingTweets } = useQuery({
        queryKey: ['channelTweets', channel?._id],
        queryFn: async () => {
            const res = await tweetService.getUserTweets(channel._id)
            return res.data.data || []
        },
        enabled: !!channel?._id && activeTab === 'Tweets'
    })


    useDocumentTitle(channel?.name ? `${channel.name} - Vixora` : 'Vixora')

    if (loadingChannel) {
        return (
            <div className="min-h-screen bg-background">
                <div className="max-w-7xl mx-auto px-4">
                    <ChannelCardSkeleton />
                </div>
            </div>
        )
    }

    if (!channel || channelError) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-bold mb-2">Channel not found</h2>
                    <p className="text-muted-foreground mb-4">The channel @{username} does not exist or could not be loaded.</p>
                    {channelError && (
                        <div className="p-4 bg-destructive/10 text-destructive rounded-lg mb-4 text-sm max-w-md mx-auto">
                            Error: {channelError.message || 'Unknown error'}
                        </div>
                    )}
                    <Link to="/" className="text-primary hover:underline inline-block">Go Home</Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <ChannelBanner bannerUrl={channel.coverImage} />
            <ChannelInfo channel={channel} />
            <ChannelTabs activeTab={activeTab} onChange={setActiveTab} />

            <div className="max-w-7xl mx-auto px-4 py-4">
                {/* VIDEOS TAB */}
                {activeTab === 'Videos' && (
                    <>
                        {loadingVideos ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-6">
                                {Array.from({ length: 8 }).map((_, i) => <VideoCardSkeleton key={i} />)}
                            </div>
                        ) : videos.length === 0 ? (
                            <div className="text-center py-20 text-muted-foreground">
                                <p>This channel has no videos.</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-6">
                                    {videos.map((video, index) => (
                                        <div
                                            key={video._id}
                                            className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                                            style={{ animationDelay: `${index * 50}ms` }}
                                        >
                                            <VideoCard video={video} />
                                        </div>
                                    ))}
                                </div>
                                {hasMoreVideos && (
                                    <div className="flex justify-center mt-8">
                                        <Button
                                            variant="ghost"
                                            onClick={() => fetchNextVideos()}
                                            disabled={loadingMoreVideos}
                                        >
                                            {loadingMoreVideos ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Load More'}
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}

                {/* PLAYLISTS TAB */}
                {activeTab === 'Playlists' && (
                    <>
                        {loadingPlaylists ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : playlists?.length === 0 ? (
                            <div className="text-center py-20 text-muted-foreground">
                                <p>This channel has no playlists.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-6">
                                {playlists.map((playlist) => (
                                    <Link to={`/playlist/${playlist._id}`} key={playlist._id} className="group cursor-pointer">
                                        <div className="relative aspect-video rounded-xl overflow-hidden bg-muted mb-3 border border-border/50">
                                            {playlist.thumbnail ? (
                                                <img
                                                    src={playlist.thumbnail}
                                                    alt={playlist.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-secondary">
                                                    <ListVideo className="w-12 h-12 text-muted-foreground/50" />
                                                </div>
                                            )}
                                            {/* Overlay for playlist count */}
                                            <div className="absolute inset-y-0 right-0 w-1/3 bg-black/60 flex flex-col items-center justify-center text-white backdrop-blur-sm">
                                                <span className="font-bold text-lg">{playlist.totalVideos || 0}</span>
                                                <ListVideo className="w-5 h-5 mt-1" />
                                            </div>
                                        </div>
                                        <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">{playlist.name}</h3>
                                        <p className="text-sm text-muted-foreground">View full playlist</p>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* TWEETS TAB */}
                {activeTab === 'Tweets' && (
                    <div className="max-w-2xl mx-auto space-y-6">
                        {loadingTweets ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : tweets?.length === 0 ? (
                            <div className="text-center py-20 text-muted-foreground">
                                <p>No tweets from this channel.</p>
                            </div>
                        ) : (
                            tweets.map(tweet => (
                                <div key={tweet.id || tweet._id} className="bg-card border border-border p-6 rounded-xl hover:bg-secondary/10 transition-colors">
                                    <div className="flex gap-4">
                                        <div className="shrink-0">
                                            <Avatar src={channel.avatar} alt={channel.username} size="md" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold text-foreground">{channel.name}</span>
                                                <span className="text-xs text-muted-foreground">{formatTimeAgo(tweet.createdAt)}</span>
                                            </div>
                                            <p className="text-foreground/90 whitespace-pre-wrap">{tweet.content}</p>
                                            <div className="flex items-center gap-6 mt-4 text-muted-foreground">
                                                <button className="flex items-center gap-1.5 hover:text-primary transition-colors">
                                                    <MessageSquare className="w-4 h-4" />
                                                    <span className="text-xs font-medium">0</span>
                                                </button>
                                                {/* Add Like button logic here later if needed */}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* ABOUT TAB */}
                {activeTab === 'About' && (
                    <div className="max-w-3xl mx-auto">
                        <div className="bg-card border border-border p-8 rounded-2xl">
                            <h3 className="text-xl font-bold mb-6 font-display">About {channel.name}</h3>
                            <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                {channel.description || "No description provided."}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-8 border-t border-border">
                                {[
                                    { label: 'Joined', value: new Date(channel.createdAt).toLocaleDateString() },
                                    { label: 'Views', value: (channel.views || 0).toLocaleString() },
                                    { label: 'Subscribers', value: (channel.subscribers || channel.subscribersCount || 0).toLocaleString() },
                                    { label: 'Videos', value: (channel.videosCount || 0).toLocaleString() }
                                ].map((stat) => (
                                    <div key={stat.label} className="glass-card p-4 rounded-xl flex justify-between items-center group hover:bg-secondary/40 transition-colors">
                                        <span className="text-muted-foreground font-medium">{stat.label}</span>
                                        <span className="text-foreground font-bold text-lg group-hover:text-primary transition-colors">{stat.value}</span>
                                    </div>
                                ))}
                                {/* Social links or other info could go here */}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
