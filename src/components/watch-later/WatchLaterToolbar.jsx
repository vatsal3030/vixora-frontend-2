import { Search, Filter, Grid, List, SortDesc, Play, Shuffle } from 'lucide-react'
import { Button } from '../ui/Button'
import { cn } from '../../lib/utils'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuLabel
} from "../ui/DropdownMenu"

export function WatchLaterToolbar({
    searchQuery,
    onSearchChange,
    viewMode,
    onViewModeChange,
    filter,
    onFilterChange,
    sortBy,
    onSortChange,
    totalCount,
    totalDuration,
    onPlayAll
}) {
    // Helper to format duration text
    const formatTotalDuration = (seconds) => {
        if (!seconds) return '0m'
        const h = Math.floor(seconds / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        return h > 0 ? `${h}h ${m}m` : `${m}m`
    }

    return (
        <div className="space-y-4 mb-6">
            {/* Stats Panel */}
            <div className="bg-gradient-to-r from-primary/10 via-transparent to-transparent rounded-xl p-4 border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Queue Status</span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-foreground">{totalCount}</span>
                        <span className="text-sm text-muted-foreground">videos</span>
                        <span className="text-muted-foreground mx-1">•</span>
                        <span className="text-sm font-medium text-foreground">{formatTotalDuration(totalDuration)}</span>
                        <span className="text-sm text-muted-foreground">to watch</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button onClick={onPlayAll} className="flex-1 sm:flex-none gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                        <Play className="w-4 h-4 fill-current" /> Play All
                    </Button>
                    <Button variant="secondary" className="flex-1 sm:flex-none gap-2">
                        <Shuffle className="w-4 h-4" /> Shuffle
                    </Button>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card/50 p-2 rounded-xl border border-border/50 backdrop-blur-sm">

                {/* Search */}
                <div className="relative flex-1 w-full md:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search your queue..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full bg-secondary/50 border-0 rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all placeholder:text-muted-foreground/60 h-10"
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto justify-end overflow-hidden">
                    {/* Filters */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant={filter !== 'all' ? "secondary" : "ghost"} size="sm" className="gap-2 h-9 border border-transparent hover:border-border">
                                <Filter className="w-4 h-4" />
                                <span className="hidden sm:inline">{filter === 'all' ? 'Filter' : filter}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Filter By</DropdownMenuLabel>
                            <DropdownMenuRadioGroup value={filter} onValueChange={onFilterChange}>
                                <DropdownMenuRadioItem value="all">All Videos</DropdownMenuRadioItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuRadioItem value="unwatched">Unwatched Only</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="in-progress">In Progress</DropdownMenuRadioItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuRadioItem value="high-priority">High Priority</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="short">Short (&lt; 5m)</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="long">Long (&gt; 20m)</DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Sort */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="gap-2 h-9 border border-transparent hover:border-border">
                                <SortDesc className="w-4 h-4" />
                                <span className="hidden sm:inline">Sort</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Sort Order</DropdownMenuLabel>
                            <DropdownMenuRadioGroup value={sortBy} onValueChange={onSortChange}>
                                <DropdownMenuRadioItem value="newest">Added (Newest)</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="oldest">Added (Oldest)</DropdownMenuRadioItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuRadioItem value="priority">Priority (High-Low)</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="duration-asc">Shortest First</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="duration-desc">Longest First</DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="h-4 w-px bg-border mx-1" />

                    {/* View Toggle */}
                    <div className="flex bg-secondary/50 rounded-lg p-1">
                        <button
                            onClick={() => onViewModeChange('grid')}
                            className={cn(
                                "p-1.5 rounded-md transition-all",
                                viewMode === 'grid' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                            )}
                            title="Grid View"
                        >
                            <Grid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onViewModeChange('list')}
                            className={cn(
                                "p-1.5 rounded-md transition-all",
                                viewMode === 'list' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                            )}
                            title="List View"
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
