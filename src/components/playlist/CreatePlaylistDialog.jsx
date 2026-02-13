import { useState } from 'react'
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
import { Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function CreatePlaylistDialog({ onPlaylistCreated, children }) {
    const [open, setOpen] = useState(false)
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [isPrivate, setIsPrivate] = useState(false)
    const queryClient = useQueryClient()

    const createMutation = useMutation({
        mutationFn: (data) => playlistService.createPlaylist(data),
        onSuccess: (response) => {
            toast.success('Playlist created successfully')
            setOpen(false)
            setName('')
            setDescription('')
            setIsPrivate(false)
            queryClient.invalidateQueries({ queryKey: 'playlists' }) // Invalidate playlists query
            queryClient.invalidateQueries({ queryKey: 'myPlaylists' }) // Invalidate myPlaylists query
            if (onPlaylistCreated) onPlaylistCreated(response.data.data)
        },
        onError: (error) => {
            console.error(error)
            toast.error(error.response?.data?.message || 'Failed to create playlist')
        }
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!name.trim()) return

        createMutation.mutate({
            name,
            description,
            isPrivate
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button className="gap-2">
                        <Plus className="w-4 h-4" />
                        Create Playlist
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Playlist</DialogTitle>
                    <DialogDescription>
                        Create a new playlist to organize your favorite videos.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <label htmlFor="name" className="text-sm font-medium">
                            Name
                        </label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="My Awesome Playlist"
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <label htmlFor="description" className="text-sm font-medium">
                            Description
                        </label>
                        <Input
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What's this playlist about?"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isPrivate"
                            checked={isPrivate}
                            onChange={(e) => setIsPrivate(e.target.checked)}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label htmlFor="isPrivate" className="text-sm font-medium cursor-pointer">
                            Private playlist
                        </label>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={createMutation.isPending}>
                            {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Create
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
