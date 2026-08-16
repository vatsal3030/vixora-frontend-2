import { useRef, useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ConfirmationDialog } from '../components/common/ConfirmationDialog'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { videoService, tweetService, playlistService } from '../services/api'
import { CreatorVideoCard } from '../components/dashboard/videos/CreatorVideoCard'
import { VideoManagementToolbar } from '../components/dashboard/videos/VideoManagementToolbar'
import { VideoBulkActions } from '../components/dashboard/videos/VideoBulkActions'
import { TweetCard } from '../components/tweet/TweetCard'
import { PlaylistCard } from '../components/playlist/PlaylistCard'
import { PlaylistCardSkeleton } from '../components/ui/Skeleton'
import HomePageSkeleton from '../components/skeletons/HomePageSkeleton'
import { Plus, Loader2, Film, Smartphone, MessageCircle, ListVideo, Globe, Lock, Pencil, Trash2 } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useInView } from 'react-intersection-observer'
import { useAuth } from '../context/AuthContext'
import { getMediaUrl } from '../lib/media'
import { formatTimeAgo } from '../lib/utils'

const TABS = [
    { id: 'videos', label: 'Videos', icon: Film },
    { id: 'shorts', label: 'Shorts', icon: Smartphone },
    { id: 'community', label: 'Community', icon: MessageCircle },
    { id: 'playlists', label: 'Playlists', icon: ListVideo },
]

