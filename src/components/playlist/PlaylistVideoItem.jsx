import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, MoreVertical, Trash2, Share2, Play, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { Button } from '../ui/Button'
import { formatViews, formatDuration } from '../../lib/utils'
import { getMediaUrl } from '../../lib/media'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../ui/DropdownMenu'
import { cn } from '../../lib/utils'
import { useState } from 'react'
import { ShareDialog } from '../common/ShareDialog'

export function PlaylistVideoItem({ video, playlistId, index, onRemove }) {
    const actualVideo = video?.video || video
    const vidId = actualVideo?._id || actualVideo?.id
    const [shareOpen, setShareOpen] = useState(false)

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: vidId || `video-${index}` })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 10 : 1,
        position: 'relative'
    }

    if (!actualVideo) return null

    const watchUrl = playlistId
        ? `/watch/${vidId}?list=${playlistId}`
        : `/watch/${vidId}`

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "group flex rounded-2xl p-2.5 hover:bg-white/[0.06] transition-colors gap-3 items-center border border-transparent hover:border-white/5 select-none",
                isDragging && "glass-panel shadow-2xl bg-black/60 border-primary/40"
            )}
        >
            {/* Index / Drag Handle */}
            <div className="w-7 flex justify-center flex-shrink-0 text-zinc-500 text-xs font-bold">
                <span className="group-hover:hidden">{index + 1}</span>
                <span
                    className="hidden group-hover:block cursor-grab active:cursor-grabbing text-zinc-400 hover:text-white"
                    {...attributes}
                    {...listeners}
                >
                    <GripVertical className="w-4 h-4" />
                </span>
            </div>

            {/* Thumbnail */}
            <Link
                to={watchUrl}
                className="relative h-[72px] sm:h-[80px] aspect-video rounded-xl overflow-hidden flex-shrink-0 bg-black/50 border border-white/5 group-hover:border-white/20 transition-colors"
            >
                <img
                    src={getMediaUrl(actualVideo.thumbnail)}
                    alt={actualVideo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                />
                {actualVideo.duration ? (
                    <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[10px] text-white font-medium">
                        {formatDuration(actualVideo.duration)}
                    </div>
                ) : null}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                    <div className="w-8 h-8 rounded-full bg-black/80 flex items-center justify-center text-white shadow-lg">
                        <Play className="w-4 h-4 fill-white ml-0.5" />
                    </div>
                </div>
            </Link>

            {/* Metadata */}
            <div className="flex-1 min-w-0 pr-2">
                <Link to={watchUrl}>
                    <h4 className="font-semibold text-sm text-white line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                        {actualVideo.title}
                    </h4>
                </Link>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-zinc-400 mt-1">
                    <Link
                        to={`/@${actualVideo.owner?.username}`}
                        className="hover:text-white transition-colors truncate max-w-[150px]"
                    >
                        {actualVideo.owner?.fullName || actualVideo.owner?.username || 'Channel'}
                    </Link>
                    <span>•</span>
                    <span>{formatViews(actualVideo.views || 0)}</span>
                    {actualVideo.createdAt && (
                        <>
                            <span>•</span>
                            <span>{formatDistanceToNow(new Date(actualVideo.createdAt), { addSuffix: true })}</span>
                        </>
                    )}
                </div>
            </div>

            {/* Actions Menu */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity h-8 w-8 text-zinc-400 hover:text-white rounded-full"
                    >
                        <MoreVertical className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 glass-panel border-white/10 text-white bg-[#1a1a1a]/95 backdrop-blur-xl rounded-xl shadow-2xl p-1">
                    <Link to={watchUrl}>
                        <DropdownMenuItem className="hover:bg-white/10 cursor-pointer focus:bg-white/10 focus:text-white rounded-lg">
                            <Play className="w-4 h-4 mr-3" />
                            Play
                        </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem
                        onSelect={(e) => { e.preventDefault(); setShareOpen(true); }}
                        className="hover:bg-white/10 cursor-pointer focus:bg-white/10 focus:text-white rounded-lg"
                    >
                        <Share2 className="w-4 h-4 mr-3" />
                        Share
                    </DropdownMenuItem>
                    {onRemove && (
                        <DropdownMenuItem
                            onClick={() => onRemove(vidId)}
                            className="text-red-500 focus:text-red-500 hover:bg-white/5 cursor-pointer rounded-lg"
                        >
                            <Trash2 className="w-4 h-4 mr-3" />
                            Remove from playlist
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <ShareDialog
                open={shareOpen}
                onOpenChange={setShareOpen}
                title={actualVideo.title}
                url={`${window.location.origin}/watch/${vidId}`}
            />
        </div>
    )
}
