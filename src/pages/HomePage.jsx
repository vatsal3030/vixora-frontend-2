import { useState, useEffect } from 'react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useInView } from 'react-intersection-observer'
import { VideoCard } from '../components/video/VideoCard'
import { VideoCardSkeleton } from '../components/ui/Skeleton'
import { feedService } from '../services/api'
import { AlertCircle, RefreshCcw, Video, Loader2 } from 'lucide-react'
import { Button } from '../components/ui/Button'
import SEO from '../components/common/SEO'
import { cn } from '../lib/utils'

// Fallback chips when tag API is unavailable
const FALLBACK_TAGS = ['Music', 'Gaming', 'Tech', 'Live', 'News', 'Movies', 'Education', 'Podcast', 'Animation']

export default function HomePage() {
    const [selectedTag, setSelectedTag] = useState(null)

    // Fetch dynamic tag chips from backend
    const { data: tagsData, isLoading: tagsLoading } = useQuery({
        queryKey: ['feed', 'tags'],
        queryFn: async () => {
            const response = await feedService.getTags({ limit: 30 })
            return response.data.data?.items || []
        },
        staleTime: 1000 * 60 * 10,
        retry: 1
    })

    // Build chip list from backend tags (fallback to hardcoded)
    const tagChips = tagsData && tagsData.length > 0
        ? tagsData.map(t => t.displayName || t.name)
        : FALLBACK_TAGS

    // Dynamic feed: if selectedTag is active, fetch tag feed; otherwise fetch full home feed
    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
        refetch
    } = useInfiniteQuery({
        queryKey: ['feed', selectedTag ? `tag-${selectedTag}` : 'home'],
        queryFn: async ({ pageParam = 1 }) => {
            if (selectedTag) {
                const response = await feedService.getTagFeed(selectedTag, {
                    page: pageParam,
                    limit: 20
                })
                return response.data
            }
            const response = await feedService.getHomeFeed({
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

    // In-place tag selection (does not navigate away, keeps user on home feed)
    const handleTagClick = (tagName) => {
        if (tagName === null || selectedTag === tagName) {
            setSelectedTag(null)
        } else {
            setSelectedTag(tagName)
        }
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

    const videos = data?.pages.flatMap(page => page.data?.items || page.data?.videos || []) || []

    return (
        <div className="pb-10">
            <SEO title={selectedTag ? `${selectedTag} - Vixora` : "Home"} />
            
            {/* Tag Discovery Chips Container — YouTube style in-place tag filter */}
            <div className="w-full overflow-hidden mb-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-3 py-1.5 px-1 scrollbar-hide">
                    {/* "All" chip */}
                    <button
                        onClick={() => handleTagClick(null)}
                        className={cn(
                            "flex-shrink-0 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap min-h-[34px] cursor-pointer",
                            !selectedTag
                                ? "bg-primary text-white shadow-md shadow-primary/25 scale-105"
                                : "glass-badge text-zinc-300 hover:text-white hover:bg-white/10"
                        )}
                    >
                        All
                    </button>

                    {tagsLoading ? (
                        Array.from({ length: 8 }).map((_, i) => (
                            <div
                                key={`tag-skeleton-${i}`}
                                className="flex-shrink-0 h-8 rounded-full bg-white/5 animate-pulse"
                                style={{ width: `${60 + (i * 13 % 40)}px` }}
                            />
                        ))
                    ) : (
                        tagChips.map((tag) => {
                            const isActive = selectedTag === tag
                            return (
                                <button
                                    key={tag}
                                    onClick={() => handleTagClick(tag)}
                                    className={cn(
                                        "flex-shrink-0 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap min-h-[34px] cursor-pointer",
                                        isActive
                                            ? "bg-primary text-white shadow-md shadow-primary/25 scale-105"
                                            : "glass-badge text-zinc-300 hover:text-white hover:bg-white/10"
                                    )}
                                >
                                    {tag}
                                </button>
                            )
                        })
                    )}
                </div>
            </div>

            {/* Video Grid — Responsive 4-column layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                {videos.map((video, index) => (
                    <div
                        key={`${video.id || video._id}-${index}`}
                        className="animate-in fade-in slide-in-from-bottom-4 duration-300"
                        style={{ animationDelay: `${(index % 20) * 40}ms`, animationFillMode: 'backwards' }}
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
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground text-center">
                    <Video className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-base font-semibold text-white mb-1">
                        {selectedTag ? `No videos found for "${selectedTag}"` : 'No videos yet'}
                    </p>
                    <p className="text-sm text-zinc-400">
                        {selectedTag ? 'Try exploring a different tag or return to All' : 'Check back soon for new uploads!'}
                    </p>
                    {selectedTag && (
                        <Button onClick={() => setSelectedTag(null)} variant="outline" className="mt-4 rounded-full">
                            Show All Videos
                        </Button>
                    )}
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
