import { cn } from '../../lib/utils'

export function Skeleton({ className, ...props }) {
    return (
        <div
            className={cn('skeleton rounded-md', className)}
            {...props}
        />
    )
}

// Video Card Skeleton
export function VideoCardSkeleton() {
    return (
        <div className="flex flex-col gap-3">
            {/* Thumbnail */}
            <Skeleton className="aspect-video w-full rounded-xl" />

            <div className="flex gap-3">
                {/* Avatar */}
                <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />

                <div className="flex-1 space-y-2">
                    {/* Title */}
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />

                    {/* Channel name & views */}
                    <Skeleton className="h-3 w-1/2" />
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
