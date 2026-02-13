import { cn } from '../../lib/utils'

/**
 * Reusable setting row component with label, description, and control
 */
export function SettingRow({
    label,
    description,
    children,
    className,
    disabled = false,
    badge
}) {
    return (
        <div
            className={cn(
                "flex items-center justify-between py-3 border-b border-border/50 last:border-0 gap-4",
                disabled && "opacity-50 pointer-events-none",
                className
            )}
        >
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground text-sm">{label}</p>
                    {badge && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                            {badge}
                        </span>
                    )}
                </div>
                {description && (
                    <p className="text-xs text-muted-foreground mt-0.5 pr-4">{description}</p>
                )}
            </div>
            <div className="flex-shrink-0 flex items-center">
                {children}
            </div>
        </div>
    )
}

/**
 * Toggle switch styled for settings - works in both light and dark mode
 */
export function SettingToggle({
    checked,
    onChange,
    disabled = false,
    loading = false,
    id
}) {
    return (
        <button
            id={id}
            role="switch"
            aria-checked={checked}
            disabled={disabled || loading}
            onClick={() => onChange(!checked)}
            className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-all duration-300",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                "disabled:cursor-not-allowed disabled:opacity-50",
                checked
                    ? "bg-primary"
                    : "bg-gray-300 dark:bg-secondary hover:bg-gray-400 dark:hover:bg-secondary/80"
            )}
        >
            <span
                className={cn(
                    "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-300",
                    checked ? "translate-x-5" : "translate-x-0.5",
                    loading && "animate-pulse"
                )}
            />
        </button>
    )
}

export default SettingRow
