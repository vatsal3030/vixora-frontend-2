import { cn } from '../../lib/utils'

export function Skeleton({ className, ...props }) {
    return (
        <div
            className={cn('skeleton glass-shimmer rounded-md', className)}
            {...props}
        />
    )
}

// Video Card Skeleton
export function VideoCardSkeleton() {
    return (
        <div className="flex flex-col animate-pulse">
            {/* Thumbnail */}
            <Skeleton className="w-full aspect-video rounded-xl" />

            {/* Info row */}
            <div className="flex gap-3 mt-3 items-start">
                {/* Avatar */}
                <Skeleton className="h-9 w-9 rounded-full flex-shrink-0 mt-0.5" />

                <div className="flex-1 min-w-0 space-y-2">
                    {/* Title */}
                    <Skeleton className="h-4 w-11/12 rounded" />
                    <Skeleton className="h-4 w-3/4 rounded" />

                    {/* Channel name & views */}
                    <div className="space-y-1.5 pt-1">
                        <Skeleton className="h-3 w-1/3 rounded" />
                        <Skeleton className="h-3 w-1/2 rounded" />
                    </div>
                </div>
            </div>
        </div>
    )
}

// Channel Card Skeleton
export function ChannelCardSkeleton() {
    return (
        <div className="flex items-center gap-4 p-4">
            <Skeleton className="h-20 w-20 rounded-full flex-shrink-0" />

            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
            </div>

            <Skeleton className="h-9 w-24" />
        </div>
    )
}
