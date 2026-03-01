import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { ThumbsUp, ThumbsDown, Share2, Download, MoreHorizontal, Bell, Loader2, Flag, FileText, Save, Play, Heart, Clock } from 'lucide-react'
import { watchService, videoService, likeService, subscriptionService, commentService, playlistService, feedService, transcriptService } from '../services/api'
import { ShareDialog } from '../components/common/ShareDialog'
import { ReportDialog } from '../components/common/ReportDialog'
import AISummaryCard from '../components/ai/AISummaryCard'
import { AddToPlaylistDialog } from '../components/playlist/AddToPlaylistDialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../components/ui/DropdownMenu"
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { CommentItem } from '../components/video/CommentItem'
import { Avatar } from '../components/ui/Avatar'
import { VideoCard } from '../components/video/VideoCard'
import CustomVideoPlayer from '../components/video/CustomVideoPlayer'
import { formatViews, formatTimeAgo, formatNumber, formatSubscribers, cn } from '../lib/utils'
import { toast } from 'sonner'
import VideoPlayerSkeleton from '../components/skeletons/VideoPlayerSkeleton'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { KeyboardShortcutsModal } from '../components/common/KeyboardShortcutsModal'
import { motion, AnimatePresence } from 'framer-motion'
import { getStoredQuality } from '../lib/media'
import TranscriptPanel from '../components/video/TranscriptPanel'
import ChaptersPanel from '../components/video/ChaptersPanel'
import { cuesAsChapters } from '../lib/videoUtils'

