import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

const buttonVariants = {
    variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-brand-red-glow hover:-translate-y-0.5',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        outline: 'border border-input bg-transparent hover:bg-accent hover:text-accent-foreground',
        danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md hover:shadow-red-900/20',
        success: 'bg-green-600 text-white hover:bg-green-700 shadow-md',
        glass: 'glass-btn hover:-translate-y-0.5',
    },
    size: {
        sm: 'h-9 px-3 rounded-lg text-sm',
        md: 'h-11 px-6 rounded-xl text-sm font-medium',
        lg: 'h-14 px-8 rounded-2xl text-base',
        icon: 'h-11 w-11 rounded-xl',
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
                    'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
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
