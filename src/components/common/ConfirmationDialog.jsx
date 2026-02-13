import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
} from '../ui/Dialog'
import { Button } from '../ui/Button'
import { AlertTriangle } from 'lucide-react'

export function ConfirmationDialog({
    title,
    description,
    trigger,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    onConfirm,
    variant = 'destructive',
    open,
    onOpenChange
}) {
    // If controlled (open/onOpenChange passed), use them. Otherwise use unchecked.
    // Dialog primitives usually handle controlled/uncontrolled.

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <div className="flex items-center gap-2 text-destructive mb-2">
                        {variant === 'destructive' && <AlertTriangle className="w-5 h-5" />}
                        <DialogTitle>{title}</DialogTitle>
                    </div>
                    <DialogDescription>
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <DialogClose asChild>
                        <Button variant="ghost">{cancelLabel}</Button>
                    </DialogClose>
                    <DialogClose asChild>
                        <Button
                            variant={variant}
                            onClick={(e) => {
                                // e.preventDefault() // Don't prevent close
                                onConfirm()
                            }}
                        >
                            {confirmLabel}
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
