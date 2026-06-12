import { useState, useEffect } from 'react'
import { adminService } from '../../services/api'
import { toast } from 'sonner'
import { formatTimeAgo } from '../../lib/utils'
import { Trash2, RotateCcw } from 'lucide-react'
import { Button } from '../../components/ui/Button'

export default function AdminPlaylists() {
    const [playlists, setPlaylists] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchPlaylists = async () => {
        try {
            setLoading(true)
            const res = await adminService.getPlaylists({ limit: 50 })
            setPlaylists(res.data.data?.items || [])
        } catch (err) {
            console.error(err)
            toast.error('Failed to load playlists')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPlaylists()
    }, [])

    const handleSoftDelete = async (playlistId) => {
        if (!confirm('Are you sure you want to delete this playlist?')) return
        try {
            await adminService.softDeletePlaylist(playlistId)
            toast.success('Playlist deleted')
            fetchPlaylists()
        } catch (err) {
            console.error(err)
            toast.error('Failed to delete playlist')
        }
    }

    const handleRestore = async (playlistId) => {
        try {
            await adminService.restorePlaylist(playlistId)
            toast.success('Playlist restored')
            fetchPlaylists()
        } catch (err) {
            console.error(err)
            toast.error('Failed to restore playlist')
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-display font-bold">Playlists</h1>
                <p className="text-muted-foreground mt-1">Manage global user playlists</p>
            </div>

            <div className="glass-card rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/5 bg-secondary/30">
                                <th className="text-left p-4 pl-6 font-medium text-muted-foreground w-1/2">Name & Description</th>
                                <th className="text-left p-4 font-medium text-muted-foreground">Owner</th>
                                <th className="text-right p-4 font-medium text-muted-foreground">Status</th>
                                <th className="text-right p-4 pr-6 font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="p-12 text-center text-muted-foreground">
                                        Loading playlists...
                                    </td>
                                </tr>
                            ) : playlists.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-12 text-center text-muted-foreground">
                                        No playlists found
                                    </td>
                                </tr>
                            ) : (
                                playlists.map((playlist) => (
                                    <tr key={playlist._id || playlist.id} className={`transition-colors ${playlist.isDeleted ? 'bg-red-500/5' : 'hover:bg-secondary/20'}`}>
                                        <td className="p-4 pl-6">
                                            <p className={`font-medium ${playlist.isDeleted ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                                                {playlist.name}
                                            </p>
                                            <div className="text-xs text-muted-foreground mt-1 truncate max-w-[300px]">{playlist.description || 'No description'}</div>
                                            <div className="text-[10px] text-muted-foreground mt-1">{formatTimeAgo(playlist.createdAt)}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm font-medium">@{playlist.owner?.username}</div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                playlist.isDeleted ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'
                                            }`}>
                                                {playlist.isDeleted ? 'DELETED' : 'ACTIVE'}
                                            </span>
                                        </td>
                                        <td className="p-4 pr-6 text-right">
                                            {playlist.isDeleted ? (
                                                <Button variant="ghost" size="sm" onClick={() => handleRestore(playlist._id || playlist.id)} className="text-green-500 hover:text-green-400">
                                                    <RotateCcw className="w-4 h-4 mr-2" /> Restore
                                                </Button>
                                            ) : (
                                                <Button variant="ghost" size="sm" onClick={() => handleSoftDelete(playlist._id || playlist.id)} className="text-red-500 hover:text-red-400">
                                                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
