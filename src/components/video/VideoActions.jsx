
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
            <div className="flex items-center bg-gray-800 rounded-full overflow-hidden">
                <Button
                    variant="ghost"
                    className={`rounded-none px-4 gap-2 hover:bg-gray-700 ${liked ? 'text-white' : 'text-gray-300'}`}
                    onClick={handleLike}
                >
                    <ThumbsUp className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                    <span className="text-sm font-medium">12K</span>
                </Button>
                <div className="w-px h-6 bg-gray-700" />
                <Button
                    variant="ghost"
                    className={`rounded-none px-4 hover:bg-gray-700 ${disliked ? 'text-white' : 'text-gray-300'}`}
                    onClick={handleDislike}
                >
                    <ThumbsDown className={`w-5 h-5 ${disliked ? 'fill-current' : ''}`} />
                </Button>
            </div>

            <Button variant="secondary" className="rounded-full gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white">
                <Share2 className="w-5 h-5" />
                Share
            </Button>

            <Button variant="secondary" className="rounded-full gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white">
                <Bookmark className="w-5 h-5" />
                Save
            </Button>

            <Button variant="secondary" className="rounded-full w-10 h-10 p-0 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white">
                <MoreHorizontal className="w-5 h-5" />
            </Button>
        </div>
    )
}
