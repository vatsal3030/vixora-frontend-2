import { cn, getInitials } from '../../lib/utils'
import { getMediaUrl } from '../../lib/media'

const avatarSizes = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm',       // 32px
    md: 'h-12 w-12 text-base',     // 48px (changed from h-10)
    lg: 'h-16 w-16 text-xl',       // 64px
    xl: 'h-24 w-24 text-2xl',      // 96px (Large requirement)
    '2xl': 'h-32 w-32 text-4xl',
}

export function Avatar({
    src,
    alt = '',
    fallback,
    size = 'md',
    className,
    online = false
}) {
    // If size is a key in avatarSizes, use it. Otherwise assume it's a class string.
    const sizeClass = avatarSizes[size] || size || avatarSizes.md

    return (
        <div className={cn('avatar-component relative inline-flex items-center justify-center shrink-0', className)}>
            <div
                className={cn(
                    'relative rounded-full overflow-hidden bg-secondary flex items-center justify-center font-semibold text-foreground select-none',
                    sizeClass
                )}
            >
                {src ? (
                    <img
                        src={getMediaUrl(src)}
                        alt={alt}
                        className="h-full w-full object-cover"
                        loading="lazy"
                    />
                ) : (
                    <span className="uppercase text-muted-foreground">{fallback || getInitials(alt)}</span>
                )}
            </div>
            {online && (
                <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" />
            )}
        </div>
    )
}
