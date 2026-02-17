import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { VideoCard } from '../components/video/VideoCard'
import { VideoCardSkeleton } from '../components/ui/Skeleton'
import { feedService } from '../services/api'
import { Flame, AlertCircle } from 'lucide-react'
import { Button } from '../components/ui/Button'

export default function TrendingPage() {
    useDocumentTitle('Trending - Vixora')
    const { data: videos = [], isLoading, error, refetch } = useQuery({
        queryKey: ['trending'],
        queryFn: async () => {
            const response = await feedService.getTrendingFeed()
            const trendingData = response?.data?.data?.docs || response?.data?.data?.videos || response?.data?.data || []
            // Handle both pagination response and direct array
            return Array.isArray(trendingData) ? trendingData : []
        },
        staleTime: 1000 * 60 * 10 // 10 minutes
    })

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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-6">
                    {isLoading && Array.from({ length: 8 }).map((_, i) => (
                        <div key={`skeleton-${i}`}>
                            <VideoCardSkeleton />
                        </div>
                    ))}


                    {!isLoading && videos.map((video, index) => (
                        <motion.div
                            key={video._id ? `${video._id}-${index}` : index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <VideoCard video={video} />
                        </motion.div>
                    ))}

                    {!isLoading && videos.length === 0 && (
                        <div className="col-span-full py-20 text-center text-muted-foreground">
                            No trending videos right now.
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
