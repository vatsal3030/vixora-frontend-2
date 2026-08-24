import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { useInView } from 'react-intersection-observer'
import { channelService } from '../services/api'
import ChannelBanner from '../components/channel/ChannelBanner'
import ChannelInfo from '../components/channel/ChannelInfo'
import ChannelTabs from '../components/channel/ChannelTabs'
import { VideoCard } from '../components/video/VideoCard'
import { PlaylistCard } from '../components/playlist/PlaylistCard'
import { VideoCardSkeleton, PlaylistCardSkeleton, ChannelCardSkeleton } from '../components/ui/Skeleton'
import { Smartphone, ListVideo, Loader2, Video } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { TweetCard } from '../components/tweet/TweetCard'
import { formatViews } from '../lib/utils'
import SEO from '../components/common/SEO'

// Helper to sanitize username from URL params
const sanitizeUsername = (raw) => {
    if (!raw) return ''
    return raw.startsWith('@') ? raw.slice(1) : raw
}

export default function ChannelPage() {
    const { username: rawUsername } = useParams()
    const username = sanitizeUsername(rawUsername)
    const [activeTab, setActiveTab] = useState('Videos')

    // Handle case where username is 'null' (e.g. incomplete profile) 
    const isInvalidProfile = username === 'null' || !username

    // 1. Fetch Channel Profile
    const { data: channel, isLoading: loadingChannel, error: channelError } = useQuery({
        queryKey: ['channel', username],
        queryFn: async () => {
            try {
                const res = await channelService.getChannelByUsername(username)
                const userData = res.data.data || res.data 
                const channelId = userData?._id || userData?.id

                if (!channelId) return userData

                try {
                    const fullChannelRes = await channelService.getChannel(channelId)
                    return { ...userData, ...fullChannelRes.data?.data }
                } catch (fullChannelErr) {
                    console.warn('Could not fetch full channel profile:', fullChannelErr)
                    return userData
                }
            } catch (err) {
                console.error('Channel fetch error:', err)
                throw err
            }
        },
        enabled: !!username && !isInvalidProfile,
        retry: 1
    })

    const activeChannelId = channel?._id || channel?.id

    // 2. Fetch Channel Videos (Infinite)
    const {
        data: videosData,
        fetchNextPage: fetchNextVideos,
        hasNextPage: hasMoreVideos,
        isFetchingNextPage: loadingMoreVideos,
        isLoading: loadingVideos
    } = useInfiniteQuery({
        queryKey: ['channelVideos', activeChannelId],
        queryFn: async ({ pageParam = 1 }) => {
            const res = await channelService.getChannelVideos(activeChannelId, { page: pageParam, limit: 20 })
            return res.data
        },
        enabled: !!activeChannelId && activeTab === 'Videos',
        getNextPageParam: (lastPage) => {
            const p = lastPage?.data?.pagination
            return p?.hasNextPage ? (p.currentPage || 1) + 1 : undefined
        },
        initialPageParam: 1
    })

    // 2b. Fetch Channel Shorts (Infinite)
    const {
        data: shortsData,
        fetchNextPage: fetchNextShorts,
        hasNextPage: hasMoreShorts,
        isFetchingNextPage: loadingMoreShorts,
        isLoading: loadingShorts
    } = useInfiniteQuery({
        queryKey: ['channelShorts', activeChannelId],
        queryFn: async ({ pageParam = 1 }) => {
            const res = await channelService.getChannelShorts(activeChannelId, { page: pageParam, limit: 20 })
            return res.data
        },
        enabled: !!activeChannelId && activeTab === 'Shorts',
        getNextPageParam: (lastPage) => {
            const p = lastPage?.data?.pagination
            return p?.hasNextPage ? (p.currentPage || 1) + 1 : undefined
        },
        initialPageParam: 1
    })

    const videos = useMemo(() => videosData?.pages.flatMap(page => page.data?.items || page.data?.videos || []) || [], [videosData])
    const shorts = useMemo(() => shortsData?.pages.flatMap(page => page.data?.items || page.data?.shorts || page.data?.videos || []) || [], [shortsData])

    // Infinite scroll for Videos
    const { ref: videosRef, inView: videosInView } = useInView({ threshold: 0.1 })
    useEffect(() => {
        if (videosInView && hasMoreVideos && !loadingMoreVideos && activeTab === 'Videos') {
            fetchNextVideos()
        }
    }, [videosInView, hasMoreVideos, loadingMoreVideos, activeTab, fetchNextVideos])

    // Infinite scroll for Shorts
    const { ref: shortsRef, inView: shortsInView } = useInView({ threshold: 0.1 })
    useEffect(() => {
        if (shortsInView && hasMoreShorts && !loadingMoreShorts && activeTab === 'Shorts') {
            fetchNextShorts()
        }
    }, [shortsInView, hasMoreShorts, loadingMoreShorts, activeTab, fetchNextShorts])

    // 3. Fetch Channel Playlists
    const { data: playlists = [], isLoading: loadingPlaylists } = useQuery({
        queryKey: ['channelPlaylists', activeChannelId],
        queryFn: async () => {
            const res = await channelService.getChannelPlaylists(activeChannelId)
            const responseData = res.data.data || res.data
            return responseData?.items || responseData?.docs || (Array.isArray(responseData) ? responseData : [])
        },
        enabled: !!activeChannelId && activeTab === 'Playlists'
    })

    // 4. Fetch Channel Tweets/Community
    const { data: tweets = [], isLoading: loadingTweets } = useQuery({
        queryKey: ['channelTweets', activeChannelId],
        queryFn: async () => {
            const res = await channelService.getChannelTweets(activeChannelId)
            const responseData = res.data.data || res.data
            return responseData?.items || responseData?.docs || (Array.isArray(responseData) ? responseData : [])
        },
        enabled: !!activeChannelId && activeTab === 'Tweets'
    })

    if (isInvalidProfile) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <h2 className="text-xl font-bold">Profile Incomplete</h2>
                    <p className="text-muted-foreground">Please update your profile to set a username.</p>
                    <Link to="/profile">
                        <Button className="glass-btn">Go to Profile</Button>
                    </Link>
                </div>
            </div>
        )
    }

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
            <SEO 
                title={channel.fullName || channel.username} 
                description={channel.description || channel.channelDescription} 
                image={channel.avatar || channel.coverImage} 
                type="profile" 
            />
            <ChannelBanner bannerUrl={channel.coverImage} />
            <ChannelInfo channel={channel} />
            <ChannelTabs activeTab={activeTab} onChange={setActiveTab} />

            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6">
                {/* VIDEOS TAB */}
                {activeTab === 'Videos' && (
                    <>
                        {loadingVideos ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8">
                                {Array.from({ length: 8 }).map((_, i) => <VideoCardSkeleton key={i} />)}
                            </div>
                        ) : videos.length === 0 ? (
                            <div className="text-center py-20 text-muted-foreground">
                                <Video className="w-12 h-12 mb-3 opacity-20 mx-auto" />
                                <p className="text-lg font-semibold text-white mb-1">No videos yet</p>
                                <p className="text-sm text-zinc-400">This channel hasn't uploaded any videos.</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8">
                                    {videos.map((video, index) => (
                                        <div
                                            key={video._id || video.id}
                                            className="animate-in fade-in slide-in-from-bottom-4 duration-400"
                                            style={{ animationDelay: `${(index % 20) * 40}ms` }}
                                        >
                                            <VideoCard video={video} />
                                        </div>
                                    ))}
                                    {loadingMoreVideos && (
                                        Array.from({ length: 4 }).map((_, i) => <VideoCardSkeleton key={`more-vid-${i}`} />)
                                    )}
                                </div>
                                <div ref={videosRef} className="h-10 w-full flex items-center justify-center mt-8">
                                    {loadingMoreVideos && <Loader2 className="w-6 h-6 animate-spin text-primary" />}
                                    {!hasMoreVideos && videos.length > 0 && (
                                        <p className="text-muted-foreground text-sm">You've reached the end</p>
                                    )}
                                </div>
                            </>
                        )}
                    </>
                )}

                {/* SHORTS TAB */}
                {activeTab === 'Shorts' && (
                    loadingShorts ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {Array.from({ length: 10 }).map((_, i) => <VideoCardSkeleton key={i} />)}
                        </div>
                    ) : shorts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center glass-panel rounded-xl border-white/5">
                            <div className="bg-secondary/30 p-4 rounded-full mb-4">
                                <Smartphone className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">No shorts yet</h3>
                            <p className="text-muted-foreground max-w-sm">
                                When @{channel.username} uploads shorts, they will appear here.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {shorts.map((video, index) => (
                                    <Link
                                        to={`/watch/${video._id || video.id}`}
                                        key={video._id || video.id}
                                        className="group relative aspect-[9/16] rounded-xl overflow-hidden bg-zinc-900 border border-white/5 shadow-md animate-in fade-in zoom-in-95 duration-400"
                                        style={{ animationDelay: `${(index % 20) * 40}ms` }}
                                    >
                                        <img
                                            src={video.thumbnail}
                                            alt={video.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                                        <div className="absolute bottom-0 left-0 right-0 p-3">
                                            <h3 className="text-white font-medium text-xs sm:text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">{video.title}</h3>
                                            <p className="text-[11px] text-zinc-300">{formatViews(video.views)}</p>
                                        </div>
                                    </Link>
                                ))}
                                {loadingMoreShorts && (
                                    Array.from({ length: 5 }).map((_, i) => <VideoCardSkeleton key={`more-short-${i}`} />)
                                )}
                            </div>
                            <div ref={shortsRef} className="h-10 w-full flex items-center justify-center mt-8">
                                {loadingMoreShorts && <Loader2 className="w-6 h-6 animate-spin text-primary" />}
                                {!hasMoreShorts && shorts.length > 0 && (
                                    <p className="text-muted-foreground text-sm">You've reached the end</p>
                                )}
                            </div>
                        </>
                    )
                )}

                {/* PLAYLISTS TAB */}
                {activeTab === 'Playlists' && (
                    <>
                        {loadingPlaylists ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8">
                                {Array.from({ length: 8 }).map((_, i) => <PlaylistCardSkeleton key={i} />)}
                            </div>
                        ) : playlists?.length === 0 ? (
                            <div className="text-center py-20 text-muted-foreground">
                                <ListVideo className="w-12 h-12 mb-3 opacity-20 mx-auto" />
                                <p className="text-lg font-semibold text-white mb-1">No playlists yet</p>
                                <p className="text-sm text-zinc-400">This channel hasn't created any playlists.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8">
                                {playlists.map((playlist) => (
                                    <PlaylistCard
                                        key={playlist.id || playlist._id}
                                        playlist={playlist}
                                    />
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
                                <p className="text-lg font-semibold text-white mb-1">No posts yet</p>
                                <p className="text-sm text-zinc-400">This channel hasn't shared any community posts.</p>
                            </div>
                        ) : (
                            tweets.map(tweet => (
                                <TweetCard key={tweet.id || tweet._id} tweet={{ ...tweet, owner: channel }} />
                            ))
                        )}
                    </div>
                )}

                {/* ABOUT TAB */}
                {activeTab === 'About' && (
                    <div className="max-w-3xl mx-auto">
                        <div className="glass-panel border-white/10 p-6 sm:p-8 rounded-xl">
                            <h3 className="text-xl font-bold mb-4 font-display text-white">About {channel.fullName || channel.username}</h3>
                            <div className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                                {channel.channelDescription || channel.description || "No description provided."}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/10">
                                {[
                                    { label: 'Joined', value: channel.stats?.joinedAt || channel.createdAt || channel.joinedAt ? new Date(channel.stats?.joinedAt || channel.createdAt || channel.joinedAt).toLocaleDateString() : 'N/A' },
                                    { label: 'Views', value: (channel.stats?.totalViews || channel.totalViews || channel.views || 0).toLocaleString() },
                                    { label: 'Subscribers', value: (channel.stats?.subscribersCount || channel.subscribersCount || channel.subscribers || 0).toLocaleString() },
                                    { label: 'Videos', value: (channel.stats?.totalVideos || channel.videosCount || channel.totalVideos || 0).toLocaleString() }
                                ].map((stat) => (
                                    <div key={stat.label} className="glass-card p-4 rounded-xl flex justify-between items-center group hover:bg-white/5 transition-colors border border-white/5">
                                        <span className="text-zinc-400 font-medium text-xs sm:text-sm">{stat.label}</span>
                                        <span className="text-white font-bold text-base sm:text-lg group-hover:text-primary transition-colors">{stat.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
