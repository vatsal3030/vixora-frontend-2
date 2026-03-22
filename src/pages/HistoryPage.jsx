import { useState, useMemo, useEffect } from 'react'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useInView } from 'react-intersection-observer'
import { Link } from 'react-router-dom'
import {
    History, Trash2, Search, Calendar, Grid3X3, List, X,
    Clock, Play, MoreVertical, ChevronDown, Pause, Filter, ArrowUpDown,
    AlertCircle, RefreshCcw, Check, CheckSquare, Square, Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { watchHistoryService } from '../services/api'
import { VideoCard } from '../components/video/VideoCard'
import { VideoCardSkeleton } from '../components/ui/Skeleton'
import { Button } from '../components/ui/Button'
import { Avatar } from '../components/ui/Avatar'
import { ConfirmationDialog } from '../components/common/ConfirmationDialog'
import SEO from '../components/common/SEO'
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

export default function HistoryPage() {
    const queryClient = useQueryClient()

    // State
    const [searchQuery, setSearchQuery] = useState('')
    const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'
    const [dateFilter, setDateFilter] = useState('all') // 'all' | 'today' | 'week' | 'month'
    const [sortBy, setSortBy] = useState('recent') // 'recent' | 'oldest'
    const [selectedVideos, setSelectedVideos] = useState(new Set())
    const [showClearDialog, setShowClearDialog] = useState(false)

    // Fetch watch history (Infinite)
    const {
        data,
        isLoading,
        error,
        refetch,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useInfiniteQuery({
        queryKey: ['watchHistory'],
        queryFn: async ({ pageParam = 1 }) => {
            const response = await watchHistoryService.getHistory({ 
                includeCompleted: true,
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

    const rawVideos = useMemo(() => data?.pages.flatMap(page => page.items || []) || [], [data])

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

    // Filter videos (Client-side filtering still applied for search/date/sort)
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

        // Sort
        result.sort((a, b) => {
            const dateA = new Date(a.watchedAt || a.updatedAt || a.createdAt)
            const dateB = new Date(b.watchedAt || b.updatedAt || b.createdAt)
            return sortBy === 'oldest' ? dateA - dateB : dateB - dateA
        })

        return result
    }, [rawVideos, searchQuery, dateFilter, sortBy])

    // Group videos by date
    const groupedVideos = useMemo(() => groupVideosByDate(filteredVideos), [filteredVideos])

    const clearSelection = () => {
        setSelectedVideos(new Set())
    }

    const handleRemoveSelected = () => {
        toast.success(`Removed ${selectedVideos.size} video(s) from history`)
        clearSelection()
    }

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
            <SEO title="History" description="Your recently watched videos on Vixora." />
            {/* Header */}
            <div className="py-6 container mx-auto px-4">
                <div className="glass-panel p-6 rounded-2xl space-y-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold flex items-center gap-3">
                            <div className="p-2 bg-white/5 rounded-xl">
                                <History className="w-6 h-6 text-primary" />
                            </div>
                            Watch History
                            <span className="text-sm font-normal text-muted-foreground ml-2 px-2 py-0.5 bg-white/5 rounded-full">
                                {rawVideos.length}
                            </span>
                        </h1>

                        <div className="flex items-center gap-2">
                            {selectedVideos.size > 0 && (
                                <div className="flex items-center gap-2 mr-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                                    <span className="text-xs font-medium text-primary hidden sm:inline">{selectedVideos.size} selected</span>
                                    <Button variant="ghost" size="sm" onClick={handleRemoveSelected} className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10 text-xs rounded-full">
                                        Remove
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={clearSelection} className="h-7 px-2 text-xs rounded-full">
                                        Cancel
                                    </Button>
                                </div>
                            )}

                            {rawVideos.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-9 text-destructive hover:bg-destructive/10 hover:text-destructive gap-2 rounded-full px-4"
                                    onClick={() => setShowClearDialog(true)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span className="hidden sm:inline">Clear All History</span>
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide">
                        <div className="relative flex-1 min-w-[240px]">
                            <input
                                type="text"
                                placeholder="Search watch history..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 glass-input border border-white/5 rounded-xl text-sm focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/70"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-white/10 rounded-full text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Dropdowns - Compact */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-10 glass-btn hover:bg-white/10 gap-2 px-4 border border-white/5 rounded-xl text-foreground">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    <span className="hidden sm:inline whitespace-nowrap text-sm font-medium">
                                        {dateFilter === 'all' ? 'Any time' : dateFilter === 'today' ? 'Today' : dateFilter === 'week' ? 'This week' : 'This month'}
                                    </span>
                                    <ChevronDown className="w-3 h-3 text-muted-foreground opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-[#1f1f1f]/95 backdrop-blur-xl border-white/10 p-1 rounded-xl shadow-premium w-40">
                                {[
                                    { value: 'all', label: 'All time' },
                                    { value: 'today', label: 'Today' },
                                    { value: 'week', label: 'This week' },
                                    { value: 'month', label: 'This month' }
                                ].map(opt => (
                                    <DropdownMenuItem
                                        key={opt.value}
                                        onClick={() => setDateFilter(opt.value)}
                                        className={cn("cursor-pointer rounded-lg text-sm mb-0.5", dateFilter === opt.value && "text-primary bg-primary/10")}
                                    >
                                        {opt.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Sort Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-10 glass-btn hover:bg-white/10 gap-2 px-4 border border-white/5 rounded-xl text-foreground">
                                    <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                                    <span className="hidden sm:inline whitespace-nowrap text-sm font-medium">
                                        {sortBy === 'recent' ? 'Latest' : 'Oldest'}
                                    </span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-[#1f1f1f]/95 backdrop-blur-xl border-white/10 p-1 rounded-xl shadow-premium w-32">
                                {[
                                    { value: 'recent', label: 'Latest' },
                                    { value: 'oldest', label: 'Oldest' }
                                ].map(opt => (
                                    <DropdownMenuItem
                                        key={opt.value}
                                        onClick={() => setSortBy(opt.value)}
                                        className={cn("cursor-pointer rounded-lg text-sm mb-0.5", sortBy === opt.value && "text-primary bg-primary/10")}
                                    >
                                        {opt.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <div className="flex bg-black/20 rounded-xl p-1 ml-auto border border-white/5">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={cn(
                                    "p-2 rounded-lg transition-all",
                                    viewMode === 'grid' ? "bg-white/10 text-white shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                )}
                                title="Grid View"
                            >
                                <Grid3X3 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={cn(
                                    "p-2 rounded-lg transition-all",
                                    viewMode === 'list' ? "bg-white/10 text-white shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                )}
                                title="List View"
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 mt-6">
                {(isLoading && rawVideos.length === 0) && (
                    <div className={cn(
                        viewMode === 'grid'
                            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8"
                            : "space-y-4"
                    )}>
                        {Array.from({ length: 12 }).map((_, i) => (
                            <VideoCardSkeleton key={i} />
                        ))}
                    </div>
                )}

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

                {filteredVideos.length > 0 && (
                    <div className="space-y-8">
                        {Object.entries(groupedVideos).map(([key, videos]) => {
                            if (videos.length === 0) return null;
                            const labels = {
                                today: 'Today',
                                yesterday: 'Yesterday',
                                thisWeek: 'This Week',
                                thisMonth: 'This Month',
                                older: 'Older'
                            }
                            return (
                                <section key={key}>
                                    <DateSectionHeader label={labels[key]} count={videos.length} />
                                    <div className={cn(
                                        viewMode === 'grid'
                                            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8"
                                            : "space-y-2"
                                    )}>
                                        {videos.map((item, index) => (
                                            <div
                                                key={`${item._id || item.id}-${index}`}
                                                className="animate-in fade-in slide-in-from-bottom-4 duration-300"
                                                style={{ animationDelay: `${(index % 20) * 30}ms`, animationFillMode: 'backwards' }}
                                            >
                                                <VideoCard video={item.video || item} />
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )
                        })}
                        
                        {/* Infinite Scroll Trigger */}
                        <div ref={loadMoreRef} className="h-10 w-full flex items-center justify-center mt-8">
                            {isFetchingNextPage && <Loader2 className="w-6 h-6 animate-spin text-primary" />}
                            {!hasNextPage && rawVideos.length > 0 && (
                                <p className="text-muted-foreground text-sm">You've reached the end</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

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
