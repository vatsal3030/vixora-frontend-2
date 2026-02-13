import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

/**
 * Card Component
 * A container component with elevation and hover effects
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.hoverable - Enable hover lift effect
 * @param {boolean} props.clickable - Enable click/pointer cursor
 * @param {Function} props.onClick - Click handler
 */
const Card = forwardRef(
    ({ children, className, hoverable = true, clickable = false, glass = false, onClick, ...props }, ref) => {
        const Component = hoverable ? motion.div : 'div'

        return (
            <Component
                ref={ref}
                onClick={onClick}
                className={cn(
                    'rounded-lg overflow-hidden',
                    glass
                        ? 'glass-card'
                        : 'bg-card border border-border',
                    hoverable && !glass && 'transition-all duration-base',
                    clickable && 'cursor-pointer',
                    className
                )}
                {...(hoverable && !glass && {
                    whileHover: { y: -4, scale: 1.01 },
                    transition: { duration: 0.2, ease: 'easeOut' }
                })}
                {...props}
            >
                {children}
            </Component>
        )
    }
)

Card.displayName = 'Card'

/**
 * Card Header
 */
export function CardHeader({ children, className, ...props }) {
    return (
        <div
            className={cn('px-6 py-4 border-b border-border', className)}
            {...props}
        >
            {children}
        </div>
    )
}

/**
 * Card Title
 */
export function CardTitle({ children, className, ...props }) {
    return (
        <h3
            className={cn("text-2xl font-semibold leading-none tracking-tight", className)}
            {...props}
        >
            {children}
        </h3>
    )
}

/**
 * Card Description
 */
export function CardDescription({ children, className, ...props }) {
    return (
        <p
            className={cn("text-sm text-muted-foreground", className)}
            {...props}
        >
            {children}
        </p>
    )
}

/**
 * Card Content
 */
export function CardContent({ children, className, ...props }) {
    return (
        <div className={cn('px-6 py-4', className)} {...props}>
            {children}
        </div>
    )
}

/**
 * Card Footer
 */
export function CardFooter({ children, className, ...props }) {
    return (
        <div
            className={cn('px-6 py-4 border-t border-border bg-background/50', className)}
            {...props}
        >
            {children}
        </div>
    )
}

export { Card }
