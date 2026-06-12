import { Skeleton } from '../ui/Skeleton'

export default function VideoPlayerSkeleton() {
    return (
        <div className="flex flex-col lg:flex-row gap-6">
            {/* Main Content Area */}
            <div className="flex-1 space-y-4">
                {/* Player Skeleton */}
                <div className="relative w-full aspect-video bg-zinc-800/50 rounded-xl overflow-hidden animate-pulse">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-16 w-16 rounded-full bg-zinc-700/50" />
                    </div>
                </div>

                {/* Title Skeleton */}
                <div className="space-y-2 pt-2 animate-pulse">
                    <div className="h-6 w-3/4 bg-zinc-800/50 rounded" />
                    <div className="h-6 w-1/2 bg-zinc-800/50 rounded" />
                </div>

                {/* Action Row Skeleton */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 animate-pulse">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-zinc-800/50" />
                        <div className="space-y-2">
                            <div className="h-4 w-32 bg-zinc-800/50 rounded" />
                            <div className="h-3 w-20 bg-zinc-800/50 rounded" />
                        </div>
                        <div className="h-9 w-28 bg-zinc-800/50 rounded-full ml-4" />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-9 w-32 bg-zinc-800/50 rounded-full" />
                        <div className="h-9 w-24 bg-zinc-800/50 rounded-full" />
                        <div className="h-9 w-12 bg-zinc-800/50 rounded-full" />
                    </div>
                </div>

                {/* Description Box Skeleton */}
                <div className="mt-4 p-4 bg-zinc-800/30 rounded-xl space-y-2 animate-pulse">
                    <div className="h-4 w-1/4 bg-zinc-800/50 rounded" />
                    <div className="h-3 w-full bg-zinc-800/50 rounded" />
                    <div className="h-3 w-full bg-zinc-800/50 rounded" />
                    <div className="h-3 w-3/4 bg-zinc-800/50 rounded" />
                </div>
            </div>

            {/* Sidebar (Recommended Videos) */}
            <div className="lg:w-[350px] xl:w-[400px] flex-shrink-0 space-y-4">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex gap-2 animate-pulse">
                        <div className="w-40 aspect-video bg-zinc-800/50 rounded-lg flex-shrink-0" />
                        <div className="flex-1 space-y-2 py-1">
                            <div className="h-4 w-full bg-zinc-800/50 rounded" />
                            <div className="h-3 w-3/4 bg-zinc-800/50 rounded" />
                            <div className="h-3 w-1/2 bg-zinc-800/50 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
