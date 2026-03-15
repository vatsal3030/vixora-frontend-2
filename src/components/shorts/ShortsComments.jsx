import { useState } from 'react'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { commentService } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { Avatar } from '../ui/Avatar'
import { CommentItem } from '../video/CommentItem'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { getMediaUrl } from '../../lib/media'
import { Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { formatNumber, formatTimeAgo } from '../../lib/utils'

export default function ShortsComments({ videoId, commentsCount, onClose }) {
    const { user } = useAuth()
    const queryClient = useQueryClient()
    const [newComment, setNewComment] = useState('')

    const {
        data: commentsData,
        fetchNextPage: fetchMoreComments,
        hasNextPage: hasMoreComments,
        isLoading
    } = useInfiniteQuery({
        queryKey: ['comments', videoId],
        queryFn: async ({ pageParam = 1 }) => {
            const res = await commentService.getComments(videoId, { page: pageParam })
            return res.data.data
        },
        enabled: !!videoId,
        getNextPageParam: (lastPage) => {
            const p = lastPage?.pagination
            return p?.hasNextPage ? (p.currentPage || p.page || 1) + 1 : undefined
        },
        initialPageParam: 1
    })

    const comments = commentsData?.pages.flatMap(page => page?.items || []) || []

    const commentMutation = useMutation({
        mutationFn: (content) => commentService.addComment(videoId, content),
        onSuccess: () => {
            setNewComment('')
            toast.success('Comment added')
            queryClient.invalidateQueries(['comments', videoId])
        },
        onError: () => toast.error('Failed to post comment')
    })

    const handleSubmitComment = (e) => {
        e.preventDefault()
        if (!user) return toast.error('Please login to comment')
        if (!newComment.trim()) return
        commentMutation.mutate(newComment)
    }

    // Stop propagation so clicking inside comments doesn't trigger video play/pause
    const handlePanelClick = (e) => {
        e.stopPropagation()
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: window.innerWidth < 1024 ? 0 : 50, y: window.innerWidth < 1024 ? 50 : 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: window.innerWidth < 1024 ? 0 : 50, y: window.innerWidth < 1024 ? 50 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute lg:relative right-0 lg:right-auto top-auto sm:top-0 lg:top-auto bottom-0 lg:bottom-auto w-full sm:w-[350px] lg:w-[400px] xl:w-[450px] h-[60vh] sm:h-full lg:h-[calc(100vh-64px-2rem)] z-[40] bg-[#0f0f0f] sm:rounded-l-2xl rounded-t-2xl lg:rounded-2xl sm:rounded-tr-none lg:rounded-tr-2xl border-t sm:border-t-0 sm:border-l lg:border border-white/10 shadow-2xl flex flex-col shrink-0"
            onClick={handlePanelClick}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg">Comments</h3>
                    <span className="text-muted-foreground text-sm">{formatNumber(commentsCount)}</span>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
                {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <Loader2 className="w-6 h-6 animate-spin text-white" />
                    </div>
                ) : comments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground space-y-2">
                        <p className="text-sm">No comments yet</p>
                        <p className="text-xs">Be the first to comment!</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {comments.map((comment) => (
                            <CommentItem key={comment._id} comment={comment} />
                        ))}
                        {hasMoreComments && (
                            <Button
                                variant="ghost"
                                onClick={() => fetchMoreComments()}
                                className="w-full text-primary hover:text-primary/80 hover:bg-white/5 text-xs h-8"
                            >
                                <Loader2 className="w-3 h-3 mr-2 animate-spin" /> Load more
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Add Comment Input */}
            <div className="p-4 border-t border-white/10 bg-[#0f0f0f] shrink-0">
                <form onSubmit={handleSubmitComment} className="flex gap-3 items-start">
                    <Avatar src={getMediaUrl(user?.avatar)} fallback={user?.username || 'U'} size="sm" />
                    <div className="flex-1 flex flex-col gap-2 relative">
                        <input
                            type="text"
                            placeholder="Add a comment..."
                            className="w-full bg-transparent border-b border-white/20 focus:border-primary outline-none transition-colors text-sm py-1"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyDown={(e) => {
                                // Prevent keyboard events from bubbling to ShortsPage (e.g. arrows)
                                e.stopPropagation()
                            }}
                        />
                        <AnimatePresence>
                            {newComment && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="flex justify-end mt-2"
                                >
                                    <Button
                                        type="submit"
                                        disabled={commentMutation.isPending}
                                        className="bg-primary hover:bg-primary/90 text-white rounded-full px-4 h-8 text-xs font-semibold"
                                    >
                                        {commentMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Comment'}
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </form>
            </div>
        </motion.div>
    )
}
