import { Link } from 'react-router-dom'
import {
    MoreVertical, CheckCircle2, Ban, EyeOff, Save, Share2,
    Pencil, Trash2, Eye, VolumeX, Volume2, Clock, Flag, Info
} from 'lucide-react'
import { useMiniPlayer } from '../../context/MiniPlayerContext'
import { Avatar } from '../ui/Avatar'
import { formatDuration, formatViews, formatTimeAgo } from '../../lib/utils'
import { getMediaUrl } from '../../lib/media'
import { AddToPlaylistDialog } from '../playlist/AddToPlaylistDialog'
import { ShareDialog } from '../common/ShareDialog'
import { ReportDialog } from '../common/ReportDialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "../ui/DropdownMenu"
import { toast } from 'sonner'
import { useState, useRef, useEffect, useCallback, memo } from 'react'
import { videoService, feedbackService } from '../../services/api'

const THUMBNAIL_FALLBACK = 'data:image/svg+xml,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180"><rect fill="#1a1a2e" width="320" height="180"/><polygon fill="#ffffff20" points="140,65 140,115 180,90"/></svg>'
)

export const VideoCard = memo(function VideoCard({
    video, type = 'default', showEditButton = false, onDelete, onTogglePublish
}) {
    const { openPlayer } = useMiniPlayer()
    const [isHovered, setIsHovered] = useState(false)
    const [isHidden, setIsHidden] = useState(false)
    const [isMuted, setIsMuted] = useState(true)
    const [previewUrl, setPreviewUrl] = useState(null)   // fetched video URL
    const [isFetchingUrl, setIsFetchingUrl] = useState(false)

    const videoRef = useRef(null)
    const hoverTimerRef = useRef(null)
    const cachedUrlRef = useRef(null)  // never re-fetch the same card
    const isUnmountedRef = useRef(false)

    const videoId = video?.id || video?._id
    const progress = video?.watchProgress || 0

    // If the list response already includes a videoFile/videoUrl, use it directly
    const listVideoSrc = getMediaUrl(video?.videoUrl || video?.videoFile || video?.video)

    useEffect(() => () => {
        isUnmountedRef.current = true
        clearTimeout(hoverTimerRef.current)
    }, [])

    // ── Fetch the streaming URL on first hover ────────────────────────────────
    const fetchPreviewUrl = useCallback(async () => {
        // Already have it
        if (cachedUrlRef.current) {
            setPreviewUrl(cachedUrlRef.current)
            return
        }
        // List response already supplied the URL
        if (listVideoSrc) {
            cachedUrlRef.current = listVideoSrc
            setPreviewUrl(listVideoSrc)
            return
        }
        // Fetch from API
        if (isFetchingUrl || !videoId) return
        setIsFetchingUrl(true)
        try {
            const res = await videoService.getVideo(videoId)
            const data = res?.data?.data
            const url = getMediaUrl(data?.videoFile || data?.videoUrl || data?.video)
            if (!isUnmountedRef.current && url) {
                cachedUrlRef.current = url
                setPreviewUrl(url)
            }
        } catch {
            // silent — preview just won't play
        } finally {
            if (!isUnmountedRef.current) setIsFetchingUrl(false)
        }
    }, [videoId, listVideoSrc, isFetchingUrl])

    // ── Play / pause the <video> ref when hover or URL changes ───────────────
    useEffect(() => {
        const el = videoRef.current
        if (!el || !previewUrl) return

        if (isHovered) {
            el.src = previewUrl
            el.muted = isMuted
            el.currentTime = 0
            const p = el.play()
            if (p instanceof Promise) {
                p.catch(() => {
                    // One retry
                    setTimeout(() => {
                        if (!isUnmountedRef.current && el.paused) el.play().catch(() => { })
                    }, 200)
                })
            }
        } else {
            el.pause()
            el.currentTime = 0
        }
    }, [isHovered, previewUrl]) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (videoRef.current) videoRef.current.muted = isMuted
    }, [isMuted])

    // ── Hover handlers ────────────────────────────────────────────────────────
    const handleMouseEnter = () => {
        if (window.matchMedia && !window.matchMedia('(hover: hover)').matches) return
        clearTimeout(hoverTimerRef.current)
        hoverTimerRef.current = setTimeout(() => {
            setIsHovered(true)
            fetchPreviewUrl()
        }, 300)
    }

    const handleMouseLeave = () => {
        clearTimeout(hoverTimerRef.current)
        setIsHovered(false)
    }

    const toggleMute = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsMuted(p => !p)
    }

    const handleNotInterested = async () => {
        setIsHidden(true)
        toast.success('Video hidden', {
            description: "Tap Undo to restore.",
            action: {
                label: 'Undo', onClick: async () => {
                    setIsHidden(false)
                    try { await feedbackService.removeNotInterested(videoId) } catch (err) { console.error(err) }
                }
            }
        })
        try { await feedbackService.markNotInterested(videoId) } catch (err) { console.error(err) }
    }
    const handleBlockChannel = async () => {
        setIsHidden(true)
        const channelId = video.owner?.id || video.owner?._id
        toast.success('Channel hidden', {
            description: `You won't see videos from ${video.owner?.username} again.`,
            action: {
                label: 'Undo', onClick: async () => {
                    setIsHidden(false)
                    try { if (channelId) await feedbackService.unblockChannel(channelId) } catch (err) { console.error(err) }
                }
            }
        })
        try { if (channelId) await feedbackService.blockChannel(channelId) } catch (err) { console.error(err) }
    }

    if (!video || isHidden) return null

    const isCompact = type === 'compact'

    // ── COMPACT ───────────────────────────────────────────────────────────────
    if (isCompact) {
        return (
            <div className="group flex gap-3 cursor-pointer" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                <Link to={`/watch/${videoId}`} className="relative min-w-[168px] w-[168px] aspect-video rounded-xl overflow-hidden bg-muted/20 flex-shrink-0 transition-transform duration-300 group-hover:scale-[1.02]">
                    <img
                        src={getMediaUrl(video.thumbnail)} alt={video.title}
                        className={`w-full h-full object-cover transition-opacity duration-300 ${isHovered && previewUrl ? 'opacity-0' : 'opacity-100'}`}
                        loading="lazy" decoding="async" onError={e => { e.target.src = THUMBNAIL_FALLBACK }}
                    />
                    <video
                        ref={videoRef}
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isHovered && previewUrl ? 'opacity-100' : 'opacity-0'}`}
                        muted playsInline loop preload="none"
                    />
                    <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
                        {formatDuration(video.duration)}
                    </div>
                    {isHovered && previewUrl && (
                        <div className="absolute top-1.5 right-1.5 flex flex-col gap-1.5 z-10">
                            <button onClick={toggleMute} className="p-1 bg-black/60 hover:bg-black/80 rounded-full text-white">
                                {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                            </button>
                            <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); openPlayer(video) }}
                                className="p-1 bg-black/60 hover:bg-black/80 rounded-full text-white"
                                title="Open in Mini Player"
                            >
                                <Info className="w-3 h-3" />
                            </button>
                        </div>
                    )}
                    {progress > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/20">
                            <div className="h-full bg-red-600" style={{ width: `${progress}%` }} />
                        </div>
                    )}
                </Link>
                <div className="flex flex-col min-w-0 flex-1 relative pr-6">
                    <Link to={`/watch/${videoId}`}>
                        <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-tight mb-1">{video.title}</h3>
                    </Link>
                    <Link to={`/@${video.owner?.username}`} className="text-xs text-muted-foreground hover:text-foreground transition-colors mb-0.5 truncate">
                        {video.owner?.fullName || video.owner?.username}
                    </Link>
                    <div className="text-xs text-muted-foreground">{formatViews(video.views)} • {formatTimeAgo(video.createdAt)}</div>
                    <div className="absolute top-0 right-0">
                        <VideoMenu videoId={videoId} title={video.title} video={video} onNotInterested={handleNotInterested} onBlock={handleBlockChannel} showEditButton={showEditButton} onDelete={onDelete} onTogglePublish={onTogglePublish} />
                    </div>
                </div>
            </div>
        )
    }

    // ── DEFAULT — YouTube-style grid card ─────────────────────────────────────
    return (
        <div className="group flex flex-col cursor-pointer" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>

            {/* Thumbnail + video container */}
            <Link to={`/watch/${videoId}`} className="relative aspect-video rounded-xl overflow-hidden bg-muted/20 block">

                {/* Thumbnail */}
                <img
                    src={getMediaUrl(video.thumbnail)} alt={video.title}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isHovered && previewUrl ? 'opacity-0' : 'opacity-100'}`}
                    loading="lazy" decoding="async" onError={e => { e.target.src = THUMBNAIL_FALLBACK }}
                />

                {/* Video element — always mounted, src set imperatively on hover */}
                <video
                    ref={videoRef}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isHovered && previewUrl ? 'opacity-100' : 'opacity-0'}`}
                    muted playsInline loop preload="none"
                />

                {/* Fetching indicator */}
                {isHovered && isFetchingUrl && !previewUrl && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                )}

                {/* Mute + Info toggle */}
                {isHovered && previewUrl && (
                    <div className="absolute top-2 right-2 flex flex-col gap-2 z-10">
                        <button onClick={toggleMute} className="p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors">
                            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        </button>
                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); openPlayer(video) }}
                            className="p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors"
                            title="Open in Mini Player"
                        >
                            <Info className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}

                {/* Duration badge */}
                <div className={`absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[11px] font-medium px-1.5 py-[2px] rounded transition-opacity duration-200 ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
                    {formatDuration(video.duration)}
                </div>

                {/* Watch progress */}
                {progress > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/20">
                        <div className="h-full bg-red-600" style={{ width: `${progress}%` }} />
                    </div>
                )}
            </Link>

            {/* Info row: avatar | title + channel + meta | three-dots */}
            <div className="flex gap-3 mt-3 items-start">
                <Link to={`/@${video.owner?.username}`} className="flex-shrink-0 mt-0.5">
                    <Avatar src={getMediaUrl(video.owner?.avatar)} fallback={video.owner?.username} size="sm" />
                </Link>

                <div className="flex-1 min-w-0">
                    <Link to={`/watch/${videoId}`}>
                        <h3 className="text-[0.9rem] font-semibold text-foreground line-clamp-2 leading-snug mb-1">{video.title}</h3>
                    </Link>
                    <Link to={`/@${video.owner?.username}`} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <span className="truncate">{video.owner?.fullName || video.owner?.username}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                    </Link>
                    <div className="text-sm text-muted-foreground mt-0.5">
                        {formatViews(video.views)} • {formatTimeAgo(video.createdAt)}
                    </div>
                </div>

                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity -mt-0.5">
                    <VideoMenu videoId={videoId} title={video.title} video={video} onNotInterested={handleNotInterested} onBlock={handleBlockChannel} showEditButton={showEditButton} onDelete={onDelete} onTogglePublish={onTogglePublish} />
                </div>
            </div>
        </div>
    )
}, (prev, next) => {
    return (prev.video?._id || prev.video?.id) === (next.video?._id || next.video?.id)
        && prev.type === next.type
        && prev.showEditButton === next.showEditButton
})

