import { Link } from 'react-router-dom'
import { MoreVertical, Share2, Trash2, Play, PlusSquare, CheckCircle2, Flag, Clock, Check } from 'lucide-react'
import { formatDuration, formatViews, formatTimeAgo } from '../../lib/utils'
import { Button } from '../ui/Button'
import { Checkbox } from '../ui/Checkbox'
import { cn } from '../../lib/utils'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from "../ui/DropdownMenu"

export function WatchLaterCard({
    video,
    viewMode = 'grid',
    isSelected,
    onSelect,
    onRemove,
    onAddToPlaylist,
    onToggleWatched,
    priority = 'none',
    onPriorityChange,
    progress = 0
}) {
    const isList = viewMode === 'list'
    const videoId = video?._id || video?.id || ''

    // Priority Colors
    const priorityColors = {
        high: 'border-l-4 border-l-red-500',
        medium: 'border-l-4 border-l-orange-500',
        low: 'border-l-4 border-l-blue-500',
        none: 'border-l-4 border-l-transparent'
    }

    const priorityBadge = {
        high: <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1 z-10"><Flag className="w-3 h-3 fill-current" /> High</div>,
        medium: <div className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1 z-10"><Flag className="w-3 h-3 fill-current" /> Med</div>,
        low: <div className="absolute top-2 left-2 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1 z-10"><Flag className="w-3 h-3 fill-current" /> Low</div>,
        none: null
    }

    if (isList) {
        return (
            <div className={cn(
                "group flex items-center gap-4 p-3 rounded-xl border bg-card transition-all hover:border-primary/50 relative overflow-hidden",
                isSelected ? "border-primary bg-primary/5" : "border-border",
                priorityColors[priority]
            )}>
                {/* Checkbox */}
                <div className="pl-1 shrink-0">
                    <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => onSelect(videoId, checked)}
                    />
                </div>

                {/* Thumbnail */}
                <div className="relative w-40 aspect-video rounded-lg overflow-hidden bg-black/20 shrink-0">
                    <Link to={`/watch/${videoId}`}>
                        <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-full h-full object-cover"
                        />
                        {/* Progress Bar */}
                        {progress > 0 && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30">
                                <div
                                    className="h-full bg-red-600"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        )}
                        <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
                            {formatDuration(video.duration)}
                        </div>
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Play className="w-8 h-8 text-white fill-white" />
                        </div>
                    </Link>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-12 md:col-span-5">
                        <Link to={`/watch/${videoId}`} className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1 block mb-1 text-base">
                            {video.title}
                        </Link>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Link to={`/channel/${video.owner?._id || video.owner?.id || video.owner}`} className="hover:text-foreground transition-colors">
                                {video.owner?.username || 'Unknown Channel'}
                            </Link>
                            {video.owner?.isVerified && <CheckCircle2 className="w-3 h-3 text-blue-500 fill-blue-500/20" />}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="hidden md:flex col-span-5 flex-col text-xs text-muted-foreground gap-1">
                        <span>{formatViews(video.views)} • {formatTimeAgo(video.createdAt)}</span>
                        <div className="flex gap-2 items-center">
                            {/* Added Date Badge (Mock for now, assumes recent add) */}
                            <span className="text-muted-foreground/70 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Added recently
                            </span>
                            {progress > 0 && <span className="text-red-400 font-medium">{Math.round(progress)}% watched</span>}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="col-span-2 flex justify-end gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-muted-foreground hover:text-green-500"
                            onClick={() => onToggleWatched(videoId)}
                            title="Mark as Watched"
                        >
                            <Check className="w-4 h-4" />
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => onRemove(videoId)}
                            title="Remove from Watch Later"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                    <MoreVertical className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>
                                        <Flag className="w-4 h-4 mr-2" /> Set Priority
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuSubContent>
                                        <DropdownMenuRadioGroup value={priority} onValueChange={(val) => onPriorityChange(videoId, val)}>
                                            <DropdownMenuRadioItem value="high" className="text-red-500">High</DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="medium" className="text-orange-500">Medium</DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="low" className="text-blue-500">Low</DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="none">None</DropdownMenuRadioItem>
                                        </DropdownMenuRadioGroup>
                                    </DropdownMenuSubContent>
                                </DropdownMenuSub>
                                <DropdownMenuItem onClick={() => onAddToPlaylist(videoId)}>
                                    <PlusSquare className="w-4 h-4 mr-2" /> Add to Playlist
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(`${window.location.origin}/watch/${videoId}`)}>
                                    <Share2 className="w-4 h-4 mr-2" /> Share
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => onRemove(videoId)} className="text-destructive">
                                    <Trash2 className="w-4 h-4 mr-2" /> Remove
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        )
    }

    // GRID VIEW
    return (
        <div className={cn(
            "group relative rounded-xl overflow-hidden bg-card border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col",
            isSelected ? "border-primary ring-1 ring-primary" : "border-border hover:border-primary/50"
        )}>
            {/* Selection Overlay */}
            <div className={cn(
                "absolute top-2 left-2 z-20 transition-opacity duration-200",
                isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}>
                <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => onSelect(videoId, checked)}
                    className="bg-black/50 border-white/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary backdrop-blur-sm"
                />
            </div>

            {/* Priority Badge */}
            {!isSelected && priorityBadge[priority]}

            {/* Thumbnail */}
            <Link to={`/watch/${videoId}`} className="block relative aspect-video bg-muted/20 shrink-0">
                <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Progress Bar */}
                {progress > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 z-10">
                        <div
                            className="h-full bg-red-600"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />

                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-medium px-1.5 py-0.5 rounded backdrop-blur-sm">
                    {formatDuration(video.duration)}
                </div>

                {/* Hover Play Icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-black/40 rounded-full p-3 backdrop-blur-sm border border-white/10 text-white shadow-lg">
                        <Play className="w-6 h-6 fill-white" />
                    </div>
                </div>
            </Link>

            {/* Content */}
            <div className="p-3 flex flex-col flex-1">
                <div className="flex justify-between items-start gap-2 mb-2">
                    <Link to={`/watch/${videoId}`} className="font-semibold text-sm line-clamp-2 leading-tight hover:text-primary transition-colors text-foreground">
                        {video.title}
                    </Link>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-6 w-6 -mr-2 -mt-1 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                    <Flag className="w-4 h-4 mr-2" /> Priority
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                    <DropdownMenuRadioGroup value={priority} onValueChange={(val) => onPriorityChange(videoId, val)}>
                                        <DropdownMenuRadioItem value="high" className="text-red-500">High</DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="medium" className="text-orange-500">Medium</DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="low" className="text-blue-500">Low</DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="none">None</DropdownMenuRadioItem>
                                    </DropdownMenuRadioGroup>
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuItem onClick={() => onToggleWatched(videoId)}>
                                <Check className="w-4 h-4 mr-2" /> Mark as Watched
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onAddToPlaylist(videoId)}>
                                <PlusSquare className="w-4 h-4 mr-2" /> Add to Playlist
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onRemove(videoId)} className="text-destructive focus:text-destructive">
                                <Trash2 className="w-4 h-4 mr-2" /> Remove
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="flex items-center gap-2 mb-auto">
                    <Link to={`/channel/${video.owner?._id || video.owner?.id || video.owner}`} className="text-xs text-muted-foreground hover:text-foreground truncate flex items-center gap-1">
                        {video.owner?.username || 'Unknown Channel'}
                        {video.owner?.isVerified && <CheckCircle2 className="w-2.5 h-2.5 text-blue-500 fill-blue-500/20" />}
                    </Link>
                </div>

                {/* Stats Row */}
                <div className="flex flex-col gap-1 mt-3 pt-3 border-t border-border/50">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground/80">
                        <span>{formatViews(video.views)}</span>
                        <span>{formatTimeAgo(video.createdAt)}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
