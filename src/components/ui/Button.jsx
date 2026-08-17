import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

const buttonVariants = {
    variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-primary-glow',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        outline: 'border border-input bg-transparent hover:bg-accent hover:text-accent-foreground',
        danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md hover:shadow-red-900/20',
        success: 'bg-green-600 text-white hover:bg-green-700 shadow-md',
        glass: 'glass-btn',
    },
    size: {
        sm: 'h-9 px-3 rounded-md text-sm',
        md: 'h-11 px-6 rounded-lg text-sm font-medium',
        lg: 'h-14 px-8 rounded-xl text-base',
        icon: 'h-11 w-11 rounded-lg',
    },
}

const Button = forwardRef(
    (
        {
            className,
            variant = 'primary',
            size = 'md',
            disabled,
            children,
            ...props
        },
        ref
    ) => {
        return (
            <button
                ref={ref}
                className={cn(
                    'inline-flex items-center justify-center font-semibold transition-all duration-base',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                    'active:scale-98 disabled:opacity-50 disabled:pointer-events-none',
                    buttonVariants.variant[variant],
                    buttonVariants.size[size],
                    className
                )}
                disabled={disabled}
                {...props}
            >
                {children}
            </button>
        )
    }
)

Button.displayName = 'Button'

export { Button, buttonVariants }
