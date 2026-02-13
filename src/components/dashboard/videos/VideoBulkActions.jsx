import { Trash2, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'

export function VideoBulkActions({
    selectedCount,
    onClearSelection,
    onDelete,
    onTogglePublish,
    isProcessing
}) {
    if (selectedCount === 0) return null

    return (
        <AnimatePresence>
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4">
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="bg-card border border-primary/20 shadow-2xl shadow-primary/10 rounded-xl p-3 flex items-center justify-between gap-4 backdrop-blur-xl ring-1 ring-border"
                >
                    <div className="flex items-center gap-3 pl-2">
                        <div className="bg-primary/10 text-primary p-1.5 rounded-lg">
                            <Check className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-sm text-foreground whitespace-nowrap">
                            {selectedCount} Selected
                        </span>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClearSelection}
                            className="text-xs h-8"
                            disabled={isProcessing}
                        >
                            Cancel
                        </Button>

                        <div className="h-4 w-px bg-border shrink-0" />

                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => onTogglePublish(true)}
                            className="text-xs h-8 whitespace-nowrap"
                            disabled={isProcessing}
                        >
                            <Eye className="w-3.5 h-3.5 mr-1.5" />
                            Publish
                        </Button>

                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => onTogglePublish(false)}
                            className="text-xs h-8 whitespace-nowrap"
                            disabled={isProcessing}
                        >
                            <EyeOff className="w-3.5 h-3.5 mr-1.5" />
                            Unpublish
                        </Button>

                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={onDelete}
                            className="text-xs h-8 whitespace-nowrap"
                            disabled={isProcessing}
                        >
                            {isProcessing ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5 mr-1.5" />}
                            Delete
                        </Button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
