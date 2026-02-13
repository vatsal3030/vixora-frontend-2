import { useState, useEffect } from 'react'
import { playlistService } from '../../services/api'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../ui/Dialog"
import { Loader2, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function EditPlaylistDialog({ playlist, onPlaylistUpdated, children }) {
    const [open, setOpen] = useState(false)
    const [name, setName] = useState(playlist?.name || '')
    const [description, setDescription] = useState(playlist?.description || '')
    const [isPrivate, setIsPrivate] = useState(playlist?.isPrivate || false)
    const queryClient = useQueryClient()

    useEffect(() => {
        if (playlist) {
            setName(playlist.name || '')
            setDescription(playlist.description || '')
            setIsPrivate(playlist.isPrivate || false)
        }
    }, [playlist])

    const updateMutation = useMutation({
        mutationFn: (data) => playlistService.updatePlaylist(playlist._id, data),
        onSuccess: (response) => {
            toast.success('Playlist updated')
            setOpen(false)
            queryClient.invalidateQueries({ queryKey: ['playlist', playlist._id] })
            queryClient.invalidateQueries({ queryKey: ['myPlaylists'] }) // Invalidate list
            if (onPlaylistUpdated) onPlaylistUpdated(response.data.data)
        },
        onError: (error) => {
            console.error(error)
            toast.error('Failed to update playlist')
        }
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!name.trim()) return

        updateMutation.mutate({
            name,
            description,
            isPrivate
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="ghost" size="icon">
                        <Pencil className="w-4 h-4" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Playlist</DialogTitle>
                    <DialogDescription>
                        Update your playlist details.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <label htmlFor="edit-name" className="text-sm font-medium">
                            Name
                        </label>
                        <Input
                            id="edit-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <label htmlFor="edit-desc" className="text-sm font-medium">
                            Description
                        </label>
                        <Input
                            id="edit-desc"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="edit-private"
                            checked={isPrivate}
                            onChange={(e) => setIsPrivate(e.target.checked)}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label htmlFor="edit-private" className="text-sm font-medium cursor-pointer">
                            Private playlist
                        </label>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={updateMutation.isPending}>
                            {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
