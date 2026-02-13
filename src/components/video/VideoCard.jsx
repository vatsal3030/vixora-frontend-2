import { Link } from 'react-router-dom'
import { MoreVertical, CheckCircle2, Ban, EyeOff, Save, Share2, Pencil, Trash2, Eye, VolumeX, Volume2, Clock, MoreHorizontal } from 'lucide-react'
import { Avatar } from '../ui/Avatar'
import { formatDuration, formatViews, formatTimeAgo } from '../../lib/utils'
import { getMediaUrl } from '../../lib/media'
import { AddToPlaylistDialog } from '../playlist/AddToPlaylistDialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "../ui/DropdownMenu"
import { toast } from 'sonner'
import { useState, useRef, useEffect } from 'react'
import { cn } from '../../lib/utils'

export function VideoCard({ video, type = 'default', showEditButton = false, onDelete, onTogglePublish }) {
    const [isHidden, setIsHidden] = useState(false)
    const [showPreview, setShowPreview] = useState(false)
    const [isMuted, setIsMuted] = useState(true)
    const [isPlaying, setIsPlaying] = useState(false)
    const hoverTimeoutRef = useRef(null)
    const videoRef = useRef(null)

    // Stable badges - computed once on mount using useState initializer
    const [isNew] = useState(() => {
        if (!video?.createdAt) return false
        const weekAgo = Date.now() - 1000 * 60 * 60 * 24 * 7
        return new Date(video.createdAt).getTime() > weekAgo
    })
    const progress = video?.watchProgress || 0 // Use actual progress if available

    // Playback Logic
    useEffect(() => {
        let isCancelled = false

        const playVideo = async () => {
            if (showPreview && videoRef.current) {
                try {
                    videoRef.current.muted = true
                    videoRef.current.volume = 0 // Extra safety measure

                    // Resume from progress (if applicable)
                    // We only set this if we are just starting to show preview
                    if (progress > 0 && video.duration && !isPlaying) {
                        const startTime = (progress / 100) * video.duration
                        if (startTime < video.duration - 1) {
                            videoRef.current.currentTime = startTime
                        }
                    }

                    // Must use await to catch play() errors properly
                    await videoRef.current.play()

                    if (!isCancelled) {
                        setIsPlaying(true)
                    }
                } catch (error) {
                    if (!isCancelled) {
                        // Ignore AbortError which happens on rapid hover/unhover
                        if (error.name !== 'AbortError') {
                            console.error("Autoplay failed:", error)
                        }
                        // Don't hide preview immediately on error to avoid flickering, 
                        // just let the thumbnail stay visible (isPlaying remains false)
                    }
                }
            } else if (!showPreview && videoRef.current) {
                setIsPlaying(false) // Reset state immediately
                videoRef.current.pause()
                videoRef.current.currentTime = 0
            }
        }

        playVideo()

        return () => {
            isCancelled = true
        }
    }, [showPreview, progress, video?.duration, isPlaying])



    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
        }
    }, [])

    const handleMouseEnter = () => {
        hoverTimeoutRef.current = setTimeout(() => {
            setShowPreview(true)
        }, 500) // 500ms delay as requested
    }

    const handleMouseLeave = () => {
        setIsPlaying(false)
        setShowPreview(false)
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
        if (videoRef.current) {
            videoRef.current.pause()
            videoRef.current.currentTime = 0
        }
    }

    const toggleMute = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsMuted(!isMuted)
        if (videoRef.current) {
            videoRef.current.muted = !isMuted
        }
    }

    const handleWatchLater = (e) => {
        e.preventDefault()
        e.stopPropagation()
        toast.success("Added to Watch Later")
        // Trigger actual logic here if available
    }

    if (!video || isHidden) return null

    const handleNotInterested = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsHidden(true)
        toast.success("Video hidden", {
            description: "We'll tune your recommendations."
        })
    }

    const handleBlockChannel = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsHidden(true)
        toast.success(`Channel blocked`, {
            description: `You won't see videos from ${video.owner?.username} again.`
        })
    }

    const isCompact = type === 'compact'


    // Playback Logic


    if (isCompact) {
        return (
            <div
                className="group flex gap-3 cursor-pointer"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {/* Thumbnail */}
                <Link to={`/watch/${video.id || video._id}`} className="relative min-w-[168px] w-[168px] aspect-video rounded-xl overflow-hidden bg-muted/20 flex-shrink-0 group-hover:scale-105 transition-transform duration-300 origin-center z-10">
                    <img
                        src={getMediaUrl(video.thumbnail)}
                        alt={video.title}
                        className={`w-full h-full object-cover transition-opacity duration-300 ${isPlaying ? 'opacity-0' : 'opacity-100'}`}
                        loading="lazy"
                    />

                    {showPreview && (
                        <video
                            ref={videoRef}
                            src={getMediaUrl(video.videoUrl || video.videoFile)}
                            className="absolute inset-0 w-full h-full object-cover animate-in fade-in duration-300"
                            muted={true}
                            playsInline
                            loop
                            preload="metadata"
                            onPlaying={() => setIsPlaying(true)}
                        />
                    )}

                    {!showPreview && (
                        <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
                            {formatDuration(video.duration)}
                        </div>
                    )}
                </Link>

                {/* Info */}
                <div className="flex flex-col min-w-0 pr-6 relative flex-1">
                    <Link to={`/watch/${video.id || video._id}`}>
                        <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors mb-1">
                            {video.title}
                        </h3>
                    </Link>

                    <Link to={`/@${video.owner?.username}`} className="text-xs text-muted-foreground hover:text-foreground transition-colors mb-1">
                        {video.owner?.fullName || video.owner?.username}
                    </Link>

                    <div className="text-xs text-muted-foreground">
                        {formatViews(video.views)} • {formatTimeAgo(video.createdAt)}
                    </div>

                    {/* Menu */}
                    <div className="absolute top-0 right-0">
                        <VideoMenu
                            videoId={video.id || video._id}
                            title={video.title}
                            video={video}
                            onNotInterested={handleNotInterested}
                            onBlock={handleBlockChannel}
                            showEditButton={showEditButton}
                            onDelete={onDelete}
                            onTogglePublish={onTogglePublish}
                        />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div
            className="group flex flex-col gap-3 cursor-pointer relative glass-card rounded-xl p-2"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Thumbnail Container */}
            <Link to={`/watch/${video.id || video._id}`} className="relative aspect-video rounded-xl overflow-hidden bg-muted/20 shadow-glass hover:shadow-glass-hover transition-all duration-300 z-10 block ring-0 outline-none">
                <img
                    src={getMediaUrl(video.thumbnail)}
                    alt={video.title}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${isPlaying ? 'opacity-0' : 'opacity-100'}`}
                    loading="lazy"
                />

                {/* Video Preview */}
                {showPreview && (
                    <video
                        ref={videoRef}
                        src={getMediaUrl(video.videoUrl || video.videoFile)}
                        className="absolute inset-0 w-full h-full object-cover animate-in fade-in duration-300"
                        muted={true}
                        playsInline
                        loop
                        preload="metadata"
                        onPlaying={() => setIsPlaying(true)}
                        onError={(e) => {
                            console.error("Video load error:", e)
                            setIsPlaying(false)
                        }}
                    />
                )}

                {/* Overlays */}
                <div className={cn("absolute inset-0 flex flex-col justify-between p-2 transition-opacity duration-300 bg-black/10 hover:bg-black/0", showPreview ? "opacity-100" : "opacity-0 group-hover:opacity-100")}>

                    {/* Dark gradient overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                    {/* Top Right Quick Actions */}
                    <div className={cn("flex justify-end gap-1.5 transition-all duration-300 z-20", showPreview ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0")}>
                        <button
                            onClick={toggleMute}
                            className="p-1.5 glass-btn rounded-full text-white"
                            title={isMuted ? "Unmute" : "Mute"}
                        >
                            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={handleWatchLater}
                            className="p-1.5 glass-btn rounded-full text-white"
                            title="Watch Later"
                        >
                            <Clock className="w-4 h-4" />
                        </button>

                        <div onClick={e => e.stopPropagation()}>
                            <VideoMenu
                                videoId={video.id || video._id}
                                title={video.title}
                                video={video}
                                onNotInterested={handleNotInterested}
                                onBlock={handleBlockChannel}
                                showEditButton={showEditButton}
                                onDelete={onDelete}
                                onTogglePublish={onTogglePublish}
                                trigger={
                                    <button className="p-1.5 glass-btn rounded-full text-white">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                }
                            />
                        </div>
                    </div>

                    {/* Bottom Info Badges */}
                    <div className="flex items-end justify-between mt-auto w-full z-20">
                        <div className="flex flex-wrap gap-1">
                            {/* Live/New Badges can go here */}
                            {isNew && <span className="glass-badge active text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">NEW</span>}
                        </div>

                        <div className="flex flex-col gap-1 items-end">
                            <span className="glass text-white text-xs font-medium px-1.5 py-0.5 rounded shadow-sm">
                                {formatDuration(video.duration)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Watch Progress */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20">
                    <div className="h-full bg-red-600" style={{ width: `${progress}%` }}></div>
                </div>
            </Link>

            {/* Info */}
            <div className="flex gap-3 items-start pr-4 relative">
                <Link to={`/@${video.owner?.username}`}>
                    <Avatar
                        src={getMediaUrl(video.owner?.avatar)}
                        fallback={video.owner?.username}
                        size="sm"
                        className="mt-0.5"
                    />
                </Link>

                <div className="flex-1 min-w-0">
                    <Link to={`/watch/${video.id || video._id}`}>
                        <h3 className="text-base font-bold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors duration-300">
                            {video.title}
                        </h3>
                    </Link>

                    <div className="flex items-center flex-wrap gap-1 mt-1 text-sm text-muted-foreground w-full">
                        <Link to={`/@${video.owner?.username}`} className="hover:text-foreground transition-colors truncate max-w-[200px] flex items-center gap-1">
                            {video.owner?.fullName || video.owner?.username}
                            <CheckCircle2 className="w-3 h-3 text-muted-foreground fill-black" />
                        </Link>
                    </div>

                    <div className="text-sm text-muted-foreground mt-0.5">
                        {formatViews(video.views)} • {formatTimeAgo(video.createdAt)}
                    </div>
                </div>

                {/* Fallback Menu for non-hover users or quick access */}
                <div className="flex-shrink-0 -mt-1 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 md:hidden">
                    <VideoMenu
                        videoId={video.id || video._id}
                        title={video.title}
                        video={video}
                        onNotInterested={handleNotInterested}
                        onBlock={handleBlockChannel}
                        showEditButton={showEditButton}
                        onDelete={onDelete}
                        onTogglePublish={onTogglePublish}
                        trigger={
                            <button className="p-1.5 hover:bg-secondary rounded-full">
                                <MoreVertical className="w-4 h-4" />
                            </button>
                        }
                    />
                </div>
            </div>
        </div>
    )
}

function VideoMenu({ videoId, title, video, onNotInterested, onBlock, showEditButton, onDelete, onTogglePublish, trigger }) {
    if (showEditButton) {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    {trigger || (
                        <button className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity p-1.5 hover:bg-secondary rounded-full outline-none text-muted-foreground hover:text-foreground">
                            <MoreVertical className="w-4 h-4" />
                        </button>
                    )}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <Link to={`/video/${videoId}/edit`}>
                        <DropdownMenuItem>
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit Video
                        </DropdownMenuItem>
                    </Link>

                    {onTogglePublish && (
                        <DropdownMenuItem onClick={() => onTogglePublish(videoId)}>
                            {video?.isPublished ? (
                                <>
                                    <EyeOff className="w-4 h-4 mr-2" />
                                    Unpublish
                                </>
                            ) : (
                                <>
                                    <Eye className="w-4 h-4 mr-2" />
                                    Publish
                                </>
                            )}
                        </DropdownMenuItem>
                    )}

                    <DropdownMenuItem onClick={() => navigator.share({ title: title, url: window.location.origin + '/watch/' + videoId }).catch(() => { })}>
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {trigger || (
                    <button className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity p-1.5 hover:bg-secondary rounded-full outline-none text-muted-foreground hover:text-foreground">
                        <MoreVertical className="w-4 h-4" />
                    </button>
                )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <AddToPlaylistDialog videoId={videoId}>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Save className="w-4 h-4 mr-2" />
                        Save to Playlist
                    </DropdownMenuItem>
                </AddToPlaylistDialog>

                <DropdownMenuItem onClick={() => navigator.share({ title: title, url: window.location.origin + '/watch/' + videoId }).catch(() => { })}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.success("Added to Watch Later")}>
                    <Clock className="w-4 h-4 mr-2" />
                    Save to Watch Later
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={onNotInterested}>
                    <EyeOff className="w-4 h-4 mr-2" />
                    Not interested
                </DropdownMenuItem>

                <DropdownMenuItem onClick={onBlock} className="text-destructive focus:text-destructive">
                    <Ban className="w-4 h-4 mr-2" />
                    Block channel
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
