import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, MoreVertical, Trash2, Share2, Play } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { Button } from '../ui/Button'
import { formatViews, formatDuration } from '../../lib/utils'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../ui/DropdownMenu'
import { cn } from '../../lib/utils'

export function PlaylistVideoItem({ video, index, onRemove }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: video._id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 10 : 1,
        position: 'relative'
    }

    // Handle case where video might be null/populated incorrectly
    if (!video) return null

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "group flex rounded-xl p-2 hover:bg-secondary/50 transition-colors gap-3 items-center",
                isDragging && "bg-secondary shadow-lg"
            )}
        >
            {/* Index usually shown on youtube, replaced by drag handle on hover */}
            <div className="w-8 flex justify-center flex-shrink-0 text-muted-foreground text-sm font-medium">
                <span className="group-hover:hidden">{index + 1}</span>
                <span className="hidden group-hover:block cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
                    <GripVertical className="w-5 h-5" />
                </span>
            </div>

            {/* Thumbnail */}
            <Link to={`/watch/${video._id}`} className="relative h-[68px] w-[120px] rounded-lg overflow-hidden flex-shrink-0 cursor-pointer">
                <img src={video.thumbnail} alt={video.title} className="bg-secondary object-cover w-full h-full" />
                <div className="absolute bottom-1 right-1 bg-black/80 px-1 rounded text-[10px] text-white font-medium">
                    {formatDuration(video.duration)}
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-5 h-5 fill-white" />
                </div>
            </Link>

            {/* Metadata */}
            <div className="flex-1 min-w-0 pr-2">
                <Link to={`/watch/${video._id}`}>
                    <h4 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                        {video.title}
                    </h4>
                </Link>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs text-muted-foreground">
                    <span className="hover:text-foreground cursor-pointer transition-colors">
                        {video.owner?.username || video.owner?.fullName || 'Unknown Channel'}
                    </span>
                    <span className="hidden sm:inline">•</span>
                    <span>{formatViews(video.views)}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>{video.createdAt ? formatDistanceToNow(new Date(video.createdAt), { addSuffix: true }) : ''}</span>
                </div>
            </div>

            {/* Actions */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onRemove(video._id)}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove from playlist
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
