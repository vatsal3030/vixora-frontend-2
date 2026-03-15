import { useRef, useState, useEffect, useCallback } from 'react'
import { Play, Pause, Volume2, VolumeX, ThumbsUp, ThumbsDown, MessageSquare, Share2, MoreVertical, Flag, Clock, Save, Maximize, Heart, Eye, CalendarDays } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../ui/DropdownMenu'
import { ReportDialog } from '../common/ReportDialog'
import { ShareDialog } from '../common/ShareDialog'
import { AddToPlaylistDialog } from '../playlist/AddToPlaylistDialog'
import { Avatar } from '../ui/Avatar'
import { Button } from '../ui/Button'
import { formatNumber, formatTimeAgo } from '../../lib/utils'
import { getMediaUrl } from '../../lib/media'
import { likeService, subscriptionService, playlistService } from '../../services/api'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuth } from '../../context/AuthContext'
import ShortsComments from './ShortsComments'
import { AnimatePresence, motion } from 'framer-motion'

export default function ShortsPlayer({ video, isActive }) {
    const videoRef = useRef(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isMuted, setIsMuted] = useState(true) // Audio MUST be muted by default to pass browser autoplay constraints
    const [progress, setProgress] = useState(0)
    const { user } = useAuth()

    const [error, setError] = useState(false)
    const [showComments, setShowComments] = useState(false)
    const [showDescription, setShowDescription] = useState(false)
    const [showLikeAnimation, setShowLikeAnimation] = useState(false)
    const videoId = video._id || video.id

    // Local optimistic state
    const [localIsLiked, setLocalIsLiked] = useState(video.isLiked || false)
    const [localLikesCount, setLocalLikesCount] = useState(video.likesCount || 0)
    const [localIsSubscribed, setLocalIsSubscribed] = useState(video.isSubscribed || false)

    // Unified sync function to avoid cascading renders
    const syncState = useCallback(() => {
        setLocalIsLiked(video.isLiked || false)
        setLocalLikesCount(video.likesCount || 0)
        setLocalIsSubscribed(video.isSubscribed || false)
    }, [video.isLiked, video.likesCount, video.isSubscribed])

    // Sync local state when video changes (needed for infinite scroll re-use)
    useEffect(() => {
        syncState()
    }, [videoId, syncState])

    const clickTimeoutRef = useRef(null)

    // Autoplay handling — robust: try unmuted, fallback to muted
    useEffect(() => {
        const vid = videoRef.current
        if (!vid) return

        if (isActive) {
            const tryPlay = async () => {
                setError(false)
                vid.currentTime = 0
                // Try unmuted first
                vid.muted = false
                try {
                    await vid.play()
                    setIsMuted(false)
                    setIsPlaying(true)
                } catch {
                    // Browser blocked unmuted, try muted
                    vid.muted = true
                    setIsMuted(true)
                    try {
                        await vid.play()
                        setIsPlaying(true)
                    } catch (e) {
                        console.warn('Autoplay fully blocked', e)
                    }
                }
            }
            // Small delay to ensure DOM is ready after scroll snap
            const t = setTimeout(tryPlay, 100)
            return () => clearTimeout(t)
        } else {
            vid.pause()
            vid.currentTime = 0
            setIsPlaying(false)
        }
    }, [isActive])

    const handleLoadedData = () => {
        if (isActive && videoRef.current?.paused) {
            videoRef.current.play().catch(() => {})
        }
    }

    const togglePlay = () => {
        if (error) return
        if (videoRef.current?.paused) {
            videoRef.current.play()
        } else {
            videoRef.current?.pause()
        }
    }

    const handleVideoClick = (e) => {
        e.stopPropagation()
        if (clickTimeoutRef.current) {
            clearTimeout(clickTimeoutRef.current)
            clickTimeoutRef.current = null
            handleLike(e)
            setShowLikeAnimation(true)
            setTimeout(() => setShowLikeAnimation(false), 800)
            return
        }
        clickTimeoutRef.current = setTimeout(() => {
            togglePlay()
            clickTimeoutRef.current = null
        }, 250)
    }

    const toggleMute = (e) => {
        e.stopPropagation()
        if (videoRef.current) {
            videoRef.current.muted = !videoRef.current.muted
            setIsMuted(videoRef.current.muted)
        }
    }

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100)
        }
    }

    const handleError = () => {
        console.error("Video failed to load:", videoId)
        setError(true)
        setIsPlaying(false)
    }

    const handleFullscreen = (e) => {
        e.stopPropagation()
        if (document.fullscreenElement) {
            document.exitFullscreen()
        } else {
            document.documentElement.requestFullscreen()
        }
    }

    // Mutations with optimistic updates
    const likeMutation = useMutation({
        mutationFn: () => likeService.toggleVideoLike(videoId),
        onMutate: () => {
            const wasLiked = localIsLiked
            setLocalIsLiked(!wasLiked)
            setLocalLikesCount(prev => wasLiked ? prev - 1 : prev + 1)
            return { wasLiked }
        },
        onError: (_err, _vars, context) => {
            if (context) {
                setLocalIsLiked(context.wasLiked)
                setLocalLikesCount(prev => context.wasLiked ? prev + 1 : prev - 1)
            }
            toast.error("Failed to update like")
        }
    })

    const subscribeMutation = useMutation({
        mutationFn: () => subscriptionService.toggleSubscription(video.owner?._id || video.owner?.id),
        onMutate: () => {
            const wasSub = localIsSubscribed
            setLocalIsSubscribed(!wasSub)
            return { wasSub }
        },
        onSuccess: (_data, _vars, context) => {
            toast.success(context?.wasSub ? "Unsubscribed" : "Subscribed!")
        },
        onError: (_err, _vars, context) => {
            if (context) setLocalIsSubscribed(context.wasSub)
            toast.error("Failed to update subscription")
        }
    })

    const watchLaterMutation = useMutation({
        mutationFn: () => playlistService.toggleWatchLater(videoId),
        onSuccess: (res) => {
            const added = res.data?.data?.added
            toast.success(added !== undefined ? (added ? "Added to Watch Later" : "Removed from Watch Later") : "Watch Later updated")
        },
        onError: () => toast.error("Failed to update Watch Later")
    })

    const isOwner = user?._id === video?.owner?._id || user?._id === video?.owner?.id

    const handleLike = (e) => {
        e.stopPropagation()
        if (!user) return toast.error("Login to like")
        likeMutation.mutate()
    }

    const handleSubscribe = (e) => {
        e.stopPropagation()
        if (!user) return toast.error("Login to subscribe")
        if (isOwner) return toast.error("You cannot subscribe to your own channel")
        subscribeMutation.mutate()
    }

    // Determine which side panel is open
    const sidePanelOpen = showComments || showDescription

    return (
        <div className="relative w-full h-full flex items-center justify-center bg-[#0f0f0f]">
            <div className="flex flex-col sm:flex-row h-full w-full sm:w-auto sm:h-auto sm:max-h-full relative justify-center items-center gap-0 sm:gap-3 lg:gap-4 mx-auto sm:px-4 sm:py-3">

                {/* ===== VIDEO CONTAINER ===== */}
                <div className="relative h-full w-full sm:h-[calc(100vh-96px)] sm:w-auto sm:aspect-[9/16] sm:rounded-2xl overflow-hidden bg-black group shadow-2xl flex-shrink-0">
                    {!error ? (
                        <video
                            ref={videoRef}
                            src={getMediaUrl(video?.videoFile || video?.videoUrl || video?.video || video?.videoFile?.url || video?.videoFile?.path)}
                            poster={getMediaUrl(video.thumbnail)}
                            className="w-full h-full object-cover cursor-pointer"
                            loop
                            playsInline
                            preload="auto"
                            muted={isMuted}
                            onTimeUpdate={handleTimeUpdate}
                            onError={handleError}
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                            onLoadedData={handleLoadedData}
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 text-white gap-4 p-8 text-center">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                                <Play className="w-8 h-8 text-white/20 ml-1" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-bold">Playback Error</p>
                                <p className="text-xs text-muted-foreground line-clamp-2">Could not load video source. Please check your connection or wait for processing.</p>
                            </div>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="border-white/10 hover:bg-white/5 rounded-full px-6 h-9 transition-all active:scale-95"
                                onClick={(e) => { e.stopPropagation(); setError(false); videoRef.current?.load(); }}
                            >
                                Retry Playback
                            </Button>
                        </div>
                    )}

                    {/* Progress Bar */}
                    {!error && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20">
                            <div className="h-full bg-red-600 transition-all duration-100 ease-linear" style={{ width: `${progress}%` }} />
                        </div>
                    )}

                    {/* Click Overlay */}
                    <div className="absolute inset-0 z-10 cursor-pointer" onClick={handleVideoClick} />

                    {/* Heart Animation */}
                    <AnimatePresence>
                        {showLikeAnimation && (
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1.3, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                                className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
                            >
                                <Heart className="w-24 h-24 text-red-500 fill-red-500 drop-shadow-2xl" />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Play/Pause Center Icon */}
                    <AnimatePresence>
                        {!isPlaying && !error && (
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
                            >
                                <div className="p-5 bg-black/50 rounded-full text-white backdrop-blur-sm">
                                    <Play className="w-10 h-10 fill-current ml-1" />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Top Controls */}
                    <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-center z-20 bg-gradient-to-b from-black/50 to-transparent pointer-events-none">
                        <div className="flex items-center gap-2 pointer-events-auto">
                            <button onClick={(e) => { e.stopPropagation(); togglePlay(); }} className="p-2.5 bg-black/60 hover:bg-black/80 rounded-full text-white transition-all transform active:scale-95 shadow-lg">
                                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                            </button>
                            <button onClick={toggleMute} className="p-2.5 bg-black/60 hover:bg-black/80 rounded-full text-white transition-all transform active:scale-95 shadow-lg">
                                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                            </button>
                        </div>
                        <div className="flex items-center gap-2 pointer-events-auto">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors">
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 glass-panel border-white/5 text-white bg-black/80 backdrop-blur-xl rounded-2xl shadow-premium p-1">
                                    <AddToPlaylistDialog videoId={videoId} trigger={
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="hover:bg-white/10 cursor-pointer focus:bg-white/10 focus:text-white py-3 px-4 rounded-xl flex items-center">
                                            <Save className="w-4 h-4 mr-3 text-muted-foreground" />
                                            <span className="font-medium">Save to Playlist</span>
                                        </DropdownMenuItem>
                                    } />
                                    <DropdownMenuItem
                                        onSelect={() => {
                                            if (!user) return toast.error('Please login')
                                            watchLaterMutation.mutate()
                                        }}
                                        disabled={watchLaterMutation.isPending}
                                        className="hover:bg-white/10 cursor-pointer focus:bg-white/10 focus:text-white py-3 px-4 rounded-xl flex items-center"
                                    >
                                        <Clock className="w-4 h-4 mr-3 text-muted-foreground" />
                                        <span className="font-medium">{watchLaterMutation.isPending ? "Saving..." : "Save to Watch Later"}</span>
                                    </DropdownMenuItem>
                                    <ReportDialog targetType="VIDEO" targetId={videoId} trigger={
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="hover:bg-white/10 cursor-pointer focus:bg-white/10 focus:text-white py-3 px-4 rounded-xl flex items-center">
                                            <Flag className="w-4 h-4 mr-3 text-muted-foreground" />
                                            <span className="font-medium text-red-400">Report</span>
                                        </DropdownMenuItem>
                                    } />
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <button onClick={handleFullscreen} className="p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors">
                                <Maximize className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Bottom Info Overlay */}
                    <div className="absolute flex flex-col justify-end bottom-0 left-0 right-0 z-20 text-white p-4 pt-16 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none pr-16 sm:pr-4 pb-5 sm:pb-4">
                        <div className="flex items-center gap-3 mb-2 pointer-events-auto">
                            <Link to={`/@${video?.owner?.username}`} className="flex-shrink-0">
                                <Avatar src={getMediaUrl(video?.owner?.avatar)} fallback={video?.owner?.username?.[0]} size="sm" className="border border-white/20" />
                            </Link>
                            <Link to={`/@${video?.owner?.username}`} className="font-semibold text-sm hover:underline drop-shadow-md line-clamp-1">
                                @{video?.owner?.username}
                            </Link>
                            {!isOwner && (
                                <Button
                                    variant={localIsSubscribed ? "secondary" : "default"}
                                    size="sm"
                                    className={`h-7 px-3 rounded-full font-bold text-xs ${!localIsSubscribed ? 'bg-white text-black hover:bg-white/90' : 'bg-white/20 text-white hover:bg-white/30'}`}
                                    onClick={handleSubscribe}
                                >
                                    {localIsSubscribed ? "Subscribed" : "Subscribe"}
                                </Button>
                            )}
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowDescription(!showDescription); setShowComments(false); }}
                            className="pointer-events-auto text-left"
                        >
                            <h2 className="line-clamp-1 text-sm font-medium drop-shadow-md leading-snug hover:underline">
                                {video.title}
                            </h2>
                        </button>
                    </div>
                </div>

                {/* ===== RIGHT SIDE ACTION BUTTONS ===== */}
                <div className={`
                    absolute bottom-4 right-2 z-20 flex flex-col items-center gap-4 sm:gap-5
                    sm:relative sm:bottom-0 sm:right-0 sm:flex sm:flex-col sm:self-end sm:pb-4
                    ${sidePanelOpen ? 'hidden sm:hidden lg:flex' : ''}
                `}>
                    {/* Like */}
                    <div className="flex flex-col items-center gap-0.5">
                        <button
                            onClick={handleLike}
                            className={`p-3 rounded-full transition-all duration-200 ${localIsLiked
                                ? 'bg-blue-500/20 text-blue-400 sm:bg-blue-500/10'
                                : 'bg-white/10 sm:bg-white/[0.06] text-white hover:bg-white/20'
                            } sm:border sm:border-white/5`}
                        >
                            <ThumbsUp className={`w-6 h-6 ${localIsLiked ? 'fill-current' : ''}`} />
                        </button>
                        <span className="text-white text-[11px] font-medium">{formatNumber(localLikesCount)}</span>
                    </div>

                    {/* Dislike */}
                    <div className="flex flex-col items-center gap-0.5">
                        <button className="p-3 rounded-full bg-white/10 sm:bg-white/[0.06] sm:border sm:border-white/5 hover:bg-white/20 transition-colors text-white">
                            <ThumbsDown className="w-6 h-6" />
                        </button>
                        <span className="text-white text-[11px] font-medium">Dislike</span>
                    </div>

                    {/* Comments */}
                    <div className="flex flex-col items-center gap-0.5">
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowComments(!showComments); setShowDescription(false); }}
                            className={`p-3 rounded-full transition-colors sm:border sm:border-white/5 ${showComments ? 'bg-blue-500/20 text-blue-400' : 'bg-white/10 sm:bg-white/[0.06] text-white hover:bg-white/20'}`}
                        >
                            <MessageSquare className="w-6 h-6" />
                        </button>
                        <span className="text-white text-[11px] font-medium">{formatNumber(video.commentsCount || 0)}</span>
                    </div>

                    {/* Share — uses /shorts/ URL */}
                    <div className="flex flex-col items-center gap-0.5">
                        <ShareDialog title={video.title} url={`${window.location.origin}/shorts/${videoId}`} trigger={
                            <button className="p-3 rounded-full bg-white/10 sm:bg-white/[0.06] sm:border sm:border-white/5 hover:bg-white/20 transition-colors text-white">
                                <Share2 className="w-6 h-6" />
                            </button>
                        } />
                        <span className="text-white text-[11px] font-medium">Share</span>
                    </div>

                    {/* Channel thumbnail */}
                    <div className="w-9 h-9 rounded-md overflow-hidden border-2 border-white/20 sm:hidden mt-1 shadow-md">
                        <img src={getMediaUrl(video.thumbnail)} alt="" className="w-full h-full object-cover" />
                    </div>
                </div>

                {/* ===== SIDE PANELS (smooth crossfade) ===== */}
                <AnimatePresence mode="wait">
                    {showComments && (
                        <ShortsComments
                            key="comments-panel"
                            videoId={videoId}
                            commentsCount={video.commentsCount}
                            onClose={() => setShowComments(false)}
                        />
                    )}
                    {showDescription && !showComments && (
                        <ShortsDescription
                            key="description-panel"
                            video={video}
                            localLikesCount={localLikesCount}
                            onClose={() => setShowDescription(false)}
                        />
                    )}
                </AnimatePresence>

            </div>
        </div>
    )
}

