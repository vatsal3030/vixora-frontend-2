import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// import { useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
    History, Trash2, Search, Calendar, Grid3X3, List, X,
    Clock, Play, MoreVertical, ChevronDown, Pause, Filter,
    AlertCircle, RefreshCcw, Check, CheckSquare, Square
} from 'lucide-react'
import { toast } from 'sonner'
import { watchHistoryService } from '../services/api'
import { VideoCard } from '../components/video/VideoCard'
import { VideoCardSkeleton } from '../components/ui/Skeleton'
import { Button } from '../components/ui/Button'
import { Avatar } from '../components/ui/Avatar'
import { ConfirmationDialog } from '../components/common/ConfirmationDialog'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
// import { formatDuration, formatViews, formatTimeAgo, formatNumber } from '../lib/utils'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "../components/ui/DropdownMenu"
import { cn } from '../lib/utils'

// Helper to group videos by date
function groupVideosByDate(videos) {
    const groups = {
        today: [],
        yesterday: [],
        thisWeek: [],
        thisMonth: [],
        older: []
    }

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    videos.forEach(video => {
        const watchedAt = new Date(video.watchedAt || video.updatedAt || video.createdAt)

        if (watchedAt >= today) {
            groups.today.push(video)
        } else if (watchedAt >= yesterday) {
            groups.yesterday.push(video)
        } else if (watchedAt >= weekAgo) {
            groups.thisWeek.push(video)
        } else if (watchedAt >= monthAgo) {
            groups.thisMonth.push(video)
        } else {
            groups.older.push(video)
        }
    })

    return groups
}

// Date section header component
function DateSectionHeader({ label, count }) {
    return (
        <div className="flex items-center gap-4 py-3 border-b border-white/10 mb-4">
            <h2 className="text-lg font-semibold text-white">{label}</h2>
            <span className="text-sm text-muted-foreground">{count} video{count !== 1 ? 's' : ''}</span>
        </div>
    )
}

// HistoryVideoCard removed - replaced by standard VideoCard


