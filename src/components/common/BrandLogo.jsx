import { cn } from '../../lib/utils'

/**
 * Reusable Brand Logo component that uses the official brand asset (brand_logo.png).
 */
export function BrandLogo({ className, size = 'md' }) {
    const sizeClasses = {
        sm: 'h-6 w-6',
        md: 'h-8 w-8',
        lg: 'h-10 w-10',
        xl: 'h-12 w-12'
    }

    return (
        <div className={cn(
            "relative overflow-hidden rounded-lg flex items-center justify-center shrink-0",
            sizeClasses[size] || size,
            className
        )}>
            <img
                src="/brand_logo2.png"
                alt="Vixora Logo"
                className="w-full h-full object-contain scale-[1.2]"
                onError={(e) => {
                    // Fallback to stylized V if image fails to load
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                }}
            />
            <div className="hidden absolute inset-0 items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 font-bold text-white uppercase rounded-lg">
                V
            </div>
        </div>
    )
}
