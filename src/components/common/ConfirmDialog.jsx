import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '../ui/Dialog'
import { Button } from '../ui/Button'
import { AlertTriangle } from 'lucide-react'

export function ConfirmDialog({
    title = 'Are you sure?',
    description = 'This action cannot be undone.',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'destructive',
    onConfirm,
    onCancel,
    trigger,
    children
}) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleConfirm = async () => {
        setLoading(true)
        try {
            await onConfirm?.()
            setOpen(false)
        } catch (error) {
            console.error('Confirm action failed:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = () => {
        onCancel?.()
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {trigger ? (
                <div onClick={() => setOpen(true)}>
                    {trigger}
                </div>
            ) : (
                children && <div onClick={() => setOpen(true)}>{children}</div>
            )}

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        {variant === 'destructive' && (
                            <div className="p-2 bg-red-500/10 rounded-full text-red-500">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                        )}
                        <DialogTitle>{title}</DialogTitle>
                    </div>
                    <DialogDescription className="pt-2">
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={loading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={variant}
                        onClick={handleConfirm}
                        disabled={loading}
                        className={variant === 'destructive' ? 'bg-red-500 hover:bg-red-600' : ''}
                    >
                        {loading ? 'Processing...' : confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
