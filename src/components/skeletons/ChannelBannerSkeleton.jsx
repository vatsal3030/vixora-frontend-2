import { Skeleton } from '../ui/Skeleton'

export default function ChannelBannerSkeleton() {
    return (
        <div className="space-y-4">
            {/* Cover Image Skeleton */}
            <Skeleton className="w-full h-32 md:h-48 lg:h-64 rounded-lg" />

            {/* Channel Info Skeleton */}
            <div className="flex flex-col md:flex-row gap-4 px-4">
                {/* Avatar Skeleton */}
                <Skeleton className="h-20 w-20 md:h-32 md:w-32 rounded-full flex-shrink-0" />

                {/* Info Content */}
                <div className="flex-1 space-y-3">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-64" />

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <Skeleton className="h-9 w-24" />
                        <Skeleton className="h-9 w-24" />
                    </div>
                </div>
            </div>

            {/* Tabs Skeleton */}
            <div className="flex gap-4 px-4 border-b">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-20" />
            </div>
        </div>
    )
}
