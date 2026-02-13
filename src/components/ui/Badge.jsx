import { cn } from '../../lib/utils'

const badgeVariants = {
    variant: {
        default: 'bg-gray-800 text-gray-100',
        primary: 'bg-primary-500 text-white',
        success: 'bg-success text-white',
        danger: 'bg-danger text-white',
        warning: 'bg-warning text-black',
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
                'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
                badgeVariants.variant[variant],
                className
            )}
        >
            {children}
        </span>
    )
}
