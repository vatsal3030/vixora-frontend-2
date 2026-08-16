import { useState } from 'react'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { commentService } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { Avatar } from '../ui/Avatar'
import { CommentItem } from '../video/CommentItem'
import { Button } from '../ui/Button'
import { getMediaUrl } from '../../lib/media'
import { Loader2, X, ArrowDownWideNarrow, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { formatNumber } from '../../lib/utils'

export default function ShortsComments({ videoId, commentsCount = 0, onClose }) {
    const { user } = useAuth()
    const queryClient = useQueryClient()
    const [newComment, setNewComment] = useState('')
    const [sortBy, setSortBy] = useState('recent') // 'recent' | 'top'

    const {
        data: commentsData,
        fetchNextPage: fetchMoreComments,
        hasNextPage: hasMoreComments,
        isLoading
    } = useInfiniteQuery({
        queryKey: ['comments', videoId, sortBy],
        queryFn: async ({ pageParam = 1 }) => {
            const res = await commentService.getComments(videoId, {
                page: pageParam,
                limit: 20,
                sortBy: sortBy === 'top' ? 'likes' : 'createdAt',
                sortType: 'desc'
            })
            return res.data.data
        },
        enabled: !!videoId,
        getNextPageParam: (lastPage) => {
            const p = lastPage?.pagination
            return p?.hasNextPage ? (p.currentPage || p.page || 1) + 1 : undefined
        },
        initialPageParam: 1
    })

    const comments = commentsData?.pages.flatMap(page => page?.items || page?.comments || page.data?.items || page.data?.comments || []) || []

    const commentMutation = useMutation({
        mutationFn: (content) => commentService.addComment(videoId, content),
        onSuccess: () => {
            setNewComment('')
            toast.success('Comment added')
            queryClient.invalidateQueries({ queryKey: ['comments', videoId] })
        },
        onError: (err) => {
            console.error('Comment error:', err)
            toast.error(err.response?.data?.message || 'Failed to post comment')
        }
    })

    const handleSubmitComment = (e) => {
        e.preventDefault()
        if (!user) return toast.error('Please login to comment')
        if (!newComment.trim()) return
        commentMutation.mutate(newComment.trim())
    }

    const handlePanelClick = (e) => {
        e.stopPropagation()
    }

    const totalCount = formatNumber(commentsCount || comments.length)

    return (
        <motion.div
            initial={{ opacity: 0, x: window.innerWidth < 1024 ? 0 : 40, y: window.innerWidth < 1024 ? 40 : 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: window.innerWidth < 1024 ? 0 : 40, y: window.innerWidth < 1024 ? 40 : 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 32 }}
            className="absolute lg:relative right-0 lg:right-auto top-auto sm:top-0 lg:top-auto bottom-0 lg:bottom-auto w-full sm:w-[350px] lg:w-[400px] xl:w-[450px] h-[65vh] sm:h-full lg:h-[calc(100vh-64px-2rem)] z-[45] bg-[#0f0f0f] sm:rounded-l-2xl rounded-t-2xl lg:rounded-2xl border-t sm:border-t-0 sm:border-l lg:border border-white/10 shadow-2xl flex flex-col shrink-0 overflow-hidden"
            onClick={handlePanelClick}
        >
            {/* Header matching YouTube Shorts */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0 bg-[#0f0f0f]/90 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg text-white">Comments</h3>
                    <span className="text-muted-foreground text-sm font-medium">{totalCount}</span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setSortBy(prev => prev === 'recent' ? 'top' : 'recent')}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-muted-foreground hover:text-white"
                        title={sortBy === 'recent' ? 'Sorted by Newest' : 'Sorted by Top'}
                    >
                        <ArrowDownWideNarrow className="w-5 h-5" />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
                        title="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                {isLoading ? (
                    <div className="flex justify-center items-center h-48">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                ) : comments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground space-y-2">
                        <MessageSquare className="w-10 h-10 opacity-40 mb-1" />
                        <p className="text-sm font-medium text-white">No comments yet</p>
                        <p className="text-xs">Be the first to share your thoughts!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {comments.map((comment) => (
                            <CommentItem
                                key={comment._id || comment.id}
                                comment={comment}
                                videoId={videoId}
                            />
                        ))}
                        {hasMoreComments && (
                            <Button
                                variant="ghost"
                                onClick={() => fetchMoreComments()}
                                className="w-full text-primary hover:text-primary/80 hover:bg-white/5 text-xs h-8 rounded-full"
                            >
                                <Loader2 className="w-3 h-3 mr-2 animate-spin" /> Load more comments
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Bottom Add Comment Box (matching YouTube Shorts style) */}
            <div className="p-3 border-t border-white/10 bg-[#121212] shrink-0">
                <form onSubmit={handleSubmitComment} className="flex gap-3 items-center">
                    <Avatar
                        src={getMediaUrl(user?.avatar)}
                        fallback={user?.username || 'U'}
                        size="sm"
                        className="flex-shrink-0"
                    />
                    <div className="flex-1 flex items-center gap-2 bg-[#1f1f1f] rounded-full px-4 py-1.5 border border-white/5 focus-within:border-primary/50 transition-colors">
                        <input
                            type="text"
                            placeholder="Add a comment..."
                            className="w-full bg-transparent outline-none text-sm text-white placeholder:text-muted-foreground py-0.5"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyDown={(e) => {
                                e.stopPropagation()
                            }}
                        />
                        <AnimatePresence>
                            {newComment.trim() && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="flex-shrink-0"
                                >
                                    <Button
                                        type="submit"
                                        disabled={commentMutation.isPending}
                                        className="bg-primary hover:bg-primary/90 text-white rounded-full px-3.5 h-7 text-xs font-semibold"
                                    >
                                        {commentMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Reply'}
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
