import { Skeleton } from '../ui/Skeleton'

export default function VideoPlayerSkeleton() {
    return (
        <div className="space-y-4">
            {/* Player Skeleton */}
            <div className="relative w-full aspect-video bg-zinc-900 dark:bg-zinc-950 rounded-lg overflow-hidden">
                <Skeleton className="w-full h-full" />

                {/* Play Button Skeleton */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <Skeleton className="h-16 w-16 rounded-full" />
                </div>

                {/* Controls Skeleton */}
                <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
                    <Skeleton className="h-1 w-full" />
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-8 w-8 rounded" />
                            <Skeleton className="h-8 w-8 rounded" />
                            <Skeleton className="h-6 w-20" />
                        </div>
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-8 w-8 rounded" />
                            <Skeleton className="h-8 w-8 rounded" />
                            <Skeleton className="h-8 w-8 rounded" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
