import { X, CheckSquare, Trash2, RefreshCcw } from 'lucide-react'
import { Button } from '../ui/Button'
import { motion, AnimatePresence } from 'framer-motion'

export function BulkActionBar({ selectedCount, onClearSelection, onRestore, onDelete }) {
    if (selectedCount === 0) return null

    return (
        <AnimatePresence>
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4">
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="bg-card border border-primary/20 shadow-2xl shadow-primary/10 rounded-xl p-4 flex items-center justify-between gap-4 backdrop-blur-xl ring-1 ring-border"
                >
                    <div className="flex items-center gap-3 pl-2">
                        <div className="bg-primary/10 text-primary p-2 rounded-lg">
                            <CheckSquare className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-foreground">{selectedCount} Selected</span>
                            <span className="text-xs text-muted-foreground">Manage your selection</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onClearSelection}
                            className="hidden sm:flex"
                        >
                            Cancel
                        </Button>

                        <div className="h-6 w-px bg-border hidden sm:block mx-1" />

                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={onRestore}
                            className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20"
                        >
                            <RefreshCcw className="w-4 h-4 mr-2" />
                            Restore
                        </Button>

                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={onDelete}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </Button>
                    </div>

                    <button
                        onClick={onClearSelection}
                        className="absolute -top-2 -right-2 bg-background border border-border rounded-full p-1 text-muted-foreground hover:text-foreground shadow-sm sm:hidden"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
