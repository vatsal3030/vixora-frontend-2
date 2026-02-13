import { cn } from '../../lib/utils'

/**
 * Card wrapper for settings sections with consistent styling
 */
export function SettingCard({
    children,
    className,
    noPadding = false
}) {
    return (
        <div
            className={cn(
                "bg-card border border-border rounded-xl",
                "shadow-sm hover:shadow transition-shadow duration-300",
                !noPadding && "p-6",
                className
            )}
        >
            {children}
        </div>
    )
}

/**
 * Section header for settings groups
 */
export function SettingSectionHeader({
    icon: Icon,
    title,
    description,
    action
}) {
    return (
        <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-3">
                {Icon && (
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Icon className="w-5 h-5" />
                    </div>
                )}
                <div>
                    <h2 className="text-xl font-semibold text-foreground">{title}</h2>
                    {description && (
                        <p className="text-sm text-muted-foreground mt-1">{description}</p>
                    )}
                </div>
            </div>
            {action && (
                <div className="flex-shrink-0">
                    {action}
                </div>
            )}
        </div>
    )
}

/**
 * Divider for separating sections within a card
 */
export function SettingDivider({ className }) {
    return (
        <div className={cn("border-t border-border/50 my-6", className)} />
    )
}

/**
 * Group wrapper for related settings
 */
export function SettingGroup({ title, children, className }) {
    return (
        <div className={cn("space-y-1", className)}>
            {title && (
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                    {title}
                </h3>
            )}
            <div className="space-y-0">
                {children}
            </div>
        </div>
    )
}

export default SettingCard
