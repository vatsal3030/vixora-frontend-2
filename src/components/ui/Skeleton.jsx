import { cn } from '../../lib/utils'

export function Skeleton({ className, ...props }) {
    return (
        <div
            className={cn('animate-pulse bg-zinc-800/50 rounded-md', className)}
            {...props}
        />
    )
}

// Video Card Skeleton
export function VideoCardSkeleton() {
    return (
        <div className="flex flex-col animate-pulse">
            {/* Thumbnail */}
            <div className="w-full aspect-video bg-zinc-800/50 rounded-xl" />

            {/* Info row */}
            <div className="flex gap-3 mt-3 items-start">
                {/* Avatar */}
                <div className="h-9 w-9 bg-zinc-800/50 rounded-full flex-shrink-0 mt-0.5" />

                <div className="flex-1 min-w-0 space-y-2">
                    {/* Title */}
                    <div className="h-4 w-11/12 bg-zinc-800/50 rounded" />
                    <div className="h-4 w-3/4 bg-zinc-800/50 rounded" />

                    {/* Channel name & views */}
                    <div className="space-y-1.5 pt-1">
                        <div className="h-3 w-1/3 bg-zinc-800/50 rounded" />
                        <div className="h-3 w-1/2 bg-zinc-800/50 rounded" />
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
            <div className="h-20 w-20 bg-zinc-800/50 rounded-full flex-shrink-0" />

            <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-zinc-800/50 rounded" />
                <div className="h-3 w-24 bg-zinc-800/50 rounded" />
            </div>

            <div className="h-9 w-24 bg-zinc-800/50 rounded-full" />
        </div>
    )
}
