import { useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useInView } from 'framer-motion'
import { VideoCard } from '../components/video/VideoCard'
import { VideoCardSkeleton } from '../components/ui/Skeleton'
import { feedService } from '../services/api'
import { ArrowLeft, AlertCircle, RefreshCcw, Video, Hash } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export default function TagFeedPage() {
    const { tagName } = useParams()
    const navigate = useNavigate()
    const decodedTag = decodeURIComponent(tagName || '')
    useDocumentTitle(`#${decodedTag} - Vixora`)

    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
        refetch
    } = useInfiniteQuery({
        queryKey: ['feed', 'tag', decodedTag],
        queryFn: async ({ pageParam = 1 }) => {
            const response = await feedService.getTagFeed(decodedTag, {
                page: pageParam,
                limit: 20
            })
            return response.data
        },
        getNextPageParam: (lastPage) => {
            const pagination = lastPage?.data?.pagination
            if (!pagination) return undefined
            if (pagination.hasNextPage) {
                return (pagination.currentPage || pagination.page || 1) + 1
            }
            return undefined
        },
        enabled: !!decodedTag,
        staleTime: 1000 * 60 * 5,
        initialPageParam: 1
    })

    // Infinite Scroll
    const loadMoreRef = useRef(null)
    const isInView = useInView(loadMoreRef)

    useEffect(() => {
        if (isInView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage()
        }
    }, [isInView, hasNextPage, isFetchingNextPage, fetchNextPage])

    const videos = data?.pages.flatMap(page => page.data?.items || []) || []
    const tagMeta = data?.pages[0]?.data?.tag

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

    return (
        <div className="pb-10">
            {/* Tag Header */}
            <div
                className="flex items-center gap-4 mb-6 animate-in fade-in slide-in-from-top-2 duration-500"
            >
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(-1)}
                    className="shrink-0"
                >
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                        <Hash className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">
                            {tagMeta?.displayName || decodedTag}
                        </h1>
                        {tagMeta?.videoCount != null && (
                            <p className="text-sm text-muted-foreground">
                                {tagMeta.videoCount.toLocaleString()} videos
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Video Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8">
                {videos.map((video, index) => (
                    <div
                        key={`${video.id}-${index}`}
                        className="animate-in fade-in slide-in-from-bottom-4 duration-300"
                        style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
                    >
                        <VideoCard video={video} />
                    </div>
                ))}

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
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                    <Video className="w-12 h-12 mb-4 opacity-20" />
                    <p>No videos found for #{decodedTag}</p>
                </div>
            )}

            {/* Infinite Scroll Trigger */}
            <div ref={loadMoreRef} className="h-10 w-full flex items-center justify-center mt-8">
                {!hasNextPage && videos.length > 0 && (
                    <p className="text-muted-foreground text-sm">You've reached the end</p>
                )}
            </div>
        </div>
    )
}
