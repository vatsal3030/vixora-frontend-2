import { Skeleton } from '../ui/Skeleton'

export default function VideoCardSkeleton() {
    return (
        <div className="flex flex-col space-y-3">
            {/* Thumbnail Skeleton */}
            <Skeleton className="w-full aspect-video rounded-lg" />

            {/* Content Skeleton */}
            <div className="flex gap-3">
                {/* Avatar Skeleton */}
                <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />

                {/* Text Skeleton */}
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
            </div>
        </div>
    )
}
