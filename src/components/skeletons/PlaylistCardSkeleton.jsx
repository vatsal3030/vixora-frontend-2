import { Skeleton } from '../ui/Skeleton'

export default function PlaylistCardSkeleton() {
    return (
        <div className="flex flex-col space-y-3">
            {/* Playlist Thumbnail Skeleton (smaller aspect ratio) */}
            <div className="relative">
                <Skeleton className="w-full aspect-video rounded-lg" />

                {/* Video Count Badge Skeleton */}
                <div className="absolute bottom-2 right-2">
                    <Skeleton className="h-6 w-12 rounded" />
                </div>
            </div>

            {/* Playlist Info Skeleton */}
            <div className="space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
            </div>
        </div>
    )
}
