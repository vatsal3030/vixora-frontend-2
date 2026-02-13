import { Search, Filter, Grid, List, SortDesc, SlidersHorizontal } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { cn } from '../../../lib/utils'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from "../../../components/ui/DropdownMenu"

export function VideoManagementToolbar({
    searchQuery,
    onSearchChange,
    viewMode,
    onViewModeChange,
    filter,
    onFilterChange,
    sortBy,
    onSortChange
}) {
    return (
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card/50 p-4 rounded-xl border border-border/50 mb-6 backdrop-blur-sm">
            {/* Left: Search & Filter */}
            <div className="flex items-center gap-3 w-full md:w-auto flex-1">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search your videos..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full bg-secondary/50 border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all placeholder:text-muted-foreground/60"
                    />
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2 h-9 hidden sm:flex">
                            <Filter className="w-4 h-4" />
                            Filter
                            {filter !== 'all' && <span className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full capitalize">{filter}</span>}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                        <DropdownMenuLabel>Visibility</DropdownMenuLabel>
                        <DropdownMenuRadioGroup value={filter} onValueChange={onFilterChange}>
                            <DropdownMenuRadioItem value="all">All Videos</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="published">Public</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="private">Private</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="unlisted">Unlisted</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Right: Sort & View Toggle */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="gap-2 h-9">
                            <SortDesc className="w-4 h-4" />
                            <span className="hidden sm:inline">Sort by: {sortBy === 'createdAt' ? 'Date' : sortBy === 'views' ? 'Views' : 'Likes'}</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuRadioGroup value={sortBy} onValueChange={onSortChange}>
                            <DropdownMenuRadioItem value="createdAt">Date (Newest)</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="views">Most Views</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="likesCount">Most Likes</DropdownMenuRadioItem>
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
    )
}
