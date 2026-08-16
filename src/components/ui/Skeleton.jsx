import { cn } from '../../lib/utils'

export function Skeleton({ className, ...props }) {
    return (
        <div
            className={cn('animate-pulse bg-white/5 rounded-md relative overflow-hidden', className)}
            {...props}
        >
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        </div>
    )
}

// Video Card Skeleton
export function VideoCardSkeleton() {
    return (
        <div className="flex flex-col animate-pulse relative overflow-hidden group">
            {/* Thumbnail */}
            <div className="w-full aspect-video bg-white/5 rounded-xl relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            </div>

            {/* Info row */}
            <div className="flex gap-3 mt-3 items-start">
                {/* Avatar */}
                <div className="h-9 w-9 bg-white/5 rounded-full flex-shrink-0 mt-0.5 relative overflow-hidden">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                    {/* Title */}
                    <div className="h-4 w-11/12 bg-white/5 rounded relative overflow-hidden">
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                    </div>
                    <div className="h-4 w-3/4 bg-white/5 rounded relative overflow-hidden">
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                    </div>

                    {/* Channel name & views */}
                    <div className="space-y-1.5 pt-1">
                        <div className="h-3 w-1/3 bg-white/5 rounded relative overflow-hidden">
                            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                        </div>
                        <div className="h-3 w-1/2 bg-white/5 rounded relative overflow-hidden">
                            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Channel Card Skeleton
export function ChannelCardSkeleton() {
    return (
        <div className="flex items-center gap-4 p-4 animate-pulse">
            <div className="h-20 w-20 bg-white/5 rounded-full flex-shrink-0 relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            </div>

            <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-white/5 rounded relative overflow-hidden">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                </div>
                <div className="h-3 w-24 bg-white/5 rounded relative overflow-hidden">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                </div>
            </div>

            <div className="h-9 w-24 bg-white/5 rounded-full relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            </div>
        </div>
    )
}

// Playlist Card Skeleton
export function PlaylistCardSkeleton() {
    return (
        <div className="flex flex-col gap-3 animate-pulse">
            <div className="w-full aspect-video bg-white/5 rounded-xl relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            </div>
            <div className="flex justify-between items-start gap-2">
                <div className="flex flex-col gap-2 flex-1">
                    <div className="h-4 w-3/4 bg-white/5 rounded relative overflow-hidden">
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                    </div>
                    <div className="h-3 w-1/2 bg-white/5 rounded relative overflow-hidden mt-1">
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                    </div>
                </div>
                <div className="h-6 w-6 bg-white/5 rounded flex-shrink-0 relative overflow-hidden">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                </div>
            </div>
        </div>
    )
}
