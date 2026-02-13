import { Link } from 'react-router-dom'
import { MoreVertical, Share2, Trash2, Play, Heart, PlusSquare, CheckCircle2 } from 'lucide-react'
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
} from "../ui/DropdownMenu"

export function LikedVideoCard({ video, viewMode = 'grid', isSelected, onSelect, onUnlike, onAddToPlaylist }) {
    const isList = viewMode === 'list'
    const videoId = video?._id || video?.id || ''

    // Use current date as fallback if likedAt is missing (should come from backend intersection)
    const likedDate = video.likedAt ? new Date(video.likedAt) : null

    if (isList) {
        return (
            <div className={cn(
                "group flex items-center gap-4 p-3 rounded-xl border bg-card transition-all hover:border-primary/50",
                isSelected ? "border-primary bg-primary/5" : "border-border"
            )}>
                {/* Checkbox */}
                <div className="pl-1">
                    <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => onSelect(video._id, checked)}
                    />
                </div>

                {/* Thumbnail */}
                <div className="relative w-40 aspect-video rounded-lg overflow-hidden bg-black/20 shrink-0">
                    <Link to={`/watch/${video._id}`}>
                        <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-full h-full object-cover"
                        />
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
                    <div className="col-span-12 md:col-span-6">
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
                    <div className="hidden md:flex col-span-4 flex-col text-xs text-muted-foreground gap-1">
                        <span>{formatViews(video.views)}</span>
                        {likedDate && (
                            <span className="text-muted-foreground/70">Liked {formatTimeAgo(likedDate)}</span>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="col-span-2 flex justify-end gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-red-500 hover:bg-red-500/10 hover:text-red-600"
                            onClick={() => onUnlike(video._id)}
                            title="Remove from Liked Videos"
                        >
                            <Heart className="w-4 h-4 fill-current" />
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                    <MoreVertical className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onAddToPlaylist(video._id)}>
                                    <PlusSquare className="w-4 h-4 mr-2" /> Add to Playlist
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(`${window.location.origin}/watch/${video._id}`)}>
                                    <Share2 className="w-4 h-4 mr-2" /> Share
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => onUnlike(video._id)} className="text-destructive">
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
            "group relative rounded-xl overflow-hidden bg-card border transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
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
                    className="bg-black/50 border-white/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
            </div>

            {/* Thumbnail */}
            <Link to={`/watch/${videoId}`} className="block relative aspect-video bg-muted/20">
                <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />

                {/* Heart Badge (Visible always to indicate liked status) */}
                <div className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full backdrop-blur-sm z-10">
                    <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                </div>

                <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
                    {formatDuration(video.duration)}
                </div>

                {/* Hover Play Icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-black/40 rounded-full p-4 backdrop-blur-sm border border-white/10 text-white shadow-lg">
                        <Play className="w-8 h-8 fill-white" />
                    </div>
                </div>
            </Link>

            {/* Content */}
            <div className="p-3">
                <div className="flex justify-between items-start gap-2 mb-2">
                    <Link to={`/watch/${videoId}`} className="font-semibold text-sm line-clamp-2 leading-tight hover:text-primary transition-colors text-foreground">
                        {video.title}
                    </Link>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-6 w-6 -mr-1 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onAddToPlaylist(videoId)}>
                                <PlusSquare className="w-4 h-4 mr-2" /> Add to Playlist
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(`${window.location.origin}/watch/${videoId}`)}>
                                <Share2 className="w-4 h-4 mr-2" /> Share
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onUnlike(videoId)} className="text-destructive focus:text-destructive">
                                <Trash2 className="w-4 h-4 mr-2" /> Remove from Liked
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-secondary overflow-hidden shrink-0">
                        {video.owner?.avatar ? (
                            <img src={video.owner.avatar} alt={video.owner.username} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-primary/20 flex items-center justify-center text-[10px] uppercase font-bold text-primary">
                                {video.owner?.username?.[0] || '?'}
                            </div>
                        )}
                    </div>
                    <Link to={`/channel/${video.owner?._id || video.owner?.id || video.owner}`} className="text-xs text-muted-foreground hover:text-foreground truncate flex items-center gap-1">
                        {video.owner?.username || 'Unknown Channel'}
                        {video.owner?.isVerified && <CheckCircle2 className="w-2.5 h-2.5 text-blue-500 fill-blue-500/20" />}
                    </Link>
                </div>

                {/* Stats Row */}
                <div className="flex items-center justify-between text-[11px] text-muted-foreground/80 border-t border-border/50 pt-2 mt-auto">
                    <span>{formatViews(video.views)}</span>
                    {likedDate && <span>Liked {formatTimeAgo(likedDate)}</span>}
                </div>
            </div>
        </div>
    )
}
