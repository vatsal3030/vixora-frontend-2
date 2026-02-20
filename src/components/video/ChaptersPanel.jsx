import { useRef } from 'react'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { cn } from '../../lib/utils'
import { getMediaUrl } from '../../lib/media'

/**
 * Format seconds → "m:ss" or "h:mm:ss"
 */
function secondsToTime(s) {
    s = Math.floor(s)
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    return `${m}:${String(sec).padStart(2, '0')}`
}

/**
 * YouTube-style horizontal chapters strip.
 *
 * Props:
 *  - chapters: Array<{ title, startSeconds, thumbnail? }>
 *  - currentTime: number (seconds)
 *  - poster: string (video thumbnail — used as fallback for chapter thumbnails)
 *  - onSeek: (seconds: number) => void
 *
 * The `chapters` array can come from:
 *  - transcript cues treated as chapters (if the video has no explicit chapters)
 *  - a `chapters` field on the video object
 */
export default function ChaptersPanel({ chapters = [], currentTime = 0, poster, onSeek }) {
    const scrollRef = useRef(null)

    if (!chapters || chapters.length === 0) return null

    // Find active chapter
    const activeIdx = chapters.reduce((acc, ch, i) => {
        return currentTime >= ch.startSeconds ? i : acc
    }, 0)

    const scrollBy = (dir) => {
        scrollRef.current?.scrollBy({ left: dir * 220, behavior: 'smooth' })
    }

    return (
        <div className="relative">
            {/* Section header */}
            <div className="flex items-center justify-between mb-2.5 px-0.5">
                <h4 className="font-bold text-sm text-white">Chapters</h4>
                <div className="flex gap-1">
                    <button
                        onClick={() => scrollBy(-1)}
                        className="w-7 h-7 rounded-lg bg-white/8 hover:bg-white/16 flex items-center justify-center text-muted-foreground hover:text-white transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => scrollBy(1)}
                        className="w-7 h-7 rounded-lg bg-white/8 hover:bg-white/16 flex items-center justify-center text-muted-foreground hover:text-white transition-colors"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Scrollable chapter cards */}
            <div
                ref={scrollRef}
                className="flex gap-2.5 overflow-x-auto pb-2"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {chapters.map((ch, i) => {
                    const isActive = i === activeIdx
                    const thumb = ch.thumbnail
                        ? (ch.thumbnail.startsWith('http') ? ch.thumbnail : getMediaUrl(ch.thumbnail))
                        : poster
                    return (
                        <button
                            key={i}
                            onClick={() => onSeek?.(ch.startSeconds)}
                            className={cn(
                                'flex-shrink-0 w-[180px] rounded-xl overflow-hidden border-2 transition-all duration-200 text-left group',
                                isActive
                                    ? 'border-primary shadow-md shadow-primary/20'
                                    : 'border-transparent hover:border-white/20'
                            )}
                        >
                            {/* Thumbnail */}
                            <div className="relative aspect-video bg-black">
                                {thumb ? (
                                    <img
                                        src={thumb}
                                        alt={ch.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-white/6" />
                                )}
                                {/* Timestamp badge */}
                                <span className={cn(
                                    'absolute bottom-1 left-1 text-[10px] font-bold px-1 py-0.5 rounded',
                                    isActive ? 'bg-primary text-white' : 'bg-black/80 text-white'
                                )}>
                                    {secondsToTime(ch.startSeconds)}
                                </span>
                            </div>
                            {/* Chapter title */}
                            <div className={cn(
                                'px-2 py-1.5 text-[11px] font-semibold line-clamp-2 leading-tight transition-colors',
                                isActive ? 'text-white bg-primary/10' : 'text-gray-300 bg-white/4 group-hover:text-white'
                            )}>
                                {ch.title || `Chapter ${i + 1}`}
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

