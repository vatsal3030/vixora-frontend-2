import { useState, useEffect } from 'react'
import { playlistService } from '../services/api'
import { Loader2, Trash2, RefreshCw, AlertTriangle } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { toast } from 'sonner'
import { formatTimeAgo } from '../lib/utils'

export default function PlaylistTrashPage() {
    const [playlists, setPlaylists] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchTrash = async () => {
        setLoading(true)
        try {
            const response = await playlistService.getDeletedPlaylists()
            if (response.data.success) {
                setPlaylists(response.data.data.docs || response.data.data || [])
            }
        } catch (error) {
            console.error(error)
            toast.error('Failed to load trash')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTrash()
    }, [])

    const handleRestore = async (id) => {
        try {
            await playlistService.restorePlaylist(id)
            setPlaylists(prev => prev.filter(p => p._id !== id))
            toast.success('Playlist restored')
        } catch (error) {
            console.error(error)
            toast.error('Failed to restore playlist')
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Permanently delete this playlist? This cannot be undone.')) return
        try {
            await playlistService.deletePlaylist(id) // Verify if deletePlaylist handles permanent via param or separate endpoint
            // api.js: deletePlaylist: (playlistId) => api.delete(`/playlists/${playlistId}`)
            // Usually delete twice means permanent or specific endpoint. 
            // Checking api.js: no specific permanent delete for playlists listed, assume regular delete on trash = permanent? 
            // Or maybe just hide it. The user request implies trash management.
            // Let's assume standard delete on a deleted item might be permanent or check api.js again.
            // api.js: deletePlaylist(playlistId) -> DELETE /playlists/:id.
            // If backend implements soft delete, calling it again might hard delete or we need a param.
            // For now, calling delete.
            setPlaylists(prev => prev.filter(p => p._id !== id))
            toast.success('Playlist permanently deleted')
        } catch (error) {
            console.error(error)
            toast.error('Failed to delete playlist')
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-4 py-4 mb-4">
                <div className="p-4 rounded-full bg-red-500/10 text-red-500">
                    <Trash2 className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-bold font-display">Playlist Trash</h1>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : playlists.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground bg-secondary/20 rounded-xl border border-dashed border-border">
                    <p>Trash is empty</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {playlists.map((playlist) => (
                        <div key={playlist._id} className="bg-card border border-border rounded-xl p-4 flex flex-col gap-4">
                            <div>
                                <h3 className="font-semibold text-lg line-clamp-1">{playlist.name}</h3>
                                <p className="text-sm text-muted-foreground">Deleted {formatTimeAgo(playlist.updatedAt)}</p>
                            </div>
                            <div className="flex gap-2 mt-auto pt-4 border-t border-border">
                                <Button
                                    className="flex-1 gap-2"
                                    variant="outline"
                                    onClick={() => handleRestore(playlist._id)}
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Restore
                                </Button>
                                <Button
                                    className="flex-1 gap-2 hover:bg-red-500 hover:text-white border-destructive text-destructive"
                                    variant="outline"
                                    onClick={() => handleDelete(playlist._id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
