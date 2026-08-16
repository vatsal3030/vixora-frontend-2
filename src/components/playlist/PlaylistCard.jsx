import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MoreVertical, Play, Globe, Lock, Trash2, Edit2, Share2, Flag, ListVideo, Shuffle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Button } from '../ui/Button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../ui/DropdownMenu'
import { ReportDialog } from '../common/ReportDialog'
import { ShareDialog } from '../common/ShareDialog'
import { playlistService } from '../../services/api'
import { getMediaUrl } from '../../lib/media'
import { toast } from 'sonner'

export function PlaylistCard({ playlist, onEdit, onDelete, onShare }) {
    const navigate = useNavigate()
    const { _id, id, name, videos = [], items = [], videoCount, isPublic, updatedAt } = playlist
    const playlistId = _id || id
    const allVideos = (items && items.length > 0) ? items : (videos || [])
    const count = videoCount ?? allVideos.length ?? 0

    const [shareOpen, setShareOpen] = useState(false)
    const [reportOpen, setReportOpen] = useState(false)
    const [isPlayingAll, setIsPlayingAll] = useState(false)

    const getFirstVideoId = (videoList) => {
        if (!videoList || videoList.length === 0) return null
        const first = videoList[0]
        const video = first?.video || first
        return video?._id || video?.id || (typeof video === 'string' ? video : null)
    }

    const handlePlayAll = async (e, shuffle = false) => {
        if (e) {
            e.preventDefault()
            e.stopPropagation()
        }

        let firstVidId = getFirstVideoId(allVideos)

        if (!firstVidId) {
            try {
                setIsPlayingAll(true)
                const res = await playlistService.getPlaylist(playlistId)
                const p = res.data?.data
                const pItems = p?.items || p?.videos || []
                if (shuffle && pItems.length > 1) {
                    const randomIndex = Math.floor(Math.random() * pItems.length)
                    firstVidId = getFirstVideoId([pItems[randomIndex]])
                } else {
                    firstVidId = getFirstVideoId(pItems)
                }
            } catch {
                navigate(`/playlist/${playlistId}`)
                return
            } finally {
                setIsPlayingAll(false)
            }
        } else if (shuffle && allVideos.length > 1) {
            const randomIndex = Math.floor(Math.random() * allVideos.length)
            firstVidId = getFirstVideoId([allVideos[randomIndex]])
        }

        if (firstVidId) {
            navigate(`/watch/${firstVidId}?list=${playlistId}${shuffle ? '&shuffle=1' : ''}`)
        } else {
            toast.info('This playlist is empty')
            navigate(`/playlist/${playlistId}`)
        }
    }

    // Determine thumbnail
    const firstItem = allVideos[0]
    const firstVideo = firstItem?.video || firstItem
    const rawThumb = playlist.thumbnail || firstVideo?.thumbnail
    const thumbnailSrc = rawThumb ? getMediaUrl(rawThumb) : null

    return (
        <div className="group flex flex-col gap-2.5 w-full cursor-pointer h-full select-none">
            {/* Thumbnail Wrapper (YouTube Style) */}
            <div
                onClick={(e) => handlePlayAll(e, false)}
                className="relative aspect-video rounded-xl overflow-hidden bg-muted/20 z-0 border border-white/5 group-hover:border-white/20 transition-all duration-300"
            >
                {thumbnailSrc ? (
                    <img
                        src={thumbnailSrc}
                        alt={name}
                        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-zinc-600">
                        <ListVideo className="w-10 h-10 mb-1" />
                        <span className="text-xs">Empty playlist</span>
                    </div>
                )}

                {/* YouTube Right Overlay Bar: Video Count & Stack Icon */}
                <div className="absolute right-0 top-0 bottom-0 w-[38%] bg-black/60 backdrop-blur-md flex flex-col items-center justify-center gap-1 text-white border-l border-white/10 z-10 transition-opacity duration-300 group-hover:opacity-0">
                    <span className="text-sm font-bold">{count}</span>
                    <ListVideo className="w-5 h-5 opacity-90" />
                </div>

                {/* YouTube Hover Play All Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center z-20 backdrop-blur-[2px]">
                    <div className="flex items-center gap-2 text-white font-bold uppercase tracking-wider text-xs bg-black/80 border border-white/20 px-4 py-2 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-transform duration-150">
                        <Play className="w-4 h-4 fill-white" />
                        Play All
                    </div>
                </div>
            </div>

            {/* Content info */}
            <div className="flex justify-between items-start gap-2 pt-0.5">
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <h3 className="font-semibold text-[15px] text-white line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                        <Link to={`/playlist/${playlistId}`} onClick={(e) => e.stopPropagation()}>
                            {name}
                        </Link>
                    </h3>

                    <Link
                        to={`/playlist/${playlistId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors mt-0.5"
                    >
                        View full playlist
                    </Link>

                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 mt-0.5">
                        {isPublic ? (
                            <Globe className="w-3 h-3 text-zinc-400" />
                        ) : (
                            <Lock className="w-3 h-3 text-zinc-400" />
                        )}
                        <span>{isPublic ? 'Public' : 'Private'}</span>
                        <span>•</span>
                        <span>Updated {updateAtFormatted(updatedAt)}</span>
                    </div>
                </div>

                {/* 3-Dot Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 -mr-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-zinc-400 hover:text-white rounded-full"
                        >
                            <MoreVertical className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        className="w-48 glass-panel border-white/10 text-white bg-[#1a1a1a]/95 backdrop-blur-xl rounded-xl shadow-2xl p-1"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <DropdownMenuItem onClick={(e) => handlePlayAll(e, false)} className="hover:bg-white/10 cursor-pointer focus:bg-white/10 focus:text-white rounded-lg">
                            <Play className="w-4 h-4 mr-3 fill-current" />
                            Play all
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => handlePlayAll(e, true)} className="hover:bg-white/10 cursor-pointer focus:bg-white/10 focus:text-white rounded-lg">
                            <Shuffle className="w-4 h-4 mr-3" />
                            Shuffle play
                        </DropdownMenuItem>
                        {onEdit && (
                            <DropdownMenuItem onClick={() => onEdit(playlist)} className="hover:bg-white/10 cursor-pointer focus:bg-white/10 focus:text-white rounded-lg">
                                <Edit2 className="w-4 h-4 mr-3" />
                                Edit playlist
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setShareOpen(true); }} className="hover:bg-white/10 cursor-pointer focus:bg-white/10 focus:text-white rounded-lg">
                            <Share2 className="w-4 h-4 mr-3" />
                            Share
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setReportOpen(true); }} className="hover:bg-white/10 cursor-pointer focus:bg-white/10 focus:text-white rounded-lg">
                            <Flag className="w-4 h-4 mr-3 text-orange-400" />
                            Report
                        </DropdownMenuItem>
                        {onDelete && (
                            <DropdownMenuItem onClick={() => onDelete(playlist)} className="text-red-500 focus:text-red-500 hover:bg-white/5 cursor-pointer rounded-lg">
                                <Trash2 className="w-4 h-4 mr-3" />
                                Delete playlist
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>

                <ShareDialog
                    open={shareOpen}
                    onOpenChange={setShareOpen}
                    title={name}
                    url={`${window.location.origin}/playlist/${playlistId}`}
                />
                <ReportDialog
                    open={reportOpen}
                    onOpenChange={setReportOpen}
                    targetType="PLAYLIST"
                    targetId={playlistId}
                />
            </div>
        </div>
    )
}

function updateAtFormatted(date) {
    if (!date) return 'recently'
    try {
        return formatDistanceToNow(new Date(date), { addSuffix: true })
    } catch {
        return 'recently'
    }
}
