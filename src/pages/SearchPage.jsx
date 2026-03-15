import { motion } from 'framer-motion'
import { useState, useMemo, useEffect } from 'react'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useInView } from 'react-intersection-observer'
import { searchService } from '../services/api'
import { VideoCard } from '../components/video/VideoCard'
import { Loader2, SearchX, History, X, Trash2, Filter } from 'lucide-react'
import { toast } from 'sonner'
import { VideoCardSkeleton } from '../components/ui/Skeleton'
import { Button } from '../components/ui/Button'
import { Avatar } from '../components/ui/Avatar'
import { getMediaUrl } from '../lib/media'
import { formatSubscribers, formatViews } from '../lib/utils'
import { PlaylistCard } from '../components/playlist/PlaylistCard'
import { TweetCard } from '../components/tweet/TweetCard'

export default function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams()
    const navigate = useNavigate()
    const query = searchParams.get('q') || ''
    const sortBy = searchParams.get('sortBy') || 'relevance'
    const sortType = searchParams.get('sortType') || 'desc'

    useDocumentTitle(query ? `Search: ${query} - Vixora` : 'Search - Vixora')

    const [filter, setFilter] = useState('All') // All, Videos, Channels, Shorts, Playlists, Tweets

    // Search History State
    const [history, setHistory] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('vixora_search_history')) || []
        } catch { return [] }
    })

    useEffect(() => {
        if (query.trim() && !history.includes(query.trim())) {
            const newHistory = [query.trim(), ...history.filter(h => h !== query.trim())].slice(0, 10)
            setHistory(newHistory)
            localStorage.setItem('vixora_search_history', JSON.stringify(newHistory))
        } else if (query.trim()) {
            const newHistory = [query.trim(), ...history.filter(h => h !== query.trim())]
            setHistory(newHistory)
            localStorage.setItem('vixora_search_history', JSON.stringify(newHistory))
        }
    }, [query])

    const removeHistoryItem = (e, item) => {
        e.preventDefault()
        e.stopPropagation()
        const newHistory = history.filter(h => h !== item)
        setHistory(newHistory)
        localStorage.setItem('vixora_search_history', JSON.stringify(newHistory))
    }

    const clearAllHistory = () => {
        setHistory([])
        localStorage.removeItem('vixora_search_history')
        toast.success("Search history cleared")
    }

    const handleSortChange = (e) => {
        const newSort = e.target.value
        setSearchParams(prev => {
            const current = new URLSearchParams(prev)
            current.set('sortBy', newSort)
            return current
        })
    }

    // Scoped queries with Infinite Scroll
    const { 
        data: searchData, 
        isLoading, 
        error, 
        fetchNextPage, 
        hasNextPage, 
        isFetchingNextPage,
        refetch 
    } = useInfiniteQuery({
        queryKey: ['search', query, filter, sortBy, sortType],
        queryFn: async ({ pageParam = 1 }) => {
            if (!query) return {}

            let scope = 'all'
            if (filter === 'Videos') scope = 'videos'
            else if (filter === 'Channels') scope = 'channels'
            else if (filter === 'Shorts') scope = 'shorts'
            else if (filter === 'Playlists') scope = 'playlists'
            else if (filter === 'Tweets') scope = 'tweets'

            const params = {
                q: query,
                scope,
                sortBy,
                sortType
            }

            if (scope === 'all') {
                params.limit = 40 // Larger limit for "All" tab since it's not paginated easily
            } else {
                params.page = pageParam
                params.limit = 20
            }

            const response = await searchService.globalSearch(params)
            return response.data.data
        },
        getNextPageParam: (lastPage) => {
            if (filter === 'All') return undefined // No standard pagination for "All"
            const pagination = lastPage?.pagination
            if (!pagination) return undefined
            return pagination.hasNextPage ? (pagination.currentPage || 1) + 1 : undefined
        },
        enabled: !!query,
        staleTime: 1000 * 60 * 1,
        initialPageParam: 1
    })

    const { ref: loadMoreRef, inView } = useInView({
        threshold: 0.1,
        rootMargin: '200px',
    })

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage && filter !== 'All') {
            fetchNextPage()
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage, filter])

    // Standardize data extraction
    const searchResults = useMemo(() => {
        if (filter === 'All') return searchData?.pages[0] || {}
        return {}
    }, [searchData, filter])

    const displayItems = useMemo(() => {
        return searchData?.pages.flatMap(page => page.items || []) || []
    }, [searchData])

    const allVideos = useMemo(() => filter === 'All' ? searchResults?.results?.videos || [] : (filter === 'Videos' ? displayItems : []), [searchResults, filter, displayItems])
    const allChannels = useMemo(() => filter === 'All' ? searchResults?.results?.channels || [] : (filter === 'Channels' ? displayItems : []), [searchResults, filter, displayItems])
    const allShorts = useMemo(() => filter === 'All' ? searchResults?.results?.shorts || [] : (filter === 'Shorts' ? displayItems : []), [searchResults, filter, displayItems])
    const allPlaylists = useMemo(() => filter === 'All' ? searchResults?.results?.playlists || [] : (filter === 'Playlists' ? displayItems : []), [searchResults, filter, displayItems])
    const allTweets = useMemo(() => filter === 'All' ? searchResults?.results?.tweets || [] : (filter === 'Tweets' ? displayItems : []), [searchResults, filter, displayItems])

    if (error) {
        toast.error('Search failed')
        console.error("Search error:", error)
    }

    const totalResultsCount = useMemo(() => {
        if (filter === 'All') {
            return (searchResults?.totals?.videos || 0) +
                (searchResults?.totals?.channels || 0) +
                (searchResults?.totals?.shorts || 0) +
                (searchResults?.totals?.playlists || 0) +
                (searchResults?.totals?.tweets || 0)
        }
        return searchData?.pages[0]?.pagination?.totalItems || displayItems.length
    }, [searchResults, filter, displayItems, searchData])

    const renderEmptyState = () => (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 glass-card rounded-full flex items-center justify-center mb-6 ring-4 ring-white/5">
                <SearchX className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-3">No matches found</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
                We couldn't find any {filter.toLowerCase()} matching "{query}". Try checking for typos or using different keywords.
            </p>
            <Button onClick={() => window.history.back()} variant="outline" className="glass hover:bg-white/5">
                <Loader2 className="w-4 h-4 mr-2 hidden" />
                Go Back
            </Button>
        </motion.div>
    )

    const renderMixedAllTab = () => {
        const videosFirstBatch = allVideos.slice(0, 3)
        const videosRemaining = allVideos.slice(3)
        const topChannel = allChannels.length > 0 ? allChannels[0] : null

        return (
            <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
                {/* 1. Top Channel Match styling matching YouTube search */}
                {topChannel && (
                    <div className="w-full border-b border-white/10 pb-6 mb-2">
                        <div onClick={() => navigate(`/@${topChannel.username}`)} className="flex flex-col sm:flex-row items-center sm:items-start gap-6 group hover:bg-white/5 p-4 rounded-xl transition-colors cursor-pointer">
                            <div className="sm:w-[320px] md:w-[360px] flex justify-center shrink-0">
                                <Avatar src={getMediaUrl(topChannel.avatar)} fallback={topChannel.username} size="xl" className="w-32 h-32 ring-1 ring-white/10 group-hover:ring-primary/50 transition-all" />
                            </div>
                            <div className="flex-1 min-w-0 text-center sm:text-left flex flex-col justify-center h-full sm:mt-2">
                                <h3 className="font-medium text-xl text-foreground group-hover:text-primary transition-colors truncate mb-1">{topChannel.fullName || topChannel.username}</h3>
                                <div className="flex flex-wrap justify-center sm:justify-start items-center gap-1.5 text-sm text-muted-foreground font-medium">
                                    <span>@{topChannel.username}</span>
                                    <span>â€¢</span>
                                    <span>{formatSubscribers(topChannel.subscribersCount || 0)} subscribers</span>
                                </div>
                                <p className="mt-3 text-sm text-muted-foreground line-clamp-2 max-w-2xl">{topChannel.description}</p>
                                <div className="mt-4 flex sm:hidden justify-center items-center">
                                    <Button variant="secondary" onClick={(e) => e.stopPropagation()} className="rounded-full">Subscribe</Button>
                                </div>
                            </div>
                            {/* Desktop View Channel Button */}
                            <div className="hidden sm:flex flex-col justify-center h-32 pr-4 lg:pr-12 shrink-0">
                                <Button variant="secondary" onClick={(e) => e.stopPropagation()} className="rounded-full px-6 transition-all hover:bg-primary hover:text-white">Subscribe</Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. Top Videos (First 3) in horizontal layout */}
                {videosFirstBatch.length > 0 && (
                    <div className="flex flex-col gap-4 w-full">
                        {videosFirstBatch.map(item => <VideoCard key={item._id || item.id} video={item} type="search" />)}
                    </div>
                )}

                {/* 3. Shorts Shelf matches YouTube layout */}
                {allShorts.length > 0 && (
                    <div className="py-6 border-y border-white/10 my-2 w-full">
                        <div className="flex items-center gap-3 mb-6 px-2">
                            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" className="w-6 h-6 fill-red-500"><path d="M10 14.65v-5.3L15 12l-5 2.65zm7.77-4.33-1.2-.5c-.68-.28-1.07-.98-.89-1.7.18-.73.86-1.12 1.54-.84l1.2.5c2.39.99 3.51 3.73 2.52 6.12-.99 2.39-3.73 3.51-6.12 2.52l-6-2.5c-2.39-.99-3.51-3.73-2.52-6.12.99-2.39 3.73-3.51 6.12-2.52l1.2.5c.68.28 1.07.98.89 1.7-.18.73-.86 1.12-1.54.84l-1.2-.5c-1.37-.57-2.93.08-3.5 1.45-.57 1.37.08 2.93 1.45 3.5l6 2.5c1.37.57 2.93-.08 3.5-1.45.57-1.37-.08-2.93-1.45-3.5l-6-2.5c-1.37-.57-2.93.08-3.5 1.45-.57 1.37.08 2.93 1.45 3.5l1.2.5c.68.28 1.07.98.89 1.7-.18.73-.86 1.12-1.54.84l-1.2-.5c-2.39-.99-3.51-3.73-2.52-6.12C4.1 4.7 6.84 3.58 9.23 4.57l1.2.5c.68.28 1.07.98.89 1.7-.18.73-.86 1.12-1.54.84l-1.2-.5c-1.37-.57-2.93.08-3.5 1.45-.57 1.37.08 2.93 1.45 3.5l6 2.5c1.37.57 2.93-.08 3.5-1.45.57-1.37-.08-2.93-1.45-3.5l-1.2-.5c-.68-.28-1.07-.98-.89-1.7.18-.73.86-1.12 1.54-.84l1.2.5c2.39.99 3.51 3.73 2.52 6.12.99 2.39 3.73 3.51 6.12 2.52z"></path></svg>
                            <h3 className="text-xl font-bold">Shorts</h3>
                        </div>
                        <div className="flex overflow-x-auto gap-4 pb-4 px-2 scrollbar-hide snap-x">
                            {allShorts.map((short) => (
                                <div key={short._id || short.id} className="snap-start shrink-0 w-[180px] sm:w-[210px] md:w-[220px]">
                                    <Link to={`/watch/${short._id || short.id}`} className="group relative aspect-[9/16] rounded-xl overflow-hidden bg-black glass-panel border border-white/5 block hover:border-white/10 transition-colors">
                                        <img src={getMediaUrl(short.thumbnail)} alt={short.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                                        <div className="absolute bottom-0 left-0 right-0 p-3 flex flex-col justify-end">
                                            <h3 className="text-white font-medium text-[0.95rem] line-clamp-2 mb-1.5 group-hover:text-primary transition-colors drop-shadow-md leading-tight">{short.title}</h3>
                                            <p className="text-xs text-white/80 font-medium">{formatViews(short.views)} views</p>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 4. Remaining Videos in horizontal layout */}
                {videosRemaining.length > 0 && (
                    <div className="flex flex-col gap-4 w-full">
                        {videosRemaining.map(item => <VideoCard key={item._id || item.id} video={item} type="search" />)}
                    </div>
                )}
            </div>
        )
    }

    if (!query) {
        return (
            <div className="py-6 min-h-[80vh] container mx-auto px-4 max-w-4xl flex items-center justify-center">
                <div className="p-8 rounded-2xl text-center w-full">
                    <History className="w-20 h-20 text-muted-foreground/30 mx-auto mb-6 opacity-80" />
                    <h2 className="text-2xl lg:text-3xl font-bold mb-3">Search Vixora</h2>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto">Type something to find videos, channels, shorts, and playlists.</p>

                    {history.length > 0 && (
                        <div className="text-left mt-8 max-w-3xl mx-auto pt-8">
                            <div className="flex items-center justify-between mb-4 px-2">
                                <h3 className="font-semibold flex items-center gap-2 text-lg">
                                    <History className="w-5 h-5 text-primary" />
                                    Recent Searches
                                </h3>
                                <Button variant="ghost" size="sm" onClick={clearAllHistory} className="text-muted-foreground hover:text-destructive text-sm h-8">
                                    <Trash2 className="w-4 h-4 mr-2" /> Clear All
                                </Button>
                            </div>
                            <div className="flex flex-col gap-1">
                                <AnimatePresence>
                                    {history.map((item) => (
                                        <motion.div
                                            key={item}
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="group flex items-center justify-between p-3.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                                            onClick={() => navigate(`/search?q=${encodeURIComponent(item)}`)}
                                        >
                                            <div className="flex items-center gap-4">
                                                <History className="w-5 h-5 text-muted-foreground/60" />
                                                <span className="font-medium text-[1.05rem]">{item}</span>
                                            </div>
                                            <button
                                                onClick={(e) => removeHistoryItem(e, item)}
                                                className="p-1.5 rounded-full hover:bg-white/10 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all hover:text-destructive"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="py-6 min-h-[80vh] container mx-auto px-4 lg:px-6">
            {/* Filter Navigation - aligned left to match YouTube style */}
            <div className="max-w-5xl mx-auto mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex overflow-x-auto gap-2 p-1 rounded-xl scrollbar-hide py-2 w-full sm:w-auto mask-fade-edges">
                    {['All', 'Videos', 'Channels', 'Playlists', 'Shorts', 'Tweets'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all shrink-0 ${filter === tab
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'bg-secondary/40 text-secondary-foreground hover:bg-secondary'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2 bg-secondary/40 px-3 py-1.5 flex-row-reverse rounded-xl transition-colors hover:bg-secondary cursor-pointer shrink-0">
                    <div className="flex items-center pointer-events-none pr-1">
                        <Filter className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <select
                        value={sortBy}
                        onChange={handleSortChange}
                        className="appearance-none bg-transparent text-sm font-medium focus:outline-none text-foreground cursor-pointer text-right min-w-[100px]"
                        dir="rtl"
                    >
                        <option value="relevance" className="bg-background text-foreground text-left">Relevance</option>
                        <option value="createdAt" className="bg-background text-foreground text-left">Upload date</option>
                        <option value="views" className="bg-background text-foreground text-left">View count</option>
                    </select>
                </div>
            </div>

            {isLoading ? (
                <div className="max-w-5xl mx-auto flex flex-col gap-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        // Roughly mimic a horizontal skeleton
                        <div key={i} className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full animate-pulse">
                            <div className="bg-white/5 w-full sm:w-[320px] md:w-[360px] aspect-video rounded-xl shrink-0" />
                            <div className="flex flex-col gap-3 py-2 w-full max-w-md">
                                <div className="h-5 bg-white/5 rounded-full w-full" />
                                <div className="h-4 bg-white/5 rounded-full w-1/2" />
                                <div className="h-8 bg-white/5 rounded-full w-8 mt-2" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (filter === 'All' ? totalResultsCount === 0 : displayItems.length === 0) ? (
                renderEmptyState()
            ) : filter === 'All' ? (
                renderMixedAllTab()
            ) : (
                <div className="max-w-5xl mx-auto w-full">
                    {/* Render specific category layouts */}
                    {filter === 'Videos' && (
                        <div className="flex flex-col gap-4 w-full">
                            {displayItems.map(item => <VideoCard key={item._id || item.id} video={item} type="search" />)}
                        </div>
                    )}

                    {filter === 'Channels' && (
                        <div className="flex flex-col gap-2">
                            {displayItems.map(item => (
                                <div key={item.id || item._id} onClick={() => navigate(`/@${item.username}`)} className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 p-4 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer">
                                    <div className="w-[320px] md:w-[360px] flex justify-center shrink-0">
                                        <Avatar src={getMediaUrl(item.avatar)} fallback={item.username} size="xl" className="w-28 h-28 ring-1 ring-white/10 group-hover:ring-white/30 transition-all" />
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col justify-center h-full sm:mt-2 text-center sm:text-left">
                                        <h3 className="font-medium text-xl text-foreground group-hover:text-primary transition-colors">{item.fullName || item.username}</h3>
                                        <div className="text-sm text-muted-foreground mt-1 tracking-wide">@{item.username} â€¢ {formatSubscribers(item.subscribersCount || 0)} subscribers</div>
                                        <p className="mt-3 text-sm text-muted-foreground line-clamp-2 max-w-2xl">{item.description}</p>
                                    </div>
                                    <div className="hidden sm:flex flex-col justify-center h-28 shrink-0 pr-8">
                                        <Button variant="secondary" onClick={(e) => e.stopPropagation()} className="rounded-full px-6 transition-all hover:bg-primary hover:text-white">Subscribe</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {filter === 'Shorts' && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {displayItems.map(item => (
                                <Link to={`/watch/${item._id || item.id}`} key={item._id || item.id} className="group relative aspect-[9/16] rounded-xl overflow-hidden bg-black border border-white/5 hover:border-white/10 transition-colors block">
                                    <img src={getMediaUrl(item.thumbnail)} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute bottom-0 left-0 right-0 p-3">
                                        <h3 className="text-white font-medium text-[0.95rem] line-clamp-2 mb-1.5 leading-tight group-hover:text-primary transition-colors">{item.title}</h3>
                                        <p className="text-xs text-white/80 font-medium">{formatViews(item.views)} views</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {filter === 'Playlists' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                            {displayItems.map(item => <PlaylistCard key={item._id || item.id} playlist={item} />)}
                        </div>
                    )}

                    {filter === 'Tweets' && (
                        <div className="flex flex-col gap-4 max-w-3xl">
                            {displayItems.map(item => (
                                <TweetCard key={item._id || item.id} tweet={item} hideActions />
                            ))}
                        </div>
                    )}

                    {/* Infinite Scroll Trigger */}
                    {filter !== 'All' && (
                        <div ref={loadMoreRef} className="h-10 w-full flex items-center justify-center mt-8">
                            {isFetchingNextPage && <Loader2 className="w-6 h-6 animate-spin text-primary" />}
                            {!hasNextPage && displayItems.length > 0 && (
                                <p className="text-muted-foreground text-sm">You've reached the end</p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
