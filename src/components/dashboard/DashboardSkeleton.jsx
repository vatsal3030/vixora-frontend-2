import { Skeleton } from "../ui/Skeleton";

export function DashboardSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header Skeleton */}
            <div className="flex flex-col gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64 md:w-80" />
                    <Skeleton className="h-4 w-48 md:w-64" />
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <Skeleton className="h-9 w-32 rounded-lg" />
                    <Skeleton className="h-9 w-9 rounded-lg" />
                    <Skeleton className="h-9 w-32 rounded-lg ml-auto sm:ml-0" />
                </div>
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="glass-card p-6 rounded-2xl space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-8 w-16" />
                            </div>
                            <Skeleton className="h-10 w-10 rounded-xl" />
                        </div>
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                ))}
            </div>

            {/* Charts Skeleton */}
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
                <div className="glass-card p-6 rounded-2xl h-[400px]">
                    <Skeleton className="h-full w-full rounded-xl" />
                </div>
            </div>

            {/* Top Videos Skeleton */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-7 w-64" />
                </div>
                <div className="glass-card rounded-xl overflow-hidden shadow-sm">
                    <div className="p-4 bg-secondary/30 flex justify-between border-b border-border">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                    <div className="space-y-0 divide-y divide-border">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="p-4 flex gap-4 items-center">
                                <Skeleton className="h-[63px] w-28 rounded-lg flex-shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-5 w-3/4 max-w-sm" />
                                </div>
                                <div className="hidden sm:flex gap-4 sm:w-1/2 justify-end">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-4 w-16" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
