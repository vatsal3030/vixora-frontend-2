import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/Dialog'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Label } from '../ui/Label'
import { Textarea } from '../ui/Textarea'
import { Globe, Lock, Link as LinkIcon, Loader2 } from 'lucide-react'
import { cn } from '../../lib/utils'

export function PlaylistModal({
    open,
    onOpenChange,
    onSubmit,
    initialData,
    isLoading
}) {
    const isEdit = !!initialData

    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
        defaultValues: {
            name: '',
            description: '',
            privacy: 'private'
        }
    })

    const title = watch('name')
    const description = watch('description')

    // Reset form when modal opens or initialData changes
    useEffect(() => {
        if (open) {
            if (initialData) {
                reset({
                    name: initialData.name || '',
                    description: initialData.description || '',
                    privacy: initialData.privacy || 'private'
                })
            } else {
                reset({
                    name: '',
                    description: '',
                    privacy: 'private'
                })
            }
        }
    }, [open, initialData, reset])

    const privacyOptions = [
        { id: 'public', label: 'Public', description: 'Anyone can view', icon: Globe },
        { id: 'private', label: 'Private', description: 'Only you can view', icon: Lock },
        { id: 'unlisted', label: 'Unlisted', description: 'Anyone with the link', icon: LinkIcon },
    ]

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-card border-border">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit playlist' : 'Create new playlist'}</DialogTitle>
                    <DialogDescription className="hidden">
                        {isEdit ? 'Update your playlist details' : 'Create a new collection of videos'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
                    {/* Title */}
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <Label htmlFor="name" className="text-right">Title <span className="text-red-500">*</span></Label>
                            <span className="text-xs text-muted-foreground">{title?.length || 0}/100</span>
                        </div>
                        <Input
                            id="name"
                            {...register('name', {
                                required: 'Title is required',
                                minLength: { value: 3, message: 'Minimum 3 characters' },
                                maxLength: { value: 100, message: 'Maximum 100 characters' }
                            })}
                            placeholder="Add a title"
                            className={cn(errors.name && "border-red-500")}
                        />
                        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <Label htmlFor="description">Description</Label>
                            <span className="text-xs text-muted-foreground">{description?.length || 0}/500</span>
                        </div>
                        <Textarea
                            id="description"
                            {...register('description', {
                                maxLength: { value: 500, message: 'Maximum 500 characters' }
                            })}
                            placeholder="Add a description"
                            className="min-h-[100px] resize-none"
                        />
                        {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
                    </div>

                    {/* Privacy */}
                    <div className="space-y-3">
                        <Label>Privacy</Label>
                        <div className="grid gap-3">
                            {privacyOptions.map((option) => (
                                <label
                                    key={option.id}
                                    className={cn(
                                        "flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer transition-all hover:bg-secondary/50",
                                        watch('privacy') === option.id && "bg-secondary border-primary/50"
                                    )}
                                >
                                    <input
                                        type="radio"
                                        value={option.id}
                                        {...register('privacy')}
                                        className="sr-only"
                                    />
                                    <option.icon className={cn(
                                        "w-5 h-5 text-muted-foreground",
                                        watch('privacy') === option.id && "text-primary"
                                    )} />
                                    <div className="flex flex-col">
                                        <span className={cn(
                                            "text-sm font-medium",
                                            watch('privacy') === option.id && "text-foreground"
                                        )}>{option.label}</span>
                                        <span className="text-xs text-muted-foreground">{option.description}</span>
                                    </div>

                                    {/* Radio Indicator */}
                                    <div className={cn(
                                        "ml-auto w-4 h-4 rounded-full border-2 border-muted-foreground/30",
                                        watch('privacy') === option.id && "border-primary bg-primary"
                                    )} />
                                </label>
                            ))}
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading || !title}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {isEdit ? 'Save changes' : 'Create Playlist'}
                            {/* Correct text 'Create Playlist' per prompt */}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
