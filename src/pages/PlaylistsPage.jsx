import { useState, useMemo, useEffect } from 'react'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useInView } from 'react-intersection-observer'
import { Plus, List, PlaySquare, User, Archive, Loader2, Music2, ArrowUpDown } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Tabs, TabsList, TabsTrigger } from '../components/ui/Tabs'
import { PlaylistGrid } from '../components/playlist/PlaylistGrid'
import { PlaylistCard } from '../components/playlist/PlaylistCard'
import { PlaylistCardSkeleton } from '../components/ui/Skeleton'
import { PlaylistModal } from '../components/playlist/PlaylistModal'
import { playlistService } from '../services/api'
import { toast } from 'sonner'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { ConfirmationDialog } from '../components/common/ConfirmationDialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../components/ui/DropdownMenu"
import { cn } from '../lib/utils'

export default function PlaylistsPage() {
    useDocumentTitle('Playlists - Vixora')
    const queryClient = useQueryClient()
    const [activeTab, setActiveTab] = useState('all') // 'all', 'public', 'private'
    const [sortBy, setSortBy] = useState('recent') // 'recent', 'oldest', 'a-z'

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingPlaylist, setEditingPlaylist] = useState(null)
    const [playlistToDelete, setPlaylistToDelete] = useState(null)

    // Data Fetching (Infinite)
    const {
        data,
        isLoading,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useInfiniteQuery({
        queryKey: ['playlists', 'me', sortBy, activeTab],
        queryFn: async ({ pageParam = 1 }) => {
            const res = await playlistService.getMyPlaylists({ 
                page: pageParam, 
                limit: 12,
                sortBy
            })
            return res.data
        },
        getNextPageParam: (lastPage) => {
            const pagination = lastPage?.data?.pagination
            if (!pagination) return undefined
            return pagination.hasNextPage ? (pagination.currentPage || 1) + 1 : undefined
        },
        initialPageParam: 1
    })

    const { ref: loadMoreRef, inView } = useInView({
        threshold: 0.1,
        rootMargin: '200px',
    })

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage()
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

    const rawPlaylists = useMemo(() => data?.pages.flatMap(page => page.data?.items || page.data?.playlists || []) || [], [data])

    // Local sorting for consistency as pages load
    const filteredPlaylists = useMemo(() => {
        return rawPlaylists.filter(playlist => {
            if (activeTab === 'public') return playlist.isPublic === true;
            if (activeTab === 'private') return playlist.isPublic === false;
            return true;
        })
    }, [rawPlaylists, activeTab])

    const sortedPlaylists = useMemo(() => {
        return [...filteredPlaylists].sort((a, b) => {
            if (sortBy === 'oldest') return new Date(a.updatedAt || a.createdAt) - new Date(b.updatedAt || b.createdAt)
            if (sortBy === 'a-z') return (a.name || '').localeCompare(b.name || '')
            return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
        })
    }, [filteredPlaylists, sortBy])

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
            updateMutation.mutate({ id: editingPlaylist._id || editingPlaylist.id, data })
        }
    }

    const handleDelete = (playlist) => {
        setPlaylistToDelete(playlist)
    }

    const openCreateModal = () => {
        setEditingPlaylist(null)
        setIsModalOpen(true)
    }

    const openEditModal = (playlist) => {
        setEditingPlaylist(playlist)
        setIsModalOpen(true)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-title sm:text-title-lg font-bold text-white font-display tracking-tight">Your Playlists</h1>
                    <p className="text-sm text-zinc-400 mt-1">Manage and organize your custom video collections</p>
                </div>
                <Button 
                    className="bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl text-xs px-4 h-9 shadow-md shadow-primary/20 gap-1.5" 
                    onClick={openCreateModal}
                >
                    <Plus className="w-4 h-4" />
                    New Playlist
                </Button>
            </div>

            {/* Filter Tabs & Sort */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                    {['all', 'public', 'private'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-xs font-semibold transition-all capitalize",
                                activeTab === tab 
                                    ? "bg-white text-black shadow-md" 
                                    : "bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white"
                            )}
                        >
                            {tab === 'all' ? 'All Playlists' : tab}
                        </button>
                    ))}
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2 border-white/10 hover:bg-white/5 h-8 text-xs rounded-xl">
                            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
                            <span>
                                {sortBy === 'recent' ? 'Recently Updated' : sortBy === 'oldest' ? 'Oldest Updated' : 'Alphabetical (A-Z)'}
                            </span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#1f1f1f]/95 border-white/10 w-48">
                        <DropdownMenuItem onClick={() => setSortBy('recent')} className={cn("cursor-pointer", sortBy === 'recent' && "text-primary")}>
                            Recently Updated
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSortBy('oldest')} className={cn("cursor-pointer", sortBy === 'oldest' && "text-primary")}>
                            Oldest Updated
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSortBy('a-z')} className={cn("cursor-pointer", sortBy === 'a-z' && "text-primary")}>
                            Alphabetical (A-Z)
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Content */}
            {isLoading && rawPlaylists.length === 0 ? (
                <PlaylistGrid>
                    {Array.from({ length: 12 }).map((_, i) => (
                        <PlaylistCardSkeleton key={`skeleton-${i}`} />
                    ))}
                </PlaylistGrid>
            ) : sortedPlaylists.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center glass-card rounded-xl border border-white/5">
                    <div className="w-20 h-20 bg-secondary/30 rounded-full flex items-center justify-center mb-6">
                        <Music2 className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">No playlists yet</h2>
                    <p className="text-muted-foreground mb-6 max-w-sm">Create your first playlist to organize your videos.</p>
                    <Button onClick={openCreateModal}>Create Playlist</Button>
                </div>
            ) : (
                <>
                    <PlaylistGrid>
                        {sortedPlaylists.map(playlist => (
                            <PlaylistCard
                                key={playlist._id || playlist.id}
                                playlist={playlist}
                                onEdit={openEditModal}
                                onDelete={handleDelete}
                            />
                        ))}
                    </PlaylistGrid>

                    {/* Infinite Scroll Trigger */}
                    <div ref={loadMoreRef} className="h-10 w-full flex items-center justify-center mt-8">
                        {isFetchingNextPage && <Loader2 className="w-6 h-6 animate-spin text-primary" />}
                        {!hasNextPage && rawPlaylists.length > 0 && (
                            <p className="text-muted-foreground text-sm">You've reached the end</p>
                        )}
                    </div>
                </>
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

            <ConfirmationDialog
                open={!!playlistToDelete}
                onOpenChange={(open) => { if (!open) setPlaylistToDelete(null) }}
                title="Delete Playlist"
                description={`Are you sure you want to delete "${playlistToDelete?.name}"?`}
                onConfirm={() => {
                    if (playlistToDelete) {
                        deleteMutation.mutate(playlistToDelete._id || playlistToDelete.id)
                        setPlaylistToDelete(null)
                    }
                }}
                isLoading={deleteMutation.isPending}
            />
        </div>
    )
}
