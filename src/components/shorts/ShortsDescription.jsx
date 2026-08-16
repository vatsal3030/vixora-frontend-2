import { motion } from 'framer-motion'
import { X, ThumbsUp, Eye, Calendar, Sparkles, Hash } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatNumber, formatViews } from '../../lib/utils'
import { ParsedText } from '../common/ParsedText'

export default function ShortsDescription({ video, onClose }) {
    if (!video) return null

    const formattedDate = video.createdAt
        ? new Date(video.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
          })
        : 'Recent'

    const likes = formatNumber(video.likesCount ?? video.likes ?? 0)
    const views = Number(video.views ?? 0).toLocaleString()

    const handlePanelClick = (e) => {
        e.stopPropagation()
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: window.innerWidth < 1024 ? 0 : 40, y: window.innerWidth < 1024 ? 40 : 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: window.innerWidth < 1024 ? 0 : 40, y: window.innerWidth < 1024 ? 40 : 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 32 }}
            className="absolute lg:relative right-0 lg:right-auto top-auto sm:top-0 lg:top-auto bottom-0 lg:bottom-auto w-full sm:w-[350px] lg:w-[400px] xl:w-[450px] h-[65vh] sm:h-full lg:h-[calc(100vh-64px-2rem)] z-[45] bg-[#0f0f0f] sm:rounded-l-2xl rounded-t-2xl lg:rounded-2xl border-t sm:border-t-0 sm:border-l lg:border border-white/10 shadow-2xl flex flex-col shrink-0 overflow-hidden"
            onClick={handlePanelClick}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
                <h3 className="font-bold text-lg text-white">Description</h3>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
                    title="Close"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
                {/* Title */}
                <div>
                    <h2 className="text-base font-semibold text-white leading-snug">
                        {video.title}
                    </h2>
                </div>

                {/* Stats Cards Row (Matching YouTube Shorts layout) */}
                <div className="grid grid-cols-3 gap-2.5">
                    {/* Likes Card */}
                    <div className="bg-[#1f1f1f] hover:bg-[#252525] transition-colors rounded-xl p-3 flex flex-col items-center justify-center text-center border border-white/5">
                        <span className="text-base font-bold text-amber-500">{likes}</span>
                        <span className="text-xs text-muted-foreground mt-0.5">Likes</span>
                    </div>

                    {/* Views Card */}
                    <div className="bg-[#1f1f1f] hover:bg-[#252525] transition-colors rounded-xl p-3 flex flex-col items-center justify-center text-center border border-white/5">
                        <span className="text-base font-bold text-amber-500">{views}</span>
                        <span className="text-xs text-muted-foreground mt-0.5">Views</span>
                    </div>

                    {/* Date Card */}
                    <div className="bg-[#1f1f1f] hover:bg-[#252525] transition-colors rounded-xl p-3 flex flex-col items-center justify-center text-center border border-white/5">
                        <span className="text-sm font-bold text-amber-500 leading-tight">{formattedDate}</span>
                        <span className="text-xs text-muted-foreground mt-0.5">Date</span>
                    </div>
                </div>

                {/* Description Body */}
                <div className="bg-[#161616] p-4 rounded-xl border border-white/5 text-sm text-white/90 leading-relaxed whitespace-pre-wrap">
                    {video.description ? (
                        <ParsedText text={video.description} />
                    ) : (
                        <p className="text-muted-foreground italic text-xs">No description provided for this short.</p>
                    )}
                </div>

                {/* Clickable Tags */}
                {video.tags && video.tags.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                            {video.tags.map((tag, idx) => {
                                const rawTagName = typeof tag === 'string' ? tag : (tag.name || tag.tag || tag.id || '')
                                const cleanTagName = String(rawTagName).replace(/^#/, '')
                                if (!cleanTagName) return null

                                return (
                                    <Link
                                        key={idx}
                                        to={`/search?q=%23${encodeURIComponent(cleanTagName)}`}
                                        onClick={(e) => e.stopPropagation()}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/40 rounded-full text-xs text-primary font-medium transition-all active:scale-95 shadow-sm hover:shadow-primary/10"
                                    >
                                        <Hash className="w-3 h-3 text-primary/80" />
                                        <span>{cleanTagName}</span>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    )
}