export default function YoursPage() {
    useDocumentTitle('Yours - Vixora')
    const { user } = useAuth()
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const [activeTab, setActiveTab] = useState('videos')

    // --- Video State ---
    const [viewMode, setViewMode] = useState('grid')
    const [searchQuery, setSearchQuery] = useState('')
    const [filter, setFilter] = useState('all')
    const [sortBy, setSortBy] = useState('createdAt')
    const [selectedIds, setSelectedIds] = useState(new Set())
    const [videoToDelete, setVideoToDelete] = useState(null)
    const [isBulkProcessing, setIsBulkProcessing] = useState(false)

    // ===================== VIDEO TAB =====================
    const {
        data: _videosData,
        fetchNextPage: fetchMoreVideos,
        hasNextPage: hasMoreVideos,
        isFetchingNextPage: loadingMoreVideos,
        isLoading: videosLoading,
    } = useInfiniteQuery({
        queryKey: ['myVideos', sortBy],
        queryFn: async ({ pageParam = 1 }) => {
            const res = await videoService.getMyVideos({ page: pageParam, limit: 24, sortBy, sortType: 'desc', isShort: false })
            return res.data.data
        },
        getNextPageParam: (lastPage) => {
            const p = lastPage?.pagination
            return p?.hasNextPage ? (p.currentPage || p.page) + 1 : undefined
        },
        initialPageParam: 1,
        enabled: activeTab === 'videos'
    })

    const { ref: videosRef, inView: videosInView } = useInView({
        threshold: 0.1,
        rootMargin: '200px',
    })

    useEffect(() => {
        if (videosInView && hasMoreVideos && !loadingMoreVideos && activeTab === 'videos') {
            fetchMoreVideos()
        }
    }, [videosInView, hasMoreVideos, loadingMoreVideos, activeTab, fetchMoreVideos])

    const allVideos = useMemo(() => {
        const flattened = _videosData?.pages.flatMap(page => page?.items || page?.videos || page.data?.items || page.data?.videos || []) || []
        return flattened.filter(video => {
            const matchesSearch = (video.title || '').toLowerCase().includes(searchQuery.toLowerCase())
            let matchesFilter = true
            if (filter === 'published') matchesFilter = video.isPublished
            if (filter === 'private') matchesFilter = !video.isPublished
            return matchesSearch && matchesFilter
        })
    }, [_videosData, searchQuery, filter])

    const deleteVideoMutation = useMutation({
        mutationFn: (videoId) => videoService.deleteVideo(videoId),
        onSuccess: () => {
            toast.success('Video moved to trash')
            queryClient.invalidateQueries({ queryKey: ['myVideos'] })
            setVideoToDelete(null)
        },
        onError: () => toast.error('Failed to delete video')
    })

    const handleSelect = (id, isSelected) => {
        const newSelected = new Set(selectedIds)
        if (isSelected) newSelected.add(id)
        else newSelected.delete(id)
        setSelectedIds(newSelected)
    }

    const handleBulkDelete = async () => {
        setIsBulkProcessing(true)
        try {
            await Promise.all([...selectedIds].map(id => videoService.deleteVideo(id)))
            toast.success(`${selectedIds.size} videos moved to trash`)
            queryClient.invalidateQueries({ queryKey: ['myVideos'] })
            setSelectedIds(new Set())
        } catch {
            toast.error('Failed to delete some videos')
        } finally {
            setIsBulkProcessing(false)
        }
    }

    const handleBulkPublish = async (publish) => {
        setIsBulkProcessing(true)
        try {
            const videosToToggle = allVideos.filter(v => selectedIds.has(v._id) && v.isPublished !== publish)
            await Promise.all(videosToToggle.map(v => videoService.togglePublish(v._id)))
            toast.success('Visibility updated')
            queryClient.invalidateQueries({ queryKey: ['myVideos'] })
            setSelectedIds(new Set())
        } catch {
            toast.error('Failed to update some videos')
        } finally {
            setIsBulkProcessing(false)
        }
    }

    // ===================== SHORTS TAB =====================
    const {
        data: _shortsData,
        fetchNextPage: fetchMoreShorts,
        hasNextPage: hasMoreShorts,
        isFetchingNextPage: loadingMoreShorts,
        isLoading: shortsLoading,
    } = useInfiniteQuery({
        queryKey: ['myShorts', sortBy],
        queryFn: async ({ pageParam = 1 }) => {
            const res = await videoService.getMyVideos({ page: pageParam, limit: 24, sortBy, sortType: 'desc', isShort: true })
            return res.data.data
        },
        getNextPageParam: (lastPage) => {
            const p = lastPage?.pagination
            return p?.hasNextPage ? (p.currentPage || p.page) + 1 : undefined
        },
        initialPageParam: 1,
        enabled: activeTab === 'shorts'
    })

    const { ref: shortsRef, inView: shortsInView } = useInView({
        threshold: 0.1,
        rootMargin: '200px',
    })

    useEffect(() => {
        if (shortsInView && hasMoreShorts && !loadingMoreShorts && activeTab === 'shorts') {
            fetchMoreShorts()
        }
    }, [shortsInView, hasMoreShorts, loadingMoreShorts, activeTab, fetchMoreShorts])

    const allShorts = useMemo(() => {
        return _shortsData?.pages.flatMap(page => page?.items || page?.shorts || page?.videos || page.data?.items || page.data?.shorts || page.data?.videos || []) || []
    }, [_shortsData])

    // ===================== COMMUNITY TAB =====================
    const {
        data: _tweetsData,
        fetchNextPage: fetchMoreTweets,
        hasNextPage: hasMoreTweets,
        isFetchingNextPage: loadingMoreTweets,
        isLoading: tweetsLoading,
        refetch: refetchTweets,
    } = useInfiniteQuery({
        queryKey: ['myTweets'],
        queryFn: async ({ pageParam = 1 }) => {
            const res = await tweetService.getUserTweets(user?._id, { page: pageParam, limit: 20 })
            return res.data.data
        },
        getNextPageParam: (lastPage) => {
            const p = lastPage?.pagination
            return p?.hasNextPage ? (p.currentPage || p.page) + 1 : undefined
        },
        initialPageParam: 1,
        enabled: activeTab === 'community' && !!user
    })

    const { ref: communityRef, inView: communityInView } = useInView({
        threshold: 0.1,
        rootMargin: '200px',
    })

    useEffect(() => {
        if (communityInView && hasMoreTweets && !loadingMoreTweets && activeTab === 'community') {
            fetchMoreTweets()
        }
    }, [communityInView, hasMoreTweets, loadingMoreTweets, activeTab, fetchMoreTweets])

    const allTweets = useMemo(() => {
        return _tweetsData?.pages.flatMap(page => page?.items || page?.tweets || page.data?.items || page.data?.tweets || []) || []
    }, [_tweetsData])

    const deleteTweetMutation = useMutation({
        mutationFn: tweetService.deleteTweet,
        onSuccess: () => {
            toast.success('Post deleted')
            queryClient.invalidateQueries({ queryKey: ['myTweets'] })
        },
        onError: () => toast.error('Failed to delete post')
    })

    // ===================== PLAYLISTS TAB =====================
    const {
        data: playlistsData,
        isLoading: playlistsLoading,
        refetch: refetchPlaylists,
    } = useQuery({
        queryKey: ['myPlaylists'],
        queryFn: async () => {
            const res = await playlistService.getMyPlaylists({ page: 1, limit: 50 })
            return res.data.data
        },
        enabled: activeTab === 'playlists'
    })

    const allPlaylists = playlistsData?.items || []

    const togglePlaylistPrivacyMutation = useMutation({
        mutationFn: playlistService.togglePlaylistPrivacy,
        onSuccess: () => {
            toast.success('Playlist visibility updated')
            refetchPlaylists()
        },
        onError: () => toast.error('Failed to update playlist visibility')
    })

    const deletePlaylistMutation = useMutation({
        mutationFn: playlistService.deletePlaylist,
        onSuccess: () => {
            toast.success('Playlist deleted')
            refetchPlaylists()
        },
        onError: () => toast.error('Failed to delete playlist')
    })

    return (
        <div className="pb-32">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Yours</h1>
                    <p className="text-muted-foreground text-sm mt-1">Manage all your content in one place</p>
                </div>
                <div className="flex gap-2">
                    <Link to="/upload?tab=tweet">
                        <Button variant="outline" size="sm" className="gap-2 glass-btn border-white/10">
                            <MessageCircle className="w-4 h-4" />
                            <span className="hidden sm:inline">New Post</span>
                        </Button>
                    </Link>
                    <Link to="/upload">
                        <Button size="sm" className="gap-2">
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Upload</span>
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 border-b border-white/10 overflow-x-auto scrollbar-hide">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all border-b-2 -mb-px ${
                            activeTab === tab.id
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ==================== VIDEOS ==================== */}
            {activeTab === 'videos' && (
                <>
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

                    {videosLoading ? (
                        <HomePageSkeleton />
                    ) : allVideos.length === 0 ? (
                        <div className="text-center py-20 rounded-2xl border border-dashed border-white/10">
                            <Film className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
                            <h3 className="text-lg font-semibold mb-2">
                                {searchQuery || filter !== 'all' ? 'No videos found' : 'No videos yet'}
                            </h3>
                            <p className="text-muted-foreground text-sm mb-6">
                                {searchQuery || filter !== 'all' ? 'Try adjusting filters.' : 'Upload your first video to get started.'}
                            </p>
                            {!searchQuery && filter === 'all' && (
                                <Link to="/upload"><Button>Upload Video</Button></Link>
                            )}
                        </div>
                    ) : (
                        <div className={viewMode === 'grid'
                            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8"
                            : "flex flex-col gap-3"
                        }>
                            {allVideos.map((video, index) => (
                                <motion.div
                                    key={video._id || video.id || `video-${index}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: (index % 24) * 0.03 }}
                                >
                                    <CreatorVideoCard
                                        video={video}
                                        viewMode={viewMode}
                                        isSelected={selectedIds.has(video._id || video.id)}
                                        onSelect={handleSelect}
                                        onDelete={() => setVideoToDelete(video._id || video.id)}
                                        onTogglePublish={(id) => videoService.togglePublish(id).then(() => {
                                            queryClient.invalidateQueries({ queryKey: ['myVideos'] })
                                            toast.success('Visibility updated')
                                        })}
                                    />
                                </motion.div>
                            ))}
                            {/* Infinite Scroll Trigger */}
                            <div ref={videosRef} className="col-span-full h-10 w-full flex items-center justify-center mt-8">
                                {loadingMoreVideos && <Loader2 className="w-6 h-6 animate-spin text-primary" />}
                                {!hasMoreVideos && allVideos.length > 0 && (
                                    <p className="text-muted-foreground text-sm">You've reached the end</p>
                                )}
                            </div>
                        </div>
                    )}


                    <VideoBulkActions
                        selectedCount={selectedIds.size}
                        onClearSelection={() => setSelectedIds(new Set())}
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
                        onConfirm={() => deleteVideoMutation.mutate(videoToDelete)}
                    />
                </>
            )}

            {/* ==================== SHORTS ==================== */}
            {activeTab === 'shorts' && (
                <>
                    {shortsLoading ? (
                        <HomePageSkeleton />
                    ) : allShorts.length === 0 ? (
                        <div className="text-center py-20 rounded-2xl border border-dashed border-white/10">
                            <Smartphone className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No Shorts yet</h3>
                            <p className="text-muted-foreground text-sm mb-6">Upload a vertical video and mark it as a Short.</p>
                            <Link to="/upload"><Button>Upload Short</Button></Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {allShorts.map((short, index) => (
                                <motion.div
                                    key={short._id || short.id || `short-${index}`}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: (index % 24) * 0.04 }}
                                    className="relative group glass-card rounded-xl overflow-hidden border border-white/5 hover:border-white/20 transition-all cursor-pointer"
                                    onClick={() => navigate(`/watch/${short._id || short.id}`)}
                                >
                                    <div className="aspect-[9/16] relative bg-black">
                                        <img
                                            src={getMediaUrl(short.thumbnail)}
                                            alt={short.title}
                                            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                                        <div className="absolute bottom-0 left-0 right-0 p-2">
                                            <p className="text-white text-xs font-medium line-clamp-2 leading-snug">{short.title}</p>
                                            <p className="text-white/50 text-[10px] mt-0.5">{(short.views || 0).toLocaleString()} views</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                    
                    {/* Infinite Scroll Trigger */}
                    <div ref={shortsRef} className="h-10 w-full flex items-center justify-center mt-8">
                        {loadingMoreShorts && <Loader2 className="w-6 h-6 animate-spin text-primary" />}
                        {!hasMoreShorts && allShorts.length > 0 && (
                            <p className="text-muted-foreground text-sm">You've reached the end</p>
                        )}
                    </div>
                </>
            )}

            {/* ==================== COMMUNITY ==================== */}
            {activeTab === 'community' && (
                <>
                    <div className="flex justify-end mb-4">
                        <Link to="/upload?tab=tweet">
                            <Button size="sm" className="gap-2">
                                <Plus className="w-4 h-4" /> New Post
                            </Button>
                        </Link>
                    </div>
                    {tweetsLoading ? (
                        <div className="py-20 text-center"><Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" /></div>
                    ) : allTweets.length === 0 ? (
                        <div className="text-center py-20 rounded-2xl border border-dashed border-white/10">
                            <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No community posts yet</h3>
                            <p className="text-muted-foreground text-sm mb-6">Share updates with your audience.</p>
                            <Link to="/upload?tab=tweet"><Button>Create Post</Button></Link>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {allTweets.map(tweet => (
                                <TweetCard
                                    key={tweet._id || tweet.id}
                                    tweet={tweet}
                                    onDelete={() => deleteTweetMutation.mutate(tweet._id || tweet.id)}
                                    onEditInit={() => navigate('/upload?tab=tweet')}
                                />
                            ))}
                            {/* Infinite Scroll Trigger */}
                            <div ref={communityRef} className="h-10 w-full flex items-center justify-center mt-8">
                                {loadingMoreTweets && <Loader2 className="w-6 h-6 animate-spin text-primary" />}
                                {!hasMoreTweets && allTweets.length > 0 && (
                                    <p className="text-muted-foreground text-sm">You've reached the end</p>
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* ==================== PLAYLISTS ==================== */}
            {activeTab === 'playlists' && (
                <>
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-white font-display">Your Created Playlists</h2>
                            <p className="text-xs text-zinc-400 mt-0.5">Playlists you have created and organized</p>
                        </div>
                        <Link to="/playlists">
                            <Button size="sm" className="bg-white text-black hover:bg-white/90 rounded-full font-bold text-xs px-4 h-9 gap-1.5 shadow-md">
                                <Plus className="w-4 h-4" /> New Playlist
                            </Button>
                        </Link>
                    </div>

                    {playlistsLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <PlaylistCardSkeleton key={`pl-skel-${i}`} />
                            ))}
                        </div>
                    ) : allPlaylists.length === 0 ? (
                        <div className="text-center py-20 rounded-2xl border border-dashed border-white/10 glass-panel">
                            <ListVideo className="w-12 h-12 mx-auto text-zinc-600 mb-4" />
                            <h3 className="text-lg font-semibold text-white mb-2 font-display">No playlists yet</h3>
                            <p className="text-zinc-400 text-sm mb-6 max-w-sm mx-auto">Create playlists to organize your favorite videos into custom collections.</p>
                            <Link to="/playlists">
                                <Button className="bg-white text-black hover:bg-white/90 rounded-full font-bold px-6">
                                    Create Playlist
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {allPlaylists.map((playlist) => (
                                <PlaylistCard
                                    key={playlist._id || playlist.id}
                                    playlist={playlist}
                                    onDelete={(p) => {
                                        if (window.confirm(`Delete playlist "${p.name}"?`)) {
                                            deletePlaylistMutation.mutate(p._id || p.id)
                                        }
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
