import { Skeleton } from "../ui/Skeleton"

export function NotificationSkeleton() {
    return (
        <div className="flex items-start gap-4 p-4 rounded-xl border border-white/5 bg-card/50">
            <Skeleton className="w-10 h-10 rounded-full shrink-0" />
            <div className="flex-1 space-y-2 pt-0.5">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/4" />
            </div>
            <div className="flex gap-2">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <Skeleton className="w-8 h-8 rounded-lg" />
            </div>
        </div>
    )
}
