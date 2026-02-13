import { VideoCardSkeleton } from "../ui/Skeleton"
import { cn } from "../../lib/utils"

export default function HomePageSkeleton({ className, count = 12 }) {
    return (
        <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6", className)}>
            {Array.from({ length: count }).map((_, index) => (
                <VideoCardSkeleton key={index} />
            ))}
        </div>
    )
}
