import { SquarePlay, MessageSquare, Play } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '../../lib/utils'

export function CompositeThumbnail({ videos = [], videoCount = 0, className, showOverlay = true }) {
    // If no videos, show placeholder
    if (!videos || videos.length === 0) {
        return (
            <div className={cn("w-full aspect-video bg-secondary/50 flex flex-col items-center justify-center text-muted-foreground", className)}>
                <SquarePlay className="w-12 h-12 opacity-50 mb-2" />
                <span className="text-sm font-medium">No videos</span>
            </div>
        )
    }

    // If 1 video, show full thumbnail
    if (videos.length === 1) {
        return (
            <div className={cn("w-full aspect-video relative", className)}>
                <img
                    src={videos[0].thumbnail}
                    alt={videos[0].title}
                    className="w-full h-full object-cover"
                />
                {showOverlay && <Overlay videoCount={videoCount} />}
            </div>
        )
    }

    // If 2 or 3 videos, show grid with placeholders if needed? 
    // Actually prompt says: "If playlist has 2-3 videos: Show those thumbnails in grid (2x2)"
    // We can just slice first 4 videos.
    const displayVideos = videos.slice(0, 4)

    return (
        <div className={cn("w-full aspect-video grid grid-cols-2 grid-rows-2 gap-[1px] bg-background/10", className)}>
            {displayVideos.map((video, idx) => (
                <div key={video._id || idx} className="relative w-full h-full overflow-hidden">
                    <img
                        src={video.thumbnail}
                        alt=""
                        className="w-full h-full object-cover"
                    />
                </div>
            ))}
            {/* Fill remaining slots with placeholder if less than 4 */}
            {Array.from({ length: 4 - displayVideos.length }).map((_, idx) => (
                <div key={`placeholder-${idx}`} className="bg-secondary/30 w-full h-full" />
            ))}

            {showOverlay && <Overlay videoCount={videoCount} />}
        </div>
    )
}

function Overlay({ videoCount }) {
    return (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-colors">
            <div className="flex flex-col items-center text-white drop-shadow-md">
                <span className="text-xl font-bold mb-1">{videoCount}</span>
                <div className="flex items-center gap-1 text-xs uppercase tracking-wider font-medium">
                    <Play className="w-3 h-3 fill-white" />
                    Videos
                </div>
            </div>

            {/* Play All Hover Overlay - handled better by parent usually but can be here too */}
        </div>
    )
}
