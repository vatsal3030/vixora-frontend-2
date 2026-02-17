import { useState, useMemo, useCallback } from 'react'
import { videoService, playlistService, tweetService } from '../services/api'
import { DeletedItemCard } from '../components/trash/DeletedItemCard'
import { BulkActionBar } from '../components/trash/BulkActionBar'
import { Button } from '../components/ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs'
import { Trash2, Film, PlaySquare, FileText, Search, RefreshCcw } from 'lucide-react'
import { toast } from 'sonner'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Checkbox } from '../components/ui/Checkbox'
import { cn } from '../lib/utils'
import { TrashSkeleton } from './TrashSkeleton'

// --- Render Helpers ---
const EmptyState = ({ label, icon: Icon }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 text-center"
    >
        <div className="bg-secondary/30 p-4 rounded-full mb-4">
            <Icon className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No deleted {label}</h3>
        <p className="text-muted-foreground max-w-sm">
            Items you delete will appear here and be automatically removed after 7 days.
        </p>
    </motion.div>
)

const SectionHeader = ({ title, count, items, onSelectAll, selectedIds }) => (
    <div className="flex items-center justify-between mb-4 mt-8">
        <h2 className="text-lg font-semibold flex items-center gap-2">
            {title} <span className="text-muted-foreground text-sm font-normal">({count})</span>
        </h2>
        {count > 0 && (
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelectAll(items)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                >
                    {items.every(i => selectedIds.has(i._id || i.id)) ? 'Deselect All' : 'Select All'}
                </Button>
            </div>
        )}
    </div>
)

