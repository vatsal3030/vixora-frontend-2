import { cn } from '../../lib/utils'

const badgeVariants = {
    variant: {
        default: 'bg-secondary text-secondary-foreground',
        primary: 'bg-primary text-white',
        success: 'bg-green-600 text-white',
        danger: 'bg-destructive text-white',
        warning: 'bg-yellow-500 text-black',
        live: 'bg-red-600 text-white animate-pulse',
    },
}

export function Badge({
    children,
    variant = 'default',
    className
}) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium',
                badgeVariants.variant[variant],
                className
            )}
        >
            {children}
        </span>
    )
}
