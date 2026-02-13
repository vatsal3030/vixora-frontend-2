import { useState, useEffect } from 'react'
import { playlistService } from '../../services/api'
import { Button } from '../ui/Button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../ui/Dialog"
import { Loader2, Plus, ListPlus, Lock, Globe, Check } from 'lucide-react'
import { toast } from 'sonner'
import { CreatePlaylistDialog } from './CreatePlaylistDialog'

export function AddToPlaylistDialog({ videoId, children }) {
    const [open, setOpen] = useState(false)
    const [playlists, setPlaylists] = useState([])
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(null)

    const fetchPlaylists = async () => {
        setLoading(true)
        try {
            const res = await playlistService.getMyPlaylists({ limit: 100 })
            if (res.data.success) {
                setPlaylists(res.data.data.docs || [])
            }
        } catch (error) {
            console.error(error)
            toast.error('Failed to load playlists')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (open) {
            fetchPlaylists()
        }
    }, [open])

    const handleToggle = async (playlist) => {
        if (processing) return
        setProcessing(playlist._id)

        // Check if already in playlist? API doesn't give us this info easily 
        // without fetching each playlist details.
        // We will just try to add. If already exists based on API error 409, we assume it's there.
        // But the common UX is checkboxes.
        // For simplicity and matching standard "Add to" flows without complex state sync:
        // We will just have "Add" buttons that turn to "Added" or checkboxes if we pre-fetched status.
        // Given constraints, let's assume we just want to Add.
        // If the API supported "remove" via toggle, we'd do that.
        // Let's implement ADD logic.

        try {
            await playlistService.addVideoToPlaylist(videoId, playlist._id)
            toast.success(`Added to ${playlist.name}`)
        } catch (error) {
            if (error.response?.status === 409) {
                // Try removing if duplicate? Or just say it's there.
                // Let's try to remove if it feels like a toggle.
                // Actually, let's keep it simple: "Video already in playlist" is shown by toast in standard flow.
                toast.error('Video already in this playlist')
            } else {
                toast.error('Failed to update playlist')
            }
        } finally {
            setProcessing(null)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="secondary" size="sm" className="gap-2">
                        <ListPlus className="w-4 h-4" />
                        Save
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Save to playlist</DialogTitle>
                </DialogHeader>

                <div className="py-4 space-y-2 max-h-[300px] overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center p-4">
                            <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                    ) : playlists.length === 0 ? (
                        <p className="text-center text-muted-foreground p-4">No playlists found</p>
                    ) : (
                        playlists.map(playlist => (
                            <div
                                key={playlist._id}
                                className="flex items-center justify-between p-2 hover:bg-secondary rounded-lg cursor-pointer transition-colors"
                                onClick={() => handleToggle(playlist)}
                            >
                                <div className="flex flex-col">
                                    <span className="font-medium truncate max-w-[250px]">{playlist.name}</span>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        {playlist.isPrivate ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                                        {playlist.isPrivate ? 'Private' : 'Public'}
                                        {' • '}{playlist.videosCount} videos
                                    </span>
                                </div>
                                {processing === playlist._id && <Loader2 className="w-4 h-4 animate-spin" />}
                            </div>
                        ))
                    )}
                </div>

                <DialogFooter className="flex-col sm:flex-col sm:space-x-0 gap-2">
                    <CreatePlaylistDialog onPlaylistCreated={(newPlaylist) => {
                        setPlaylists(prev => [newPlaylist, ...prev])
                        handleToggle(newPlaylist) // Auto add to new playlist
                    }}>
                        <Button variant="outline" className="w-full gap-2 justify-start">
                            <Plus className="w-4 h-4" />
                            Create new playlist
                        </Button>
                    </CreatePlaylistDialog>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
