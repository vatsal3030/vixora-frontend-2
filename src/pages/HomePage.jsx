import { useEffect, useState } from 'react'

import { useInfiniteQuery } from '@tanstack/react-query'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { VideoCard } from '../components/video/VideoCard'
import { VideoCardSkeleton } from '../components/ui/Skeleton'
import { videoService } from '../services/api'
import { Loader2, AlertCircle, RefreshCcw, Video } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export default function HomePage() {
    useDocumentTitle('Vixora')
    const [activeCategory, setActiveCategory] = useState('All')

    // Infinite Query for Videos
    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
        refetch
    } = useInfiniteQuery({
        queryKey: ['videos', 'home', activeCategory], // Add category to key
        queryFn: async ({ pageParam = 1 }) => {
            // Logic for tags: 'All' sends no tags, others send category name
            const tags = activeCategory === 'All' ? undefined : activeCategory
            const response = await videoService.getVideos({
                page: pageParam,
                limit: 20, // Explicitly request 20
                tags
            })
            return response.data
        },
        getNextPageParam: (lastPage) => {
            const pagination = lastPage?.data?.pagination
            if (!pagination) return undefined

            if (pagination.currentPage < pagination.totalPages) {
                return pagination.currentPage + 1
            }
            return undefined
        },
        staleTime: 1000 * 60 * 5,
    })

    // Infinite Scroll Trigger
    const loadMoreRef = useRef(null)
    const isInView = useInView(loadMoreRef)

    useEffect(() => {
        if (isInView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage()
        }
    }, [isInView, hasNextPage, isFetchingNextPage, fetchNextPage])

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

    const videos = data?.pages.flatMap(page => page.data?.videos || page.videos || []) || []

    return (
        <div className="pb-10">
            {/* Filter Section */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 py-2 px-3 scrollbar-hide -mx-3 sm:-mx-4 lg:-mx-6 sm:px-4 lg:px-6 mb-4">
                {['All', 'Music', 'Gaming', 'Tech', 'Live', 'News', 'Movies'].map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap min-h-[36px]
                            ${activeCategory === cat
                                ? 'glass-badge active shadow-glass-glow'
                                : 'glass-badge text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Video Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-6">
                {videos.map((video, index) => (
                    <div
                        key={`${video.id}-${index}`}
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
                    <p>No videos found. Try a different category.</p>
                </div>
            )}

            {/* Infinite Scroll Trigger */}
            <div ref={loadMoreRef} className="h-10 w-full flex items-center justify-center mt-8">
                {/* Replaced Spinner with invisible trigger unless actually loading, but skeletons handle visual loading above */}
                {!hasNextPage && videos.length > 0 && (
                    <p className="text-muted-foreground text-sm">You've reached the end</p>
                )}
            </div>
        </div>
    )
}
