import { forwardRef, useState } from 'react'
import { cn } from '../../lib/utils'
import { Eye, EyeOff } from 'lucide-react'

const Input = forwardRef(
    ({ className, type = 'text', error, showPasswordToggle, ...props }, ref) => {
        const [showPassword, setShowPassword] = useState(false)
        const isPassword = type === 'password'
        const inputType = isPassword && showPasswordToggle ? (showPassword ? 'text' : 'password') : type

        return (
            <div className="w-full">
                <div className="relative">
                    <input
                        type={inputType}
                        className={cn(
                            'flex h-11 w-full rounded-lg px-4 py-2 text-sm',
                            'glass-input placeholder:text-muted-foreground',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/10 focus-visible:ring-offset-0',
                            'disabled:cursor-not-allowed disabled:opacity-50',
                            error && 'border-red-500/50 focus-visible:ring-red-500/20',
                            isPassword && showPasswordToggle && 'pr-10',
                            className
                        )}
                        ref={ref}
                        {...props}
                    />
                    {isPassword && showPasswordToggle && (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors outline-none"
                            tabIndex={-1}
                        >
                            {showPassword ? (
                                <EyeOff className="w-4 h-4" />
                            ) : (
                                <Eye className="w-4 h-4" />
                            )}
                        </button>
                    )}
                </div>
                {error && (
                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                        {error}
                    </p>
                )}
            </div>
        )
    }
)

Input.displayName = 'Input'

export { Input }
