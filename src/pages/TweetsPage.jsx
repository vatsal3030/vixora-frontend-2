import { useState } from 'react'
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { tweetService, videoService } from '../services/api'
import { uploadToCloudinary } from '../lib/cloudinaryUpload'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Avatar } from '../components/ui/Avatar'
import { toast } from 'sonner'
import { Loader2, Image, X, FireExtinguisher, Flame, Users, Clock, Sparkles } from 'lucide-react'
import { useInView } from 'react-intersection-observer'
import { TweetCard } from '../components/tweet/TweetCard'
import { Link } from 'react-router-dom'

export default function TweetsPage() {
    const { user } = useAuth()
    const [mode, setMode] = useState(user ? 'forYou' : 'hot') // 'forYou' | 'following' | 'latest' | 'hot'

    const [content, setContent] = useState('')
    const [imageFile, setImageFile] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [createLoading, setCreateLoading] = useState(false)
    const { ref, inView } = useInView()

    const { data: hotTopicsData, isLoading: topicsLoading } = useQuery({
        queryKey: ['hotTopics'],
        queryFn: async () => {
            const res = await tweetService.getHotTopics({ limit: 20, windowHours: 72 })
            return res.data.data
        },
        staleTime: 5 * 60 * 1000
    })

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
        refetch
    } = useInfiniteQuery({
        queryKey: ['feed', mode],
        queryFn: async ({ pageParam = 1 }) => {
            const res = await tweetService.getFeed({ mode, page: pageParam, limit: 20 })
            return res.data.data
        },
        getNextPageParam: (lastPage) => lastPage.pagination.hasNextPage ? lastPage.pagination.currentPage + 1 : undefined,
    })

    // Fetch next page
    if (inView && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
    }

    const handleImageSelect = (e) => {
        const file = e.target.files[0]
        if (file) {
            setImageFile(file)
            const reader = new FileReader()
            reader.onloadend = () => setImagePreview(reader.result)
            reader.readAsDataURL(file)
        }
    }

    const removeImage = () => {
        setImageFile(null)
        setImagePreview(null)
    }


    const handleCreateTweet = async (e) => {
        e.preventDefault()
        if (!content.trim() && !imageFile) return

        setCreateLoading(true)
        try {
            let imagePublicId = null
            if (imageFile) {
                const sigRes = await videoService.getUploadSignature('post')
                const sigData = sigRes.data.data
                const cloudData = await uploadToCloudinary(imageFile, sigData)
                imagePublicId = cloudData.public_id
            }

            const payload = { content }
            if (imagePublicId) payload.imagePublicId = imagePublicId

            const response = await tweetService.createTweet(payload)
            if (response.data.success) {
                toast.success('Post sent')
                setContent('')
                removeImage()
                refetch() // Reload feed
            }
        } catch (error) {
            console.error(error)
            toast.error('Failed to post tweet')
        } finally {
            setCreateLoading(false)
        }
    }

    const handleDelete = async (tweetId) => {
        try {
            await tweetService.deleteTweet(tweetId)
            toast.success('Deleted')
            refetch()
        } catch {
            toast.error("Failed to delete")
        }
    }

    const tweets = data ? data.pages.flatMap(page => page.items) : []

    const navTabs = [
        { id: 'forYou', label: 'For You', icon: Sparkles, requiresAuth: true },
        { id: 'following', label: 'Following', icon: Users, requiresAuth: true },
        { id: 'hot', label: 'Trending', icon: Flame, requiresAuth: false },
        { id: 'latest', label: 'Latest', icon: Clock, requiresAuth: false },
    ]

    return (
        <div className="container mx-auto px-4 py-8 lg:py-10 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Main Feed Column */}
                <div className="lg:col-span-3">

                    {/* Header & Tabs */}
                    <div className="sticky top-[60px] z-10 bg-background/80 backdrop-blur-xl pb-4 mb-4 border-b border-white/5">
                        <h1 className="text-2xl font-bold mb-4 px-2">Community</h1>
                        <div className="flex gap-2 p-1 bg-secondary/30 rounded-xl overflow-x-auto scrollbar-hide">
                            {navTabs.map(tab => {
                                if (tab.requiresAuth && !user) return null
                                const isActive = mode === tab.id
                                const Icon = tab.icon
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setMode(tab.id)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all shrink-0 ${isActive ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {tab.label}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Compose Box */}
                    {user && (
                        <div className="bg-card border border-white/5 rounded-2xl p-4 sm:p-5 mb-8 shadow-sm">
                            <div className="flex gap-3 sm:gap-4">
                                <Avatar src={user.avatar} fallback={user.username} className="w-10 h-10 ring-1 ring-white/10" />
                                <form onSubmit={handleCreateTweet} className="flex-1">
                                    <textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="What's happening?"
                                        className="w-full bg-transparent border-none p-0 min-h-[50px] text-lg lg:text-xl placeholder:text-muted-foreground/60 resize-none focus:ring-0 focus:outline-none mb-4"
                                    />

                                    {imagePreview && (
                                        <div className="relative mb-4 inline-block">
                                            <img src={imagePreview} alt="Preview" className="max-h-60 rounded-xl border border-white/10 object-cover" />
                                            <button
                                                type="button"
                                                onClick={removeImage}
                                                className="absolute top-2 right-2 bg-black/60 backdrop-blur-md p-1.5 rounded-full hover:bg-black/80 text-white transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center pt-3 border-t border-white/5">
                                        <div className="flex gap-1">
                                            <label className="cursor-pointer p-2 hover:bg-primary/20 hover:text-primary rounded-full text-muted-foreground transition-colors">
                                                <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                                                <Image className="w-5 h-5" />
                                            </label>
                                        </div>
                                        <Button type="submit" className="rounded-full px-6 font-semibold" disabled={(!content.trim() && !imageFile) || createLoading}>
                                            {createLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                            Post
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Feed List */}
                    <div className="space-y-4">
                        {status === 'pending' ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : status === 'error' ? (
                            <div className="text-center py-12 text-muted-foreground bg-red-500/5 rounded-2xl border border-red-500/10">
                                Failed to load feed.
                            </div>
                        ) : tweets.length === 0 ? (
                            <div className="text-center py-16 text-muted-foreground bg-secondary/20 rounded-2xl border border-dashed border-white/5">
                                <span className="block text-4xl mb-3">📭</span>
                                <h3 className="text-lg font-semibold text-foreground mb-1">No posts right now</h3>
                                <p className="text-sm">Check back later or start the conversation.</p>
                            </div>
                        ) : (
                            <>
                                {tweets.map((tweet) => (
                                    <TweetCard key={tweet._id || tweet.id} tweet={tweet} onDelete={handleDelete} />
                                ))}

                                {/* Infinite scroll trigger */}
                                <div ref={ref} className="h-20 flex items-center justify-center">
                                    {isFetchingNextPage && <Loader2 className="w-6 h-6 animate-spin text-primary" />}
                                    {!hasNextPage && tweets.length > 0 && <span className="text-sm text-muted-foreground">You're all caught up!</span>}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Right Sidebar - Hot Topics */}
                <div className="hidden lg:block">
                    <div className="sticky top-[100px] glass-card border flex flex-col border-white/5 rounded-2xl p-5 shadow-sm">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Flame className="w-5 h-5 text-orange-500" />
                            Trending Topics
                        </h2>

                        {topicsLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="animate-pulse">
                                        <div className="h-3 bg-white/5 rounded w-12 mb-2" />
                                        <div className="h-4 bg-white/5 rounded w-32 mb-1" />
                                        <div className="h-3 bg-white/5 rounded w-20" />
                                    </div>
                                ))}
                            </div>
                        ) : hotTopicsData?.items?.length > 0 ? (
                            <div className="flex flex-col gap-5">
                                {hotTopicsData.items.map((topic, index) => (
                                    <div key={topic.topic} className="flex flex-col cursor-pointer group">
                                        <span className="text-[0.7rem] text-muted-foreground font-medium mb-0.5 uppercase tracking-wider">
                                            {index + 1} · Trending
                                        </span>
                                        <span className="font-bold text-[0.95rem] text-foreground group-hover:text-primary transition-colors">
                                            #{topic.displayName || topic.topic}
                                        </span>
                                        <span className="text-[0.8rem] text-muted-foreground mt-0.5">
                                            {topic.engagement} interactions
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-muted-foreground text-center py-6">
                                Not enough data to show trends right now.
                            </div>
                        )}
                    </div>

                    {/* Footer links */}
                    <div className="mt-6 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground px-2">
                        <a href="#" className="hover:text-foreground hover:underline">Terms of Service</a>
                        <a href="#" className="hover:text-foreground hover:underline">Privacy Policy</a>
                        <a href="#" className="hover:text-foreground hover:underline">Cookie Policy</a>
                        <a href="#" className="hover:text-foreground hover:underline">Accessibility</a>
                        <span>&copy; 2026 Vixora</span>
                    </div>
                </div>

            </div>
        </div>
    )
}
