import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

const Textarea = forwardRef(
    ({ className, error, ...props }, ref) => {
        return (
            <div className="w-full">
                <textarea
                    className={cn(
                        'flex min-h-[80px] w-full rounded-lg px-4 py-2 text-sm',
                        'glass-input placeholder:text-muted-foreground',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-0',
                        'disabled:cursor-not-allowed disabled:opacity-50',
                        'transition-all duration-200 resize-y',
                        error && 'border-red-500 focus-visible:ring-red-500/50',
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {error && (
                    <p className="mt-1 text-sm text-red-500">{error}</p>
                )}
            </div>
        )
    }
)

Textarea.displayName = 'Textarea'

export { Textarea }
