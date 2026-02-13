import { cn } from '../../lib/utils'
import { Check, Loader2, AlertCircle, Cloud } from 'lucide-react'

/**
 * Auto-save status indicator
 */
export function SaveIndicator({ status = 'idle', className }) {
    const states = {
        idle: {
            icon: Cloud,
            text: 'All changes saved',
            className: 'text-muted-foreground'
        },
        saving: {
            icon: Loader2,
            text: 'Saving...',
            className: 'text-primary'
        },
        saved: {
            icon: Check,
            text: 'Saved',
            className: 'text-green-500'
        },
        error: {
            icon: AlertCircle,
            text: 'Failed to save',
            className: 'text-destructive'
        }
    }

    const currentState = states[status] || states.idle
    const Icon = currentState.icon

    return (
        <div
            className={cn(
                "flex items-center gap-2 text-sm transition-all duration-300",
                currentState.className,
                className
            )}
            role="status"
            aria-live="polite"
        >
            <Icon className={cn(
                "w-4 h-4",
                status === 'saving' && "animate-spin"
            )} />
            <span>{currentState.text}</span>
        </div>
    )
}

export default SaveIndicator
