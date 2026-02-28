import { Skeleton } from "../ui/Skeleton";

export function AdminDashboardSkeleton() {
    return (
        <div className="space-y-8 animate-pulse">
            <div className="flex items-center justify-between">
                <div>
                    <Skeleton className="h-8 w-64 mb-2" />
                    <Skeleton className="h-4 w-48" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="glass-card p-6 rounded-2xl flex items-center gap-4">
                        <Skeleton className="w-14 h-14 rounded-xl" />
                        <div>
                            <Skeleton className="h-4 w-24 mb-2" />
                            <Skeleton className="h-8 w-16" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                <div className="glass-card p-6 rounded-2xl space-y-4">
                    <Skeleton className="h-[250px] w-full rounded-xl" />
                </div>
                <div className="glass-card p-6 rounded-2xl space-y-4">
                    <Skeleton className="h-[250px] w-full rounded-xl" />
                </div>
            </div>
        </div>
    );
}