// ─── Three-dot menu ───────────────────────────────────────────────────────────
function VideoMenu({ videoId, title, video, onNotInterested, onBlock, showEditButton, onDelete, onTogglePublish, trigger }) {
    const defaultTrigger = (
        <button className="p-1.5 hover:bg-secondary rounded-full outline-none text-muted-foreground hover:text-foreground transition-colors">
            <MoreVertical className="w-4 h-4" />
        </button>
    )

    if (showEditButton) {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>{trigger || defaultTrigger}</DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <Link to={`/video/${videoId}/edit`}>
                        <DropdownMenuItem><Pencil className="w-4 h-4 mr-2" />Edit Video</DropdownMenuItem>
                    </Link>
                    {onTogglePublish && (
                        <DropdownMenuItem onClick={() => onTogglePublish(videoId)}>
                            {video?.isPublished
                                ? <><EyeOff className="w-4 h-4 mr-2" />Unpublish</>
                                : <><Eye className="w-4 h-4 mr-2" />Publish</>
                            }
                        </DropdownMenuItem>
                    )}
                    <ShareDialog title={title} url={`${window.location.origin}/watch/${videoId}`} trigger={
                        <DropdownMenuItem onSelect={e => e.preventDefault()}><Share2 className="w-4 h-4 mr-2" />Share</DropdownMenuItem>
                    } />
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" />Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>{trigger || defaultTrigger}</DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <AddToPlaylistDialog videoId={videoId}>
                    <DropdownMenuItem onSelect={e => e.preventDefault()}><Save className="w-4 h-4 mr-2" />Save to Playlist</DropdownMenuItem>
                </AddToPlaylistDialog>
                <DropdownMenuItem onClick={() => toast.success("Added to Watch Later")}>
                    <Clock className="w-4 h-4 mr-2" />Save to Watch Later
                </DropdownMenuItem>
                <ShareDialog title={title} url={`${window.location.origin}/watch/${videoId}`} trigger={
                    <DropdownMenuItem onSelect={e => e.preventDefault()}><Share2 className="w-4 h-4 mr-2" />Share</DropdownMenuItem>
                } />
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onNotInterested}><EyeOff className="w-4 h-4 mr-2" />Not interested</DropdownMenuItem>
                <DropdownMenuItem onClick={onBlock} className="text-destructive focus:text-destructive">
                    <Ban className="w-4 h-4 mr-2" />Block channel
                </DropdownMenuItem>
                <ReportDialog targetType="VIDEO" targetId={videoId} trigger={
                    <DropdownMenuItem onSelect={e => e.preventDefault()} className="text-orange-400 focus:text-orange-400">
                        <Flag className="w-4 h-4 mr-2" />Report
                    </DropdownMenuItem>
                } />
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
