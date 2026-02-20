import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
    Heart, Trash2, Search, Grid3X3, List, ThumbsUp
} from 'lucide-react'
import { toast } from 'sonner'
import { likeService } from '../services/api'
import { VideoCard } from '../components/video/VideoCard'
import { VideoCardSkeleton } from '../components/ui/Skeleton'
import { Button } from '../components/ui/Button'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { cn } from '../lib/utils'

export default function LikedVideosPage() {
    useDocumentTitle('Liked Videos - Vixora')
    const queryClient = useQueryClient()

    // State
    const [searchQuery, setSearchQuery] = useState('')
    const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'

    // Fetch liked videos
    const { data: responseData, isLoading } = useQuery({
        queryKey: ['likedVideos'],
        queryFn: async () => {
            const response = await likeService.getLikedVideos()
            return response.data.data?.items || []
        }
    })



    // Unlike mutation
    const unlikeMutation = useMutation({
        mutationFn: (videoId) => likeService.toggleVideoLike(videoId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['likedVideos'] })
            toast.success('Removed from liked videos')
        },
        onError: () => toast.error('Failed to remove video')
    })

    // Filter videos
    const filteredVideos = useMemo(() => {
        const videos = Array.isArray(responseData) ? responseData : []

        let result = [...videos]

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            result = result.filter(item => {
                const v = item.video || item
                if (!v) return false
                return (
                    v.title?.toLowerCase().includes(query) ||
                    v.owner?.username?.toLowerCase().includes(query)
                )
            })
        }
        return result
    }, [responseData, searchQuery])

    return (
        <div className="min-h-screen pb-10">
            {/* Header */}
            <div className="py-8 container mx-auto px-4">
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-pink-500/10 rounded-xl">
                                <ThumbsUp className="w-8 h-8 text-pink-500" style={{ shapeRendering: 'geometricPrecision' }} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">Liked Videos</h1>
                                <p className="text-muted-foreground mt-1">
                                    {filteredVideos.length} videos • Private playlist
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-md">
                            <input
                                type="text"
                                placeholder="Search liked videos..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 glass-input border border-white/10 rounded-lg focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        </div>
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
                            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
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
                            <ThumbsUp className="w-16 h-16 text-muted-foreground opacity-50" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">No liked videos yet</h3>
                        <p className="text-muted-foreground max-w-sm mb-6">
                            Videos you like will appear here. Start watching and liking videos!
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
                            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                            : "grid-cols-1"
                    )}>
                        {filteredVideos.map((item, index) => {
                            const video = item.video || item
                            if (!video) return null
                            return (
                                <div key={video._id || index} className="relative group">
                                    <VideoCard video={video} />
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault()
                                            unlikeMutation.mutate(video._id)
                                        }}
                                        className="absolute top-2 right-2 p-2 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 text-white hover:text-destructive z-10"
                                        title="Remove from Liked Videos"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
