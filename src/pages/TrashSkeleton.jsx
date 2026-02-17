import { Skeleton } from "../components/ui/Skeleton";

export function TrashSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                </div>
            </div>

            {/* Filter Bar Skeleton */}
            <div className="glass-panel p-1 rounded-xl flex gap-1 w-fit">
                <Skeleton className="h-9 w-24 rounded-lg" />
                <Skeleton className="h-9 w-24 rounded-lg" />
                <Skeleton className="h-9 w-24 rounded-lg" />
            </div>

            {/* Content Grid Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="glass-card rounded-xl overflow-hidden">
                        {/* Thumbnail */}
                        <Skeleton className="aspect-video w-full" />

                        {/* Info */}
                        <div className="p-4 space-y-3">
                            <div className="flex justify-between items-start gap-2">
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-2/3" />
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-2">
                                <Skeleton className="h-3 w-20" />
                                <Skeleton className="h-3 w-20" />
                            </div>

                            <div className="flex gap-2 pt-2">
                                <Skeleton className="h-8 flex-1 rounded-lg" />
                                <Skeleton className="h-8 flex-1 rounded-lg" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
