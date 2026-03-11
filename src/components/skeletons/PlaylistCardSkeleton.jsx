import { Skeleton } from '../ui/Skeleton'

export default function PlaylistCardSkeleton() {
    return (
        <div className="flex flex-col gap-3 w-full animate-pulse">
            <Skeleton className="w-full aspect-video rounded-xl shadow-sm" />

            <div className="flex justify-between items-start gap-2">
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <Skeleton className="h-5 w-3/4 rounded" />
                    <Skeleton className="h-4 w-1/2 mt-1 rounded" />
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <Skeleton className="h-3 w-1/3 rounded" />
                    </div>
                </div>
            </div>
        </div>
    )
}
