import { Avatar } from '../ui/Avatar'
import { formatTimeAgo } from '../../lib/utils'
import { Link } from 'react-router-dom'

import { useState } from 'react'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { likeService } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'sonner'
import { formatViews } from '../../lib/utils'

export function CommentItem({ comment }) {
    const { user } = useAuth()
    const [likesCount, setLikesCount] = useState(comment?.likesCount || 0)
    const [isLiked, setIsLiked] = useState(comment?.isLiked || false)

    const likeMutation = useMutation({
        mutationFn: () => likeService.toggleCommentLike(comment._id),
        onMutate: () => {
            setIsLiked((prev) => !prev)
            setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1))
        },
        onError: () => {
            setIsLiked((prev) => !prev)
            setLikesCount((prev) => (isLiked ? prev + 1 : prev - 1))
            toast.error('Failed to like comment')
        }
    })

    const handleLike = () => {
        if (!user) return toast.error('Please login to like')
        likeMutation.mutate()
    }

    if (!comment) return null

    return (
        <div className="flex gap-3 items-start group">
            <Link to={`/@${comment.owner?.username}`}>
                <Avatar src={comment.owner?.avatar} fallback={comment.owner?.username} size="md" />
            </Link>
            <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Link to={`/@${comment.owner?.username}`} className="font-semibold text-foreground hover:text-primary transition-colors">
                        @{comment.owner?.username}
                    </Link>
                    <span>{formatTimeAgo(comment.createdAt)}</span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">{comment.content}</p>

                {/* Actions */}
                <div className="flex items-center gap-4 pt-1">
                    <button
                        onClick={handleLike}
                        disabled={likeMutation.isPending}
                        className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${isLiked ? 'text-primary' : 'text-muted-foreground hover:text-white'}`}
                    >
                        <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                        <span>{likesCount > 0 ? formatViews(likesCount) : ''}</span>
                    </button>

                    <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white transition-colors">
                        <ThumbsDown className="w-3.5 h-3.5" />
                    </button>

                    <button className="text-xs font-medium text-muted-foreground hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                        Reply
                    </button>
                </div>
            </div>
        </div>
    )
}
