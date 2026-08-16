import { useState, useEffect, useRef, useCallback } from 'react'
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
import SEO from '../components/common/SEO'
import { KeyboardShortcutsModal } from '../components/common/KeyboardShortcutsModal'
import { motion, AnimatePresence } from 'framer-motion'
import { getStoredQuality, getMediaUrl } from '../lib/media'
import TranscriptPanel from '../components/video/TranscriptPanel'
import ChaptersPanel from '../components/video/ChaptersPanel'
import { cuesAsChapters } from '../lib/videoUtils'
import { ParsedText } from '../components/common/ParsedText'
import { PlaylistWatchPanel } from '../components/playlist/PlaylistWatchPanel'

export default function WatchPage() {
    const { videoId } = useParams()
    const [searchParams, setSearchParams] = useSearchParams()
    const playlistId = searchParams.get('list')
    const initialShuffle = searchParams.get('shuffle') === '1'
    const [isShuffle, setIsShuffle] = useState(initialShuffle)
    const [loopMode, setLoopMode] = useState('off') // 'off' | 'all' | 'one'

    const toggleShuffle = () => {
        setIsShuffle(prev => {
            const next = !prev
            if (next) {
                searchParams.set('shuffle', '1')
            } else {
                searchParams.delete('shuffle')
            }
            setSearchParams(searchParams, { replace: true })
            return next
        })
    }

    const toggleLoop = () => {
        setLoopMode(prev => {
            if (prev === 'off') return 'all'
            if (prev === 'all') return 'one'
            return 'off'
        })
    }

    const handleDismissPlaylist = () => {
        searchParams.delete('list')
        searchParams.delete('shuffle')
        setSearchParams(searchParams, { replace: true })
    }
    const { user } = useAuth()
    const queryClient = useQueryClient()
    const [newComment, setNewComment] = useState('')
    const [showShortcuts, setShowShortcuts] = useState(false)
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
    const [autoPlayNext, setAutoPlayNext] = useState(() => {
        try { return localStorage.getItem('vixora_autoplay_next') !== 'false' } catch { return true }
    })
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

    const comments = commentsData?.pages.flatMap(page => page?.items || page?.comments || page.data?.items || page.data?.comments || []) || []

    const { data: recommendedRaw } = useQuery({
        queryKey: ['recommendations', videoId],
        queryFn: async () => {
            const res = await feedService.getHomeFeed({ limit: 20 })
            const items = res.data.data?.items || []
            // Shuffle recommended videos so they are different each time
            return [...items].sort(() => Math.random() - 0.5)
        },
        enabled: !!videoId,
        staleTime: 1000 * 60 * 5
    })

    const recommended = recommendedRaw?.filter(v => String(v._id) !== String(videoId) && String(v.id) !== String(videoId)) || []

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

    const transcriptItems = transcriptData?.items || transcriptData?.cues || []
    const chapters = video?.chapters || cuesAsChapters(transcriptItems, 8, video?.thumbnail)

    // Auto-next countdown state
    const [autoNextCountdown, setAutoNextCountdown] = useState(null) // { secondsLeft, nextVideo, url }
    const countdownIntervalRef = useRef(null)
    const countdownTimeoutRef = useRef(null)

    const clearAutoNextCountdown = useCallback(() => {
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
        if (countdownTimeoutRef.current) clearTimeout(countdownTimeoutRef.current)
        countdownIntervalRef.current = null
        countdownTimeoutRef.current = null
        setAutoNextCountdown(null)
    }, [])

    // Cleanup on unmount — prevents orphaned setTimeout/setInterval
    useEffect(() => {
        return () => clearAutoNextCountdown()
    }, [clearAutoNextCountdown])

    // Persist autoPlayNext preference
    useEffect(() => {
        try { localStorage.setItem('vixora_autoplay_next', autoPlayNext ? 'true' : 'false') } catch {}
    }, [autoPlayNext])

    const handleVideoEnd = () => {
        // If single video looping is enabled, restart video
        if (loopMode === 'one') {
            seekToRef.current?.(0)
            return
        }

        let nextVideo = null
        if (playlistId && playlist) {
            const rawItems = playlist.items || playlist.videos || []
            const playlistVideos = rawItems.map(i => i.video || i)
            const currentIndex = playlistVideos.findIndex(v => (v._id || v.id) === videoId)

            if (isShuffle && playlistVideos.length > 1) {
                const candidates = playlistVideos.filter((_, idx) => idx !== currentIndex)
                nextVideo = candidates[Math.floor(Math.random() * candidates.length)]
            } else if (currentIndex !== -1 && currentIndex < playlistVideos.length - 1) {
                nextVideo = playlistVideos[currentIndex + 1]
            } else if (loopMode === 'all' && playlistVideos.length > 0) {
                nextVideo = playlistVideos[0]
            }
        }

        if (!nextVideo && autoPlayNext && recommended.length > 0) {
            nextVideo = recommended[0]
        }

        if (nextVideo?._id || nextVideo?.id) {
            const nextId = nextVideo._id || nextVideo.id
            const url = playlistId
                ? `/watch/${nextId}?list=${playlistId}${isShuffle ? '&shuffle=1' : ''}`
                : `/watch/${nextId}`
            
            // Advance with countdown
            let secondsLeft = playlistId ? 2 : 5
            setAutoNextCountdown({ secondsLeft, nextVideo, url })

            countdownIntervalRef.current = setInterval(() => {
                secondsLeft -= 1
                if (secondsLeft <= 0) {
                    clearAutoNextCountdown()
                    navigate(url)
                } else {
                    setAutoNextCountdown(prev => prev ? { ...prev, secondsLeft } : null)
                }
            }, 1000)
        }
    }

    const handlePlayNow = () => {
        if (autoNextCountdown?.url) {
            const url = autoNextCountdown.url
            clearAutoNextCountdown()
            navigate(url)
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
        mutationFn: () => likeService.toggleVideoLike(videoId),
        onMutate: async () => {
            await queryClient.cancelQueries(['video', videoId])
            const previousVideo = queryClient.getQueryData(['video', videoId])
            queryClient.setQueryData(['video', videoId], old => ({
                ...old,
                isLiked: !old.isLiked,
                likesCount: old.isLiked ? old.likesCount - 1 : old.likesCount + 1
            }))
            return { previousVideo }
        },
        onError: (err, newTodo, context) => {
            queryClient.setQueryData(['video', videoId], context.previousVideo)
            toast.error('Failed to update like')
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['video', videoId])
            queryClient.invalidateQueries(['likedVideos'])
        }
    })

    const commentMutation = useMutation({
        mutationFn: (content) => commentService.addComment(videoId, content),
        onSuccess: () => {
            setNewComment('')
            toast.success('Comment posted')
            queryClient.invalidateQueries({ queryKey: ['comments', videoId] })
            queryClient.invalidateQueries({ queryKey: ['video', videoId] })
        },
        onError: () => toast.error('Failed to post comment')
    })

    const handleSubscribe = () => user ? subscribeMutation.mutate() : toast.error('Please login to subscribe')

    const handleSubmitComment = (e) => {
        e.preventDefault()
        if (!user) return toast.error('Please login to comment')
        if (!newComment.trim()) return
        commentMutation.mutate(newComment)
    }

    if (videoLoading) return <div className="p-6 pt-[80px]"><VideoPlayerSkeleton /></div>
    if (videoError || !video) return <div className="p-10 pt-[80px] text-center text-xl">Video not found</div>

    return (
        <div className={cn(
            "min-h-screen relative transition-colors duration-500 selection:bg-primary/30",
            isTheaterMode ? "bg-black" : "bg-background container mx-auto px-4 py-6 max-w-[1800px]"
        )}>
            <SEO title={video.title} description={video.description} image={video.thumbnail} url={window.location.href} type="video.other" />
            
            {/* Cinematic Background Glow for Theater Mode */}
            {isTheaterMode && (
                <div className="absolute top-0 left-0 right-0 h-[85vh] pointer-events-none overflow-hidden z-0">
                    <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full scale-[2] opacity-30 animate-pulse" />
                </div>
            )}

            <div className={cn("flex flex-col gap-6 relative z-10", isTheaterMode ? '' : 'lg:flex-row')}>

                {/* Left Column (Video + Info + Comments) */}
                <div className={`flex-1 flex flex-col gap-6 w-full ${isTheaterMode ? '' : 'min-w-0'}`}>
                    {/* 1. Video Player Section */}
                    <div className={cn(
                        "w-full transition-all duration-500 relative",
                        isTheaterMode ? "-mt-16 w-full" : ""
                    )}>
                        <CustomVideoPlayer
                            src={playbackUrl}
                            poster={video.thumbnail}
                            videoId={videoId}
                            initialDuration={video?.duration}
                            initialProgress={video?.watchProgress}
                            autoPlay={true}
                            onEnded={handleVideoEnd}
                            isTheaterMode={isTheaterMode}
                            onToggleTheater={() => setIsTheaterMode(!isTheaterMode)}
                            onShowShortcuts={() => setShowShortcuts(true)}
                            selectedQuality={getStoredQuality()}
                            availableQualities={availableQualities}
                            onTimeUpdate={setCurrentTime}
                            seekToRef={seekToRef}
                            className={cn(
                                "transition-all duration-500",
                                isTheaterMode ? "w-full h-[100vh] lg:h-[90vh] object-contain bg-black" : "w-full aspect-video shadow-premium rounded-xl overflow-hidden"
                            )}
                        />

                        {/* Auto-Next Countdown Overlay */}
                        <AnimatePresence>
                            {autoNextCountdown && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-30 rounded-xl"
                                >
                                    <div className="flex flex-col items-center gap-4 text-center p-6 max-w-sm">
                                        <div className="relative w-48 aspect-video rounded-lg overflow-hidden shadow-lg">
                                            {autoNextCountdown.nextVideo?.thumbnail && (
                                                <img src={getMediaUrl(autoNextCountdown.nextVideo.thumbnail)} alt="Next" className="w-full h-full object-cover" />
                                            )}
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                                <div className="relative w-16 h-16">
                                                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                                                        <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                                                        <circle cx="32" cy="32" r="28" fill="none" stroke="white" strokeWidth="3"
                                                            strokeDasharray={`${2 * Math.PI * 28}`}
                                                            strokeDashoffset={`${2 * Math.PI * 28 * (1 - autoNextCountdown.secondsLeft / (playlistId ? 2 : 5))}`}
                                                            strokeLinecap="round" className="transition-all duration-1000 ease-linear"
                                                        />
                                                    </svg>
                                                    <span className="absolute inset-0 flex items-center justify-center text-white text-xl font-bold">
                                                        {autoNextCountdown.secondsLeft}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                                                {playlistId ? 'Next in playlist' : 'Playing next'}
                                            </p>
                                            <p className="text-sm font-semibold text-white line-clamp-2">{autoNextCountdown.nextVideo?.title || 'Untitled'}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Button variant="secondary" onClick={clearAutoNextCountdown}
                                                className="rounded-full bg-white/10 hover:bg-white/20 text-white px-5 h-9">
                                                Cancel
                                            </Button>
                                            <Button onClick={handlePlayNow}
                                                className="rounded-full bg-white text-black hover:bg-white/90 px-5 h-9 font-semibold">
                                                <Play className="w-4 h-4 mr-1.5 fill-current" /> Play Now
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* 2. Video Info Section */}
                    <div className={cn(
                        "space-y-4 transition-opacity duration-300",
                        isTheaterMode ? "container mx-auto px-4 max-w-[1200px] mt-4 opacity-90 hover:opacity-100" : ""
                    )}>
                        <h1 className="text-xl md:text-2xl font-bold text-white break-words leading-tight drop-shadow-sm">{video.title}</h1>

                        <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <Link to={`/@${video.owner?.username || 'unknown'}`} className="flex-shrink-0">
                                    <Avatar src={video.owner?.avatar} fallback={video.owner?.username || '?'} size="lg" className="w-10 h-10 md:w-12 md:h-12" />
                                </Link>
                                <div className="flex flex-col mr-4">
                                    <Link to={`/@${video.owner?.username || 'unknown'}`} className="font-bold hover:text-primary transition-colors text-base md:text-lg line-clamp-1">
                                        {video.owner?.fullName || video.owner?.username || 'Unknown'}
                                    </Link>
                                    <span className="text-xs md:text-sm text-muted-foreground">
                                        {formatSubscribers(video.owner?.subscribersCount || 0)}
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
                                <div className="flex items-center bg-white/10 hover:bg-white/15 rounded-full h-9 md:h-10 shrink-0 overflow-hidden border border-white/10 transition-colors">
                                    <button
                                        onClick={() => {
                                            if (!user) return navigate('/login')
                                            setLikeAnimation(true)
                                            setTimeout(() => setLikeAnimation(false), 300)
                                            likeMutation.mutate()
                                        }}
                                        className="flex items-center gap-2 px-3.5 h-full hover:bg-white/15 transition-colors text-white active:scale-95"
                                    >
                                        <motion.div
                                            animate={likeAnimation ? { scale: [1, 1.4, 1] } : {}}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <ThumbsUp className={`w-4 h-4 md:w-5 md:h-5 transition-all ${video.isLiked ? 'fill-primary text-primary' : ''}`} />
                                        </motion.div>
                                        <span className="text-xs md:text-sm font-semibold">{formatNumber(video.likesCount)}</span>
                                    </button>
                                    <div className="w-[1px] h-4 bg-white/20"></div>
                                    <button
                                        className="flex items-center justify-center px-3 h-full hover:bg-white/15 transition-colors text-white active:scale-95"
                                        title="Dislike"
                                    >
                                        <ThumbsDown className="w-4 h-4 md:w-5 md:h-5" />
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
                                    onClick={async () => {
                                        const downloadUrl = video?.videoFile || video?.videoUrl || playbackUrl
                                        if (!downloadUrl) {
                                            toast.error("Download unavailable", { description: "No downloadable source found." })
                                            return
                                        }
                                        // If it's an HLS manifest, we can't blob-download — fallback to new tab
                                        if (downloadUrl.endsWith('.m3u8')) {
                                            toast.info("Opening video in new tab", { description: "HLS streams can't be downloaded directly." })
                                            window.open(downloadUrl, '_blank')
                                            return
                                        }
                                        const toastId = toast.loading("Downloading video...", { description: "Please wait while we prepare your download." })
                                        try {
                                            const response = await fetch(downloadUrl)
                                            if (!response.ok) throw new Error('Failed to fetch')
                                            const blob = await response.blob()
                                            const url = URL.createObjectURL(blob)
                                            const a = document.createElement('a')
                                            a.href = url
                                            const ext = downloadUrl.split('.').pop()?.split('?')[0] || 'mp4'
                                            a.download = `${(video?.title || 'video').replace(/[^a-zA-Z0-9_\-\s]/g, '').trim()}.${ext}`
                                            document.body.appendChild(a)
                                            a.click()
                                            document.body.removeChild(a)
                                            URL.revokeObjectURL(url)
                                            toast.success("Download complete!", { id: toastId })
                                        } catch (err) {
                                            console.error("Download failed:", err)
                                            toast.error("Download failed", { id: toastId, description: "Opening video in a new tab instead." })
                                            window.open(downloadUrl, '_blank')
                                        }
                                    }}
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
                                        <AddToPlaylistDialog videoId={video._id || video.id} trigger={
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
                                        <ReportDialog targetType="VIDEO" targetId={video._id || video.id} trigger={
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

                        {/* Description Box */}
                        <div className="bg-secondary/40 hover:bg-secondary/60 transition-colors p-4 rounded-xl cursor-pointer"
                            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}>
                            <div className="flex gap-3 text-sm font-semibold text-white mb-2">
                                <span>{formatViews(video.views)} views</span>
                                <span>•</span>
                                <span>{formatTimeAgo(video.createdAt)}</span>
                            </div>
                            <p className={cn("text-sm text-foreground/90 whitespace-pre-wrap", !isDescriptionExpanded && "line-clamp-3")}>
                                <ParsedText text={video.description} />
                            </p>
                            <button className="text-xs font-bold text-muted-foreground mt-2 hover:text-white transition-colors">
                                {isDescriptionExpanded ? "Show less" : "...more"}
                            </button>
                        </div>
                    </div>

                    {/* Comments Section */}
                    <div className="space-y-6 pt-4">
                        <div className="flex items-center gap-6">
                            <h2 className="text-xl font-bold text-white">{video.commentsCount || 0} Comments</h2>
                        </div>

                        {user && (
                            <form onSubmit={handleSubmitComment} className="flex gap-4 items-start">
                                <Avatar src={user.avatar} fallback={user.username} size="md" />
                                <div className="flex-1 space-y-2">
                                    <input
                                        type="text"
                                        placeholder="Add a comment..."
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        className="w-full bg-transparent border-b border-border focus:border-primary pb-2 outline-none transition-colors text-sm text-white"
                                    />
                                    <div className="flex justify-end gap-2">
                                        <Button type="button" variant="ghost" size="sm" onClick={() => setNewComment('')} className="rounded-full">Cancel</Button>
                                        <Button type="submit" size="sm" disabled={!newComment.trim() || commentMutation.isPending} className="rounded-full">Comment</Button>
                                    </div>
                                </div>
                            </form>
                        )}

                        <div className="space-y-4">
                            {comments.map((comment) => (
                                <CommentItem key={comment._id || comment.id} comment={comment} videoId={videoId} onSeek={(s) => seekToRef.current?.(s)} />
                            ))}
                            {hasMoreComments && (
                                <Button variant="ghost" onClick={() => fetchMoreComments()} className="w-full text-primary hover:text-primary/80 hover:bg-white/5">
                                    <Loader2 className="w-4 h-4 mr-2" /> Load more comments
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. Sidebar (YouTube Playlist Panel / Recommendations / Transcript / Chapters) */}
                <div className={`${isTheaterMode ? 'container mx-auto px-4 max-w-[1200px]' : 'lg:w-[400px] xl:w-[420px] flex-shrink-0'} flex flex-col gap-4 w-full`}>
                    {/* YouTube Style Playlist Panel (Matching Image 4) */}
                    {playlistId && playlist && (
                        <PlaylistWatchPanel
                            playlist={playlist}
                            playlistId={playlistId}
                            currentVideoId={videoId}
                            onClose={handleDismissPlaylist}
                            isShuffle={isShuffle}
                            onToggleShuffle={toggleShuffle}
                            loopMode={loopMode}
                            onToggleLoop={toggleLoop}
                        />
                    )}

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

                                <div className="flex flex-col gap-3">
                                    {recommended?.map((recVideo) => (
                                        <VideoCard
                                            key={recVideo._id || recVideo.id}
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
