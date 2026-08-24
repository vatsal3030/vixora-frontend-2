import { Link } from 'react-router-dom'
import { MoreVertical, Share2, Pencil, Trash2, Eye, EyeOff, Globe, Lock, AlertCircle, Sparkles } from 'lucide-react'
import { formatDuration, formatViews, formatTimeAgo } from '../../../lib/utils'
import { getMediaUrl } from '../../../lib/media'
import { Button } from '../../../components/ui/Button'
import { Checkbox } from '../../../components/ui/Checkbox'
import { cn } from '../../../lib/utils'
import { toast } from 'sonner'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "../../../components/ui/DropdownMenu"

const StatusBadge = ({ isPublished, isProcessing }) => {
    if (isProcessing) return <div className="bg-yellow-500/90 text-white px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Processing</div>
    if (isPublished) return <div className="bg-green-500/90 text-white px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1"><Globe className="w-3 h-3" /> Public</div>
    return <div className="bg-red-500/90 text-white px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1"><Lock className="w-3 h-3" /> Private</div>
}

export function CreatorVideoCard({ video, viewMode = 'grid', isSelected, onSelect, onDelete, onTogglePublish }) {
    const isList = viewMode === 'list'
    const videoId = video?.id || video?._id

    const handleCopyLink = (e) => {
        e.stopPropagation()
        navigator.clipboard.writeText(`${window.location.origin}/watch/${videoId}`)
        toast.success("Link copied to clipboard")
    }

    if (isList) {
        return (
            <div className={cn(
                "group flex items-center gap-4 p-3 rounded-xl border transition-all hover:border-primary/50 glass-card",
                isSelected ? "border-primary bg-primary/5" : "border-white/5"
            )}>
                {/* Checkbox */}
                <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => onSelect(videoId, checked)}
                    className="mr-2"
                />

                {/* Thumbnail */}
                <div className="relative w-40 aspect-video rounded-lg overflow-hidden bg-black/20 shrink-0">
                    <img
                        src={getMediaUrl(video.thumbnail)}
                        alt={video.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
                        {formatDuration(video.duration)}
                    </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-12 md:col-span-5">
                        <Link to={`/watch/${videoId}`} className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1 block mb-1">
                            {video.title}
                        </Link>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{formatTimeAgo(video.createdAt)}</span>
                            <span>•</span>
                            <StatusBadge isPublished={video.isPublished} />
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="hidden md:flex col-span-5 gap-6 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5" title="Views">
                            <Eye className="w-4 h-4" />
                            {formatViews(video.views)}
                        </div>
                        <div className="flex items-center gap-1.5" title="Likes">
                            {formatViews(video.likesCount || 0)} likes
                        </div>
                        <div className="flex items-center gap-1.5" title="Comments">
                            {video.commentsCount || 0} comments
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="col-span-2 flex justify-end gap-2">
                        <Link to={`/video/${videoId}/edit`}>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                <Pencil className="w-4 h-4" />
                            </Button>
                        </Link>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                    <MoreVertical className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="glass-panel border-white/10 text-white bg-black/80 backdrop-blur-xl">
                                <Link to={`/video/${videoId}/edit`}>
                                    <DropdownMenuItem className="cursor-pointer hover:bg-white/10">
                                        <Pencil className="w-4 h-4 mr-2" /> Edit Details
                                    </DropdownMenuItem>
                                </Link>
                                <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer hover:bg-white/10">
                                    <Share2 className="w-4 h-4 mr-2" /> Copy Link
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => onTogglePublish(videoId)} className="cursor-pointer hover:bg-white/10">
                                    {video.isPublished ? <><EyeOff className="w-4 h-4 mr-2" /> Unpublish</> : <><Eye className="w-4 h-4 mr-2" /> Publish</>}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onDelete(videoId)} className="text-destructive font-medium cursor-pointer hover:bg-white/10">
                                    <Trash2 className="w-4 h-4 mr-2" /> Delete
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
        <div className="group relative flex flex-col">
            {/* Selection Overlay */}
            <div className={cn(
                "absolute top-2 left-2 z-20 transition-opacity duration-base",
                isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}>
                <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => onSelect(videoId, checked)}
                    className="bg-black/50 border-white/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
            </div>

            <Link to={`/watch/${videoId}`} className={cn(
                "relative aspect-video rounded-xl overflow-hidden bg-muted/20 block transition-all",
                isSelected ? "ring-2 ring-primary border border-primary" : "border border-transparent group-hover:border-white/10"
            )}>
                <img
                    src={getMediaUrl(video.thumbnail)}
                    alt={video.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

                <div className="absolute top-2 right-2">
                    <StatusBadge isPublished={video.isPublished} />
                </div>

                <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
                    {formatDuration(video.duration)}
                </div>
            </Link>

            {/* Content */}
            <div className="flex gap-3 mt-3 items-start relative px-1">
                <div className="flex-1 min-w-0 pr-6">
                    <Link to={`/watch/${videoId}`} className="font-semibold text-sm line-clamp-2 leading-snug hover:text-primary transition-colors">
                        {video.title}
                    </Link>

                    <div className="text-xs text-muted-foreground mt-1">
                        {formatViews(video.views)} views • {formatTimeAgo(video.createdAt)}
                    </div>
                </div>

                {/* Actions Dropdown */}
                <div className="absolute top-0 right-0">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass-panel border-white/10 text-white bg-black/80 backdrop-blur-xl">
                            <Link to={`/video/${videoId}/edit`}>
                                <DropdownMenuItem className="cursor-pointer hover:bg-white/10">
                                    <Pencil className="w-4 h-4 mr-2" /> Edit
                                </DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer hover:bg-white/10">
                                <Share2 className="w-4 h-4 mr-2" /> Copy Link
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onTogglePublish(videoId)} className="cursor-pointer hover:bg-white/10">
                                {video.isPublished ? <><EyeOff className="w-4 h-4 mr-2" /> Unpublish</> : <><Eye className="w-4 h-4 mr-2" /> Publish</>}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDelete(videoId)} className="text-destructive focus:text-destructive cursor-pointer hover:bg-white/10">
                                <Trash2 className="w-4 h-4 mr-2" /> Move to Trash
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    )
}
