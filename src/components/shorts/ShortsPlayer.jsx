import { useRef, useState, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, ThumbsUp, ThumbsDown, MessageSquare, Share2, MoreVertical, Loader2, Flag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../ui/DropdownMenu'
import { ReportDialog } from '../common/ReportDialog'
import { Avatar } from '../ui/Avatar'
import { Button } from '../ui/Button'
import { formatViews } from '../../lib/utils'
import { getMediaUrl } from '../../lib/media'
import { likeService, subscriptionService } from '../../services/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuth } from '../../context/AuthContext'

export default function ShortsPlayer({ video, isActive, onTogglePlay }) {
    const videoRef = useRef(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isMuted, setIsMuted] = useState(false) // Default to unmuted usually, but maybe start muted for autoplay policy? User pref?
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
                    await videoRef.current.play()
                } catch (e) {
                    // Autoplay barred, try muted
                    console.log("Autoplay blocked, attempting muted fallback")
                    setIsMuted(true)
                    if (videoRef.current) {
                        videoRef.current.muted = true
                        try {
                            await videoRef.current.play()
                        } catch (e) {
                            console.log("Muted autoplay also failed", e)
                        }
                    }
                }
            }
            playVideo()
        } else {
            if (videoRef.current) {
                videoRef.current.pause()
                videoRef.current.currentTime = 0
            }
        }
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

    const handleLike = (e) => {
        e.stopPropagation()
        if (!user) return toast.error("Login to like")
        likeMutation.mutate()
    }

    const handleSubscribe = (e) => {
        e.stopPropagation()
        if (!user) return toast.error("Login to subscribe")
        subscribeMutation.mutate()
    }

    return (
        <div className="relative w-full h-full flex justify-center bg-black snap-center shrink-0">
            {/* Aspect Ratio Container: 9:16 max width */}
            <div className="relative h-full aspect-[9/16] group">
                {!error ? (
                    <video
                        ref={videoRef}
                        src={getMediaUrl(video.videoFile)}
                        poster={getMediaUrl(video.thumbnail)}
                        className="w-full h-full object-cover cursor-pointer"
                        loop
                        playsInline
                        onClick={togglePlay}
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

                {/* Play/Pause Center Icon */}
                {!isPlaying && !error && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                        <div className="p-4 bg-black/40 rounded-full text-white backdrop-blur-sm">
                            <Play className="w-8 h-8 fill-current" />
                        </div>
                    </div>
                )}

                {/* Top Controls */}
                <div className="absolute top-4 right-4 flex gap-4 z-20">
                    {/* Mute Button */}
                    <button onClick={toggleMute} className="p-2 bg-black/40 rounded-full text-white backdrop-blur-sm hover:bg-black/60 transition-colors">
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    {/* More Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="p-2 bg-black/40 rounded-full text-white backdrop-blur-sm hover:bg-black/60 transition-colors">
                                <MoreVertical className="w-5 h-5" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 glass-panel border-white/5 text-white bg-black/60 backdrop-blur-xl rounded-xl shadow-premium">
                            <ReportDialog targetType="VIDEO" targetId={video._id} trigger={
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="hover:bg-white/10 cursor-pointer focus:bg-white/10 focus:text-white py-3">
                                    <Flag className="w-4 h-4 mr-3" /> Report
                                </DropdownMenuItem>
                            } />
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Right Side Actions */}
                <div className="absolute bottom-20 right-2 flex flex-col gap-6 items-center z-20">
                    <div className="flex flex-col items-center gap-1">
                        <button
                            onClick={handleLike}
                            className={`p-3 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors ${video.isLiked ? 'text-blue-500' : 'text-white'}`}
                        >
                            <ThumbsUp className={`w-6 h-6 ${video.isLiked ? 'fill-current' : ''}`} />
                        </button>
                        <span className="text-white text-xs font-bold">{formatViews(video.likesCount, true)}</span>
                    </div>

                    <div className="flex flex-col items-center gap-1">
                        <button className="p-3 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors text-white">
                            <ThumbsDown className="w-6 h-6" />
                        </button>
                        <span className="text-white text-xs font-bold">Dislike</span>
                    </div>

                    <div className="flex flex-col items-center gap-1">
                        <Link
                            to={`/watch/${video._id}`}
                            className="p-3 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors text-white"
                        >
                            <MessageSquare className="w-6 h-6" />
                        </Link>
                        <span className="text-white text-xs font-bold">{formatViews(video.commentsCount, true)}</span>
                    </div>

                    <div className="flex flex-col items-center gap-1">
                        <button className="p-3 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors text-white">
                            <Share2 className="w-6 h-6" />
                        </button>
                        <span className="text-white text-xs font-bold">Share</span>
                    </div>

                    <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-white/20">
                        <img src={getMediaUrl(video.thumbnail)} alt="cover" className="w-full h-full object-cover" />
                    </div>
                </div>

                {/* Bottom Info Overlay */}
                <div className="absolute bottom-4 left-4 right-16 z-20 text-white flex flex-col gap-3">
                    {/* Channel Info */}
                    <div className="flex items-center gap-3">
                        <Link to={`/@${video?.owner?.username}`} className="flex-shrink-0">
                            <Avatar src={getMediaUrl(video?.owner?.avatar)} fallback={video?.owner?.username?.[0]} size="md" className="border border-white/20" />
                        </Link>
                        <Link to={`/@${video?.owner?.username}`} className="font-bold hover:underline shadow-black drop-shadow-md">
                            @{video?.owner?.username}
                        </Link>
                        <Button
                            variant={video?.isSubscribed ? "secondary" : "default"} // Use default white/black or branding
                            size="sm"
                            className={`h-8 px-4 rounded-full font-bold ml-2 ${!video?.isSubscribed ? 'bg-white text-black hover:bg-white/90' : 'bg-black/40 text-white hover:bg-black/60 backdrop-blur-md'}`}
                            onClick={handleSubscribe}
                        >
                            {video?.isSubscribed ? "Subscribed" : "Subscribe"}
                        </Button>
                    </div>

                    {/* Title */}
                    <div className="line-clamp-2 text-sm font-medium drop-shadow-md">
                        {video.title}
                    </div>
                </div>
            </div>
        </div>
    )
}
