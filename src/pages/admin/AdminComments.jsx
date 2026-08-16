import { useState, useEffect } from 'react'
import { adminService } from '../../services/api'
import { toast } from 'sonner'
import { formatTimeAgo } from '../../lib/utils'
import { Trash2, RotateCcw } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog'

export default function AdminComments() {
    const [comments, setComments] = useState([])
    const [loading, setLoading] = useState(true)
    const [deleteTargetId, setDeleteTargetId] = useState(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const fetchComments = async () => {
        try {
            setLoading(true)
            const res = await adminService.getComments({ limit: 50 })
            setComments(res.data.data?.items || [])
        } catch (err) {
            console.error(err)
            toast.error('Failed to load comments')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchComments()
    }, [])

    const handleSoftDelete = async (commentId) => {
        setIsDeleting(true)
        try {
            await adminService.softDeleteComment(commentId)
            toast.success('Comment deleted')
            setDeleteTargetId(null)
            fetchComments()
        } catch (err) {
            console.error(err)
            toast.error('Failed to delete comment')
        } finally {
            setIsDeleting(false)
        }
    }

    const handleRestore = async (commentId) => {
        try {
            await adminService.restoreComment(commentId)
            toast.success('Comment restored')
            fetchComments()
        } catch (err) {
            console.error(err)
            toast.error('Failed to restore comment')
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-display font-bold">Comments</h1>
                <p className="text-muted-foreground mt-1">Manage global platform comments</p>
            </div>

            <div className="glass-card rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/5 bg-secondary/30">
                                <th className="text-left p-4 pl-6 font-medium text-muted-foreground w-1/2">Content</th>
                                <th className="text-left p-4 font-medium text-muted-foreground">Author</th>
                                <th className="text-right p-4 font-medium text-muted-foreground">Status</th>
                                <th className="text-right p-4 pr-6 font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="p-12 text-center text-muted-foreground">
                                        Loading comments...
                                    </td>
                                </tr>
                            ) : comments.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-12 text-center text-muted-foreground">
                                        No comments found
                                    </td>
                                </tr>
                            ) : (
                                comments.map((comment) => (
                                    <tr key={comment._id || comment.id} className={`transition-colors ${comment.isDeleted ? 'bg-red-500/5' : 'hover:bg-secondary/20'}`}>
                                        <td className="p-4 pl-6">
                                            <p className={`line-clamp-2 ${comment.isDeleted ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                                                {comment.content}
                                            </p>
                                            <div className="text-xs text-muted-foreground mt-1">{formatTimeAgo(comment.createdAt)}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm font-medium">@{comment.owner?.username}</div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                comment.isDeleted ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'
                                            }`}>
                                                {comment.isDeleted ? 'DELETED' : 'ACTIVE'}
                                            </span>
                                        </td>
                                        <td className="p-4 pr-6 text-right">
                                            {comment.isDeleted ? (
                                                <Button variant="ghost" size="sm" onClick={() => handleRestore(comment._id || comment.id)} className="text-green-500 hover:text-green-400">
                                                    <RotateCcw className="w-4 h-4 mr-2" /> Restore
                                                </Button>
                                            ) : (
                                                <Button variant="ghost" size="sm" onClick={() => setDeleteTargetId(comment._id || comment.id)} className="text-red-500 hover:text-red-400">
                                                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmationDialog
                open={!!deleteTargetId}
                onOpenChange={(open) => { if (!open) setDeleteTargetId(null) }}
                title="Delete Comment"
                description="Are you sure you want to delete this comment? This can be reversed by restoring."
                onConfirm={() => handleSoftDelete(deleteTargetId)}
                isLoading={isDeleting}
            />
        </div>
    )
}