export default function TrashPage() {
    const queryClient = useQueryClient()
    const [selectedIds, setSelectedIds] = useState(new Set())
    const [searchQuery, setSearchQuery] = useState('')

    // --- Queries ---
    const { data: videos = [], isLoading: videosLoading, error: videoError } = useQuery({
        queryKey: ['trashVideos'],
        queryFn: async () => {
            try {
                const res = await videoService.getDeletedVideos({ limit: 100 })
                return res.data.data || []
            } catch (e) {
                console.warn("Failed to fetch trash videos", e)
                return []
            }
        }
    })

    const { data: playlists = [], isLoading: playlistsLoading } = useQuery({
        queryKey: ['trashPlaylists'],
        queryFn: async () => (await playlistService.getDeletedPlaylists()).data.data || []
    })

    const { data: tweets = [], isLoading: tweetsLoading } = useQuery({
        queryKey: ['trashTweets'],
        queryFn: async () => (await tweetService.getDeletedTweets()).data.data || []
    })

    const isLoading = videosLoading || playlistsLoading || tweetsLoading

    // --- Derived State with Search & Filter ---
    const filterItems = useCallback((items) => {
        return items.filter(item => {
            return (item.title || item.name || item.content || '').toLowerCase().includes(searchQuery.toLowerCase())
        })
    }, [searchQuery])

    const deletedVideos = useMemo(() => filterItems(videos.filter(v => !v.isShorts && v.duration > 60)), [videos, searchQuery, filterItems])
    const deletedShorts = useMemo(() => filterItems(videos.filter(v => v.isShorts || v.duration <= 60)), [videos, searchQuery, filterItems])
    const deletedPlaylists = useMemo(() => filterItems(playlists), [playlists, searchQuery, filterItems])
    const deletedTweets = useMemo(() => filterItems(tweets), [tweets, searchQuery, filterItems])

    // --- Bulk Selection Logic ---
    const handleSelect = (id, isSelected) => {
        const newSelected = new Set(selectedIds)
        if (isSelected) {
            newSelected.add(id)
        } else {
            newSelected.delete(id)
        }
        setSelectedIds(newSelected)
    }

    const handleSelectAll = (sectionItems) => {
        const allIds = sectionItems.map(i => i._id || i.id)
        const allSelected = allIds.every(id => selectedIds.has(id))

        const newSelected = new Set(selectedIds)
        if (allSelected) {
            allIds.forEach(id => newSelected.delete(id))
        } else {
            allIds.forEach(id => newSelected.add(id))
        }
        setSelectedIds(newSelected)
    }

    const clearSelection = () => setSelectedIds(new Set())

    // --- Mutations ---
    const restoreMutation = useMutation({
        mutationFn: async ({ id, type }) => {
            if (type === 'video') return videoService.restoreVideo(id)
            if (type === 'playlist') return playlistService.restorePlaylist(id)
            if (type === 'tweet') return tweetService.restoreTweet(id)
        },
        onSuccess: () => {
            toast.success("Restored successfully")
            queryClient.invalidateQueries({ queryKey: ['trashVideos'] })
            queryClient.invalidateQueries({ queryKey: ['trashPlaylists'] })
            queryClient.invalidateQueries({ queryKey: ['trashTweets'] })
            clearSelection()
        }
    })

    const deleteMutation = useMutation({
        mutationFn: async ({ id, type }) => {
            if (type === 'video') return videoService.deleteVideo(id, true)
            if (type === 'playlist') return playlistService.deletePlaylist(id)
            if (type === 'tweet') return tweetService.deleteTweet(id)
        },
        onSuccess: () => {
            toast.success("Permanently deleted")
            queryClient.invalidateQueries({ queryKey: ['trashVideos'] })
            queryClient.invalidateQueries({ queryKey: ['trashPlaylists'] })
            queryClient.invalidateQueries({ queryKey: ['trashTweets'] })
            clearSelection()
        }
    })

    // --- Action Handlers ---
    const handleRestore = (id, type) => restoreMutation.mutate({ id, type })
    const handleDelete = (id, type) => {
        if (window.confirm("This action cannot be undone. Delete forever?")) {
            deleteMutation.mutate({ id, type })
        }
    }

    const handleBulkRestore = () => {
        toast.promise(
            Promise.all([...selectedIds].map(id => {
                // Determine type based on ID presence in lists
                let type = 'video'
                if (playlists.find(p => p._id === id)) type = 'playlist'
                if (tweets.find(t => t._id === id || t.id === id)) type = 'tweet'
                return restoreMutation.mutateAsync({ id, type })
            })),
            {
                loading: 'Restoring selected items...',
                success: 'All items restored',
                error: 'Failed to restore some items'
            }
        )
    }

    const handleBulkDelete = () => {
        if (!window.confirm(`Permanently delete ${selectedIds.size} items? This cannot be undone.`)) return

        toast.promise(
            Promise.all([...selectedIds].map(id => {
                let type = 'video'
                if (playlists.find(p => p._id === id)) type = 'playlist'
                if (tweets.find(t => t._id === id || t.id === id)) type = 'tweet'
                return deleteMutation.mutateAsync({ id, type })
            })),
            {
                loading: 'Deleting items forever...',
                success: 'Items permanently deleted',
                error: 'Failed to delete some items'
            }
        )
    }

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8 pb-32 max-w-7xl">
                <TrashSkeleton />
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8 pb-32 max-w-7xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Trash2 className="w-8 h-8 text-red-500" />
                        Trash
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Items are permanently deleted after 7 days.
                    </p>
                </div>

                {/* Search */}
                <div className="relative w-full md:w-auto min-w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search deleted items..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-secondary/50 border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all placeholder:text-muted-foreground/60"
                    />
                </div>
            </div>

            <Tabs defaultValue="videos" className="w-full">
                <TabsList className="bg-transparent border-b border-white/10 w-full justify-start h-auto gap-6 p-0 mb-6">
                    <TabsTrigger value="videos" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-red-500 rounded-none px-0 pb-3 text-muted-foreground data-[state=active]:text-red-500 gap-2 transition-all">
                        <Film className="w-4 h-4" /> Videos ({deletedVideos.length})
                    </TabsTrigger>
                    <TabsTrigger value="shorts" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-red-500 rounded-none px-0 pb-3 text-muted-foreground data-[state=active]:text-red-500 gap-2 transition-all">
                        <div className="border-2 border-current rounded h-4 w-3 flex items-center justify-center text-[8px] font-bold">S</div> Shorts ({deletedShorts.length})
                    </TabsTrigger>
                    <TabsTrigger value="playlists" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-red-500 rounded-none px-0 pb-3 text-muted-foreground data-[state=active]:text-red-500 gap-2 transition-all">
                        <PlaySquare className="w-4 h-4" /> Playlists ({deletedPlaylists.length})
                    </TabsTrigger>
                    <TabsTrigger value="tweets" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-red-500 rounded-none px-0 pb-3 text-muted-foreground data-[state=active]:text-red-500 gap-2 transition-all">
                        <FileText className="w-4 h-4" /> Tweets ({deletedTweets.length})
                    </TabsTrigger>
                </TabsList>

                {/* VIDEOS TAB */}
                <TabsContent value="videos" className="focus-visible:outline-none">
                    <SectionHeader title="Deleted Videos" count={deletedVideos.length} items={deletedVideos} onSelectAll={handleSelectAll} selectedIds={selectedIds} />

                    {deletedVideos.length === 0 ? (
                        <EmptyState label="videos" icon={Film} />
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {deletedVideos.map(video => (
                                <DeletedItemCard
                                    key={video._id}
                                    item={video}
                                    type="video"
                                    isSelected={selectedIds.has(video._id)}
                                    onSelect={handleSelect}
                                    onRestore={handleRestore}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* SHORTS TAB */}
                <TabsContent value="shorts" className="focus-visible:outline-none">
                    <SectionHeader title="Deleted Shorts" count={deletedShorts.length} items={deletedShorts} onSelectAll={handleSelectAll} selectedIds={selectedIds} />

                    {deletedShorts.length === 0 ? (
                        <EmptyState label="shorts" icon={Film} />
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {deletedShorts.map(video => (
                                <DeletedItemCard
                                    key={video._id}
                                    item={video}
                                    type="video"
                                    isSelected={selectedIds.has(video._id)}
                                    onSelect={handleSelect}
                                    onRestore={handleRestore}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* PLAYLISTS TAB */}
                <TabsContent value="playlists" className="focus-visible:outline-none">
                    <SectionHeader title="Deleted Playlists" count={deletedPlaylists.length} items={deletedPlaylists} onSelectAll={handleSelectAll} selectedIds={selectedIds} />

                    {deletedPlaylists.length === 0 ? (
                        <EmptyState label="playlists" icon={PlaySquare} />
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {deletedPlaylists.map(playlist => (
                                <DeletedItemCard
                                    key={playlist._id}
                                    item={playlist}
                                    type="playlist"
                                    isSelected={selectedIds.has(playlist._id)}
                                    onSelect={handleSelect}
                                    onRestore={handleRestore}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* TWEETS TAB */}
                <TabsContent value="tweets" className="focus-visible:outline-none">
                    <SectionHeader title="Deleted Tweets" count={deletedTweets.length} items={deletedTweets} onSelectAll={handleSelectAll} selectedIds={selectedIds} />

                    {deletedTweets.length === 0 ? (
                        <EmptyState label="tweets" icon={FileText} />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {deletedTweets.map(tweet => (
                                <div
                                    key={tweet._id || tweet.id}
                                    className={cn(
                                        "p-4 rounded-xl border bg-secondary/20 relative group transition-all",
                                        selectedIds.has(tweet._id || tweet.id) ? "border-primary ring-1 ring-primary" : "border-border hover:border-primary/50"
                                    )}
                                >
                                    <div className="absolute top-3 left-3 z-10">
                                        <Checkbox
                                            checked={selectedIds.has(tweet._id || tweet.id)}
                                            onCheckedChange={(checked) => handleSelect(tweet._id || tweet.id, checked)}
                                        />
                                    </div>
                                    <div className="pl-8">
                                        <p className="mb-2 line-clamp-3">{tweet.content}</p>
                                        <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
                                            <span>Deleted {new Date(tweet.updatedAt).toLocaleDateString()}</span>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button size="icon" variant="ghost" className="h-6 w-6 text-green-500" onClick={() => handleRestore(tweet._id || tweet.id, 'tweet')}>
                                                    <RefreshCcw className="w-3 h-3" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500" onClick={() => handleDelete(tweet._id || tweet.id, 'tweet')}>
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Sticky Bulk Action Bar */}
            <BulkActionBar
                selectedCount={selectedIds.size}
                onClearSelection={clearSelection}
                onRestore={handleBulkRestore}
                onDelete={handleBulkDelete}
            />
        </div>
    )
}