export default function HistoryPage() {
    useDocumentTitle('Watch History - Vixora')
    const queryClient = useQueryClient()

    // State
    const [searchQuery, setSearchQuery] = useState('')
    const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'
    const [dateFilter, setDateFilter] = useState('all') // 'all' | 'today' | 'week' | 'month'
    // const [sortBy, setSortBy] = useState('recent') // 'recent' | 'oldest' | 'mostWatched'
    const [selectedVideos, setSelectedVideos] = useState(new Set())
    const [showClearDialog, setShowClearDialog] = useState(false)
    // const [isSelectMode, setIsSelectMode] = useState(false)

    // Fetch watch history
    const { data: rawVideos = [], isLoading, error, refetch } = useQuery({
        queryKey: ['watchHistory'],
        queryFn: async () => {
            const response = await watchHistoryService.getContinueWatching()
            return response.data.data.videos || []
        }
    })

    // Clear history mutation
    const clearHistoryMutation = useMutation({
        mutationFn: () => watchHistoryService.clearHistory(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['watchHistory'] })
            toast.success('Watch history cleared')
            setShowClearDialog(false)
        },
        onError: () => toast.error('Failed to clear history')
    })

    // Filter videos
    const filteredVideos = useMemo(() => {
        let result = [...rawVideos]

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            result = result.filter(v =>
                v.title?.toLowerCase().includes(query) ||
                v.owner?.username?.toLowerCase().includes(query) ||
                v.owner?.fullName?.toLowerCase().includes(query)
            )
        }

        // Date filter
        if (dateFilter !== 'all') {
            const now = new Date()
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

            result = result.filter(video => {
                const watchedAt = new Date(video.watchedAt || video.updatedAt || video.createdAt)

                switch (dateFilter) {
                    case 'today':
                        return watchedAt >= today
                    case 'week':
                        return watchedAt >= new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
                    case 'month':
                        return watchedAt >= new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
                    default:
                        return true
                }
            })
        }

        // Sort - always recent for now as we removed the sort control
        result.sort((a, b) => {
            const dateA = new Date(a.watchedAt || a.updatedAt || a.createdAt)
            const dateB = new Date(b.watchedAt || b.updatedAt || b.createdAt)
            return dateB - dateA
        })

        return result
    }, [rawVideos, searchQuery, dateFilter])

    // Group videos by date
    const groupedVideos = useMemo(() => groupVideosByDate(filteredVideos), [filteredVideos])

    // Selection handlers
    /*
    const toggleSelection = (videoId) => {
        setSelectedVideos(prev => {
            const newSet = new Set(prev)
            if (newSet.has(videoId)) {
                newSet.delete(videoId)
            } else {
                newSet.add(videoId)
            }
            return newSet
        })
    }
    */

    /*
    const selectAll = () => {
        setSelectedVideos(new Set(filteredVideos.map(v => v._id || v.id)))
    }
    */

    const clearSelection = () => {
        setSelectedVideos(new Set())
        // setIsSelectMode(false)
    }

    const handleRemoveSelected = () => {
        // TODO: Implement bulk remove API
        toast.success(`Removed ${selectedVideos.size} video(s) from history`)
        clearSelection()
    }

    /*
    const handleRemoveSingle = (videoId) => {
        // TODO: Implement single remove API
        toast.success('Removed from history')
    }
    */

    // Calculate stats
    /*
    const totalWatchTime = useMemo(() => {
        return rawVideos.reduce((acc, v) => acc + (v.watchProgress || 0), 0)
    }, [rawVideos])
    */

    // Error state
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="p-4 bg-red-500/10 rounded-full text-red-500">
                    <AlertCircle className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-medium">Failed to load watch history</h3>
                <p className="text-muted-foreground text-sm max-w-xs">{error.message || 'Something went wrong'}</p>
                <Button onClick={() => refetch()} variant="outline" className="gap-2">
                    <RefreshCcw className="w-4 h-4" />
                    Try Again
                </Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen pb-10">
            {/* Header */}
            {/* Header */}
            <div className="py-2 container mx-auto px-4">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            Watch History
                            <span className="text-sm font-normal text-muted-foreground ml-2">
                                {rawVideos.length} videos
                            </span>
                        </h1>

                        <div className="flex items-center gap-2">
                            {/* Selection mode actions */}
                            {selectedVideos.size > 0 && (
                                <div className="flex items-center gap-2 mr-2 px-3 py-1 bg-primary/10 rounded-full">
                                    <span className="text-xs font-medium text-primary hidden sm:inline">{selectedVideos.size} selected</span>
                                    <Button variant="ghost" size="sm" onClick={handleRemoveSelected} className="h-7 px-2 text-destructive hover:text-destructive text-xs">
                                        Remove
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={clearSelection} className="h-7 px-2 text-xs">
                                        Cancel
                                    </Button>
                                </div>
                            )}

                            {rawVideos.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 text-destructive hover:bg-destructive/10"
                                    onClick={() => setShowClearDialog(true)}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    <span className="hidden sm:inline">Clear All</span>
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Filters Row - Compact */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {/* Search - Compact Expandable or just smaller */}
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search history..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-1.5 bg-secondary/50 border-0 rounded-lg text-sm focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/70"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-white/10 rounded-full"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>

                        {/* Dropdowns - Compact */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 bg-secondary/50 gap-1.5 px-3">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline whitespace-nowrap">
                                        {dateFilter === 'all' ? 'Any time' : dateFilter}
                                    </span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-[#212121] border-white/10">
                                {[
                                    { value: 'all', label: 'All time' },
                                    { value: 'today', label: 'Today' },
                                    { value: 'week', label: 'This week' },
                                    { value: 'month', label: 'This month' }
                                ].map(opt => (
                                    <DropdownMenuItem
                                        key={opt.value}
                                        onClick={() => setDateFilter(opt.value)}
                                        className={cn("cursor-pointer", dateFilter === opt.value && "text-primary")}
                                    >
                                        {opt.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <div className="flex bg-secondary/50 rounded-lg p-0.5 ml-auto">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={cn(
                                    "p-1.5 rounded-md transition-all",
                                    viewMode === 'grid' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <Grid3X3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={cn(
                                    "p-1.5 rounded-md transition-all",
                                    viewMode === 'list' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <List className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 mt-6">
                {/* Loading State */}
                {isLoading && (
                    <div className={cn(
                        viewMode === 'grid'
                            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-6"
                            : "space-y-2"
                    )}>
                        {Array.from({ length: 8 }).map((_, i) => (
                            <VideoCardSkeleton key={i} />
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && filteredVideos.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="p-6 bg-white/5 rounded-full mb-6">
                            <History className="w-16 h-16 text-muted-foreground opacity-50" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">
                            {searchQuery ? 'No videos found' : 'No watch history yet'}
                        </h3>
                        <p className="text-muted-foreground max-w-sm mb-6">
                            {searchQuery
                                ? `No videos match "${searchQuery}". Try a different search.`
                                : 'Videos you watch will appear here. Start exploring!'}
                        </p>
                        {!searchQuery && (
                            <Link to="/">
                                <Button className="gap-2">
                                    <Play className="w-4 h-4" />
                                    Browse Videos
                                </Button>
                            </Link>
                        )}
                    </div>
                )}

                {/* Videos - Grouped by Date */}
                {!isLoading && filteredVideos.length > 0 && (
                    <div className="space-y-8">
                        {/* Today */}
                        {groupedVideos.today.length > 0 && (
                            <section>
                                <DateSectionHeader label="Today" count={groupedVideos.today.length} />
                                <div className={cn(
                                    viewMode === 'grid'
                                        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-6"
                                        : "space-y-2"
                                )}>
                                    {groupedVideos.today.map((video, index) => (
                                        <div
                                            key={video._id || index}
                                            className="animate-in fade-in slide-in-from-bottom-4 duration-300"
                                            style={{ animationDelay: `${index * 30}ms`, animationFillMode: 'backwards' }}
                                        >
                                            <div className="relative group">
                                                <VideoCard video={video} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Yesterday */}
                        {groupedVideos.yesterday.length > 0 && (
                            <section>
                                <DateSectionHeader label="Yesterday" count={groupedVideos.yesterday.length} />
                                <div className={cn(
                                    viewMode === 'grid'
                                        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-6"
                                        : "space-y-2"
                                )}>
                                    {groupedVideos.yesterday.map((video, index) => (
                                        <div
                                            key={video._id || index}
                                            className="animate-in fade-in slide-in-from-bottom-4 duration-300"
                                            style={{ animationDelay: `${index * 30}ms`, animationFillMode: 'backwards' }}
                                        >
                                            <div className="relative group">
                                                <VideoCard video={video} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* This Week */}
                        {groupedVideos.thisWeek.length > 0 && (
                            <section>
                                <DateSectionHeader label="This Week" count={groupedVideos.thisWeek.length} />
                                <div className={cn(
                                    viewMode === 'grid'
                                        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-6"
                                        : "space-y-2"
                                )}>
                                    {groupedVideos.thisWeek.map((video, index) => (
                                        <div
                                            key={video._id || index}
                                            className="animate-in fade-in slide-in-from-bottom-4 duration-300"
                                            style={{ animationDelay: `${index * 30}ms`, animationFillMode: 'backwards' }}
                                        >
                                            <div className="relative group">
                                                <VideoCard video={video} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* This Month */}
                        {groupedVideos.thisMonth.length > 0 && (
                            <section>
                                <DateSectionHeader label="This Month" count={groupedVideos.thisMonth.length} />
                                <div className={cn(
                                    viewMode === 'grid'
                                        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-6"
                                        : "space-y-2"
                                )}>
                                    {groupedVideos.thisMonth.map((video, index) => (
                                        <div
                                            key={video._id || index}
                                            className="animate-in fade-in slide-in-from-bottom-4 duration-300"
                                            style={{ animationDelay: `${index * 30}ms`, animationFillMode: 'backwards' }}
                                        >
                                            <div className="relative group">
                                                <VideoCard video={video} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Older */}
                        {groupedVideos.older.length > 0 && (
                            <section>
                                <DateSectionHeader label="Older" count={groupedVideos.older.length} />
                                <div className={cn(
                                    viewMode === 'grid'
                                        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-6"
                                        : "space-y-2"
                                )}>
                                    {groupedVideos.older.map((video, index) => (
                                        <div
                                            key={video._id || index}
                                            className="animate-in fade-in slide-in-from-bottom-4 duration-300"
                                            style={{ animationDelay: `${index * 30}ms`, animationFillMode: 'backwards' }}
                                        >
                                            <div className="relative group">
                                                <VideoCard video={video} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </div>

            {/* Clear History Confirmation Dialog */}
            <ConfirmationDialog
                open={showClearDialog}
                onOpenChange={setShowClearDialog}
                title="Clear Watch History?"
                description="This will permanently remove all videos from your watch history. This action cannot be undone."
                confirmLabel="Clear History"
                onConfirm={() => clearHistoryMutation.mutate()}
                isLoading={clearHistoryMutation.isPending}
            />
        </div>
    )
}
