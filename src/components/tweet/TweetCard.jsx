import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Avatar } from '../ui/Avatar'
import { Button } from '../ui/Button'
import { getMediaUrl } from '../../lib/media'
import { formatTimeAgo } from '../../lib/utils'
import { Heart, MessageSquare, MoreVertical, Flag, Edit, Trash2, Share2 } from 'lucide-react'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../ui/DropdownMenu'
import { ReportDialog } from '../common/ReportDialog'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'sonner'
import { likeService } from '../../services/api'

export function TweetCard({ 
    tweet, 
    onDelete, 
    onEditInit, 
    hideActions = false 
}) {
    const { user } = useAuth()
    const [isLiked, setIsLiked] = useState(tweet?.isLikedByMe || false)
    const [likesCount, setLikesCount] = useState(tweet?.likesCount || 0)

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
            await likeService.toggleTweetLike(tweet._id || tweet.id)
        } catch (error) {
            console.error(error)
            // Revert on error
            setIsLiked(!isLiked)
            setLikesCount(prev => isLiked ? prev + 1 : Math.max(0, prev - 1))
            toast.error("Failed to toggle like")
        }
    }

    const isOwner = user && tweet.owner?._id === user._id

    return (
        <div className="glass-card border border-white/5 p-4 sm:p-5 rounded-2xl hover:bg-white/5 transition-colors group flex gap-3 sm:gap-4 relative">
            <Link to={`/@${tweet.owner?.username}`} className="shrink-0 h-fit block">
                <Avatar src={getMediaUrl(tweet.owner?.avatar)} fallback={tweet.owner?.username} size="md" className="ring-1 ring-white/10 group-hover:ring-white/30 transition-all" />
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
                                <ReportDialog targetType="TWEET" targetId={tweet._id || tweet.id} trigger={
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="hover:bg-white/10 cursor-pointer focus:bg-white/10 focus:text-white py-3">
                                        <Flag className="w-4 h-4 mr-3" /> Report
                                    </DropdownMenuItem>
                                } />
                                {isOwner && (
                                    <>
                                        <DropdownMenuItem onClick={() => onEditInit && onEditInit(tweet)} className="hover:bg-white/10 cursor-pointer focus:bg-white/10 focus:text-white py-3">
                                            <Edit className="w-4 h-4 mr-3" /> Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onDelete && onDelete(tweet._id || tweet.id)} className="text-red-500 hover:text-red-500 focus:text-red-500 cursor-pointer py-3">
                                            <Trash2 className="w-4 h-4 mr-3" /> Delete
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                <div className="text-[0.95rem] leading-relaxed whitespace-pre-wrap mt-1">
                    {/* Render extracted topics as highlighted spans if needed, but for now just text */}
                    {tweet.content}
                </div>

                {tweet.image && (
                    <div className="mt-3 rounded-xl overflow-hidden border border-white/5">
                        <img src={getMediaUrl(tweet.image)} alt="Attachment" className="max-w-full max-h-[400px] object-cover" loading="lazy" />
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
                        {/* Reply */}
                        <div className="flex items-center group/action cursor-pointer">
                            <div className="p-2 rounded-full group-hover/action:bg-blue-500/10 transition-colors">
                                <MessageSquare className="w-[1.15rem] h-[1.15rem] text-muted-foreground group-hover/action:text-blue-400 transition-colors" />
                            </div>
                            <span className="text-xs text-muted-foreground font-medium group-hover/action:text-blue-400 -ml-0.5">
                                {tweet.commentsCount || 0}
                            </span>
                        </div>

                        {/* Like */}
                        <div className="flex items-center group/action cursor-pointer" onClick={handleLike}>
                            <div className="p-2 rounded-full group-hover/action:bg-pink-500/10 transition-colors">
                                <Heart className={`w-[1.15rem] h-[1.15rem] transition-colors ${isLiked ? 'fill-pink-500 text-pink-500' : 'text-muted-foreground group-hover/action:text-pink-400'}`} />
                            </div>
                            <span className={`text-xs font-medium -ml-0.5 transition-colors ${isLiked ? 'text-pink-500' : 'text-muted-foreground group-hover/action:text-pink-400'}`}>
                                {likesCount > 0 ? likesCount : ''}
                            </span>
                        </div>

                        {/* Share */}
                        <div className="flex items-center group/action cursor-pointer" onClick={(e) => { e.preventDefault(); navigator.clipboard.writeText(`${window.location.origin}/tweets/${tweet._id || tweet.id}`); toast.success("Link copied!"); }}>
                            <div className="p-2 rounded-full group-hover/action:bg-green-500/10 transition-colors">
                                <Share2 className="w-[1.15rem] h-[1.15rem] text-muted-foreground group-hover/action:text-green-400 transition-colors" />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
