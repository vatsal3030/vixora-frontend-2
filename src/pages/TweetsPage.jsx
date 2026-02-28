import { useState, useEffect, useCallback } from 'react'
import { tweetService, videoService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Avatar } from '../components/ui/Avatar'
import { toast } from 'sonner'
import { Loader2, Trash2, Heart, MessageSquare, Image, X, MoreVertical, Flag } from 'lucide-react'
import { formatTimeAgo } from '../lib/utils'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../components/ui/DropdownMenu'
import { ReportDialog } from '../components/common/ReportDialog'

export default function TweetsPage() {
    const { user } = useAuth()
    const [tweets, setTweets] = useState([])
    const [content, setContent] = useState('')
    const [loading, setLoading] = useState(true)
    const [createLoading, setCreateLoading] = useState(false)
    const [imageFile, setImageFile] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)

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

    const handleImageSelect = (e) => {
        const file = e.target.files[0]
        if (file) {
            setImageFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const removeImage = () => {
        setImageFile(null)
        setImagePreview(null)
        // Reset file input if needed, but since we hide it and use label, it handles itself mostly.
    }

    // Generic direct upload helper
    const uploadToCloudinary = async (file, signatureData) => {
        const url = `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/${signatureData.resourceType}/upload`
        const formData = new FormData()
        formData.append('file', file)
        formData.append('api_key', signatureData.api_key)
        formData.append('timestamp', signatureData.timestamp)
        formData.append('signature', signatureData.signature)
        formData.append('public_id', signatureData.publicId)

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest()
            xhr.open('POST', url)
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(JSON.parse(xhr.responseText))
                } else {
                    reject(new Error(`Cloudinary upload failed: ${xhr.statusText}`))
                }
            }
            xhr.onerror = () => reject(new Error('Network error'))
            xhr.send(formData)
        })
    }

    const handleCreateTweet = async (e) => {
        e.preventDefault()
        if (!content.trim() && !imageFile) return

        setCreateLoading(true)
        try {
            let imagePublicId = null

            if (imageFile) {
                // 1. Get Signature
                // Using 'post' as resourceType based on Handoff calling it "post" in signature mapping.
                const sigRes = await videoService.getUploadSignature('post')
                const sigData = sigRes.data.data

                // 2. Upload
                const cloudData = await uploadToCloudinary(imageFile, sigData)
                imagePublicId = cloudData.public_id
            }

            const payload = { content }
            if (imagePublicId) {
                payload.imagePublicId = imagePublicId
            }

            const response = await tweetService.createTweet(payload)

            if (response.data.success) {
                toast.success('Tweet posted')
                setContent('')
                removeImage()
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

                        {imagePreview && (
                            <div className="relative mb-4 inline-block">
                                <img src={imagePreview} alt="Preview" className="max-h-60 rounded-lg border border-white/10" />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute top-2 right-2 bg-black/50 p-1 rounded-full hover:bg-black/70 text-white transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        <div className="flex justify-between items-center">
                            <div className="flex gap-2">
                                <label className="cursor-pointer p-2 hover:bg-white/5 rounded-full text-primary transition-colors">
                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                                    <Image className="w-5 h-5" />
                                </label>
                            </div>
                            <Button type="submit" disabled={(!content.trim() && !imageFile) || createLoading}>
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
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-white/10 rounded-full">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48 glass-panel border-white/5 text-white bg-black/60 backdrop-blur-xl rounded-xl shadow-premium">
                                                <ReportDialog targetType="TWEET" targetId={tweet._id} trigger={
                                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="hover:bg-white/10 cursor-pointer focus:bg-white/10 focus:text-white py-3">
                                                        <Flag className="w-4 h-4 mr-3" /> Report
                                                    </DropdownMenuItem>
                                                } />
                                                {(tweet.owner?._id === user._id || !tweet.owner) && (
                                                    <DropdownMenuItem onClick={() => handleDeleteTweet(tweet._id)} className="text-red-500 hover:text-red-500 focus:text-red-500 cursor-pointer py-3">
                                                        <Trash2 className="w-4 h-4 mr-3" /> Delete
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    <p className="mt-2 text-sm whitespace-pre-wrap">{tweet.content}</p>

                                    {tweet.image && (
                                        <div className="mt-3 rounded-lg overflow-hidden border border-white/5">
                                            <img src={tweet.image} alt="Tweet attachment" className="max-w-full max-h-[500px] object-cover" />
                                        </div>
                                    )}

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
