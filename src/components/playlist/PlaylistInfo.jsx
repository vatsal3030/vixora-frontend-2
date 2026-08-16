import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CompositeThumbnail } from './CompositeThumbnail'
import { Button } from '../ui/Button'
import { Play, Shuffle, MoreVertical, Share2, Edit2, Trash2, Globe, Lock, Link as LinkIcon, Download } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../ui/DropdownMenu'
import { formatDistanceToNow } from 'date-fns'
import { cn, formatViews } from '../../lib/utils'
import { ShareDialog } from '../common/ShareDialog'
import { getMediaUrl } from '../../lib/media'

export function PlaylistInfo({ playlist, onEdit, onDelete, onShare, isOwner }) {
    const navigate = useNavigate()
    const { _id, id, name, description, items, videos: aliasVideos, videoCount, isPublic, privacy, updatedAt, owner } = playlist
    const rawVideos = items || aliasVideos || []
    const videos = rawVideos.map(v => v?.video || v)
    const playlistId = _id || id
    const [isDescExpanded, setIsDescExpanded] = useState(false)
    const [shareOpen, setShareOpen] = useState(false)

    const isPublicVisibility = isPublic !== undefined ? isPublic : privacy === 'public'
    const totalCount = videoCount ?? videos.length
    const totalViews = videos.reduce((acc, v) => acc + (v.views || 0), 0)

    const getFirstVideoId = () => {
        if (videos.length === 0) return null
        const v = videos[0]
        return v?._id || v?.id || (typeof v === 'string' ? v : null)
    }

    const handlePlayAll = (shuffle = false) => {
        if (videos.length === 0) return
        let vidId = getFirstVideoId()
        if (shuffle && videos.length > 1) {
            const randomIndex = Math.floor(Math.random() * videos.length)
            const randomVideo = videos[randomIndex]
            vidId = randomVideo?._id || randomVideo?.id || vidId
        }
        if (vidId) {
            navigate(`/watch/${vidId}?list=${playlistId}${shuffle ? '&shuffle=1' : ''}`)
        }
    }

    return (
        <div className="flex flex-col gap-5 md:sticky md:top-24 h-fit bg-gradient-to-b from-white/[0.08] to-transparent p-5 md:p-6 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl">
            {/* Thumbnail */}
            <div className="relative aspect-video rounded-2xl overflow-hidden group shadow-2xl border border-white/10">
                <CompositeThumbnail
                    videos={videos}
                    videoCount={totalCount}
                    className="w-full h-full object-cover opacity-100 group-hover:opacity-90 transition-opacity"
                    showOverlay={false}
                />

                {videos.length > 0 && (
                    <button
                        onClick={() => handlePlayAll(false)}
                        className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]"
                    >
                        <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider bg-black/80 border border-white/20 px-5 py-2.5 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-transform">
                            <Play className="w-4 h-4 fill-white" />
                            Play All
                        </div>
                    </button>
                )}
            </div>

            {/* Title & Metadata */}
            <div className="space-y-3.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight font-display tracking-tight">
                    {name}
                </h1>

                <div className="flex flex-col gap-1.5 text-xs text-zinc-400">
                    <Link
                        to={`/@${owner?.username}`}
                        className="font-bold text-sm text-white hover:text-primary transition-colors inline-flex items-center gap-1.5"
                    >
                        {owner?.fullName || owner?.username || 'You'}
                    </Link>

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-zinc-400">
                        <span className="font-semibold text-zinc-300">{totalCount} videos</span>
                        <span>•</span>
                        <span>{formatViews(totalViews)}</span>
                        <span>•</span>
                        <span>Updated {updatedAt ? formatDistanceToNow(new Date(updatedAt), { addSuffix: true }) : 'recently'}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-zinc-400 mt-1">
                        {isPublicVisibility ? (
                            <Globe className="w-3.5 h-3.5" />
                        ) : (
                            <Lock className="w-3.5 h-3.5" />
                        )}
                        <span className="font-medium">{isPublicVisibility ? 'Public' : 'Private'}</span>
                    </div>
                </div>

                {/* Prominent Action Buttons (YouTube Style: Play all & Shuffle) */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <Button
                        onClick={() => handlePlayAll(false)}
                        disabled={videos.length === 0}
                        className="bg-white text-black hover:bg-white/90 rounded-full font-bold text-xs h-10 shadow-lg flex items-center justify-center gap-2"
                    >
                        <Play className="w-4 h-4 fill-current" />
                        Play all
                    </Button>

                    <Button
                        onClick={() => handlePlayAll(true)}
                        disabled={videos.length === 0}
                        variant="secondary"
                        className="bg-white/10 hover:bg-white/20 text-white rounded-full font-bold text-xs h-10 border border-white/10 shadow-md flex items-center justify-center gap-2"
                    >
                        <Shuffle className="w-4 h-4" />
                        Shuffle
                    </Button>
                </div>

                {/* Secondary Actions (Share / Menu) */}
                <div className="flex items-center justify-between pt-1 border-t border-white/5">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShareOpen(true)}
                        className="rounded-full text-zinc-300 hover:text-white hover:bg-white/10 text-xs gap-1.5 h-9"
                    >
                        <Share2 className="w-4 h-4" />
                        Share
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full text-zinc-400 hover:text-white hover:bg-white/10 w-9 h-9">
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 glass-panel border-white/10 text-white bg-[#1a1a1a]/95 backdrop-blur-xl rounded-xl shadow-2xl p-1">
                            {isOwner && (
                                <>
                                    <DropdownMenuItem onClick={() => onEdit && onEdit(playlist)} className="hover:bg-white/10 cursor-pointer focus:bg-white/10 focus:text-white rounded-lg">
                                        <Edit2 className="w-4 h-4 mr-3" />
                                        Edit playlist
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onDelete && onDelete(playlist)} className="text-red-500 focus:text-red-500 hover:bg-white/5 cursor-pointer rounded-lg">
                                        <Trash2 className="w-4 h-4 mr-3" />
                                        Delete playlist
                                    </DropdownMenuItem>
                                </>
                            )}
                            <DropdownMenuItem disabled className="text-zinc-500">
                                <Download className="w-4 h-4 mr-3" />
                                Download
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Description */}
                {description && (
                    <div
                        className={cn("text-xs text-zinc-400 bg-white/5 p-3.5 rounded-2xl cursor-pointer hover:bg-white/[0.08] transition-colors border border-white/5", !isDescExpanded && "line-clamp-3")}
                        onClick={() => setIsDescExpanded(!isDescExpanded)}
                    >
                        <p className="whitespace-pre-wrap">{description}</p>
                    </div>
                )}
            </div>

            <ShareDialog
                open={shareOpen}
                onOpenChange={setShareOpen}
                title={name}
                url={`${window.location.origin}/playlist/${playlistId}`}
            />
        </div>
    )
}
