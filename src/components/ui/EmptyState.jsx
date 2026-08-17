import { cn } from '../../lib/utils'
import { Button } from './Button'
import { Link } from 'react-router-dom'

/**
 * EmptyState — unified empty/zero-data state for all pages.
 *
 * Standard pattern (Phase 2):
 *   - Muted icon in a soft circular container
 *   - Title (text-lg font-semibold)
 *   - Description (text-sm text-muted-foreground)
 *   - Optional CTA button
 *
 * @param {Object} props
 * @param {React.ElementType} props.icon - Lucide icon component
 * @param {string} props.title - Main heading text
 * @param {string} [props.description] - Subheading / help text
 * @param {string} [props.actionLabel] - CTA button label
 * @param {string} [props.actionHref] - CTA link destination (renders as Link)
 * @param {Function} [props.onAction] - CTA click handler (renders as Button)
 * @param {string} [props.className] - Additional wrapper classes
 */
export function EmptyState({
    icon: Icon,
    title,
    description,
    actionLabel,
    actionHref,
    onAction,
    className,
}) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500",
                className
            )}
        >
            {Icon && (
                <div className="w-20 h-20 bg-secondary/30 rounded-full flex items-center justify-center mb-6">
                    <Icon className="w-10 h-10 text-muted-foreground" />
                </div>
            )}
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            {description && (
                <p className="text-sm text-muted-foreground max-w-sm mb-6">
                    {description}
                </p>
            )}
            {actionLabel && actionHref && (
                <Link to={actionHref}>
                    <Button>{actionLabel}</Button>
                </Link>
            )}
            {actionLabel && onAction && !actionHref && (
                <Button onClick={onAction}>{actionLabel}</Button>
            )}
        </div>
    )
}
