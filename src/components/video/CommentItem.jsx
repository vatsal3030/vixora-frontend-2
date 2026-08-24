import { Avatar } from '../ui/Avatar'
import { formatTimeAgo, formatNumber } from '../../lib/utils'
import { getMediaUrl } from '../../lib/media'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ThumbsUp, ThumbsDown, MoreVertical, Pencil, Trash2, Loader2, MessageSquare, ChevronDown, ChevronUp, CornerDownRight } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { likeService, commentService } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'sonner'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../ui/DropdownMenu'
import { Button } from '../ui/Button'
import { ConfirmationDialog } from '../common/ConfirmationDialog'
import { ParsedText } from '../common/ParsedText'

export function CommentItem({ comment, videoId, tweetId, onSeek, depth = 0, onReplySuccess }) {
    const { user } = useAuth()
    const queryClient = useQueryClient()
    const commentId = comment?.id || comment?._id
    
    const [likesCount, setLikesCount] = useState(comment?.likesCount || 0)
    const [isLiked, setIsLiked] = useState(comment?.isLiked || false)

    const [isEditing, setIsEditing] = useState(false)
    const [editContent, setEditContent] = useState(comment?.content || '')
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    
    const [isReplying, setIsReplying] = useState(false)
    const [replyContent, setReplyContent] = useState('')
    const [showReplies, setShowReplies] = useState(false)

    // Local replies state with embedded replies fallback
    const [localReplies, setLocalReplies] = useState(comment?.replies || [])
    const [replyCount, setReplyCount] = useState(comment?.repliesCount ?? (comment?.replies || []).length ?? 0)
    const [isLoadingReplies, setIsLoadingReplies] = useState(false)
    const [repliesFetched, setRepliesFetched] = useState(false)

    useEffect(() => {
        setLikesCount(comment?.likesCount || 0)
        setIsLiked(comment?.isLiked || false)
        setEditContent(comment?.content || '')
        if (comment?.replies && comment.replies.length > 0) {
            setLocalReplies(comment.replies)
        }
        setReplyCount(comment?.repliesCount ?? (comment?.replies || []).length ?? 0)
    }, [comment])

    const ownerId = typeof comment?.owner === 'object' 
        ? (comment?.owner?.id || comment?.owner?._id) 
        : (comment?.ownerId || comment?.owner)
    const currentUserId = user?.id || user?._id
    const isOwner = currentUserId && ownerId && currentUserId === ownerId

    const likeMutation = useMutation({
        mutationFn: () => likeService.toggleCommentLike(commentId),
        onMutate: () => {
            setIsLiked((prev) => !prev)
            setLikesCount((prev) => (isLiked ? Math.max(0, prev - 1) : prev + 1))
        },
        onError: () => {
            setIsLiked((prev) => !prev)
            setLikesCount((prev) => (isLiked ? prev + 1 : Math.max(0, prev - 1)))
            toast.error('Failed to like comment')
        }
    })

    const editMutation = useMutation({
        mutationFn: (newContent) => commentService.updateComment(commentId, newContent),
        onSuccess: () => {
            toast.success("Comment updated")
            setIsEditing(false)
            if (videoId) queryClient.invalidateQueries({ queryKey: ['comments', videoId] })
            if (tweetId) queryClient.invalidateQueries({ queryKey: ['tweetComments', tweetId] })
        },
        onError: (err) => {
            const msg = err.response?.data?.message || "Failed to edit comment"
            toast.error(msg)
        }
    })

    const deleteMutation = useMutation({
        mutationFn: () => commentService.deleteComment(commentId),
        onSuccess: () => {
            toast.success("Comment deleted")
            if (videoId) {
                queryClient.invalidateQueries({ queryKey: ['comments', videoId] })
                queryClient.invalidateQueries({ queryKey: ['video', videoId] })
            }
            if (tweetId) {
                queryClient.invalidateQueries({ queryKey: ['tweetComments', tweetId] })
                queryClient.invalidateQueries({ queryKey: ['tweet', tweetId] })
            }
        },
        onError: () => toast.error("Failed to delete comment")
    })

    const replyMutation = useMutation({
        mutationFn: (content) => {
            if (tweetId) {
                return commentService.addTweetComment(tweetId, content, commentId)
            }
            return commentService.addComment(videoId, content, commentId)
        },
        onSuccess: (res) => {
            const newReply = res.data?.data
            setReplyContent('')
            setIsReplying(false)
            setShowReplies(true)
            toast.success("Reply posted")
            if (newReply) {
                setLocalReplies(prev => [...prev, newReply])
                setReplyCount(prev => prev + 1)
            }
            if (onReplySuccess) onReplySuccess()
            if (videoId) {
                queryClient.invalidateQueries({ queryKey: ['comments', videoId] })
                queryClient.invalidateQueries({ queryKey: ['video', videoId] })
            }
            if (tweetId) {
                queryClient.invalidateQueries({ queryKey: ['tweetComments', tweetId] })
                queryClient.invalidateQueries({ queryKey: ['tweet', tweetId] })
            }
        },
        onError: (err) => {
            const msg = err.response?.data?.message || "Failed to add reply"
            toast.error(msg)
        }
    })

    const handleLike = () => {
        if (!user) return toast.error('Please login to like')
        likeMutation.mutate()
    }

    const handleSaveEdit = () => {
        if (!editContent.trim()) return toast.error("Comment cannot be empty")
        editMutation.mutate(editContent.trim())
    }

    const handleReply = () => {
        if (!replyContent.trim()) return toast.error("Reply cannot be empty")
        replyMutation.mutate(replyContent.trim())
    }

    const loadReplies = async () => {
        if (isLoadingReplies) return
        setIsLoadingReplies(true)
        try {
            const res = await commentService.getReplies(commentId)
            const items = res.data?.data?.items || res.data?.data?.replies || []
            setLocalReplies(items)
            setRepliesFetched(true)
            if (items.length > replyCount) setReplyCount(items.length)
        } catch (err) {
            console.error("Error loading replies:", err)
        } finally {
            setIsLoadingReplies(false)
        }
    }

    if (!comment) return null
    const hasReplies = replyCount > 0 || localReplies.length > 0
    const username = comment.owner?.username || 'user'

    return (
        <div className="flex flex-col group/tree">
            <div className="flex gap-3 items-start group relative">
                {/* User Avatar */}
                <Link to={`/@${username}`} className="shrink-0 pt-0.5">
                    <Avatar 
                        src={getMediaUrl(comment.owner?.avatar)} 
                        fallback={username} 
                        size={depth === 0 ? "md" : "sm"} 
                    />
                </Link>

                {/* Comment Body */}
                <div className="flex-1 space-y-1 relative min-w-0">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mr-10">
                        <Link to={`/@${username}`} className="font-semibold text-foreground hover:text-primary transition-colors truncate">
                            @{username}
                        </Link>
                        <span className="shrink-0">{formatTimeAgo(comment.createdAt)}</span>
                        {comment.isEdited && <span className="italic text-[10px] opacity-70 shrink-0">(edited)</span>}
                    </div>

                    {isEditing ? (
                        <div className="pr-4 mt-2 mb-2">
                            <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-2 focus:border-primary outline-none transition-colors text-sm resize-none h-auto min-h-[50px] text-white"
                                placeholder="Update your comment..."
                                autoFocus
                            />
                            <div className="flex justify-end gap-2 mt-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => { setIsEditing(false); setEditContent(comment.content); }}
                                    disabled={editMutation.isPending}
                                    className="h-7 text-xs rounded-full"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleSaveEdit}
                                    disabled={editMutation.isPending || !editContent.trim()}
                                    className="h-7 text-xs rounded-full"
                                >
                                    {editMutation.isPending && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                                    Save
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-sm text-zinc-200 leading-relaxed break-words">
                            <ParsedText text={comment.content} onSeek={onSeek} />
                        </div>
                    )}

                    {/* Actions */}
                    {!isEditing && (
                        <div className="flex items-center gap-4 pt-1">
                            <button
                                onClick={handleLike}
                                disabled={likeMutation.isPending}
                                className={`flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer ${isLiked ? 'text-primary' : 'text-muted-foreground hover:text-white'}`}
                            >
                                <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                                <span>{likesCount > 0 ? formatNumber(likesCount) : ''}</span>
                            </button>

                            <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white transition-colors cursor-pointer">
                                <ThumbsDown className="w-3.5 h-3.5" />
                            </button>

                            <button 
                                onClick={() => {
                                    if (!user) return toast.error("Please login to reply")
                                    if (!isReplying) {
                                        setReplyContent(`@${username} `)
                                    }
                                    setIsReplying(!isReplying)
                                }}
                                className="text-xs font-semibold text-muted-foreground hover:text-white transition-colors cursor-pointer opacity-90 sm:opacity-0 sm:group-hover:opacity-100"
                            >
                                Reply
                            </button>
                        </div>
                    )}

                    {/* Reply Input Box */}
                    {isReplying && (
                        <div className="flex gap-3 mt-3 pr-4 animate-in fade-in zoom-in-95 duration-base">
                            <Avatar src={getMediaUrl(user?.avatar)} fallback={user?.username} size="sm" />
                            <div className="flex-1">
                                <textarea
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 focus:border-primary outline-none transition-colors text-sm resize-none h-auto min-h-[40px] text-white"
                                    placeholder={`Reply to @${username}...`}
                                    autoFocus
                                />
                                <div className="flex justify-end gap-2 mt-2">
                                    <Button variant="ghost" size="sm" onClick={() => setIsReplying(false)} className="h-7 text-xs rounded-full">
                                        Cancel
                                    </Button>
                                    <Button size="sm" onClick={handleReply} disabled={replyMutation.isPending || !replyContent.trim()} className="h-7 text-xs rounded-full">
                                        {replyMutation.isPending && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                                        Reply
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Replies Toggle (YouTube Style) */}
                    {hasReplies && (
                        <div className="mt-1">
                            <button 
                                onClick={() => {
                                    const next = !showReplies
                                    setShowReplies(next)
                                    if (next && (localReplies.length === 0 || !repliesFetched)) {
                                        loadReplies()
                                    }
                                }}
                                className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold hover:bg-primary/10 px-2.5 py-1 rounded-full transition-colors cursor-pointer"
                            >
                                {showReplies ? (
                                    <>
                                        <ChevronUp className="w-3.5 h-3.5" />
                                        Hide replies
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="w-3.5 h-3.5" />
                                        {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Dropdown Menu (Owner) */}
                    {isOwner && !isEditing && (
                        <div className="absolute top-0 right-0">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button size="icon" variant="ghost" className="h-6 w-6 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                        <MoreVertical className="w-4 h-4 text-muted-foreground" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="glass-panel border-white/10 text-white bg-black/80 backdrop-blur-xl">
                                    <DropdownMenuItem onClick={() => setIsEditing(true)} className="cursor-pointer hover:bg-white/10">
                                        <Pencil className="w-4 h-4 mr-2" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-destructive cursor-pointer hover:bg-white/10">
                                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                </div>

                <ConfirmationDialog
                    open={showDeleteDialog}
                    onOpenChange={setShowDeleteDialog}
                    title="Delete comment"
                    description="Delete your comment permanently?"
                    onConfirm={() => deleteMutation.mutate()}
                    isLoading={deleteMutation.isPending}
                />
            </div>

            {/* Nested Replies Tree (YouTube Visuals with Curved Connectors) */}
            {hasReplies && showReplies && (
                <div className="relative pl-6 sm:pl-8 ml-3 sm:ml-4 mt-2 space-y-4 border-l-2 border-white/10 group-hover/tree:border-white/20 transition-colors">
                    {isLoadingReplies && (
                        <div className="flex items-center gap-2 py-2 text-xs text-muted-foreground">
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" /> Loading replies...
                        </div>
                    )}
                    {localReplies.map((reply) => {
                        const rId = reply?.id || reply?._id
                        return (
                            <div key={rId} className="relative">
                                {/* YouTube Tree Curved Connector Branch */}
                                <div className="absolute -left-6 sm:-left-8 top-3.5 w-4 sm:w-6 h-3 rounded-bl-lg border-b-2 border-l-2 border-white/10 pointer-events-none" />
                                <CommentItem 
                                    comment={reply} 
                                    videoId={videoId} 
                                    tweetId={tweetId} 
                                    onSeek={onSeek} 
                                    depth={depth + 1}
                                    onReplySuccess={() => setReplyCount(prev => prev + 1)}
                                />
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default CommentItem
