import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
    Library,
    History,
    Clock,
    ThumbsUp,
    ListVideo,
    PlaySquare,
    User,
    ChevronRight,
    Loader2
} from 'lucide-react'
import { watchHistoryService, playlistService, likeService } from '../services/api'
import { VideoCard } from '../components/video/VideoCard'
import { PlaylistCard } from '../components/playlist/PlaylistCard'
import { Button } from '../components/ui/Button'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useAuth } from '../context/AuthContext'
import { Avatar } from '../components/ui/Avatar'
import { getMediaUrl } from '../lib/media'

export default function LibraryPage() {
    useDocumentTitle('Library - Vixora')
    const { currentUser } = useAuth()

    // --- Queries ---

    // 1. History
    const { data: historyData, isLoading: historyLoading } = useQuery({
        queryKey: ['watchHistory', 'recent'],
        queryFn: async () => {
            const res = await watchHistoryService.getHistory()
            return res.data.data?.items || res.data.data?.videos || res.data.data || []
        }
    })
    const recentHistory = historyData?.slice(0, 8) || []

    // 2. Watch Later
    const { data: watchLaterData, isLoading: watchLaterLoading } = useQuery({
        queryKey: ['watchLater'],
        queryFn: async () => {
            const res = await playlistService.getWatchLater()
            // Assume array resolution
            return res.data.data?.items || res.data.data?.videos || res.data.data || []
        }
    })
    const watchLaterVideos = watchLaterData?.slice(0, 8).map(item => item.video || item) || []

    // 3. Liked Videos
    const { data: likedData, isLoading: likedLoading } = useQuery({
        queryKey: ['likedVideos'],
        queryFn: async () => {
            const res = await likeService.getLikedVideos()
            return res.data.data?.items || res.data.data?.videos || res.data.data || []
        }
    })
    const likedVideos = likedData?.slice(0, 8).map(item => item.video || item) || []

    // 4. Playlists
    const { data: playlists = [], isLoading: playlistsLoading } = useQuery({
        queryKey: ['myPlaylists'],
        queryFn: async () => {
            const res = await playlistService.getMyPlaylists()
            return res.data.data?.items || res.data.data?.docs || res.data.data || []
        }
    })
    const slicedPlaylists = playlists.slice(0, 8)

    const isLoading = historyLoading || watchLaterLoading || likedLoading || playlistsLoading

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="pb-24 pt-6 px-4 sm:px-6 lg:px-8 container mx-auto max-w-[1600px] min-h-[80vh]">

            <div className="flex flex-col lg:flex-row gap-10">
                {/* Main Content (Shelves) */}
                <div className="flex-1 w-full min-w-0 flex flex-col gap-12">

                    <ShelfSection
                        title="History"
                        icon={History}
                        viewAllLink="/history"
                        items={recentHistory}
                        renderItem={(video) => (
                            <div className="w-[240px] sm:w-[280px] flex-shrink-0" key={video._id}>
                                <VideoCard video={video.video || video} hideAvatar />
                            </div>
                        )}
                        emptyText="You have no recently watched videos."
                    />

                    <ShelfSection
                        title="Watch Later"
                        icon={Clock}
                        viewAllLink="/watch-later"
                        items={watchLaterVideos}
                        renderItem={(video) => (
                            <div className="w-[240px] sm:w-[280px] flex-shrink-0" key={video._id}>
                                <VideoCard video={video} hideAvatar />
                            </div>
                        )}
                        emptyText="You haven't added any videos to Watch Later."
                    />

                    <ShelfSection
                        title="Liked Videos"
                        icon={ThumbsUp}
                        viewAllLink="/liked"
                        items={likedVideos}
                        renderItem={(video) => (
                            <div className="w-[240px] sm:w-[280px] flex-shrink-0" key={video._id}>
                                <VideoCard video={video} hideAvatar />
                            </div>
                        )}
                        emptyText="You haven't liked any videos yet."
                    />

                    <ShelfSection
                        title="Playlists"
                        icon={ListVideo}
                        viewAllLink="/playlists"
                        items={slicedPlaylists}
                        renderItem={(playlist) => (
                            <div className="w-[240px] sm:w-[280px] flex-shrink-0" key={playlist._id}>
                                <PlaylistCard playlist={playlist} />
                            </div>
                        )}
                        emptyText="You haven't created any playlists."
                    />

                </div>

                {/* Right Sidebar (Profile Summary Stats) - Hidden on Mobile */}
                <div className="hidden lg:flex flex-col w-[320px] flex-shrink-0">
                    <div className="sticky top-24 flex flex-col items-center p-8 glass-card rounded-2xl border border-white/5 shadow-glass text-center">
                        <Avatar
                            src={getMediaUrl(currentUser?.avatar)}
                            fallback={currentUser?.fullName || currentUser?.username}
                            size="xl"
                            className="w-28 h-28 mb-4 shadow-glass-glow"
                        />
                        <h2 className="text-xl font-bold mb-1">{currentUser?.fullName || currentUser?.username}</h2>
                        <span className="text-muted-foreground text-sm font-medium mb-6">@{currentUser?.username}</span>

                        <div className="w-full h-px bg-white/10 mb-6" />

                        <div className="w-full flex flex-col gap-4 text-sm">
                            <StatRow label="Subscriptions" icon={User} value={currentUser?.subscriptionsCount || 0} />
                            <StatRow label="Playlists" icon={ListVideo} value={playlists.length} />
                            <StatRow label="Liked Videos" icon={ThumbsUp} value={likedData?.length || 0} />
                            <StatRow label="Watch Later" icon={Clock} value={watchLaterData?.length || 0} />
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}

function StatRow({ label, value, icon: Icon }) {
    return (
        <div className="flex items-center justify-between text-muted-foreground w-full py-1">
            <span className="flex items-center gap-2">
                {Icon && <Icon className="w-4 h-4" />}
                {label}
            </span>
            <span className="font-semibold text-foreground">{value}</span>
        </div>
    )
}

function ShelfSection({ title, icon: Icon, viewAllLink, items, renderItem, emptyText }) {
    return (
        <section className="flex flex-col">
            <div className="flex justify-between items-center mb-5 px-1">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-secondary rounded-lg text-foreground shadow-sm">
                        {Icon && <Icon className="w-5 h-5" />}
                    </div>
                    <h2 className="text-xl font-bold tracking-tight">{title}</h2>
                </div>
                {viewAllLink && items && items.length > 0 && (
                    <Link to={viewAllLink}>
                        <Button variant="outline" className="rounded-full text-xs font-semibold px-4 glass-btn border-white/10">
                            View All
                        </Button>
                    </Link>
                )}
            </div>

            {(!items || items.length === 0) ? (
                <div className="flex flex-col items-center justify-center py-10 text-center glass-card rounded-xl border border-white/5 border-dashed bg-secondary/10">
                    <p className="text-sm text-muted-foreground">{emptyText || "Nothing to see here."}</p>
                </div>
            ) : (
                <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 snap-x">
                    {items.map(renderItem)}
                </div>
            )}
        </section>
    )
}
