import { useState, useEffect, useCallback } from 'react'
import { tweetService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Avatar } from '../components/ui/Avatar'
import { toast } from 'sonner'
import { Loader2, Trash2, Heart, MessageSquare } from 'lucide-react'
import { formatTimeAgo } from '../lib/utils'

export default function TweetsPage() {
    const { user } = useAuth()
    const [tweets, setTweets] = useState([])
    const [content, setContent] = useState('')
    const [loading, setLoading] = useState(true)
    const [createLoading, setCreateLoading] = useState(false)

    const fetchTweets = useCallback(async () => {
        setLoading(true)
        try {
            const response = await tweetService.getUserTweets(user._id)
            if (response.data.success) {
                setTweets(response.data.data)
            }
        } catch (error) {
            console.error(error)
            toast.error('Failed to load tweets')
        } finally {
            setLoading(false)
        }
    }, [user])

    useEffect(() => {
        if (user) {
            fetchTweets()
        }
    }, [user, fetchTweets])

    const handleCreateTweet = async (e) => {
        e.preventDefault()
        if (!content.trim()) return

        setCreateLoading(true)
        try {
            const response = await tweetService.createTweet({ content })
            if (response.data.success) {
                toast.success('Tweet posted')
                setContent('')
                fetchTweets() // Refresh list
            }
        } catch (error) {
            console.error(error)
            toast.error('Failed to post tweet')
        } finally {
            setCreateLoading(false)
        }
    }

    const handleDeleteTweet = async (tweetId) => {
        if (!window.confirm('Are you sure you want to delete this tweet?')) return

        try {
            await tweetService.deleteTweet(tweetId)
            setTweets(prev => prev.filter(t => t._id !== tweetId))
            toast.success('Tweet deleted')
        } catch (error) {
            console.error(error)
            toast.error('Failed to delete tweet')
        }
    }

    if (!user) return null

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <h1 className="text-2xl font-bold mb-6">Community Posts</h1>

            {/* Create Tweet */}
            <div className="bg-card border border-border rounded-xl p-4 mb-8">
                <div className="flex gap-4">
                    <Avatar src={user.avatar} fallback={user.username} />
                    <form onSubmit={handleCreateTweet} className="flex-1">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Share something with your community..."
                            className="w-full bg-secondary/50 border-none rounded-lg p-3 min-h-[100px] resize-none focus:ring-1 focus:ring-primary focus:outline-none mb-2"
                        />
                        <div className="flex justify-end">
                            <Button type="submit" disabled={!content.trim() || createLoading}>
                                {createLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Post
                            </Button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Tweets List */}
            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : tweets.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground bg-secondary/20 rounded-xl border border-dashed border-border">
                    No posts yet. Start a conversation!
                </div>
            ) : (
                <div className="space-y-4">
                    {tweets.map((tweet) => (
                        <div key={tweet._id} className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors">
                            <div className="flex gap-4">
                                <Avatar src={tweet.owner?.avatar || user.avatar} fallback={tweet.owner?.username || user.username} />
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="font-semibold mr-2">{tweet.owner?.username || user.username}</span>
                                            <span className="text-xs text-muted-foreground">{formatTimeAgo(tweet.createdAt)}</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                            onClick={() => handleDeleteTweet(tweet._id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    <p className="mt-2 text-sm whitespace-pre-wrap">{tweet.content}</p>

                                    <div className="flex gap-4 mt-4">
                                        <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                                            <Heart className="w-4 h-4" />
                                            {tweet.likesCount || 0}
                                        </button>
                                        <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                                            <MessageSquare className="w-4 h-4" />
                                            0
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