// ===== Description Side Panel Component =====
function ShortsDescription({ video, localLikesCount, onClose }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: window.innerWidth < 1024 ? 0 : 50, y: window.innerWidth < 1024 ? 50 : 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: window.innerWidth < 1024 ? 0 : 50, y: window.innerWidth < 1024 ? 50 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute lg:relative right-0 lg:right-auto top-auto sm:top-0 lg:top-auto bottom-0 lg:bottom-auto w-full sm:w-[350px] lg:w-[400px] xl:w-[450px] h-[60vh] sm:h-full lg:h-[calc(100vh-64px-2rem)] z-[40] bg-[#0f0f0f] sm:rounded-l-2xl rounded-t-2xl lg:rounded-2xl sm:rounded-tr-none lg:rounded-tr-2xl border-t sm:border-t-0 sm:border-l lg:border border-white/10 shadow-2xl flex flex-col shrink-0"
            onClick={(e) => e.stopPropagation()}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
                <h3 className="font-bold text-lg text-white">Description</h3>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-hide">
                {/* Title */}
                <p className="text-white text-sm leading-relaxed">{video.title}</p>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4 py-3 border-y border-white/10">
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-white font-bold text-base">{formatNumber(localLikesCount)}</span>
                        <span className="text-muted-foreground text-xs flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> Likes</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-white font-bold text-base">{formatNumber(video.views || 0)}</span>
                        <span className="text-muted-foreground text-xs flex items-center gap-1"><Eye className="w-3 h-3" /> Views</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-white font-bold text-base">{formatTimeAgo ? formatTimeAgo(video.createdAt) : 'N/A'}</span>
                        <span className="text-muted-foreground text-xs flex items-center gap-1"><CalendarDays className="w-3 h-3" /> Ago</span>
                    </div>
                </div>

                {/* Description Text */}
                {video.description && (
                    <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{video.description}</p>
                )}

                {/* Tags */}
                {video.tags && video.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {video.tags.map((tag, i) => (
                            <a key={i} href={`/tags/${encodeURIComponent(tag)}`} className="text-blue-400 text-xs hover:underline cursor-pointer">#{tag}</a>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    )
}
