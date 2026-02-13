import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
    Library,
    History,
    Clock,
    ThumbsUp,
    List,
    Plus,
    ChevronRight
} from 'lucide-react'
import { watchHistoryService, playlistService, likeService } from '../services/api'
import { VideoCard } from '../components/video/VideoCard'
import { cn } from '../lib/utils'
import { Button } from '../components/ui/Button'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export default function LibraryPage() {
    useDocumentTitle('Library - Vixora')

    // --- Queries ---

    // 1. History (Recent)
    const { data: historyData } = useQuery({
        queryKey: ['watchHistory', 'recent'],
        queryFn: async () => {
            const res = await watchHistoryService.getHistory()
            return res.data.data.videos || [] // Assuming standard response
        }
    })
    const recentHistory = historyData?.slice(0, 10) || []

    // 2. Watch Later (Count)
    const { data: watchLaterData } = useQuery({
        queryKey: ['watchLater'],
        queryFn: async () => {
            const res = await playlistService.getWatchLater()
            return res.data.data.videos || []
        }
    })
    const watchLaterCount = watchLaterData?.length || 0

    // 3. Liked Videos (Count)
    const { data: likedData } = useQuery({
        queryKey: ['likedVideos'],
        queryFn: async () => {
            const res = await likeService.getLikedVideos()
            return res.data.data.videos || res.data.data || []
        }
    })
    const likedCount = likedData?.length || 0

    // 4. Playlists
    const { data: playlists = [] } = useQuery({
        queryKey: ['myPlaylists'],
        queryFn: async () => {
            const res = await playlistService.getMyPlaylists()
            return res.data.data || []
        }
    })

    return (
        <div className="pb-24 pt-4 px-4 container mx-auto max-w-7xl min-h-[80vh]">

            {/* Library Header (Mobile Only mostly, but good for all) */}
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-red-500/10 rounded-full text-red-500">
                    <Library className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-bold">Library</h1>
            </div>

            {/* Quick Access Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-10">
                <LibraryCard
                    icon={<History className="w-6 h-6" />}
                    title="History"
                    subtitle="Keep track"
                    to="/history"
                    colorClass="text-purple-500 bg-purple-500/10"
                />
                <LibraryCard
                    icon={<Clock className="w-6 h-6" />}
                    title="Watch Later"
                    count={watchLaterCount}
                    to="/watch-later"
                    colorClass="text-blue-500 bg-blue-500/10"
                />
                <LibraryCard
                    icon={<ThumbsUp className="w-6 h-6" />}
                    title="Liked Videos"
                    count={likedCount}
                    to="/liked"
                    colorClass="text-green-500 bg-green-500/10"
                />
                <LibraryCard
                    icon={<List className="w-6 h-6" />}
                    title="Playlists"
                    count={playlists.length}
                    to="/playlists"
                    colorClass="text-orange-500 bg-orange-500/10"
                />
            </div>

            {/* Recent History Section */}
            <section className="mb-10">
                <div className="flex justify-between items-center mb-4 px-1">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <History className="w-4 h-4 text-muted-foreground" />
                        Recent History
                    </h2>
                    <Link to="/history">
                        <Button variant="ghost" size="sm" className="text-accent text-xs font-semibold hover:bg-accent/10">
                            View all
                        </Button>
                    </Link>
                </div>

                {recentHistory.length > 0 ? (
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 scroll-pl-4">
                        {recentHistory.map(video => (
                            <div key={video._id} className="w-[160px] sm:w-[200px] flex-shrink-0">
                                <VideoCard video={video} hideAvatar />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-secondary/10 rounded-xl border border-dashed border-white/5">
                        <p className="text-muted-foreground text-sm">No watch history yet</p>
                    </div>
                )}
            </section>

            {/* Playlists Section */}
            <section>
                <div className="flex justify-between items-center mb-4 px-1">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <List className="w-4 h-4 text-muted-foreground" />
                        Your Playlists
                    </h2>
                    <Link to="/playlists">
                        <Button variant="ghost" size="sm" className="text-xs">
                            <Plus className="w-4 h-4 mr-1" />
                            New Playlist
                        </Button>
                    </Link>
                </div>

                {playlists.length > 0 ? (
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 scroll-pl-4">
                        {playlists.map(playlist => (
                            <Link
                                key={playlist._id}
                                to={`/playlist/${playlist._id}`}
                                className="group flex-shrink-0 w-[140px] space-y-2"
                            >
                                <div className="aspect-square rounded-xl bg-secondary/30 border border-white/5 flex items-center justify-center relative overflow-hidden group-hover:border-primary/50 transition-all">
                                    <List className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                                    <span className="absolute bottom-2 right-2 text-xs font-medium text-white bg-black/50 px-1.5 py-0.5 rounded">
                                        {playlist.videos?.length || 0}
                                    </span>
                                </div>
                                <h3 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                                    {playlist.name}
                                </h3>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-sm text-muted-foreground">No playlists created</p>
                    </div>
                )}
            </section>

        </div>
    )
}

function LibraryCard({ icon, title, subtitle, count, to, colorClass }) {
    return (
        <Link
            to={to}
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-secondary/20 border border-white/5 hover:bg-secondary/40 hover:border-primary/20 hover:-translate-y-1 transition-all duration-300 text-center gap-3 group h-full"
        >
            <div className={cn("p-3 rounded-full transition-transform group-hover:scale-110 duration-300", colorClass)}>
                {icon}
            </div>
            <div className="space-y-0.5">
                <h3 className="font-semibold text-sm">{title}</h3>
                {count !== undefined && (
                    <p className="text-xs text-muted-foreground">
                        {count} video{count !== 1 ? 's' : ''}
                    </p>
                )}
                {subtitle && (
                    <p className="text-xs text-muted-foreground">
                        {subtitle}
                    </p>
                )}
            </div>
        </Link>
    )
}
