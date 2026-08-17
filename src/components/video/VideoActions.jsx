
import { ThumbsUp, ThumbsDown, Share2, Bookmark, MoreHorizontal } from 'lucide-react'
import { Button } from '../ui/Button'
import { useState } from 'react'

export default function VideoActions() {
    const [liked, setLiked] = useState(false)
    const [disliked, setDisliked] = useState(false)

    const handleLike = () => {
        setLiked(!liked)
        if (disliked) setDisliked(false)
    }

    const handleDislike = () => {
        setDisliked(!disliked)
        if (liked) setLiked(false)
    }

    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex items-center bg-secondary rounded-full overflow-hidden">
                <Button
                    variant="ghost"
                    className={`rounded-none px-4 gap-2 hover:bg-white/10 ${liked ? 'text-white' : 'text-muted-foreground'}`}
                    onClick={handleLike}
                >
                    <ThumbsUp className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                    <span className="text-sm font-medium">12K</span>
                </Button>
                <div className="w-px h-6 bg-border" />
                <Button
                    variant="ghost"
                    className={`rounded-none px-4 hover:bg-white/10 ${disliked ? 'text-white' : 'text-muted-foreground'}`}
                    onClick={handleDislike}
                >
                    <ThumbsDown className={`w-5 h-5 ${disliked ? 'fill-current' : ''}`} />
                </Button>
            </div>

            <Button variant="secondary" className="rounded-full gap-2 bg-secondary hover:bg-white/10 text-muted-foreground hover:text-white">
                <Share2 className="w-5 h-5" />
                Share
            </Button>

            <Button variant="secondary" className="rounded-full gap-2 bg-secondary hover:bg-white/10 text-muted-foreground hover:text-white">
                <Bookmark className="w-5 h-5" />
                Save
            </Button>

            <Button variant="secondary" className="rounded-full w-10 h-10 p-0 bg-secondary hover:bg-white/10 text-muted-foreground hover:text-white">
                <MoreHorizontal className="w-5 h-5" />
            </Button>
        </div>
    )
}
