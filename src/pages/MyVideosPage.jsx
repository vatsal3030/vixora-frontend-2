import { useRef, useState, useMemo } from 'react'
import { ConfirmationDialog } from '../components/common/ConfirmationDialog'
import { motion } from 'framer-motion' // eslint-disable-line
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { videoService } from '../services/api'
import { CreatorVideoCard } from '../components/dashboard/videos/CreatorVideoCard'
import { VideoManagementToolbar } from '../components/dashboard/videos/VideoManagementToolbar'
import { VideoBulkActions } from '../components/dashboard/videos/VideoBulkActions'
import HomePageSkeleton from '../components/skeletons/HomePageSkeleton'
import { Plus, Loader2, Film } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export default function MyVideosPage() {
    useDocumentTitle('Your Videos - Vixora Studio')
    const queryClient = useQueryClient()

    // --- State ---
    const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'
    const [searchQuery, setSearchQuery] = useState('')
    const [filter, setFilter] = useState('all') // 'all', 'published', 'private', 'unlisted'
    const [sortBy, setSortBy] = useState('createdAt') // 'createdAt', 'views', 'likesCount'
    const [selectedIds, setSelectedIds] = useState(new Set())
    const [videoToDelete, setVideoToDelete] = useState(null)
    const [isBulkProcessing, setIsBulkProcessing] = useState(false)

    // --- Query ---
    const {
        data: _videosData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        error
    } = useInfiniteQuery({
        queryKey: ['myVideos', sortBy], // Re-fetch when sort changes
        queryFn: async ({ pageParam = 1 }) => {
            const res = await videoService.getMyVideos({
                page: pageParam,
                limit: 24,
                sortBy: sortBy,
                sortType: 'desc'
            })
            return res.data.data
        },
        getNextPageParam: (lastPage) => lastPage?.hasNextPage ? lastPage.nextPage : undefined,
        initialPageParam: 1
    })

    // --- Derived State (Client-side Filtering) ---
    const allVideos = useMemo(() => {
        const flattened = _videosData?.pages.flatMap(page => page?.docs || page) || []

        return flattened.filter(video => {
            // Text Search
            const matchesSearch = (video.title || '').toLowerCase().includes(searchQuery.toLowerCase())

            // Status Filter
            let matchesFilter = true
            if (filter === 'published') matchesFilter = video.isPublished
            if (filter === 'private') matchesFilter = !video.isPublished
            // API doesn't seem to differentiate unlisted/private clearly in video object unless isPublished is false.
            // Assuming !isPublished = Private for now based on available data.

            return matchesSearch && matchesFilter
        })
    }, [_videosData, searchQuery, filter])

    // --- Mutations ---
    const deleteMutation = useMutation({
        mutationFn: (videoId) => videoService.deleteVideo(videoId),
        onSuccess: () => {
            toast.success('Video moved to trash')
            queryClient.invalidateQueries({ queryKey: ['myVideos'] })
            setVideoToDelete(null)
        },
        onError: () => toast.error('Failed to delete video')
    })

    const togglePublishMutation = useMutation({ // eslint-disable-line no-unused-vars
        mutationFn: (videoId) => videoService.togglePublishStatus(videoId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myVideos'] })
            toast.success('Visibility updated')
        },
        onError: () => toast.error('Failed to update status')
    })

    // --- Actions ---
    const handleSelect = (id, isSelected) => {
        const newSelected = new Set(selectedIds)
        if (isSelected) newSelected.add(id)
        else newSelected.delete(id)
        setSelectedIds(newSelected)
    }

    const clearSelection = () => setSelectedIds(new Set())

    const handleBulkDelete = async () => {
        if (!window.confirm(`Move ${selectedIds.size} videos to trash?`)) return
        setIsBulkProcessing(true)
        try {
            await Promise.all([...selectedIds].map(id => videoService.deleteVideo(id)))
            toast.success(`${selectedIds.size} videos moved to trash`)
            queryClient.invalidateQueries({ queryKey: ['myVideos'] })
            clearSelection()
        } catch {
            toast.error('Failed to delete some videos')
        } finally {
            setIsBulkProcessing(false)
        }
    }

    const handleBulkPublish = async (publish) => {
        setIsBulkProcessing(true)
        try {
            // Need to check current status to avoid redundant calls? 
            // Or just call toggle if state doesn't match? 
            // API is 'togglePublish', simpler to verify we only toggle ones that need it.
            // Client-side filtering check:
            const videosToToggle = allVideos.filter(v => selectedIds.has(v._id) && v.isPublished !== publish)

            await Promise.all(videosToToggle.map(v => videoService.togglePublish(v._id)))

            toast.success('Visibility updated')
            queryClient.invalidateQueries({ queryKey: ['myVideos'] })
            clearSelection()
        } catch {
            toast.error('Failed to update some videos')
        } finally {
            setIsBulkProcessing(false)
        }
    }

    // --- Infinite Scroll ---
    const observerRef = useRef()
    const lastItemRef = (node) => {
        if (isLoading || isFetchingNextPage) return
        if (observerRef.current) observerRef.current.disconnect()
        observerRef.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasNextPage) {
                fetchNextPage()
            }
        })
        if (node) observerRef.current.observe(node)
    }

    // --- Render ---
    if (error) {
        return (
            <div className="text-center py-20">
                <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
                <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
        )
    }

    return (
        <div className="py-2 pb-32">

            {/* Toolbar */}
            <VideoManagementToolbar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                filter={filter}
                onFilterChange={setFilter}
                sortBy={sortBy}
                onSortChange={setSortBy}
            />

            {/* Content */}
            {isLoading ? (
                <HomePageSkeleton />
            ) : allVideos.length === 0 ? (
                <div className="text-center py-20 bg-secondary/10 rounded-2xl border border-dashed border-border/50">
                    <div className="bg-secondary/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Film className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                        {searchQuery || filter !== 'all' ? 'No videos found' : 'Upload your first video'}
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                        {searchQuery || filter !== 'all'
                            ? 'Try adjusting your search or filters.'
                            : 'Share your content with the world. Videos you upload will appear here.'}
                    </p>
                    {(searchQuery || filter !== 'all') ? (
                        <Button variant="outline" onClick={() => { setSearchQuery(''); setFilter('all'); }}>
                            Clear Filters
                        </Button>
                    ) : (
                        <Link to="/upload">
                            <Button>Upload Now</Button>
                        </Link>
                    )}
                </div>
            ) : (
                <div className={viewMode === 'grid'
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8"
                    : "flex flex-col gap-3"
                }>
                    {allVideos.map((video, index) => (
                        <motion.div
                            ref={index === allVideos.length - 1 ? lastItemRef : null}
                            key={video._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                        >
                            <CreatorVideoCard
                                video={video}
                                viewMode={viewMode}
                                isSelected={selectedIds.has(video._id)}
                                onSelect={handleSelect}
                                onDelete={() => setVideoToDelete(video._id)}
                                onTogglePublish={(id) => videoService.togglePublish(id).then(() => {
                                    queryClient.invalidateQueries({ queryKey: ['myVideos'] });
                                    toast.success('Visibility updated');
                                })}
                            />
                        </motion.div>
                    ))}
                </div>
            )}

            {isFetchingNextPage && (
                <div className="py-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                </div>
            )}

            {/* Sticky Actions */}
            <VideoBulkActions
                selectedCount={selectedIds.size}
                onClearSelection={clearSelection}
                onDelete={handleBulkDelete}
                onTogglePublish={handleBulkPublish}
                isProcessing={isBulkProcessing}
            />

            <ConfirmationDialog
                open={!!videoToDelete}
                onOpenChange={(open) => !open && setVideoToDelete(null)}
                title="Move to Trash?"
                description="This video will be moved to trash and deleted forever after 7 days."
                confirmLabel="Move to Trash"
                onConfirm={() => deleteMutation.mutate(videoToDelete)}
            />
        </div>
    )
}
