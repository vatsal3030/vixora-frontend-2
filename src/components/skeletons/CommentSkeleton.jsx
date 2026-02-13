import { Skeleton } from '../ui/Skeleton'

export default function CommentSkeleton() {
    return (
        <div className="flex gap-3 py-3">
            {/* Avatar Skeleton */}
            <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />

            {/* Comment Content Skeleton */}
            <div className="flex-1 space-y-2">
                {/* Header (name + time) */}
                <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-16" />
                </div>

                {/* Comment Text */}
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <Skeleton className="h-6 w-12" />
                    <Skeleton className="h-6 w-12" />
                </div>
            </div>
        </div>
    )
}
