import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CompositeThumbnail } from './CompositeThumbnail'
import { Button } from '../ui/Button'
import { Play, MoreVertical, Share2, Edit2, Trash2, Globe, Lock, Link as LinkIcon, Download } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../ui/DropdownMenu'
import { formatDistanceToNow } from 'date-fns'
import { cn, formatViews } from '../../lib/utils'

export function PlaylistInfo({ playlist, onEdit, onDelete, onShare, isOwner }) {
    const { _id, name, description, videos = [], videoCount, privacy, updatedAt, owner } = playlist
    const [isDescExpanded, setIsDescExpanded] = useState(false)

    const privacyIcon = {
        public: <Globe className="w-4 h-4" />,
        private: <Lock className="w-4 h-4" />,
        unlisted: <LinkIcon className="w-4 h-4" />
    }

    const totalViews = videos.reduce((acc, v) => acc + (v.views || 0), 0)

    return (
        <div className="flex flex-col gap-6 md:sticky md:top-24 h-fit">
            {/* Thumbnail */}
            <div className="relative aspect-video rounded-xl overflow-hidden group shadow-2xl">
                <CompositeThumbnail
                    videos={videos}
                    videoCount={videoCount || videos.length}
                    className="w-full h-full opacity-100 group-hover:opacity-90 transition-opacity"
                    showOverlay={false}
                />

                {/* Play All Overlay Button */}
                {videos.length > 0 && (
                    <Link
                        to={`/watch/${videos[0]._id}?list=${_id}`}
                        className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <div className="flex items-center gap-2 text-white font-medium bg-black/60 px-6 py-3 rounded-full hover:scale-105 transition-transform">
                            <Play className="w-5 h-5 fill-white" />
                            Play All
                        </div>
                    </Link>
                )}
            </div>

            {/* Info */}
            <div className="space-y-4">
                <h1 className="text-2xl font-bold leading-tight">{name}</h1>

                <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground hover:text-primary cursor-pointer transition-colors">
                        {owner?.username || 'You'}
                    </span>
                    <div className="flex flex-wrap gap-x-2 gap-y-1">
                        <span>{videoCount || videos.length} videos</span>
                        <span>•</span>
                        <span>{formatViews(totalViews)}</span>
                        <span>•</span>
                        <span>Updated {updatedAt ? formatDistanceToNow(new Date(updatedAt), { addSuffix: true }) : 'recently'}</span>
                    </div>
                    {isOwner && (
                        <div className="flex items-center gap-2 mt-2 bg-secondary/30 w-fit px-3 py-1.5 rounded-full">
                            {privacyIcon[privacy]}
                            <span className="capitalize text-xs font-medium">{privacy}</span>
                        </div>
                    )}
                </div>

                {/* Actions Row */}
                <div className="flex gap-2">
                    {/* Play All Button (Mobile/Desktop prominent) */}
                    <Link to={videos.length > 0 ? `/watch/${videos[0]._id}?list=${_id}` : '#'}>
                        <Button className="flex-1 bg-white text-black hover:bg-white/90 rounded-full font-semibold px-8" disabled={videos.length === 0}>
                            <Play className="w-4 h-4 mr-2 fill-black" />
                            Play all
                        </Button>
                    </Link>

                    {/* Secondary Actions */}
                    <div className="flex gap-1">
                        <Button variant="secondary" size="icon" className="rounded-full" onClick={() => onShare && onShare(playlist)}>
                            <Share2 className="w-4 h-4" />
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="secondary" size="icon" className="rounded-full">
                                    <MoreVertical className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {isOwner && (
                                    <>
                                        <DropdownMenuItem onClick={() => onEdit && onEdit(playlist)}>
                                            <Edit2 className="w-4 h-4 mr-2" />
                                            Edit playlist
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onDelete && onDelete(playlist)} className="text-red-500 focus:text-red-500">
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete playlist
                                        </DropdownMenuItem>
                                    </>
                                )}
                                <DropdownMenuItem disabled>
                                    <Download className="w-4 h-4 mr-2" />
                                    Download (Premium)
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Description */}
                {description && (
                    <div
                        className={cn("text-sm text-muted-foreground bg-secondary/20 p-3 rounded-xl cursor-pointer hover:bg-secondary/30 transition-colors", !isDescExpanded && "line-clamp-3")}
                        onClick={() => setIsDescExpanded(!isDescExpanded)}
                    >
                        <p>{description}</p>
                    </div>
                )}
            </div>
        </div>
    )
}
