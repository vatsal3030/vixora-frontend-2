import { cn } from '../../lib/utils'

/**
 * Reusable Brand Logo component that uses the final brand asset (vixora_logo_final.jpg).
 * Since the source image contains both the icon and text, we use object-fit and object-position
 * to "crop" the image and show only the top "V" icon part as requested.
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
            "relative overflow-hidden rounded-lg bg-[#0f0f0f] flex items-center justify-center shrink-0 border border-white/5",
            sizeClasses[size] || size,
            className
        )}>
            <img
                src="/vixora_logo_final.jpg"
                alt="Vixora Logo"
                className="w-full h-full object-cover object-[center_18%] scale-[1.50]"
                onError={(e) => {
                    // Fallback to stylized V if image fails to load
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                }}
            />
            <div className="hidden absolute inset-0 items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 font-bold text-white uppercase">
                V
            </div>
        </div>
    )
}
