import { useEffect } from 'react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useInView } from 'react-intersection-observer'
import { useNavigate } from 'react-router-dom'
import { VideoCard } from '../components/video/VideoCard'
import { VideoCardSkeleton } from '../components/ui/Skeleton'
import { feedService } from '../services/api'
import { AlertCircle, RefreshCcw, Video } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

// Fallback chips when tag API is unavailable
const FALLBACK_TAGS = ['Music', 'Gaming', 'Tech', 'Live', 'News', 'Movies']

export default function HomePage() {
    useDocumentTitle('Vixora')
    const navigate = useNavigate()

    // Fetch dynamic tag chips from backend (separate from video feed)
    const { data: tagsData, isLoading: tagsLoading } = useQuery({
        queryKey: ['feed', 'tags'],
        queryFn: async () => {
            const response = await feedService.getTags({ limit: 20 })
            return response.data.data?.items || []
        },
        staleTime: 1000 * 60 * 10,
        retry: 1
    })

    // Build chip list from backend tags (fallback to hardcoded)
    const tagChips = tagsData && tagsData.length > 0
        ? tagsData.map(t => t.displayName || t.name)
        : FALLBACK_TAGS

    // Home feed — always unfiltered, no tag dependency
    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
        refetch
    } = useInfiniteQuery({
        queryKey: ['feed', 'home'],
        queryFn: async ({ pageParam = 1 }) => {
            const response = await feedService.getHomeFeed({
                page: pageParam,
                limit: 20
            })
            return response.data
        },
        getNextPageParam: (lastPage) => {
            // Standardize: read from data.pagination
            const pagination = lastPage?.data?.pagination
            if (!pagination) return undefined
            return pagination.hasNextPage ? (pagination.currentPage || 1) + 1 : undefined
        },
        staleTime: 1000 * 60 * 5,
        initialPageParam: 1
    })

    // Robust Infinite Scroll Trigger using react-intersection-observer
    const { ref: loadMoreRef, inView } = useInView({
        threshold: 0.1,
        rootMargin: '200px',
    })

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage()
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

    // Tag chip click → navigate to tag feed page
    const handleTagClick = (tagName) => {
        navigate(`/tags/${encodeURIComponent(tagName)}`)
    }

    // Error State
    if (status === 'error') {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="p-4 bg-red-500/10 rounded-full text-red-500">
                    <AlertCircle className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-medium">Failed to load videos</h3>
                <p className="text-muted-foreground text-sm max-w-xs">{error.message || 'Something went wrong'}</p>
                <Button onClick={() => refetch()} variant="outline" className="gap-2">
                    <RefreshCcw className="w-4 h-4" />
                    Try Again
                </Button>
            </div>
        )
    }

    const videos = data?.pages.flatMap(page => page.data?.items || []) || []

    return (
        <div className="pb-10">
            {/* Tag Discovery Chips Container — width constrained to prevent x-overflow */}
            <div className="w-full overflow-hidden">
                <div className="flex items-center gap-2 overflow-x-auto pb-4 py-2 px-3 scrollbar-hide -mx-3 sm:-mx-4 lg:-mx-6 sm:px-4 lg:px-6 mb-2">
                    {tagsLoading ? (
                        Array.from({ length: 7 }).map((_, i) => (
                            <div
                                key={`tag-skeleton-${i}`}
                                className="flex-shrink-0 h-9 rounded-full bg-white/5 animate-pulse"
                                style={{ width: `${60 + (i * 13 % 40)}px` }}
                            />
                        ))
                    ) : (
                        tagChips.map((tag) => (
                            <button
                                key={tag}
                                onClick={() => handleTagClick(tag)}
                                className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap min-h-[36px] glass-badge text-muted-foreground hover:text-foreground hover:bg-white/10"
                            >
                                {tag}
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Video Grid — always shows full unfiltered feed */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8">
                {videos.map((video, index) => (
                    <div
                        key={`${video.id || video._id}-${index}`}
                        className="animate-in fade-in slide-in-from-bottom-4 duration-300"
                        style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
                    >
                        <VideoCard video={video} />
                    </div>
                ))}

                {/* Loading State (Initial or Next Page) */}
                {(status === 'pending' || isFetchingNextPage) && (
                    Array.from({ length: 8 }).map((_, i) => (
                        <div key={`skeleton-${i}`} className="w-full">
                            <VideoCardSkeleton />
                        </div>
                    ))
                )}
            </div>

            {/* Empty State */}
            {status === 'success' && videos.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground">
                    <Video className="w-12 h-12 mb-4 opacity-20" />
                    <p>No videos yet. Check back soon!</p>
                </div>
            )}

            {/* Infinite Scroll Trigger */}
            <div ref={loadMoreRef} className="h-10 w-full flex items-center justify-center mt-8">
                {isFetchingNextPage && <Loader2 className="w-6 h-6 animate-spin text-primary" />}
                {!hasNextPage && videos.length > 0 && (
                    <p className="text-muted-foreground text-sm">You've reached the end</p>
                )}
            </div>
        </div>
    )
}