export default function WatchPage() {
    const { videoId } = useParams()
    const [searchParams] = useSearchParams()
    const playlistId = searchParams.get('list')
    const { user } = useAuth()
    const queryClient = useQueryClient()
    const [newComment, setNewComment] = useState('')
    const [showShortcuts, setShowShortcuts] = useState(false)
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
    const [autoPlayNext, setAutoPlayNext] = useState(true)
    const [isTheaterMode, setIsTheaterMode] = useState(false)
    const [likeAnimation, setLikeAnimation] = useState(false)
    const [activeTab, setActiveTab] = useState('next') // 'next' | 'transcript' | 'chapters'
    const [currentTime, setCurrentTime] = useState(0)
    const seekToRef = useRef(null)
    const navigate = useNavigate()

    // --- Queries ---
    const { data: video, isLoading: videoLoading, error: videoError } = useQuery({
        queryKey: ['video', videoId],
        queryFn: async () => {
            const res = await videoService.getVideo(videoId)
            return res.data.data
        },
        enabled: !!videoId,
        staleTime: 1000 * 60 * 5
    })

    const { data: watchData } = useQuery({
        queryKey: ['watch', videoId],
        queryFn: async () => {
            const quality = getStoredQuality()
            const res = await watchService.watchVideo(videoId, quality)
            return res.data.data
        },
        enabled: !!videoId,
        staleTime: 1000 * 60 * 5,
        retry: false,
    })

    const playbackUrl = (
        watchData?.playbackUrl ||
        watchData?.streaming?.selectedPlaybackUrl ||
        video?.videoFile ||
        video?.videoUrl
    )

    const availableQualities = watchData?.availableQualities || watchData?.streaming?.availableQualities || []

    const {
        data: commentsData,
        fetchNextPage: fetchMoreComments,
        hasNextPage: hasMoreComments
    } = useInfiniteQuery({
        queryKey: ['comments', videoId],
        queryFn: async ({ pageParam = 1 }) => {
            const res = await commentService.getComments(videoId, { page: pageParam })
            return res.data.data
        },
        enabled: !!videoId,
        getNextPageParam: (lastPage) => {
            const p = lastPage?.pagination
            return p?.hasNextPage ? (p.currentPage || p.page || 1) + 1 : undefined
        },
        initialPageParam: 1
    })

    const comments = commentsData?.pages.flatMap(page => page?.items || []) || []

    const { data: recommendedRaw } = useQuery({
        queryKey: ['recommendations', videoId],
        queryFn: async () => {
            const res = await feedService.getHomeFeed({ limit: 12 })
            return res.data.data?.items || []
        },
        enabled: !!videoId,
        staleTime: 1000 * 60 * 5
    })

    const recommended = recommendedRaw?.filter(v => v._id !== videoId) || []

    const { data: playlist } = useQuery({
        queryKey: ['playlist', playlistId],
        queryFn: async () => {
            const res = await playlistService.getPlaylist(playlistId)
            return res.data.data
        },
        enabled: !!playlistId
    })

    const { data: transcriptData } = useQuery({
        queryKey: ['transcript', videoId],
        queryFn: async () => {
            const res = await transcriptService.getWatchTranscript(videoId)
            return res.data.data
        },
        enabled: !!videoId
    })

    useDocumentTitle(video?.title || 'Vixora')

    const transcriptItems = transcriptData?.items || transcriptData?.cues || []
    const chapters = video?.chapters || cuesAsChapters(transcriptItems, 8, video?.thumbnail)

    const handleVideoEnd = () => {
        if (!autoPlayNext) return
        let nextVideo = null
        if (playlistId && playlist?.videos) {
            const currentIndex = playlist.videos.findIndex(v => v._id === videoId)
            if (currentIndex !== -1 && currentIndex < playlist.videos.length - 1) {
                nextVideo = playlist.videos[currentIndex + 1]
            }
        }
        if (!nextVideo && recommended.length > 0) {
            nextVideo = recommended[0]
        }
        if (nextVideo?._id) {
            toast('Playing next: ' + (nextVideo.title || 'Untitled Video'), { duration: 3000 })
            const url = playlistId
                ? `/watch/${nextVideo._id}?list=${playlistId}`
                : `/watch/${nextVideo._id}`
            setTimeout(() => navigate(url), 3000)
        }
    }

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === '?' && e.shiftKey) setShowShortcuts(prev => !prev)
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    // --- Mutations ---
    const subscribeMutation = useMutation({
        mutationFn: () => {
            const channelId = typeof video.owner === 'string' ? video.owner : (video.owner?._id || video.owner?.id)
            if (!channelId) throw new Error("Channel ID missing")
            return subscriptionService.toggleSubscription(channelId)
        },
        onMutate: async () => {
            await queryClient.cancelQueries(['video', videoId])
            const previousVideo = queryClient.getQueryData(['video', videoId])
            queryClient.setQueryData(['video', videoId], old => ({
                ...old,
                isSubscribed: !old.isSubscribed,
                owner: {
                    ...old.owner,
                    subscribersCount: old.owner.subscribersCount + (old.isSubscribed ? -1 : 1)
                }
            }))
            return { previousVideo }
        },
        onError: (err, newTodo, context) => {
            queryClient.setQueryData(['video', videoId], context.previousVideo)
            toast.error('Subscription failed')
        },
        onSuccess: () => queryClient.invalidateQueries(['video', videoId])
    })

    const watchLaterMutation = useMutation({
        mutationFn: () => playlistService.toggleWatchLater(videoId),
        onSuccess: (res) => {
            const added = res.data?.data?.added
            if (added !== undefined) {
                toast.success(added ? "Added to Watch Later" : "Removed from Watch Later")
            } else {
                toast.success("Watch Later updated")
            }
            queryClient.invalidateQueries({ queryKey: ['watchLater'] })
        },
        onError: () => toast.error("Failed to update Watch Later")
    })

    const likeMutation = useMutation({
        mutationFn: () => likeService.toggleVideoLike(video._id || video.id),
        onMutate: async () => {
            await queryClient.cancelQueries(['video', videoId])
            const previousVideo = queryClient.getQueryData(['video', videoId])
            queryClient.setQueryData(['video', videoId], old => ({
                ...old,
                isLiked: !old.isLiked,
                likesCount: old.likesCount + (old.isLiked ? -1 : 1)
            }))
            return { previousVideo }
        },
        onError: (err, vars, context) => {
            queryClient.setQueryData(['video', videoId], context.previousVideo)
            toast.error('Like failed')
        },
        onSuccess: () => queryClient.invalidateQueries(['video', videoId])
    })

    const commentMutation = useMutation({
        mutationFn: (content) => commentService.addComment(videoId, content),
        onSuccess: () => {
            setNewComment('')
            toast.success('Comment added')
            queryClient.invalidateQueries(['comments', videoId])
        },
        onError: () => toast.error('Failed to post comment')
    })

    const handleSubscribe = () => user ? subscribeMutation.mutate() : toast.error('Please login to subscribe')

    const handleLike = () => {
        if (!user) return toast.error('Please login to like')
        setLikeAnimation(true)
        setTimeout(() => setLikeAnimation(false), 600)
        likeMutation.mutate()
    }

    const handleSubmitComment = (e) => {
        e.preventDefault()
        if (!user) return toast.error('Please login to comment')
        if (!newComment.trim()) return
        commentMutation.mutate(newComment)
    }

    if (videoLoading) return <div className="p-6 pt-[80px]"><VideoPlayerSkeleton /></div>
    if (videoError || !video) return <div className="p-10 pt-[80px] text-center text-xl">Video not found</div>

    return (
        <div className={isTheaterMode ? "w-full min-h-screen bg-background relative selection:bg-primary/30" : "container mx-auto px-4 py-6 max-w-[1800px] min-h-screen bg-background relative selection:bg-primary/30"}>
            <div className={`flex flex-col ${isTheaterMode ? '' : 'lg:flex-row'} gap-6`}>

                {/* Left Column (Video + Info + Comments) */}
                <div className={`flex-1 flex flex-col gap-6 w-full ${isTheaterMode ? '' : 'min-w-0'}`}>
                    {/* 1. Video Player Section */}
                    <div className="w-full">
                        <CustomVideoPlayer
                            src={playbackUrl}
                            poster={video.thumbnail}
                            videoId={videoId}
                            autoPlay={true}
                            onEnded={handleVideoEnd}
                            isTheaterMode={isTheaterMode}
                            onToggleTheater={() => setIsTheaterMode(!isTheaterMode)}
                            onShowShortcuts={() => setShowShortcuts(true)}
                            selectedQuality={getStoredQuality()}
                            availableQualities={availableQualities}
                            onTimeUpdate={setCurrentTime}
                            seekToRef={seekToRef}
                            className={isTheaterMode ? "w-full h-[85vh]" : "w-full aspect-video shadow-premium rounded-xl overflow-hidden"}
                        />
                    </div>

                    {/* 2. Video Info Section */}
                    <div className={`${isTheaterMode ? 'container mx-auto px-4 max-w-[1200px]' : ''} space-y-4`}>
                        <h1 className="text-xl md:text-2xl font-bold line-clamp-2 mt-2">{video.title}</h1>

                        <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <Link to={`/@${video.owner.username}`} className="flex-shrink-0">
                                    <Avatar src={video.owner.avatar} fallback={video.owner.username} size="lg" className="w-10 h-10 md:w-12 md:h-12" />
                                </Link>
                                <div className="flex flex-col mr-4">
                                    <Link to={`/@${video.owner.username}`} className="font-bold hover:text-primary transition-colors text-base md:text-lg line-clamp-1">
                                        {video.owner.fullName}
                                    </Link>
                                    <span className="text-xs md:text-sm text-muted-foreground">
                                        {formatSubscribers(video.owner.subscribersCount)}
                                    </span>
                                </div>
                                <Button
                                    variant={video.isSubscribed ? "secondary" : "primary"}
                                    className={`rounded-full px-4 md:px-6 h-9 md:h-10 font-medium ${video.isSubscribed ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white text-black hover:bg-white/90'}`}
                                    onClick={handleSubscribe}
                                    disabled={subscribeMutation.isPending}
                                >
                                    {video.isSubscribed ? (
                                        <>
                                            <Bell className="w-4 h-4 mr-2" />
                                            Subscribed
                                        </>
                                    ) : 'Subscribe'}
                                </Button>
                            </div>

                            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
                                <div className="flex items-center glass-card rounded-full h-9 md:h-10 shrink-0 relative">
                                    <button
                                        onClick={() => {
                                            if (!user) return navigate('/login')
                                            setLikeAnimation(true)
                                            setTimeout(() => setLikeAnimation(false), 300)
                                            likeMutation.mutate()
                                        }}
                                        className="flex items-center gap-2 px-4 h-full hover:bg-white/10 transition-colors rounded-l-full"
                                    >
                                        <motion.div
                                            animate={likeAnimation ? { scale: [1, 1.4, 1] } : {}}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <ThumbsUp className={`w-5 h-5 transition-all duration-300 ${video.isLiked ? 'fill-primary text-primary' : ''}`} />
                                        </motion.div>
                                        <span className="text-sm font-medium">{formatNumber(video.likesCount)}</span>
                                    </button>
                                    <div className="w-[1px] h-5 bg-white/10"></div>
                                    <button className="px-4 h-full hover:bg-white/10 transition-colors rounded-r-full">
                                        <ThumbsDown className="w-5 h-5" />
                                    </button>
                                </div>

                                <ShareDialog title={video.title} url={window.location.href} trigger={
                                    <Button variant="secondary" className="rounded-full bg-white/10 hover:bg-white/20 shrink-0 h-9 md:h-10 text-white px-4">
                                        <Share2 className="w-4 h-4 mr-2" /> Share
                                    </Button>
                                } />

                                <Button
                                    variant="secondary"
                                    className="rounded-full bg-white/10 hover:bg-white/20 shrink-0 h-9 md:h-10 text-white px-4"
                                    onClick={() => toast.success("Download started", { description: "Video is being saved to your device." })}
                                >
                                    <Download className="w-4 h-4 mr-2" /> Download
                                </Button>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="secondary" size="icon" className="rounded-full bg-white/10 hover:bg-white/20 shrink-0 w-9 h-9 md:w-10 md:h-10">
                                            <MoreHorizontal className="w-5 h-5" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56 glass-panel border-white/5 text-white rounded-xl shadow-premium">
                                        <AddToPlaylistDialog videoId={video._id} trigger={
                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="hover:bg-white/10 cursor-pointer focus:bg-white/10 focus:text-white py-3">
                                                <Save className="w-4 h-4 mr-3" /> Save to Playlist
                                            </DropdownMenuItem>
                                        } />
                                        <DropdownMenuItem
                                            onSelect={() => {
                                                if (!user) return toast.error('Please login to save to watch later')
                                                watchLaterMutation.mutate()
                                            }}
                                            disabled={watchLaterMutation.isPending}
                                            className="hover:bg-white/10 cursor-pointer focus:bg-white/10 focus:text-white py-3"
                                        >
                                            <Clock className="w-4 h-4 mr-3" /> {watchLaterMutation.isPending ? "Saving..." : "Save to Watch Later"}
                                        </DropdownMenuItem>
                                        <ReportDialog targetType="VIDEO" targetId={video._id} trigger={
                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="hover:bg-white/10 cursor-pointer focus:bg-white/10 focus:text-white py-3">
                                                <Flag className="w-4 h-4 mr-3" /> Report
                                            </DropdownMenuItem>
                                        } />
                                        <DropdownMenuItem onClick={() => setActiveTab('transcript')} className="hover:bg-white/10 cursor-pointer focus:bg-white/10 focus:text-white py-3">
                                            <FileText className="w-4 h-4 mr-3" /> Show Transcript
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        <div
                            className={`glass-card rounded-xl p-4 text-sm cursor-pointer transition-colors ${isDescriptionExpanded ? '' : 'overflow-hidden'}`}
                            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                        >
                            <div className="font-semibold mb-2 text-white flex items-center gap-2">
                                <span>{formatViews(video.views)}</span>
                                <span className="text-muted-foreground">•</span>
                                <span>{formatTimeAgo(video.createdAt)}</span>
                            </div>
                            <p className="whitespace-pre-line text-gray-300 leading-relaxed font-normal text-[0.95rem]">
                                {isDescriptionExpanded ? video.description : (
                                    (video.description?.substring(0, 180) || '') + (video.description?.length > 180 ? '...' : '')
                                )}
                            </p>
                            {video.description?.length > 180 && (
                                <button className="text-white mt-2 font-semibold hover:underline text-sm">
                                    {isDescriptionExpanded ? 'Show less' : '...more'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* 4. Comments Section */}
                    <div className={`${isTheaterMode ? 'container mx-auto px-4 max-w-[1200px]' : ''} pt-6 pb-20`}>
                        <div className="flex items-center gap-6 mb-6">
                            <h3 className="font-bold text-xl">{formatNumber(video.commentsCount)} Comments</h3>
                        </div>

                        <form onSubmit={handleSubmitComment} className="flex gap-4 mb-8 items-start">
                            <Avatar src={user?.avatar} fallback={user?.username || 'G'} size="md" className="w-10 h-10" />
                            <div className="flex-1 space-y-2">
                                <input
                                    type="text"
                                    placeholder="Add a comment..."
                                    className="w-full glass-input px-4 py-2 text-sm placeholder:text-muted-foreground focus-visible:ring-primary/50"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                />
                                <AnimatePresence>
                                    {newComment && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="flex justify-end gap-2"
                                        >
                                            <Button type="button" variant="ghost" onClick={() => setNewComment('')} className="rounded-full hover:bg-white/10 text-white">Cancel</Button>
                                            <Button type="submit" disabled={commentMutation.isPending} className="bg-primary hover:bg-primary/90 text-white rounded-full px-4">
                                                {commentMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Comment'}
                                            </Button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </form>

                        <div className="space-y-6">
                            {comments.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p>No comments yet. Be the first to comment!</p>
                                </div>
                            )}
                            {comments.map((comment) => (
                                <CommentItem key={comment._id} comment={comment} />
                            ))}
                            {hasMoreComments && (
                                <Button variant="ghost" onClick={() => fetchMoreComments()} className="w-full text-primary hover:text-primary/80 hover:bg-white/5">
                                    <Loader2 className="w-4 h-4 mr-2" /> Load more comments
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. Sidebar (Recommendations / Transcript / Chapters) */}
                <div className={`${isTheaterMode ? 'container mx-auto px-4 max-w-[1200px]' : 'lg:w-[400px] flex-shrink-0'} flex flex-col gap-4 w-full`}>
                    {/* AI Summary Card */}
                    <AISummaryCard videoId={videoId} />

                    {/* Sidebar Tabs */}
                    <div className="flex bg-white/4 rounded-xl p-1 mb-2">
                        <button
                            onClick={() => setActiveTab('next')}
                            className={cn(
                                "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all",
                                activeTab === 'next' ? "bg-white/10 text-white shadow-sm" : "text-muted-foreground hover:text-white"
                            )}
                        >
                            Next
                        </button>
                        <button
                            onClick={() => setActiveTab('transcript')}
                            className={cn(
                                "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all",
                                activeTab === 'transcript' ? "bg-white/10 text-white shadow-sm" : "text-muted-foreground hover:text-white"
                            )}
                        >
                            Transcript
                        </button>
                        {chapters.length > 0 && (
                            <button
                                onClick={() => setActiveTab('chapters')}
                                className={cn(
                                    "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all",
                                    activeTab === 'chapters' ? "bg-white/10 text-white shadow-sm" : "text-muted-foreground hover:text-white"
                                )}
                            >
                                Chapters
                            </button>
                        )}
                    </div>

                    <div className="flex flex-col gap-3 min-h-[300px]">
                        {activeTab === 'next' && (
                            <>
                                <div className="flex items-center justify-between px-1 mb-1">
                                    <h3 className="font-bold text-sm">Recommended</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-semibold text-muted-foreground uppercase opacity-60">Autoplay</span>
                                        <div
                                            className={`w-8 h-4.5 rounded-full p-0.5 cursor-pointer transition-colors ${autoPlayNext ? 'bg-primary' : 'bg-gray-600'}`}
                                            onClick={() => setAutoPlayNext(!autoPlayNext)}
                                        >
                                            <div className={`w-3.5 h-3.5 bg-white rounded-full transition-transform shadow-sm ${autoPlayNext ? 'translate-x-3.5' : 'translate-x-0'}`} />
                                        </div>
                                    </div>
                                </div>

                                {playlist ? (
                                    <div className="glass-card rounded-xl border-white/5 overflow-hidden mb-2">
                                        <div className="p-2.5 bg-white/5 border-b border-white/5">
                                            <h4 className="font-bold text-xs truncate">{playlist.name}</h4>
                                            <p className="text-[10px] text-muted-foreground truncate">{playlist.owner?.username} - {playlist.videos.length} videos</p>
                                        </div>
                                        <div className="max-h-[300px] overflow-y-auto">
                                            {playlist.videos?.map((v, i) => (
                                                <Link key={v._id} to={`/watch/${v._id}?list=${playlist._id}`}
                                                    className={`flex gap-2 p-2 hover:bg-white/5 ${v._id === videoId && 'bg-white/10'}`}>
                                                    <span className="text-[10px] text-gray-400 w-4 flex-shrink-0 flex items-center">{v._id === videoId ? <Play className="w-2.5 h-2.5 fill-white" /> : i + 1}</span>
                                                    <img src={v.thumbnail} className="w-20 h-11 object-cover rounded" />
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] font-bold line-clamp-2 text-white">{v.title}</p>
                                                        <p className="text-[9px] text-gray-400">{v.owner?.username}</p>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                ) : null}

                                <div className="flex flex-col gap-3">
                                    {recommended?.map((recVideo) => (
                                        <VideoCard
                                            key={recVideo._id}
                                            video={recVideo}
                                            layout="compact"
                                        />
                                    ))}
                                </div>
                            </>
                        )}

                        {activeTab === 'transcript' && (
                            <div className="glass-card rounded-xl p-3 h-[500px] flex flex-col">
                                <TranscriptPanel
                                    videoId={videoId}
                                    currentTime={currentTime}
                                    onSeek={(s) => seekToRef.current?.(s)}
                                />
                            </div>
                        )}

                        {activeTab === 'chapters' && (
                            <div className="glass-card rounded-xl p-3">
                                <ChaptersPanel
                                    chapters={chapters}
                                    currentTime={currentTime}
                                    poster={video.thumbnail}
                                    onSeek={(s) => seekToRef.current?.(s)}
                                />
                            </div>
                        )}
                    </div>
                </div >
            </div >

            <KeyboardShortcutsModal isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
        </div >
    )
}
