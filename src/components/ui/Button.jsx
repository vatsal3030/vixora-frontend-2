import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

const buttonVariants = {
    variant: {
        primary: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:brightness-110 shadow-md hover:shadow-glow',
        ghost: 'bg-transparent hover:bg-secondary text-foreground hover:text-foreground',
        outline: 'bg-transparent border border-border hover:border-primary-500 hover:bg-primary/5 text-foreground',
        danger: 'bg-danger hover:bg-red-600 text-white',
        success: 'bg-success hover:bg-green-600 text-white',
        glass: 'glass-btn text-foreground',
    },
    size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
        icon: 'p-2',
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
