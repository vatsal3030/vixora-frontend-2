import { Avatar } from '../ui/Avatar'
import { formatTimeAgo } from '../../lib/utils'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { ThumbsUp, ThumbsDown, MoreVertical, Pencil, Trash2, Loader2 } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { likeService, commentService } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'sonner'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../ui/DropdownMenu'
import { Button } from '../ui/Button'
import { ConfirmationDialog } from '../common/ConfirmationDialog'
import { formatNumber } from '../../lib/utils'
import { ParsedText } from '../common/ParsedText'

export function CommentItem({ comment, videoId, onSeek, depth = 0 }) {
    const { user } = useAuth()
    const queryClient = useQueryClient()
    const [likesCount, setLikesCount] = useState(comment?.likesCount || 0)
    const [isLiked, setIsLiked] = useState(comment?.isLiked || false)

    const [isEditing, setIsEditing] = useState(false)
    const [editContent, setEditContent] = useState(comment?.content || '')
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    
    const [isReplying, setIsReplying] = useState(false)
    const [replyContent, setReplyContent] = useState('')
    const [showReplies, setShowReplies] = useState(false)

    const isOwner = user && (user._id === comment?.owner?._id || user.id === comment?.owner?.id)

    const likeMutation = useMutation({
        mutationFn: () => likeService.toggleCommentLike(comment.id || comment._id),
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

    const editMutation = useMutation({
        mutationFn: (newContent) => commentService.updateComment(comment._id, newContent),
        onSuccess: () => {
            toast.success("Comment updated")
            setIsEditing(false)
            queryClient.invalidateQueries({ queryKey: ['comments'] })
        },
        onError: () => toast.error("Failed to edit comment")
    })

    const deleteMutation = useMutation({
        mutationFn: () => commentService.deleteComment(comment._id || comment.id),
        onSuccess: () => {
            toast.success("Comment deleted")
            queryClient.invalidateQueries({ queryKey: ['comments'] })
        },
        onError: () => toast.error("Failed to delete comment")
    })

    const replyMutation = useMutation({
        mutationFn: (content) => commentService.addComment(videoId, content, comment._id || comment.id),
        onSuccess: () => {
            setReplyContent('')
            setIsReplying(false)
            setShowReplies(true)
            toast.success("Reply added")
            queryClient.invalidateQueries({ queryKey: ['comments'] })
        },
        onError: () => toast.error("Failed to add reply")
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

    if (!comment) return null
    const embeddedReplies = comment.replies || []
    // repliesCount from backend _count — tells us total replies that exist
    const totalRepliesCount = comment.repliesCount || embeddedReplies.length || 0
    const hasReplies = totalRepliesCount > 0

    // On-demand reply fetching for deeper nesting
    const [fetchedReplies, setFetchedReplies] = useState([])
    const [isLoadingReplies, setIsLoadingReplies] = useState(false)
    const [repliesFetched, setRepliesFetched] = useState(false)

    // Use embedded replies if available (depth 0 from initial query), else use fetched
    const displayReplies = embeddedReplies.length > 0 ? embeddedReplies : fetchedReplies

    const loadReplies = async () => {
        if (repliesFetched || isLoadingReplies) return
        setIsLoadingReplies(true)
        try {
            const res = await commentService.getReplies(comment._id || comment.id)
            const items = res.data?.data?.items || res.data?.data?.replies || []
            setFetchedReplies(items)
            setRepliesFetched(true)
        } catch (err) {
            toast.error('Failed to load replies')
        } finally {
            setIsLoadingReplies(false)
        }
    }

    return (
        <div className="flex gap-3 items-start group">
            <Link to={`/@${comment.owner?.username}`}>
                <Avatar src={comment.owner?.avatar} fallback={comment.owner?.username} size="md" />
            </Link>
            <div className="flex-1 space-y-1 relative">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mr-10">
                    <Link to={`/@${comment.owner?.username}`} className="font-semibold text-foreground hover:text-primary transition-colors">
                        @{comment.owner?.username}
                    </Link>
                    <span>{formatTimeAgo(comment.createdAt)}</span>
                    {comment.isEdited && <span className="italic text-[10px] opacity-70">(edited)</span>}
                </div>

                {isEditing ? (
                    <div className="pr-4 mt-2 mb-2">
                        <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full bg-transparent border-b border-muted-foreground/30 focus:border-primary outline-none transition-colors text-sm py-1 resize-none h-auto min-h-[40px]"
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
                    <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                        <ParsedText text={comment.content} onSeek={onSeek} />
                    </div>
                )}

                {/* Actions */}
                {!isEditing && (
                    <div className="flex items-center gap-4 pt-1">
                        <button
                            onClick={handleLike}
                            disabled={likeMutation.isPending}
                            className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${isLiked ? 'text-primary' : 'text-muted-foreground hover:text-white'}`}
                        >
                            <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                            <span>{likesCount > 0 ? formatNumber(likesCount) : ''}</span>
                        </button>

                        <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white transition-colors">
                            <ThumbsDown className="w-3.5 h-3.5" />
                        </button>

                        <button 
                            onClick={() => {
                                if (!user) return toast.error("Please login to reply")
                                if (depth >= 10) {
                                    return toast.warning("Maximum reply depth reached. You cannot reply further down this thread.")
                                }
                                if (!isReplying) {
                                    setReplyContent(`@${comment.owner?.username} `)
                                }
                                setIsReplying(!isReplying)
                            }}
                            className="text-xs font-medium text-muted-foreground hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                        >
                            Reply
                        </button>
                    </div>
                )}

                {/* Reply Input */}
                {isReplying && (
                    <div className="flex gap-3 mt-3 pr-4 animate-in fade-in zoom-in-95 duration-200">
                        <Avatar src={user?.avatar} fallback={user?.username} size="sm" />
                        <div className="flex-1">
                            <textarea
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                className="w-full bg-transparent border-b border-muted-foreground/30 focus:border-primary outline-none transition-colors text-sm py-1 resize-none h-auto min-h-[30px]"
                                placeholder="Add a reply..."
                                autoFocus
                            />
                            <div className="flex justify-end gap-2 mt-2">
                                <Button variant="ghost" size="sm" onClick={() => setIsReplying(false)} className="h-7 text-xs rounded-full">Cancel</Button>
                                <Button size="sm" onClick={handleReply} disabled={replyMutation.isPending || !replyContent.trim()} className="h-7 text-xs rounded-full">
                                    {replyMutation.isPending && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                                    Reply
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Replies Thread */}
                {hasReplies && (
                    <div className="mt-2">
                        <button 
                            onClick={() => {
                                const next = !showReplies
                                setShowReplies(next)
                                // If no embedded replies and we haven't fetched yet, fetch on first expand
                                if (next && embeddedReplies.length === 0 && !repliesFetched) {
                                    loadReplies()
                                }
                            }}
                            className="flex items-center gap-2 text-sm text-primary font-medium hover:bg-primary/10 px-3 py-1.5 rounded-full transition-colors"
                        >
                            {showReplies ? 'Hide replies' : `View ${totalRepliesCount} repl${totalRepliesCount === 1 ? 'y' : 'ies'}`}
                        </button>
                        
                        {showReplies && (
                            <div className={`mt-4 space-y-4 ${depth < 8 ? 'pl-4 sm:pl-6 border-l-2 border-white/10 ml-2' : 'pl-2 border-l border-white/5 ml-1'} relative`}>
                                {isLoadingReplies && (
                                    <div className="flex items-center gap-2 p-3 text-sm text-muted-foreground">
                                        <Loader2 className="w-4 h-4 animate-spin" /> Loading replies...
                                    </div>
                                )}
                                {displayReplies.map((reply) => (
                                    <div key={reply._id || reply.id} className="relative">
                                        {depth < 8 && <div className="absolute -left-4 sm:-left-6 top-5 w-4 sm:w-6 h-[2px] bg-white/10" />}
                                        {depth < 10 ? (
                                            <CommentItem comment={reply} videoId={videoId} onSeek={onSeek} depth={depth + 1} />
                                        ) : (
                                            <div className="text-xs text-muted-foreground italic py-2">
                                                Continue this thread →
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Dropdown Menu (Owner) */}
                {isOwner && !isEditing && (
                    <div className="absolute top-0 right-0">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-6 w-6 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                    <MoreVertical className="w-4 h-4 text-muted-foreground" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                                    <Pencil className="w-4 h-4 mr-2" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-destructive">
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
    )
}
