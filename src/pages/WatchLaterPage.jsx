import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
    Clock, Trash2, Search, Grid3X3, List, ArrowUpDown, LayoutGrid
} from 'lucide-react'
import { toast } from 'sonner'
import { playlistService } from '../services/api'
import { VideoCard } from '../components/video/VideoCard'
import { VideoCardSkeleton } from '../components/ui/Skeleton'
import { Button } from '../components/ui/Button'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { cn } from '../lib/utils'

export default function WatchLaterPage() {
    useDocumentTitle('Watch Later - Vixora')
    const queryClient = useQueryClient()

    // State
    const [searchQuery, setSearchQuery] = useState('')
    const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'
    const [sortBy, setSortBy] = useState('addedAt') // 'addedAt' | 'priority'

    // Fetch watch later videos
    const { data: responseData, isLoading } = useQuery({
        queryKey: ['watchLater'],
        queryFn: async () => {
            const response = await playlistService.getWatchLater()
            // Backend returns { videos: [], metadata: {} } or just [] depending on implementation
            return response.data.data
        }
    })


    // Remove video mutation
    const removeMutation = useMutation({
        mutationFn: (videoId) => playlistService.toggleWatchLater(videoId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['watchLater'] })
            toast.success('Removed from Watch Later')
        },
        onError: () => toast.error('Failed to remove video')
    })

    // Derive raw videos for count display
    const rawVideos = useMemo(() => responseData?.items || [], [responseData])

    // Filter and sort videos
    const filteredVideos = useMemo(() => {
        let result = [...rawVideos]

        // Search
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            result = result.filter(item =>
                item.video?.title?.toLowerCase().includes(query) ||
                item.video?.owner?.username?.toLowerCase().includes(query)
            )
        }

        // Sort
        result.sort((a, b) => {
            if (sortBy === 'addedAt') {
                return new Date(b.addedAt) - new Date(a.addedAt)
            }
            return 0
        })

        return result
    }, [rawVideos, searchQuery, sortBy])

    return (
        <div className="min-h-screen pb-10">
            {/* Header */}
            <div className="py-8 container mx-auto px-4">
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-xl">
                                <Clock className="w-8 h-8 text-primary" style={{ shapeRendering: 'geometricPrecision' }} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">Watch Later</h1>
                                <p className="text-muted-foreground mt-1">
                                    {rawVideos.length} videos • Private playlist
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-md">
                            <input
                                type="text"
                                placeholder="Search watch later..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 glass-input border border-white/10 rounded-lg focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        </div>

                        <Button variant="ghost" size="icon" onClick={() => setSortBy(prev => prev === 'addedAt' ? 'oldest' : 'addedAt')}>
                            <ArrowUpDown className="w-4 h-4" />
                        </Button>

                        <div className="flex glass-panel rounded-lg p-1 border border-white/10 ml-auto">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={cn(
                                    "p-2 rounded-md transition-all",
                                    viewMode === 'grid' ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white"
                                )}
                            >
                                <Grid3X3 className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={cn(
                                    "p-2 rounded-md transition-all",
                                    viewMode === 'list' ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white"
                                )}
                            >
                                <List className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4">
                {isLoading && (
                    <div className={cn(
                        "grid gap-6",
                        viewMode === 'grid'
                            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                            : "grid-cols-1"
                    )}>
                        {Array.from({ length: 8 }).map((_, i) => (
                            <VideoCardSkeleton key={i} />
                        ))}
                    </div>
                )}

                {!isLoading && filteredVideos.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="p-6 glass-card rounded-full mb-6">
                            <Clock className="w-16 h-16 text-muted-foreground opacity-50" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Your list is empty</h3>
                        <p className="text-muted-foreground max-w-sm mb-6">
                            Save videos to watch later.
                        </p>
                        <Link to="/">
                            <Button>Browse Videos</Button>
                        </Link>
                    </div>
                )}

                {!isLoading && filteredVideos.length > 0 && (
                    <div className={cn(
                        "grid gap-6",
                        viewMode === 'grid'
                            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                            : "grid-cols-1"
                    )}>
                        {filteredVideos.map((item, index) => (
                            <div key={item._id || index} className="relative group">
                                <VideoCard video={item.video} />
                                <button
                                    onClick={(e) => {
                                        e.preventDefault()
                                        removeMutation.mutate(item.video._id)
                                    }}
                                    className="absolute top-2 right-2 p-2 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 text-white hover:text-destructive z-10"
                                    title="Remove from Watch Later"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
