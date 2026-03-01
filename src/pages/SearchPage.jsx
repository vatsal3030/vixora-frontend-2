import { useState, useMemo } from 'react'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { motion } from 'framer-motion' // eslint-disable-line
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { searchService } from '../services/api'
import { VideoCard } from '../components/video/VideoCard'
import { Loader2, SearchX } from 'lucide-react'
import { toast } from 'sonner'
import { VideoCardSkeleton } from '../components/ui/Skeleton'
import { Button } from '../components/ui/Button'

export default function SearchPage() {
    const [searchParams] = useSearchParams()
    const query = searchParams.get('q') || ''
    useDocumentTitle(query ? `Search: ${query} - Vixora` : 'Search - Vixora')

    const [filter, setFilter] = useState('All') // All, Videos, Channels

    // Using TanStack Query for Global Search
    const { data: searchResults = {}, isLoading, error } = useQuery({
        queryKey: ['search', query],
        queryFn: async () => {
            if (!query) return {}

            // The backend global search API natively groups by type when scope=all
            const response = await searchService.globalSearch({ q: query, scope: 'all' })
            return response.data.data
        },
        enabled: !!query,
        staleTime: 1000 * 60 * 1,
    })

    // Normalize data from the grouped `results` payload
    const allVideos = useMemo(() => searchResults?.results?.videos || searchResults?.items || [], [searchResults])
    const allChannels = useMemo(() => searchResults?.results?.channels || [], [searchResults])

    if (error) {
        toast.error('Search failed')
        console.error("Search error:", error)
    }

    // The UI tabs filter between the globally fetched scopes
    const displayItems = useMemo(() => {
        if (filter === 'Channels') {
            return allChannels
        }
        if (filter === 'Videos') {
            return allVideos
        }
        // 'All' view currently renders videos by default in standard grid
        // Custom mix logic can be added later as UI matures
        return allVideos
    }, [filter, allVideos, allChannels])

    return (
        <div className="py-6 min-h-[80vh] container mx-auto px-4">
            <div className="glass-panel p-6 rounded-2xl mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            Search Results
                            <span className="text-sm font-normal text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                                {displayItems.length} found
                            </span>
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Showing results for <span className="text-foreground font-medium">"{query}"</span>
                        </p>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex bg-black/20 p-1 rounded-xl border border-white/5 shrink-0">
                        {['All', 'Videos', 'Channels'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setFilter(tab)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === tab
                                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <VideoCardSkeleton key={i} />
                    ))}
                </div>
            ) : displayItems.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-20 text-center"
                >
                    <div className="w-24 h-24 glass-card rounded-full flex items-center justify-center mb-6 ring-4 ring-white/5">
                        <SearchX className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h2 className="text-2xl font-bold mb-3">No matches found</h2>
                    <p className="text-muted-foreground max-w-md mx-auto mb-8">
                        We couldn't find any {filter === 'Channels' ? 'channels' : 'videos'} matching "{query}". Try checking for typos or using different keywords.
                    </p>
                    <Button onClick={() => window.history.back()} variant="outline" className="glass hover:bg-white/5">
                        <Loader2 className="w-4 h-4 mr-2" />
                        Go Back
                    </Button>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8">
                    {displayItems.map((video, index) => (
                        <motion.div
                            key={video.id || video._id || index}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05, type: "spring", stiffness: 100 }}
                        >
                            <VideoCard video={video} />
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    )
}
