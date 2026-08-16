import { useRef, useState, useEffect, useCallback } from 'react'
import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    ThumbsUp,
    ThumbsDown,
    MessageSquare,
    Share2,
    MoreVertical,
    Flag,
    FileText,
    Heart,
    Hash
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../ui/DropdownMenu'
import { ReportDialog } from '../common/ReportDialog'
import { ShareDialog } from '../common/ShareDialog'
import { Avatar } from '../ui/Avatar'
import { Button } from '../ui/Button'
import { formatNumber } from '../../lib/utils'
import { getMediaUrl } from '../../lib/media'
import { likeService, subscriptionService } from '../../services/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuth } from '../../context/AuthContext'
import { AnimatePresence, motion } from 'framer-motion'
import ShortsComments from './ShortsComments'
import ShortsDescription from './ShortsDescription'

export default function ShortsPlayer({ video, isActive, isGlobalMuted, onToggleMute }) {
    const videoRef = useRef(null)
    const progressBarRef = useRef(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [userPaused, setUserPaused] = useState(false)
    const [progress, setProgress] = useState(0)
    const [duration, setDuration] = useState(0)
    const [showCenterIcon, setShowCenterIcon] = useState(null) // 'play' | 'pause' | null
    const [showHeartAnimation, setShowHeartAnimation] = useState(false)
    const lastClickTimeRef = useRef(0)
    const singleClickTimerRef = useRef(null)

    // Scrubbing state
    const [isScrubbing, setIsScrubbing] = useState(false)
    const [hoverProgress, setHoverProgress] = useState(null)
    const [hoverTime, setHoverTime] = useState(0)

    const { user } = useAuth()
    const queryClient = useQueryClient()

    const [error, setError] = useState(false)
    const [activePanel, setActivePanel] = useState(null) // 'comments' | 'description' | null

    // Optimistic Local State
    const [isLiked, setIsLiked] = useState(Boolean(video?.isLiked))
    const [likesCount, setLikesCount] = useState(video?.likesCount ?? video?.likes ?? 0)
    const [isDisliked, setIsDisliked] = useState(false)
    const [isSubscribed, setIsSubscribed] = useState(Boolean(video?.isSubscribed))

    // Sync local state if video prop changes
    useEffect(() => {
        setIsLiked(Boolean(video?.isLiked))
        setLikesCount(video?.likesCount ?? video?.likes ?? 0)
        setIsSubscribed(Boolean(video?.isSubscribed))
    }, [video?.id, video?._id, video?.isLiked, video?.likesCount, video?.likes, video?.isSubscribed])

    // Reset userPaused whenever a new short becomes active
    useEffect(() => {
        if (isActive) {
            setUserPaused(false)
        }
    }, [isActive])

    // Autoplay handling based on isActive
    useEffect(() => {
        const vid = videoRef.current
        if (!vid) return

        if (isActive) {
            setError(false)
            vid.muted = isGlobalMuted

            if (!userPaused) {
                const attemptPlay = async () => {
                    try {
                        await vid.play()
                        setIsPlaying(true)
                    } catch (err) {
                        if (err.name === 'NotAllowedError') {
                            try {
                                vid.muted = true
                                await vid.play()
                                setIsPlaying(true)
                            } catch (retryErr) {
                                console.warn('Autoplay fallback failed', retryErr)
                            }
                        }
                    }
                }

                attemptPlay()
            }
        } else {
            vid.pause()
            vid.currentTime = 0
            setIsPlaying(false)
            setActivePanel(null)
        }
    }, [isActive, userPaused])

    // Sync mute property without disturbing play/pause state
    useEffect(() => {
        const vid = videoRef.current
        if (vid) {
            vid.muted = isGlobalMuted
        }
    }, [isGlobalMuted])

    const triggerCenterAnimation = (type) => {
        setShowCenterIcon(type)
        setTimeout(() => {
            setShowCenterIcon(null)
        }, 500)
    }

    const togglePlay = useCallback((e) => {
        if (e) {
            e.preventDefault()
            e.stopPropagation()
        }
        const vid = videoRef.current
        if (!vid || error) return

        if (vid.paused) {
            setUserPaused(false)
            vid.play().then(() => {
                setIsPlaying(true)
                triggerCenterAnimation('play')
            }).catch(console.warn)
        } else {
            setUserPaused(true)
            vid.pause()
            setIsPlaying(false)
            triggerCenterAnimation('pause')
        }
    }, [error])

    // Single Click vs Double Click Handler
    const handlePlayerClick = (e) => {
        e.preventDefault()
        e.stopPropagation()
        const now = Date.now()
        const timeDiff = now - lastClickTimeRef.current

        if (timeDiff < 280) {
            // Double Click: Like + Reels Heart Animation!
            if (singleClickTimerRef.current) {
                clearTimeout(singleClickTimerRef.current)
                singleClickTimerRef.current = null
            }
            if (!isLiked) {
                handleLike(e)
            }
            setShowHeartAnimation(true)
            setTimeout(() => setShowHeartAnimation(false), 900)
        } else {
            // Single Click: Toggle Play/Pause after short delay
            singleClickTimerRef.current = setTimeout(() => {
                togglePlay()
            }, 250)
        }
        lastClickTimeRef.current = now
    }

    // Keyboard Space & K Shortcut for active video
    useEffect(() => {
        if (!isActive) return
        const handleKeyDown = (e) => {
            if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return
            if (e.code === 'Space' || e.key === ' ' || e.key === 'k' || e.key === 'K') {
                e.preventDefault()
                e.stopPropagation()
                togglePlay()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isActive, togglePlay])

    const handleTimeUpdate = () => {
        if (videoRef.current && videoRef.current.duration) {
            setDuration(videoRef.current.duration)
            if (!isScrubbing) {
                const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100
                setProgress(currentProgress)
            }
        }
    }

    const handleError = () => {
        console.error("Video failed to load:", video?._id || video?.id)
        setError(true)
        setIsPlaying(false)
    }

    // Mutations
    const videoId = video?.id || video?._id

    const likeMutation = useMutation({
        mutationFn: () => likeService.toggleVideoLike(videoId),
        onMutate: () => {
            setIsLiked(prev => !prev)
            if (isDisliked) setIsDisliked(false)
            setLikesCount(prev => isLiked ? Math.max(0, prev - 1) : prev + 1)
        },
        onError: () => {
            setIsLiked(Boolean(video?.isLiked))
            setLikesCount(video?.likesCount ?? video?.likes ?? 0)
            toast.error("Failed to like video")
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shorts'] })
    })

    const subscribeMutation = useMutation({
        mutationFn: () => subscriptionService.toggleSubscription(video.owner?.id || video.owner?._id),
        onMutate: () => {
            setIsSubscribed(prev => !prev)
        },
        onError: () => {
            setIsSubscribed(Boolean(video?.isSubscribed))
            toast.error("Failed to update subscription")
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shorts'] })
    })

    const isOwner = user && (user._id === video?.owner?._id || user.id === video?.owner?.id || user.id === video?.owner?._id)

    const handleLike = (e) => {
        if (e) e.stopPropagation()
        if (!user) return toast.error("Please login to like")
        likeMutation.mutate()
    }

    const handleDislike = (e) => {
        e.stopPropagation()
        if (!user) return toast.error("Please login to dislike")
        setIsDisliked(prev => !prev)
        if (!isDisliked && isLiked) {
            setIsLiked(false)
            setLikesCount(prev => Math.max(0, prev - 1))
            likeMutation.mutate()
        }
    }

    const handleSubscribe = (e) => {
        e.stopPropagation()
        if (!user) return toast.error("Please login to subscribe")
        if (isOwner) return toast.error("You cannot subscribe to your own channel")
        subscribeMutation.mutate()
    }

    const togglePanel = (panelName, e) => {
        if (e) e.stopPropagation()
        setActivePanel(prev => prev === panelName ? null : panelName)
    }

    // Interactive Timeline Scrubber Functions (Matching Photo 3)
    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return "0:00"
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`
    }

    const handleScrubberSeek = (clientX) => {
        if (!progressBarRef.current || !videoRef.current || !videoRef.current.duration) return
        const rect = progressBarRef.current.getBoundingClientRect()
        const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
        const targetTime = pos * videoRef.current.duration
        videoRef.current.currentTime = targetTime
        setProgress(pos * 100)
    }

    const handleScrubberMouseDown = (e) => {
        e.stopPropagation()
        setIsScrubbing(true)
        handleScrubberSeek(e.clientX)

        const handleMouseMove = (moveEvent) => {
            handleScrubberSeek(moveEvent.clientX)
        }

        const handleMouseUp = () => {
            setIsScrubbing(false)
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }

        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', handleMouseUp)
    }

    const handleScrubberMouseMove = (e) => {
        if (!progressBarRef.current || !videoRef.current || !videoRef.current.duration) return
        const rect = progressBarRef.current.getBoundingClientRect()
        const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
        setHoverProgress(pos * 100)
        setHoverTime(pos * videoRef.current.duration)
    }

    const commentsCount = video?.commentsCount ?? video?.comments?.length ?? 0
    const videoUrl = `${window.location.origin}/shorts/${videoId}`

    // Extract tags from description or video.tags
    const extractedTags = (video?.tags || []).map(t => typeof t === 'string' ? t : t.name || t.tag || '').filter(Boolean)

    return (
        <div className="relative w-full h-full flex justify-center items-center bg-black sm:bg-[#0f0f0f] shrink-0 sm:py-2 select-none">
            {/* Flex Container: Center Video + Bottom-Aligned Action Bar + Side Panel */}
            <div className="flex flex-col lg:flex-row h-full w-full sm:w-auto relative justify-center items-end gap-0 lg:gap-4 pb-2 sm:pb-3">

                {/* Video Player Wrapper (9:16 aspect ratio on desktop) */}
                <div
                    onClick={handlePlayerClick}
                    className="relative h-full w-full sm:w-auto sm:aspect-[9/16] sm:rounded-2xl overflow-hidden bg-black shadow-2xl flex-shrink-0 flex items-center justify-center cursor-pointer group/player"
                >
                    {!error ? (
                        <video
                            ref={videoRef}
                            src={getMediaUrl(video?.playbackUrl || video?.videoFile || video?.videoUrl || video?.url || video?.streaming?.selectedPlaybackUrl)}
                            poster={getMediaUrl(video?.thumbnail || video?.poster)}
                            className="w-full h-full object-contain sm:object-cover"
                            loop
                            playsInline
                            autoPlay={isActive}
                            muted={isGlobalMuted}
                            onTimeUpdate={handleTimeUpdate}
                            onError={handleError}
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-white gap-3 p-6 text-center">
                            <p className="text-sm font-medium">Video Unavailable</p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setError(false)
                                    if (videoRef.current) {
                                        videoRef.current.load()
                                        videoRef.current.play().catch(console.warn)
                                    }
                                }}
                                className="rounded-full"
                            >
                                Retry
                            </Button>
                        </div>
                    )}

                    {/* Top Left Controls Overlay */}
                    <div className="absolute top-4 left-4 flex items-center gap-2 z-30 pointer-events-auto">
                        {/* Play/Pause Button */}
                        <button
                            onClick={togglePlay}
                            className="p-2.5 bg-black/40 hover:bg-black/60 rounded-full text-white backdrop-blur-md transition-all active:scale-95 shadow-md"
                            title={isPlaying ? 'Pause (k / Space)' : 'Play (k / Space)'}
                        >
                            {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                        </button>

                        {/* Mute/Unmute Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                if (onToggleMute) onToggleMute()
                            }}
                            className="p-2.5 bg-black/40 hover:bg-black/60 rounded-full text-white backdrop-blur-md transition-all active:scale-95 shadow-md"
                            title={isGlobalMuted ? 'Unmute (m)' : 'Mute (m)'}
                        >
                            {isGlobalMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </button>
                    </div>

                    {/* Center Animated Play/Pause Ripple Indicator */}
                    <AnimatePresence>
                        {showCenterIcon && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.3 }}
                                transition={{ duration: 0.3 }}
                                className="absolute inset-0 flex items-center justify-center pointer-events-none z-25"
                            >
                                <div className="p-5 bg-black/60 rounded-full text-white backdrop-blur-md shadow-2xl border border-white/10">
                                    {showCenterIcon === 'play' ? (
                                        <Play className="w-10 h-10 fill-white ml-1" />
                                    ) : (
                                        <Pause className="w-10 h-10 fill-white" />
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Double-Tap Reels-like Heart Animation */}
                    <AnimatePresence>
                        {showHeartAnimation && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0, rotate: -15 }}
                                animate={{
                                    opacity: [0, 1, 1, 0],
                                    scale: [0.3, 1.4, 1.1, 1.25],
                                    rotate: [-15, 0, 5, 0],
                                    y: [0, -15, -35]
                                }}
                                transition={{ duration: 0.85, ease: "easeOut" }}
                                className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
                            >
                                <div className="relative flex items-center justify-center">
                                    <Heart className="w-24 h-24 sm:w-28 sm:h-28 fill-red-500 text-red-500 drop-shadow-[0_0_30px_rgba(239,68,68,0.9)]" />
                                    <div className="absolute inset-0 bg-red-500/30 rounded-full blur-2xl -z-10 animate-ping" />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Interactive Timeline Scrubber (Matching Photo 3) */}
                    {!error && (
                        <div
                            ref={progressBarRef}
                            onMouseDown={handleScrubberMouseDown}
                            onMouseMove={handleScrubberMouseMove}
                            onMouseLeave={() => setHoverProgress(null)}
                            className="absolute bottom-0 left-0 right-0 h-4 flex items-end cursor-pointer group/scrub z-35 pointer-events-auto"
                        >
                            {/* Scrubber Background Track */}
                            <div className="relative w-full h-1 group-hover/scrub:h-1.5 transition-all bg-white/25">
                                {/* Progress Fill */}
                                <div
                                    className="h-full bg-red-600 relative transition-none"
                                    style={{ width: `${progress}%` }}
                                >
                                    {/* Red Dot Thumb (Visible on hover or scrub) */}
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-red-600 rounded-full shadow-md scale-0 group-hover/scrub:scale-100 transition-transform" />
                                </div>

                                {/* Time Preview Badge Tooltip (Matching Photo 3) */}
                                {(hoverProgress !== null || isScrubbing) && (
                                    <div
                                        className="absolute bottom-5 -translate-x-1/2 bg-black/90 border border-white/20 text-white text-xs font-mono font-bold px-2 py-1 rounded-md shadow-2xl pointer-events-none backdrop-blur-md"
                                        style={{ left: `${hoverProgress !== null ? hoverProgress : progress}%` }}
                                    >
                                        {formatTime(hoverProgress !== null ? hoverTime : (videoRef.current?.currentTime || 0))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Bottom Left Info Overlay (Creator + Title + Clickable Tags) */}
                    <div className="absolute bottom-2 left-0 right-0 z-20 text-white p-4 pt-12 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none sm:pr-4 pr-16 pb-4 sm:pb-3 flex flex-col justify-end">
                        {/* Channel Row */}
                        <div className="flex items-center gap-2.5 mb-2 pointer-events-auto">
                            <Link
                                to={`/@${video?.owner?.username}`}
                                onClick={(e) => e.stopPropagation()}
                                className="flex-shrink-0"
                            >
                                <Avatar
                                    src={getMediaUrl(video?.owner?.avatar)}
                                    fallback={video?.owner?.username?.[0] || 'U'}
                                    size="sm"
                                    className="border border-white/20 ring-1 ring-black/40"
                                />
                            </Link>
                            <Link
                                to={`/@${video?.owner?.username}`}
                                onClick={(e) => e.stopPropagation()}
                                className="font-bold text-sm hover:underline drop-shadow-md truncate max-w-[160px] sm:max-w-[200px]"
                            >
                                @{video?.owner?.username}
                            </Link>
                            {!isOwner && (
                                <Button
                                    size="sm"
                                    onClick={handleSubscribe}
                                    disabled={subscribeMutation.isPending}
                                    className={`rounded-full h-7 px-3.5 text-xs font-semibold shadow-md transition-all ${
                                        isSubscribed
                                            ? 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-md'
                                            : 'bg-white hover:bg-gray-100 text-black'
                                    }`}
                                >
                                    {isSubscribed ? 'Subscribed' : 'Subscribe'}
                                </Button>
                            )}
                        </div>

                        {/* Title & Description Click Trigger */}
                        <div
                            className="pointer-events-auto cursor-pointer group/desc"
                            onClick={(e) => togglePanel('description', e)}
                            title="Click to view description"
                        >
                            <h2 className="line-clamp-2 text-sm sm:text-base font-medium drop-shadow-md leading-snug group-hover/desc:text-primary transition-colors">
                                {video.title}
                            </h2>
                        </div>

                        {/* Clickable Tags under Title */}
                        {extractedTags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-1.5 pointer-events-auto">
                                {extractedTags.slice(0, 3).map((tag, idx) => (
                                    <Link
                                        key={idx}
                                        to={`/search?q=%23${encodeURIComponent(tag.replace(/^#/, ''))}`}
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-xs text-white/75 hover:text-white font-medium hover:underline drop-shadow-sm"
                                    >
                                        #{tag.replace(/^#/, '')}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Action Column (Bottom-Aligned Matching YouTube Photo 4) */}
                <div className="
                    absolute bottom-4 right-2 z-30 flex flex-col items-center gap-3.5 pb-2
                    sm:relative sm:bottom-0 sm:right-auto sm:flex sm:flex-col sm:justify-end sm:items-center sm:pb-1 sm:gap-4
                ">
                    {/* Like Button */}
                    <div className="flex flex-col items-center gap-1 pointer-events-auto">
                        <button
                            onClick={handleLike}
                            className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-lg active:scale-95 ${
                                isLiked
                                    ? 'bg-primary text-white shadow-primary/30'
                                    : 'bg-black/40 sm:bg-white/10 hover:bg-white/20 text-white'
                            }`}
                            title="I like this"
                        >
                            <ThumbsUp className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                        </button>
                        <span className="text-white text-xs font-semibold drop-shadow-md">{formatNumber(likesCount)}</span>
                    </div>

                    {/* Dislike Button */}
                    <div className="flex flex-col items-center gap-1 pointer-events-auto">
                        <button
                            onClick={handleDislike}
                            className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-lg active:scale-95 ${
                                isDisliked
                                    ? 'bg-white/30 text-white'
                                    : 'bg-black/40 sm:bg-white/10 hover:bg-white/20 text-white'
                            }`}
                            title="I dislike this"
                        >
                            <ThumbsDown className={`w-5 h-5 ${isDisliked ? 'fill-current' : ''}`} />
                        </button>
                        <span className="text-white text-xs font-medium drop-shadow-md">Dislike</span>
                    </div>

                    {/* Comments Button */}
                    <div className="flex flex-col items-center gap-1 pointer-events-auto">
                        <button
                            onClick={(e) => togglePanel('comments', e)}
                            className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-lg active:scale-95 ${
                                activePanel === 'comments'
                                    ? 'bg-primary text-white ring-2 ring-primary'
                                    : 'bg-black/40 sm:bg-white/10 hover:bg-white/20 text-white'
                            }`}
                            title="Comments"
                        >
                            <MessageSquare className="w-5 h-5" />
                        </button>
                        <span className="text-white text-xs font-semibold drop-shadow-md">{formatNumber(commentsCount)}</span>
                    </div>

                    {/* Share Button */}
                    <ShareDialog
                        title={video.title}
                        url={videoUrl}
                        trigger={
                            <div className="flex flex-col items-center gap-1 cursor-pointer pointer-events-auto">
                                <button
                                    className="w-12 h-12 bg-black/40 sm:bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-lg active:scale-95 text-white"
                                    title="Share"
                                >
                                    <Share2 className="w-5 h-5" />
                                </button>
                                <span className="text-white text-xs font-medium drop-shadow-md">Share</span>
                            </div>
                        }
                    />

                    {/* More / 3-dots Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                className="w-12 h-12 bg-black/40 sm:bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-lg active:scale-95 text-white pointer-events-auto"
                                title="More options"
                            >
                                <MoreVertical className="w-5 h-5" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[200px] glass-panel border-white/10 text-white bg-[#1a1a1a]/95 backdrop-blur-xl rounded-2xl shadow-premium p-1.5">
                            <DropdownMenuItem
                                onClick={(e) => togglePanel('description', e)}
                                className="hover:bg-white/10 cursor-pointer py-2.5 px-3 rounded-xl flex items-center gap-2.5"
                            >
                                <FileText className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium text-sm">Description</span>
                            </DropdownMenuItem>

                            <ReportDialog
                                targetType="VIDEO"
                                targetId={videoId}
                                trigger={
                                    <DropdownMenuItem
                                        onSelect={(e) => e.preventDefault()}
                                        className="hover:bg-white/10 cursor-pointer py-2.5 px-3 rounded-xl flex items-center gap-2.5"
                                    >
                                        <Flag className="w-4 h-4 text-muted-foreground" />
                                        <span className="font-medium text-sm">Report</span>
                                    </DropdownMenuItem>
                                }
                            />
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Sound / Channel Spinning Avatar at bottom right */}
                    <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-white/20 relative shadow-lg">
                        <img
                            src={getMediaUrl(video.thumbnail || video.owner?.avatar)}
                            alt="thumbnail"
                            className="w-full h-full object-cover animate-[pulse_4s_ease-in-out_infinite]"
                        />
                    </div>
                </div>

                {/* Side-by-Side Panel (Comments or Description) */}
                <AnimatePresence>
                    {activePanel === 'comments' && (
                        <ShortsComments
                            videoId={videoId}
                            commentsCount={commentsCount}
                            onClose={() => setActivePanel(null)}
                        />
                    )}
                    {activePanel === 'description' && (
                        <ShortsDescription
                            video={video}
                            onClose={() => setActivePanel(null)}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
