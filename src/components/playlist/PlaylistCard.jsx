import { Link, useNavigate } from 'react-router-dom'
import { MoreVertical, Play, Globe, Lock, Link as LinkIcon, Trash2, Edit2, Share2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

import { CompositeThumbnail } from './CompositeThumbnail'
import { Button } from '../ui/Button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../ui/DropdownMenu'

export function PlaylistCard({ playlist, onEdit, onDelete, onShare }) {
    const navigate = useNavigate()
    const { _id, name, videos = [], videoCount, privacy, updatedAt } = playlist

    const privacyIcon = {
        public: <Globe className="w-3 h-3 text-muted-foreground" />,
        private: <Lock className="w-3 h-3 text-muted-foreground" />,
        unlisted: <LinkIcon className="w-3 h-3 text-muted-foreground" />
    }

    const handlePlayAll = (e) => {
        e.preventDefault()
        if (videos.length > 0) {
            navigate(`/watch/${videos[0]._id}?list=${_id}`)
        }
    }

    return (
        <div className="group flex flex-col gap-3 w-full cursor-pointer">
            {/* Thumbnail Wrapper */}
            <Link to={`/playlist/${_id}`} className="relative aspect-video rounded-xl overflow-hidden shadow-sm group-hover:shadow-xl group-hover:scale-[1.02] transition-all duration-200">
                <CompositeThumbnail
                    videos={videos}
                    videoCount={videoCount || videos.length}
                    className="w-full h-full group-hover:opacity-80 transition-opacity duration-200"
                    showOverlay={true}
                />

                {/* Hover Play Overlay */}
                <div
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
                    onClick={handlePlayAll}
                >
                    <div className="flex items-center gap-2 text-white font-medium uppercase tracking-wide text-sm bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm hover:bg-black/60 transition-colors">
                        <Play className="w-4 h-4 fill-white" />
                        Play All
                    </div>
                </div>
            </Link>

            {/* Content */}
            <div className="flex justify-between items-start gap-2">
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <h3 className="font-semibold text-base line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                        <Link to={`/playlist/${_id}`}>{name}</Link>
                    </h3>

                    <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                        <span className="font-medium hover:text-foreground transition-colors">
                            {/* Assuming owner name is available? If not, skip or show 'View full playlist' */}
                            View full playlist
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            {privacyIcon[privacy] || privacyIcon.public}
                            <span>{privacy ? privacy.charAt(0).toUpperCase() + privacy.slice(1) : 'Public'}</span>
                            <span>•</span>
                            <span>Updated {updateAtFormatted(updatedAt)}</span>
                        </div>
                    </div>
                </div>

                {/* Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus-visible:opacity-100">
                            <MoreVertical className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={handlePlayAll}>
                            <Play className="w-4 h-4 mr-2" />
                            Play all
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(playlist)}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit playlist
                        </DropdownMenuItem>
                        {onShare && (
                            <DropdownMenuItem onClick={() => onShare(playlist)}>
                                <Share2 className="w-4 h-4 mr-2" />
                                Share
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => onDelete(playlist)} className="text-red-500 focus:text-red-500">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete playlist
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
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
