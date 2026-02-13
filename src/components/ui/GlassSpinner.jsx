import { cn } from '../../lib/utils'

/**
 * GlassSpinner - A glassmorphic loading spinner
 * 
 * @param {Object} props
 * @param {'sm'|'md'|'lg'} props.size - Spinner size variant
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.label - Accessible label
 */
export function GlassSpinner({ size = 'md', className, label = 'Loading...' }) {
    const sizeMap = {
        sm: 'w-6 h-6',
        md: 'w-10 h-10',
        lg: 'w-16 h-16',
    }

    const borderMap = {
        sm: 'border-2',
        md: 'border-[3px]',
        lg: 'border-4',
    }

    return (
        <div className={cn('flex items-center justify-center', className)} role="status" aria-label={label}>
            <div className="relative">
                {/* Outer glow ring */}
                <div
                    className={cn(
                        sizeMap[size],
                        'rounded-full animate-glow-pulse absolute inset-0'
                    )}
                />
                {/* Spinning glass ring */}
                <div
                    className={cn(
                        sizeMap[size],
                        borderMap[size],
                        'rounded-full animate-spin',
                        'border-transparent border-t-primary border-r-primary/30',
                        'backdrop-blur-sm'
                    )}
                    style={{
                        background: 'var(--glass-bg)',
                        boxShadow: 'var(--glass-glow)',
                    }}
                />
            </div>
            <span className="sr-only">{label}</span>
        </div>
    )
}
