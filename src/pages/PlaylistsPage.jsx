import { useState, useMemo, useEffect } from 'react'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useInView } from 'react-intersection-observer'
import { Plus, List, PlaySquare, User, Archive, Loader2, Music2, ArrowUpDown } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Tabs, TabsList, TabsTrigger } from '../components/ui/Tabs'
import { PlaylistGrid } from '../components/playlist/PlaylistGrid'
import { PlaylistCard } from '../components/playlist/PlaylistCard'
import { PlaylistModal } from '../components/playlist/PlaylistModal'
import { playlistService } from '../services/api'
import { toast } from 'sonner'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
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
    const [activeTab, setActiveTab] = useState('all') // 'all', 'playlists', 'courses', 'owned'
    const [sortBy, setSortBy] = useState('recent') // 'recent', 'oldest', 'a-z'

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingPlaylist, setEditingPlaylist] = useState(null)

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
                sortBy,
                tab: activeTab !== 'all' ? activeTab : undefined
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

    const rawPlaylists = useMemo(() => data?.pages.flatMap(page => page.data?.items || []) || [], [data])

    // Local sorting for consistency as pages load
    const sortedPlaylists = useMemo(() => {
        return [...rawPlaylists].sort((a, b) => {
            if (sortBy === 'oldest') return new Date(a.updatedAt || a.createdAt) - new Date(b.updatedAt || b.createdAt)
            if (sortBy === 'a-z') return (a.name || '').localeCompare(b.name || '')
            return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
        })
    }, [rawPlaylists, sortBy])

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
        if (window.confirm(`Delete playlist "${playlist.name}"?`)) {
            deleteMutation.mutate(playlist._id || playlist.id)
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
                <TabsList className="bg-transparent p-0 border-b border-white/10 w-full justify-start rounded-none h-auto gap-8 overflow-x-auto scrollbar-hide">
                    {['all', 'playlists', 'courses', 'owned'].map((tab) => (
                        <TabsTrigger
                            key={tab}
                            value={tab}
                            className="capitalize rounded-none border-b-2 border-transparent px-0 pb-3 text-sm font-medium text-muted-foreground data-[state=active]:border-white data-[state=active]:text-white data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-all whitespace-nowrap"
                        >
                            {tab === 'all' ? 'Recently added' : tab}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            {/* Sort Controls */}
            <div className="flex justify-end mb-6">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2 border-white/10 hover:bg-white/5">
                            <ArrowUpDown className="w-4 h-4" />
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
                <div className="flex justify-center items-center h-[30vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : sortedPlaylists.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center glass-card rounded-2xl border border-white/5">
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
        </div>
    )
}
