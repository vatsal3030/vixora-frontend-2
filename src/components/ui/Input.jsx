import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

const Input = forwardRef(
    ({ className, type = 'text', error, ...props }, ref) => {
        return (
            <div className="w-full">
                <input
                    type={type}
                    className={cn(
                        'flex h-11 w-full rounded-lg border bg-gray-900 px-4 py-2 text-sm',
                        'border-gray-700 text-gray-100 placeholder:text-gray-500',
                        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                        'disabled:cursor-not-allowed disabled:opacity-50',
                        'transition-all duration-200',
                        error && 'border-danger focus:ring-danger',
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {error && (
                    <p className="mt-1 text-sm text-danger">{error}</p>
                )}
            </div>
        )
    }
)

Input.displayName = 'Input'

export { Input }
