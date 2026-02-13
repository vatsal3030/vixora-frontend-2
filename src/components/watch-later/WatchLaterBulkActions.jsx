import { Trash2, PlusSquare, Flag, Check } from 'lucide-react'
import { Button } from '../ui/Button'
import { motion, AnimatePresence } from 'framer-motion'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from "../ui/DropdownMenu"

export function WatchLaterBulkActions({
    selectedCount,
    onClearSelection,
    onRemove,
    onAddToPlaylist,
    onSetPriority,
    onMarkWatched
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

                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClearSelection}
                            className="text-xs h-8"
                        >
                            Cancel
                        </Button>

                        <div className="h-4 w-px bg-border shrink-0" />

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="secondary" size="sm" className="text-xs h-8 whitespace-nowrap">
                                    <Flag className="w-3.5 h-3.5 mr-1.5" /> Set Priority
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuRadioGroup onValueChange={onSetPriority}>
                                    <DropdownMenuRadioItem value="high" className="text-red-500">High</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="medium" className="text-orange-500">Medium</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="low" className="text-blue-500">Low</DropdownMenuRadioItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuRadioItem value="none">Clear Priority</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={onMarkWatched}
                            className="text-xs h-8 whitespace-nowrap hover:bg-green-500/10 hover:text-green-500"
                        >
                            <Check className="w-3.5 h-3.5 mr-1.5" />
                            Watched
                        </Button>

                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={onRemove}
                            className="text-xs h-8 whitespace-nowrap"
                        >
                            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                            Remove
                        </Button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
