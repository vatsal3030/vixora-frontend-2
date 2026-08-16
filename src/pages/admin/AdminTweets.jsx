import { useState, useEffect } from 'react'
import { adminService } from '../../services/api'
import { toast } from 'sonner'
import { formatTimeAgo } from '../../lib/utils'
import { Trash2, RotateCcw } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog'

export default function AdminTweets() {
    const [tweets, setTweets] = useState([])
    const [loading, setLoading] = useState(true)
    const [deleteTargetId, setDeleteTargetId] = useState(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const fetchTweets = async () => {
        try {
            setLoading(true)
            const res = await adminService.getTweets({ limit: 50 })
            setTweets(res.data.data?.items || [])
        } catch (err) {
            console.error(err)
            toast.error('Failed to load tweets')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTweets()
    }, [])

    const handleSoftDelete = async (tweetId) => {
        setIsDeleting(true)
        try {
            await adminService.softDeleteTweet(tweetId)
            toast.success('Tweet deleted')
            setDeleteTargetId(null)
            fetchTweets()
        } catch (err) {
            console.error(err)
            toast.error('Failed to delete tweet')
        } finally {
            setIsDeleting(false)
        }
    }

    const handleRestore = async (tweetId) => {
        try {
            await adminService.restoreTweet(tweetId)
            toast.success('Tweet restored')
            fetchTweets()
        } catch (err) {
            console.error(err)
            toast.error('Failed to restore tweet')
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-display font-bold">Tweets</h1>
                <p className="text-muted-foreground mt-1">Manage global platform tweets</p>
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
                                        Loading tweets...
                                    </td>
                                </tr>
                            ) : tweets.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-12 text-center text-muted-foreground">
                                        No tweets found
                                    </td>
                                </tr>
                            ) : (
                                tweets.map((tweet) => (
                                    <tr key={tweet._id || tweet.id} className={`transition-colors ${tweet.isDeleted ? 'bg-red-500/5' : 'hover:bg-secondary/20'}`}>
                                        <td className="p-4 pl-6">
                                            <p className={`line-clamp-2 ${tweet.isDeleted ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                                                {tweet.content}
                                            </p>
                                            <div className="text-xs text-muted-foreground mt-1">{formatTimeAgo(tweet.createdAt)}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm font-medium">@{tweet.owner?.username}</div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                tweet.isDeleted ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'
                                            }`}>
                                                {tweet.isDeleted ? 'DELETED' : 'ACTIVE'}
                                            </span>
                                        </td>
                                        <td className="p-4 pr-6 text-right">
                                            {tweet.isDeleted ? (
                                                <Button variant="ghost" size="sm" onClick={() => handleRestore(tweet._id || tweet.id)} className="text-green-500 hover:text-green-400">
                                                    <RotateCcw className="w-4 h-4 mr-2" /> Restore
                                                </Button>
                                            ) : (
                                                <Button variant="ghost" size="sm" onClick={() => setDeleteTargetId(tweet._id || tweet.id)} className="text-red-500 hover:text-red-400">
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
                title="Delete Tweet"
                description="Are you sure you want to delete this tweet? This can be reversed by restoring."
                onConfirm={() => handleSoftDelete(deleteTargetId)}
                isLoading={isDeleting}
            />
        </div>
    )
}
