import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Avatar } from '../ui/Avatar'
import { Button } from '../ui/Button'
import { getMediaUrl } from '../../lib/media'
import { formatTimeAgo } from '../../lib/utils'
import { Heart, MessageSquare, MoreVertical, Flag, Edit, Trash2, Share2, Loader2, Send, ChevronDown } from 'lucide-react'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../ui/DropdownMenu'
import { ReportDialog } from '../common/ReportDialog'
import { ShareDialog } from '../common/ShareDialog'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'sonner'
import { likeService, commentService } from '../../services/api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CommentItem } from '../video/CommentItem'

export function TweetCard({
    tweet,
    onDelete,
    onEditInit,
    hideActions = false
}) {
    const { user } = useAuth()
    const queryClient = useQueryClient()
    const tweetId = tweet?._id || tweet?.id

    const [isLiked, setIsLiked] = useState(tweet?.isLikedByMe || false)
    const [likesCount, setLikesCount] = useState(tweet?.likesCount || 0)
    
    // Comments state
    const [showComments, setShowComments] = useState(false)
    const [newComment, setNewComment] = useState('')
    const [commentsCount, setCommentsCount] = useState(tweet?.commentsCount || 0)

    const { data: commentsData, isLoading: loadingComments } = useQuery({
        queryKey: ['tweetComments', tweetId],
        queryFn: async () => {
            const res = await commentService.getTweetComments(tweetId)
            return res.data?.data?.items || res.data?.data?.comments || []
        },
        enabled: showComments && !!tweetId
    })

    const addCommentMutation = useMutation({
        mutationFn: (content) => commentService.addTweetComment(tweetId, content),
        onSuccess: () => {
            setNewComment('')
            setCommentsCount(prev => prev + 1)
            queryClient.invalidateQueries({ queryKey: ['tweetComments', tweetId] })
            toast.success('Comment posted')
        },
        onError: (err) => {
            const msg = err.response?.data?.message || 'Failed to post comment'
            toast.error(msg)
        }
    })

    if (!tweet) return null

    const handleLike = async (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (!user) {
            toast.error("You must be logged in to like posts")
            return
        }

        // Optimistic toggle
        setIsLiked(!isLiked)
        setLikesCount(prev => isLiked ? Math.max(0, prev - 1) : prev + 1)

        try {
            await likeService.toggleTweetLike(tweetId)
        } catch (error) {
            console.error(error)
            // Revert on error
            setIsLiked(!isLiked)
            setLikesCount(prev => isLiked ? prev + 1 : Math.max(0, prev - 1))
            toast.error("Failed to toggle like")
        }
    }

    const handleAddComment = (e) => {
        e.preventDefault()
        if (!user) return toast.error('Please login to comment')
        if (!newComment.trim()) return toast.error('Comment cannot be empty')
        addCommentMutation.mutate(newComment.trim())
    }

    const ownerId = typeof tweet.owner === 'object' ? (tweet.owner?._id || tweet.owner?.id) : tweet.owner
    const isOwner = user && ownerId && (ownerId === user._id || ownerId === user.id)

    return (
        <div className="glass-card border border-white/5 p-4 sm:p-5 rounded-xl hover:bg-white/5 transition-colors group flex flex-col gap-3 relative">
            <div className="flex gap-3 sm:gap-4 items-start">
                <Link to={`/@${tweet.owner?.username}`} className="shrink-0 h-fit block pt-0.5">
                    <Avatar 
                        src={getMediaUrl(tweet.owner?.avatar)} 
                        fallback={tweet.owner?.username} 
                        size="md" 
                        className="ring-1 ring-white/10 group-hover:ring-white/30 transition-all" 
                    />
                </Link>

                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center flex-wrap gap-x-2 text-[0.95rem]">
                            <Link to={`/@${tweet.owner?.username}`} className="font-semibold text-foreground hover:text-primary transition-colors truncate max-w-[150px] sm:max-w-full">
                                {tweet.owner?.fullName || tweet.owner?.username}
                            </Link>
                            <span className="text-muted-foreground text-[0.85rem]">@{tweet.owner?.username}</span>
                            <span className="text-muted-foreground text-[0.85rem] hidden sm:inline">•</span>
                            <span className="text-muted-foreground text-[0.85rem]">
                                {formatTimeAgo(tweet.createdAt)}
                            </span>
                        </div>

                        {!hideActions && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-white/10 rounded-full shrink-0 -mt-1 -mr-2">
                                        <MoreVertical className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 glass-panel border-white/5 text-white bg-black/60 backdrop-blur-xl rounded-xl shadow-premium">
                                    <ReportDialog targetType="TWEET" targetId={tweetId} trigger={
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="hover:bg-white/10 cursor-pointer focus:bg-white/10 focus:text-white py-3">
                                            <Flag className="w-4 h-4 mr-3" /> Report
                                        </DropdownMenuItem>
                                    } />
                                    {isOwner && (
                                        <>
                                            <DropdownMenuItem onClick={() => onEditInit && onEditInit(tweet)} className="hover:bg-white/10 cursor-pointer focus:bg-white/10 focus:text-white py-3">
                                                <Edit className="w-4 h-4 mr-3" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onDelete && onDelete(tweetId)} className="text-red-500 hover:text-red-500 focus:text-red-500 cursor-pointer py-3">
                                                <Trash2 className="w-4 h-4 mr-3" /> Delete
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>

                    <div className="text-[0.95rem] leading-relaxed whitespace-pre-wrap mt-1 text-zinc-200">
                        {tweet.content}
                    </div>

                    {tweet.image && (
                        <div className="mt-3 rounded-xl overflow-hidden border border-white/5 bg-black/20">
                            {tweet.image.match(/\.(mp4|webm|mkv)$/i) ? (
                                <video src={getMediaUrl(tweet.image)} controls className="max-w-full max-h-[400px] w-full object-contain" />
                            ) : (
                                <img src={getMediaUrl(tweet.image)} alt="Attachment" className="max-w-full max-h-[400px] object-cover" loading="lazy" />
                            )}
                        </div>
                    )}

                    {/* Topics Tags */}
                    {tweet.topics && tweet.topics.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {tweet.topics.map(t => (
                                <span key={t} className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                                    #{t}
                                </span>
                            ))}
                        </div>
                    )}

                    {!hideActions && (
                        <div className="flex items-center justify-between mt-3 max-w-md pr-4 sm:pr-8">
                            {/* Comments Button */}
                            <button
                                onClick={() => setShowComments(!showComments)}
                                className={`flex items-center group/action cursor-pointer transition-colors ${showComments ? 'text-blue-400' : 'text-muted-foreground hover:text-blue-400'}`}
                            >
                                <div className={`p-2 rounded-full transition-colors ${showComments ? 'bg-blue-500/10' : 'group-hover/action:bg-blue-500/10'}`}>
                                    <MessageSquare className="w-[1.15rem] h-[1.15rem]" />
                                </div>
                                <span className="text-xs font-medium -ml-0.5">
                                    {commentsCount > 0 ? commentsCount : ''}
                                </span>
                            </button>

                            {/* Like Button */}
                            <div className="flex items-center group/action cursor-pointer" onClick={handleLike}>
                                <div className="p-2 rounded-full group-hover/action:bg-pink-500/10 transition-colors">
                                    <Heart className={`w-[1.15rem] h-[1.15rem] transition-colors ${isLiked ? 'fill-pink-500 text-pink-500' : 'text-muted-foreground group-hover/action:text-pink-400'}`} />
                                </div>
                                <span className={`text-xs font-medium -ml-0.5 transition-colors ${isLiked ? 'text-pink-500' : 'text-muted-foreground group-hover/action:text-pink-400'}`}>
                                    {likesCount > 0 ? likesCount : ''}
                                </span>
                            </div>

                            {/* Share */}
                            <ShareDialog title={`Post by ${tweet.owner?.fullName || tweet.owner?.username}`} url={`${window.location.origin}/tweets/${tweetId}`} trigger={
                                <div className="flex items-center group/action cursor-pointer">
                                    <div className="p-2 rounded-full group-hover/action:bg-green-500/10 transition-colors">
                                        <Share2 className="w-[1.15rem] h-[1.15rem] text-muted-foreground group-hover/action:text-green-400 transition-colors" />
                                    </div>
                                </div>
                            } />
                        </div>
                    )}
                </div>
            </div>

            {/* Inline Comments Section */}
            {showComments && (
                <div className="mt-3 pt-4 border-t border-white/5 pl-2 sm:pl-4 space-y-4 animate-in fade-in duration-200">
                    {/* Add Comment Input */}
                    <div className="flex gap-3 items-start">
                        <Avatar src={getMediaUrl(user?.avatar)} fallback={user?.username} size="sm" />
                        <div className="flex-1 space-y-2">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add a comment to this post..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm text-white placeholder:text-muted-foreground focus:border-primary outline-none resize-none min-h-[50px] transition-all"
                            />
                            {newComment.trim() && (
                                <div className="flex justify-end gap-2">
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => setNewComment('')}
                                        className="h-7 text-xs rounded-full"
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        size="sm" 
                                        onClick={handleAddComment}
                                        disabled={addCommentMutation.isPending}
                                        className="h-7 text-xs rounded-full gap-1.5"
                                    >
                                        {addCommentMutation.isPending ? (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                            <Send className="w-3 h-3" />
                                        )}
                                        Comment
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Comments List */}
                    {loadingComments ? (
                        <div className="flex justify-center py-6">
                            <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        </div>
                    ) : !commentsData || commentsData.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-4">No comments yet. Be the first to comment!</p>
                    ) : (
                        <div className="space-y-4">
                            {commentsData.map((comment) => (
                                <CommentItem
                                    key={comment.id || comment._id}
                                    comment={comment}
                                    tweetId={tweetId}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
