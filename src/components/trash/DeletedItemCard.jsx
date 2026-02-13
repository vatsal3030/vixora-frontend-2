import { RefreshCcw, Trash2, CheckCircle2, AlertTriangle, Clock } from 'lucide-react'
import { Button } from '../ui/Button'
import { Checkbox } from '../ui/Checkbox'
import { formatDuration, formatViews, formatTimeAgo } from '../../lib/utils'
import { cn } from '../../lib/utils'
import { Link } from 'react-router-dom'

export function DeletedItemCard({ item, type, isSelected, onSelect, onRestore, onDelete }) {
    // Calculate days remaining (Assuming 30 days retention policy, or 7 if strict)
    // User request mentioned "7 days remaining", let's calculate based on deletedAt if available
    const deletedDate = item.deletedAt ? new Date(item.deletedAt) : new Date()
    const expiryDate = new Date(deletedDate)
    expiryDate.setDate(deletedDate.getDate() + 7) // 7-day policy per user request text

    const now = new Date()
    const daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24))

    const isExpiringSoon = daysLeft <= 2
    const isMediumUrgency = daysLeft <= 4

    return (
        <div className={cn(
            "group relative rounded-xl overflow-hidden bg-card border transition-all duration-200",
            isSelected ? "border-primary ring-1 ring-primary" : "border-border hover:border-primary/50"
        )}>
            {/* Selection Checkbox (Visible on hover or selected) */}
            <div className={cn(
                "absolute top-2 left-2 z-20 transition-opacity duration-200",
                isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}>
                <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => onSelect(item._id || item.id, checked)}
                    className="bg-black/50 border-white/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
            </div>

            {/* Thumbnail Section */}
            <div className="relative aspect-video bg-muted/20">
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />

                <img
                    src={item.thumbnail || item.video?.thumbnail}
                    alt={item.title || item.name}
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                />

                {/* Days Remaining Badge */}
                <div className={cn(
                    "absolute top-2 left-2 z-10 px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1 backdrop-blur-md shadow-sm pointer-events-none transition-opacity",
                    isSelected ? "opacity-0" : "opacity-100", // Hide if checkbox is there
                    isExpiringSoon ? "bg-red-500/90 text-white" :
                        isMediumUrgency ? "bg-orange-500/90 text-white" : "bg-black/60 text-white"
                )}>
                    <Clock className="w-3 h-3" />
                    {daysLeft > 0 ? `${daysLeft} days left` : 'Expiring soon'}
                </div>

                {/* Duration (if video) */}
                {type === 'video' && item.duration && (
                    <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
                        {formatDuration(item.duration)}
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="p-3">
                <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                    {item.title || item.name || 'Untitled Content'}
                </h3>

                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <span>Deleted {deletedDate.toLocaleDateString()}</span>
                    {type === 'video' && (
                        <>
                            <span>•</span>
                            <span>{formatViews(item.views)}</span>
                        </>
                    )}
                </div>

                {/* Action Buttons (Always visible on mobile, hover on desktop) */}
                <div className="flex items-center gap-2 mt-auto pt-2 border-t border-border/50 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 flex-1 text-xs gap-1 hover:bg-green-500/10 hover:text-green-500"
                        onClick={() => onRestore(item._id || item.id, type)}
                    >
                        <RefreshCcw className="w-3.5 h-3.5" />
                        Restore
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 px-0 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                        onClick={() => onDelete(item._id || item.id, type)}
                        title="Delete Forever"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
