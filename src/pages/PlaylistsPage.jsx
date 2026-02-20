import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, List, PlaySquare, User, Archive, Loader2, Music2 } from 'lucide-react' // Music2 as generic playlist icon
import { Button } from '../components/ui/Button'
import { Tabs, TabsList, TabsTrigger } from '../components/ui/Tabs'
import { PlaylistGrid } from '../components/playlist/PlaylistGrid'
import { PlaylistCard } from '../components/playlist/PlaylistCard'
import { PlaylistModal } from '../components/playlist/PlaylistModal'
import { playlistService } from '../services/api' // Adjust path if needed (pages/PlaylistsPage.jsx -> ../services/api)
import { toast } from 'sonner'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export default function PlaylistsPage() {
    useDocumentTitle('Playlists - Vixora')
    const queryClient = useQueryClient()
    const [activeTab, setActiveTab] = useState('all') // 'all', 'owned', 'saved'

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingPlaylist, setEditingPlaylist] = useState(null)

    // Data Fetching
    const { data: playlists = [], isLoading } = useQuery({
        queryKey: ['playlists', 'me'],
        queryFn: async () => {
            const res = await playlistService.getMyPlaylists()
            return res.data.data?.items || []
        }
    })

    // Prepare Tabs Data
    const rawPlaylists = Array.isArray(playlists) ? playlists : []
    const sortedPlaylists = [...rawPlaylists]
        .filter(() => {
            if (activeTab === 'all') return true
            if (activeTab === 'owned') return true // We only have owned for now
            if (activeTab === 'playlists') return true
            return true
        })
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))

    // Mutations
    const createMutation = useMutation({
        mutationFn: (data) => playlistService.createPlaylist(data),
        onSuccess: () => {
            toast.success('Playlist created successfully')
            setIsModalOpen(false)
            queryClient.invalidateQueries({ queryKey: ['playlists'] })
        },
        onError: () => toast.error('Failed to create playlist')
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => playlistService.updatePlaylist(id, data),
        onSuccess: () => {
            toast.success('Playlist updated')
            setIsModalOpen(false)
            setEditingPlaylist(null)
            queryClient.invalidateQueries({ queryKey: ['playlists'] })
        },
        onError: () => toast.error('Failed to update playlist')
    })

    const deleteMutation = useMutation({
        mutationFn: (id) => playlistService.deletePlaylist(id),
        onSuccess: () => {
            toast.success('Playlist deleted')
            queryClient.invalidateQueries({ queryKey: ['playlists'] })
        },
        onError: () => toast.error('Failed to delete playlist')
    })

    // Handlers
    const handleCreate = (data) => createMutation.mutate(data)

    const handleUpdate = (data) => {
        if (editingPlaylist) {
            updateMutation.mutate({ id: editingPlaylist._id, data })
        }
    }

    const handleDelete = (playlist) => {
        if (window.confirm(`Delete playlist "${playlist.name}"?`)) {
            deleteMutation.mutate(playlist._id)
        }
    }

    const openCreateModal = () => {
        setEditingPlaylist(null)
        setIsModalOpen(true)
    }

    const openEditModal = (playlist) => {
        setEditingPlaylist(playlist)
        setIsModalOpen(true)
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Your Playlists</h1>
                <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={openCreateModal}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Playlist
                </Button>
            </div>

            {/* Filter Tabs */}
            <Tabs defaultValue="all" className="mb-8 w-full" onValueChange={setActiveTab}>
                <TabsList className="bg-transparent p-0 border-b border-white/10 w-full justify-start rounded-none h-auto gap-8">
                    {/* Custom Tab Triggers to match YouTube style (text only, underline on active) */}
                    {['all', 'playlists', 'courses', 'owned'].map((tab) => (
                        <TabsTrigger
                            key={tab}
                            value={tab}
                            className="capitalize rounded-none border-b-2 border-transparent px-0 pb-3 text-muted-foreground data-[state=active]:border-white data-[state=active]:text-white data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-all"
                        >
                            {tab === 'all' ? 'Recently added' : tab}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            {/* Content */}
            {sortedPlaylists.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 bg-secondary/30 rounded-full flex items-center justify-center mb-6">
                        <Music2 className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">No playlists yet</h2>
                    <p className="text-muted-foreground mb-6 max-w-sm">Create your first playlist to organize your videos.</p>
                    <Button onClick={openCreateModal}>Create Playlist</Button>
                </div>
            ) : (
                <PlaylistGrid>
                    {sortedPlaylists.map(playlist => (
                        <PlaylistCard
                            key={playlist._id}
                            playlist={playlist}
                            onEdit={openEditModal}
                            onDelete={handleDelete}
                        // onShare can be implemented later
                        />
                    ))}
                </PlaylistGrid>
            )}

            {/* Modal */}
            <PlaylistModal
                open={isModalOpen}
                onOpenChange={(open) => {
                    setIsModalOpen(open)
                    if (!open) setEditingPlaylist(null)
                }}
                onSubmit={editingPlaylist ? handleUpdate : handleCreate}
                initialData={editingPlaylist}
                isLoading={createMutation.isPending || updateMutation.isPending}
            />
        </div>
    )
}
