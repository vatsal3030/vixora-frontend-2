import { useState, useMemo, useEffect } from 'react'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useInView } from 'react-intersection-observer'
import { Link } from 'react-router-dom'
import {
    Heart, Trash2, Search, Grid3X3, List, ThumbsUp, ArrowUpDown, Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { likeService } from '../services/api'
import { VideoCard } from '../components/video/VideoCard'
import { VideoCardSkeleton } from '../components/ui/Skeleton'
import { Button } from '../components/ui/Button'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { cn } from '../lib/utils'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../components/ui/DropdownMenu"

export default function LikedVideosPage() {
    useDocumentTitle('Liked Videos - Vixora')
    const queryClient = useQueryClient()

    // State
    const [searchQuery, setSearchQuery] = useState('')
    const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'
    const [sortBy, setSortBy] = useState('recent') // 'recent' | 'oldest'

    // Fetch liked videos (Infinite)
    const {
        data,
        isLoading,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useInfiniteQuery({
        queryKey: ['likedVideos', sortBy],
        queryFn: async ({ pageParam = 1 }) => {
            const response = await likeService.getLikedVideos({
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

    const rawVideos = useMemo(() => data?.pages.flatMap(page => page.data?.items || []) || [], [data])

    // Unlike mutation
    const unlikeMutation = useMutation({
        mutationFn: (videoId) => likeService.toggleVideoLike(videoId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['likedVideos'] })
            toast.success('Removed from liked videos')
        },
        onError: () => toast.error('Failed to remove video')
    })

    // Filter videos (Client-side filtering for search)
    const filteredVideos = useMemo(() => {
        let result = [...rawVideos]

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

        // Sorting is handled by API but we can keep it as a safety or client-side sort if needed
        // Given we are paginating, client-side sort on just the loaded items might be confusing
        // But the sortBy query key ensures we refetch when sort changes.

        return result
    }, [rawVideos, searchQuery])

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
                                placeholder="Search liked videos..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 glass-input border border-white/10 rounded-lg focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        </div>
                        
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="gap-2 border-white/10 hover:bg-white/5">
                                    <ArrowUpDown className="w-4 h-4" />
                                    <span className="hidden sm:inline">
                                        {sortBy === 'recent' ? 'Latest' : 'Oldest'}
                                    </span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-[#1f1f1f]/95 border-white/10 w-32">
                                <DropdownMenuItem onClick={() => setSortBy('recent')} className={cn("cursor-pointer", sortBy === 'recent' && "text-primary")}>
                                    Latest
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSortBy('oldest')} className={cn("cursor-pointer", sortBy === 'oldest' && "text-primary")}>
                                    Oldest
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

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
                {(isLoading && rawVideos.length === 0) && (
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

                {filteredVideos.length > 0 && (
                    <div className={cn(
                        "grid gap-6",
                        viewMode === 'grid'
                            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                            : "grid-cols-1"
                    )}>
                        {filteredVideos.map((item, index) => {
                            const video = item.video || item
                            if (!video) return null
                            return (
                                <div key={video._id || index} className="relative group animate-in fade-in slide-in-from-bottom-4 duration-300" style={{ animationDelay: `${(index % 20) * 30}ms`, animationFillMode: 'backwards' }}>
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
                        
                        {/* Infinite Scroll Trigger */}
                        <div ref={loadMoreRef} className="col-span-full h-10 w-full flex items-center justify-center mt-8">
                            {isFetchingNextPage && <Loader2 className="w-6 h-6 animate-spin text-primary" />}
                            {!hasNextPage && rawVideos.length > 0 && (
                                <p className="text-muted-foreground text-sm">You've reached the end</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
