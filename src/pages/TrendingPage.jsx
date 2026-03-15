import { useEffect } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useInView } from 'react-intersection-observer'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { VideoCard } from '../components/video/VideoCard'
import { VideoCardSkeleton } from '../components/ui/Skeleton'
import { feedService } from '../services/api'
import { Flame, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { motion } from 'framer-motion'

export default function TrendingPage() {
    useDocumentTitle('Trending - Vixora')

    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        refetch
    } = useInfiniteQuery({
        queryKey: ['trending'],
        queryFn: async ({ pageParam = 1 }) => {
            const response = await feedService.getTrendingFeed({ page: pageParam, limit: 20 })
            return response.data
        },
        getNextPageParam: (lastPage) => {
            const pagination = lastPage?.data?.pagination
            if (!pagination) return undefined
            return pagination.hasNextPage ? (pagination.currentPage || 1) + 1 : undefined
        },
        staleTime: 1000 * 60 * 10, // 10 minutes
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

    const videos = data?.pages.flatMap(page => page.data?.items || []) || []

    return (
        <div className="space-y-6 py-6 container mx-auto px-4">
            <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-red-500/10 rounded-xl">
                    <Flame className="w-8 h-8 text-red-500 fill-red-500/20" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Trending</h1>
                    <p className="text-muted-foreground">See what's popular on Vixora right now</p>
                </div>
            </div>

            {error ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                    <div className="p-4 bg-red-500/10 rounded-full text-red-500">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-medium">Failed to load trending videos</h3>
                    <p className="text-muted-foreground text-sm max-w-xs">{error.message || 'Something went wrong'}</p>
                    <Button onClick={() => refetch()} variant="outline">Try Again</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8 pb-10">
                    {(isLoading || (isFetchingNextPage && videos.length === 0)) && Array.from({ length: 12 }).map((_, i) => (
                        <div key={`skeleton-${i}`}>
                            <VideoCardSkeleton />
                        </div>
                    ))}

                    {videos.map((video, index) => (
                        <motion.div
                            key={video._id ? `${video._id}-${index}` : index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: (index % 20) * 0.05 }}
                        >
                            <VideoCard video={video} />
                        </motion.div>
                    ))}

                    {!isLoading && videos.length === 0 && (
                        <div className="col-span-full py-20 text-center text-muted-foreground">
                            No trending videos right now.
                        </div>
                    )}

                    {/* Infinite Scroll Trigger */}
                    <div ref={loadMoreRef} className="col-span-full h-10 w-full flex items-center justify-center mt-8">
                        {isFetchingNextPage && <Loader2 className="w-6 h-6 animate-spin text-primary" />}
                        {!hasNextPage && videos.length > 0 && (
                            <p className="text-muted-foreground text-sm">You've reached the end</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
