import { useRef, useState, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, ThumbsUp, ThumbsDown, MessageSquare, Share2, MoreVertical, Loader2, Flag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../ui/DropdownMenu'
import { ReportDialog } from '../common/ReportDialog'
import { Avatar } from '../ui/Avatar'
import { Button } from '../ui/Button'
import { formatNumber } from '../../lib/utils'
import { getMediaUrl } from '../../lib/media'
import { likeService, subscriptionService } from '../../services/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuth } from '../../context/AuthContext'

export default function ShortsPlayer({ video, isActive, onTogglePlay }) {
    const videoRef = useRef(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isMuted, setIsMuted] = useState(true) // Start muted for guaranteed autoplay
    const [progress, setProgress] = useState(0)
    const { user } = useAuth()
    const queryClient = useQueryClient()

    const [error, setError] = useState(false)

    // Autoplay handling based on isActive prop
    useEffect(() => {
        if (isActive) {
            const playVideo = async () => {
                if (!videoRef.current) return
                try {
                    setError(false) // Reset error on new attempt
                    // Force DOM to muted to guarantee browser autoplay policies are appeased
                    if (isMuted) videoRef.current.muted = true
                    await videoRef.current.play()
                } catch (err) {
                    console.warn("Autoplay blocked or failed", err)
                }
            }
            playVideo()
        } else {
            if (videoRef.current) {
                videoRef.current.pause()
                videoRef.current.currentTime = 0
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isActive])

    const togglePlay = () => {
        if (error) return // Don't try to play if errored
        if (videoRef.current?.paused) {
            videoRef.current.play()
        } else {
            videoRef.current?.pause()
        }
        if (onTogglePlay) onTogglePlay()
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
            const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100
            setProgress(progress)
        }
    }

    const handleError = () => {
        console.error("Video failed to load:", video._id)
        setError(true)
        setIsPlaying(false)
    }

    // Mutations
    const likeMutation = useMutation({
        mutationFn: () => likeService.toggleVideoLike(video._id),
        onMutate: async () => {
            await queryClient.cancelQueries(['shorts'])
            const previousData = queryClient.getQueryData(['shorts'])

            // Optimistic update logic for infinite query... complex but doable. 
            // For now, simpler to just invalidate or use local state for immediate feedback.
            return { previousData }
        },
        onSuccess: () => {
            // Invalidate shorts feed
            queryClient.invalidateQueries(['shorts'])
        }
    })

    const subscribeMutation = useMutation({
        mutationFn: () => subscriptionService.toggleSubscription(video.owner._id),
        onSuccess: () => {
            toast.success(video.isSubscribed ? "Unsubscribed" : "Subscribed")
            queryClient.invalidateQueries(['shorts'])
        }
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

    return (
        <div className="relative w-full h-full flex justify-center bg-black sm:bg-[#0f0f0f] snap-center shrink-0 sm:py-4">

            {/* Main Flex Container: Column on mobile (stacked), Row on Desktop (Video + Sidebar) */}
            <div className="flex flex-col sm:flex-row h-full w-full sm:w-auto relative justify-center gap-0 sm:gap-4">

                {/* Video Container (9:16 aspect ratio on Desktop) */}
                <div className="relative h-full w-full sm:w-auto sm:aspect-[9/16] sm:rounded-2xl overflow-hidden bg-black group shadow-2xl flex-shrink-0">
                    {!error ? (
                        <video
                            ref={videoRef}
                            src={getMediaUrl(video.videoFile)}
                            poster={getMediaUrl(video.thumbnail)}
                            className="w-full h-full object-cover cursor-pointer"
                            loop
                            playsInline
                            muted={isMuted}
                            onTimeUpdate={handleTimeUpdate}
                            onError={handleError}
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-white gap-2">
                            <p className="text-sm font-medium">Video Unavailable</p>
                            <Button variant="outline" size="sm" onClick={() => { setError(false); videoRef.current?.load(); }}>
                                Retry
                            </Button>
                        </div>
                    )}

                    {/* Progress Bar */}
                    {!error && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20">
                            <div
                                className="h-full bg-red-600 transition-all duration-100 ease-linear"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    )}

                    {/* Play/Pause Click Handler Overlay */}
                    <div
                        className="absolute inset-0 z-10 cursor-pointer"
                        onClick={togglePlay}
                    />

                    {/* Play/Pause Center Icon */}
                    {!isPlaying && !error && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                            <div className="p-4 bg-black/40 rounded-full text-white backdrop-blur-sm">
                                <Play className="w-8 h-8 fill-current" />
                            </div>
                        </div>
                    )}

                    {/* Top Controls (Mute button) */}
                    <div className="absolute top-4 right-4 flex gap-4 z-20">
                        {/* Mute Button overlays video on all screens */}
                        <button onClick={toggleMute} className="p-2 bg-black/40 xl:bg-black/20 rounded-full text-white backdrop-blur-sm sm:hover:bg-black/60 transition-colors">
                            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                        </button>
                    </div>

                    {/* Bottom Info Overlay inside Player (Always over video) */}
                    <div className="absolute flex flex-col justify-end bottom-0 left-0 right-0 z-20 text-white p-4 pt-12 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none sm:pr-4 pr-16 pb-6 sm:pb-4">
                        {/* Channel Info */}
                        <div className="flex items-center gap-3 mb-3 pointer-events-auto">
                            <Link to={`/@${video?.owner?.username}`} className="flex-shrink-0">
                                <Avatar src={getMediaUrl(video?.owner?.avatar)} fallback={video?.owner?.username?.[0]} size="md" className="border border-white/20" />
                            </Link>
                            <Link to={`/@${video?.owner?.username}`} className="font-bold hover:underline shadow-black drop-shadow-md line-clamp-1">
                                @{video?.owner?.username}
                            </Link>
                            {!isOwner && (
                                <Button
                                    variant={video?.isSubscribed ? "secondary" : "default"}
                                    size="sm"
                                    className={`h-8 px-4 rounded-full font-bold ml-1 ${!video?.isSubscribed ? 'bg-white text-black hover:bg-white/90' : 'bg-black/40 text-white hover:bg-black/60 backdrop-blur-md'}`}
                                    onClick={handleSubscribe}
                                >
                                    {video?.isSubscribed ? "Subscribed" : "Subscribe"}
                                </Button>
                            )}
                        </div>
                        {/* Title & Description Structure */}
                        <div className="flex flex-col gap-2">
                            <h2 className="line-clamp-2 text-sm sm:text-base font-medium drop-shadow-md leading-snug">
                                {video.title}
                            </h2>
                            {video.description && (
                                <p className="line-clamp-2 text-xs sm:text-sm text-white/80 drop-shadow-md font-light leading-relaxed">
                                    {video.description}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side Actions (Overlaid on Mobile, Outside on Desktop) */}
                <div className="
                    absolute bottom-4 right-2 z-20 flex flex-col items-center gap-5 pb-4  /* Mobile overlay styling */
                    sm:relative sm:bottom-auto sm:right-auto sm:flex sm:flex-col sm:justify-end sm:pb-0 sm:pt-4 sm:pr-2 sm:gap-6 /* Desktop sidebar styling */
                ">
                    <div className="flex flex-col items-center gap-1">
                        <button
                            onClick={handleLike}
                            className={`p-3 rounded-full bg-black/40 sm:bg-white/[0.05] sm:border sm:border-white/5 backdrop-blur-sm sm:hover:bg-white/10 hover:bg-black/60 transition-colors ${video.isLiked ? 'text-blue-500' : 'text-white'}`}
                        >
                            <ThumbsUp className={`w-6 h-6 sm:w-7 sm:h-7 ${video.isLiked ? 'fill-current' : ''}`} />
                        </button>
                        <span className="text-white sm:text-muted-foreground text-xs font-bold sm:mt-1">{formatNumber(video.likesCount)}</span>
                    </div>

                    <div className="flex flex-col items-center gap-1">
                        <button className="p-3 rounded-full bg-black/40 sm:bg-white/[0.05] sm:border sm:border-white/5 backdrop-blur-sm sm:hover:bg-white/10 hover:bg-black/60 transition-colors text-white">
                            <ThumbsDown className="w-6 h-6 sm:w-7 sm:h-7" />
                        </button>
                        <span className="text-white sm:text-muted-foreground text-xs font-bold sm:mt-1">Dislike</span>
                    </div>

                    <div className="flex flex-col items-center gap-1">
                        <Link
                            to={`/watch/${video._id}`}
                            className="p-3 rounded-full bg-black/40 sm:bg-white/[0.05] sm:border sm:border-white/5 backdrop-blur-sm sm:hover:bg-white/10 hover:bg-black/60 transition-colors text-white"
                        >
                            <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7" />
                        </Link>
                        <span className="text-white sm:text-muted-foreground text-xs font-bold sm:mt-1">{formatNumber(video.commentsCount)}</span>
                    </div>

                    <div className="flex flex-col items-center gap-1">
                        <button className="p-3 rounded-full bg-black/40 sm:bg-white/[0.05] sm:border sm:border-white/5 backdrop-blur-sm sm:hover:bg-white/10 hover:bg-black/60 transition-colors text-white">
                            <Share2 className="w-6 h-6 sm:w-7 sm:h-7" />
                        </button>
                        <span className="text-white sm:text-muted-foreground text-xs font-bold sm:mt-1">Share</span>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="p-3 rounded-full bg-black/40 sm:bg-white/[0.05] sm:border sm:border-white/5 backdrop-blur-sm sm:hover:bg-white/10 hover:bg-black/60 transition-colors text-white">
                                <MoreVertical className="w-6 h-6 sm:w-7 sm:h-7" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[180px] glass-panel border-white/5 text-white bg-black/80 backdrop-blur-xl rounded-2xl shadow-premium p-2">
                            <ReportDialog targetType="VIDEO" targetId={video._id} trigger={
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="hover:bg-white/10 cursor-pointer focus:bg-white/10 focus:text-white py-3 px-4 rounded-xl flex items-center">
                                    <Flag className="w-4 h-4 mr-3 text-muted-foreground" />
                                    <span className="font-medium">Report</span>
                                </DropdownMenuItem>
                            } />
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-white/20 sm:hidden">
                        <img src={getMediaUrl(video.thumbnail)} alt="cover" className="w-full h-full object-cover" />
                    </div>
                </div>

            </div>
        </div>
    )
}
