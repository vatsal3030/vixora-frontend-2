import { cn } from '../../lib/utils'

export function PlaylistGrid({ children, className }) {
    return (
        <div className={cn(
            "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8",
            className
        )}>
            {children}
        </div>
    )
}
