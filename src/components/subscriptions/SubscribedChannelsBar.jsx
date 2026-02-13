
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Avatar } from '../ui/Avatar'
import { CheckCircle2 } from 'lucide-react'
import { cn } from '../../lib/utils'

export function SubscribedChannelsBar({ channels = [], isLoading, selectedChannelId, onSelectChannel }) {
    const scrollContainerRef = useRef(null)

    // Check for overflow to potentially show scroll hints (advanced polish, skipping for now to keep it simple)

    if (!isLoading && channels.length === 0) return null

    return (
        <div className="relative group w-full mb-4">
            {/* Scroll Container */}
            <div
                ref={scrollContainerRef}
                className="flex items-center gap-3 overflow-x-auto pb-4 pt-2 px-1 scrollbar-hide snap-x"
            >
                {/* "All" Option */}
                <button
                    onClick={() => onSelectChannel(null)}
                    className="flex flex-col items-center gap-1.5 min-w-[64px] snap-start group/item"
                >
                    <div className={cn(
                        "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 border-2",
                        !selectedChannelId
                            ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25 scale-105"
                            : "bg-secondary/50 text-muted-foreground border-transparent hover:bg-secondary hover:border-primary/50"
                    )}>
                        <span className="font-bold text-sm">All</span>
                    </div>
                    <span className={cn(
                        "text-xs font-medium transition-colors line-clamp-1 max-w-[72px] text-center",
                        !selectedChannelId ? "text-primary" : "text-muted-foreground group-hover/item:text-foreground"
                    )}>
                        All
                    </span>
                </button>

                {/* Loading Skeletons */}
                {isLoading && Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-1.5 min-w-[64px] snap-start">
                        <div className="w-14 h-14 rounded-full bg-secondary animate-pulse" />
                        <div className="w-10 h-3 bg-secondary rounded animate-pulse" />
                    </div>
                ))}

                {/* Channel List */}
                {!isLoading && channels.map((channel) => {
                    const isSelected = selectedChannelId === (channel._id || channel.id)

                    return (
                        <button
                            key={channel._id || channel.id}
                            onClick={() => onSelectChannel(channel._id || channel.id)}
                            className="flex flex-col items-center gap-1.5 min-w-[64px] snap-start group/item"
                        >
                            <div className={cn(
                                "relative w-14 h-14 rounded-full p-0.5 transition-all duration-300 border-2",
                                isSelected
                                    ? "border-primary shadow-lg shadow-primary/25 scale-105"
                                    : "border-transparent hover:border-primary/50"
                            )}>
                                <Avatar
                                    src={channel.avatar}
                                    alt={channel.username}
                                    size="full" // We need a 'full' size or just use custom class
                                    className="w-full h-full"
                                />
                                {/* New Content Indicator (mock) - optional polish */}
                                {/* <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary rounded-full border-2 border-background" /> */}
                            </div>
                            <span className={cn(
                                "text-xs font-medium transition-colors line-clamp-1 max-w-[72px] text-center",
                                isSelected ? "text-primary" : "text-muted-foreground group-hover/item:text-foreground"
                            )}>
                                {channel.username}
                            </span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
