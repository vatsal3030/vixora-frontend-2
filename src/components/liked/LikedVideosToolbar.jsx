import { Search, Filter, Grid, List, SortDesc, Tag } from 'lucide-react'
import { Button } from '../ui/Button'
import { cn } from '../../lib/utils'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from "../ui/DropdownMenu"

export function LikedVideosToolbar({
    searchQuery,
    onSearchChange,
    viewMode,
    onViewModeChange,
    filter,
    onFilterChange,
    sortBy,
    onSortChange,
    totalCount
}) {
    return (
        <div className="space-y-4 mb-6">
            {/* Main Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card/50 p-4 rounded-xl border border-border/50 backdrop-blur-sm">

                {/* Search */}
                <div className="relative flex-1 w-full md:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search liked videos..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full bg-secondary/50 border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all placeholder:text-muted-foreground/60"
                    />
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2 w-full md:w-auto justify-end overflow-x-auto">
                    <span className="text-xs text-muted-foreground whitespace-nowrap hidden lg:inline mr-2">
                        {totalCount} videos
                    </span>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="gap-2 h-9">
                                <SortDesc className="w-4 h-4" />
                                <span className="hidden sm:inline">Sort: {sortBy === 'newestLiked' ? 'Recently Liked' : sortBy === 'views' ? 'Most Viewed' : 'Oldest Liked'}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuRadioGroup value={sortBy} onValueChange={onSortChange}>
                                <DropdownMenuRadioItem value="newestLiked">Recently Liked</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="oldestLiked">Oldest Liked</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="views">Most Viewed</DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="h-6 w-px bg-border mx-1" />

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

            {/* Filter Chips */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                <Button
                    variant={filter === 'all' ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => onFilterChange('all')}
                    className={cn("rounded-full px-4 h-8 text-xs hover:bg-secondary/80", filter === 'all' && "bg-foreground text-background hover:bg-foreground/90")}
                >
                    All
                </Button>
                <Button
                    variant={filter === 'video' ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => onFilterChange('video')}
                    className={cn("rounded-full px-4 h-8 text-xs bg-card border border-border hover:bg-secondary", filter === 'video' && "bg-primary text-primary-foreground border-primary hover:bg-primary/90")}
                >
                    Videos
                </Button>
                <Button
                    variant={filter === 'shorts' ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => onFilterChange('shorts')}
                    className={cn("rounded-full px-4 h-8 text-xs bg-card border border-border hover:bg-secondary", filter === 'shorts' && "bg-primary text-primary-foreground border-primary hover:bg-primary/90")}
                >
                    Shorts
                </Button>
            </div>
        </div>
    )
}
