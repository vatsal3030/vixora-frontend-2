import { Link, useLocation } from 'react-router-dom'
import {
    Home,
    TrendingUp,
    Users,
    History,
    Clock,
    ThumbsUp,
    ListVideo,
    BarChart2,
    Video,
    Trash2,
    Settings,
    Menu,
    X,
    Search,
    Film
} from 'lucide-react'
import { cn } from '../../lib/utils'

const sidebarItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: TrendingUp, label: 'Trending', path: '/trending' },
    { icon: Film, label: 'Shorts', path: '/shorts' }, // Added Shorts
    { icon: Users, label: 'Subscriptions', path: '/subscriptions' },
]

const libraryItems = [
    { icon: History, label: 'History', path: '/history' },
    { icon: Clock, label: 'Watch Later', path: '/watch-later' },
    { icon: ThumbsUp, label: 'Liked Videos', path: '/liked' },
    { icon: ListVideo, label: 'Playlists', path: '/playlists' },
    { icon: Video, label: 'Your Videos', path: '/my-videos' },
    { icon: BarChart2, label: 'Dashboard', path: '/dashboard' },
    { icon: Trash2, label: 'Trash', path: '/trash' },
    { icon: Settings, label: 'Settings', path: '/settings' },
]

export function Sidebar({ isOpen, onClose, isCollapsed }) {
    const location = useLocation()

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/'
        return location.pathname.startsWith(path)
    }

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    onClick={onClose}
                    className="fixed inset-0 bg-black/60 z-40 lg:hidden animate-in fade-in duration-200"
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    // Base Layout
                    "fixed top-16 bottom-0 left-0 z-40 glass-panel border-r border-white/10 overflow-y-auto scrollbar-hide transition-all duration-300 ease-in-out",
                    // Mobile: Slide in/out
                    isOpen ? "translate-x-0" : "-translate-x-full",
                    // Desktop: Always visible, width controlled by prop
                    "lg:translate-x-0",
                    isCollapsed ? "w-[80px]" : "w-[256px]"
                )}
            >
                {/* Mobile Close Button (Top Right of Sidebar) */}
                <button
                    onClick={onClose}
                    className="lg:hidden absolute top-4 right-4 p-2 hover:bg-secondary rounded-lg text-foreground"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="py-4 px-3 space-y-6">
                    {/* Main Navigation */}
                    <nav className="space-y-1">
                        {sidebarItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                                    isActive(item.path)
                                        ? "glass-badge active font-semibold"
                                        : "hover:bg-[var(--glass-bg-hover)] text-muted-foreground hover:text-foreground",
                                    isCollapsed && "justify-center px-2"
                                )}
                                title={isCollapsed ? item.label : undefined}
                                onClick={() => window.innerWidth < 1024 && onClose()}
                            >
                                <item.icon className={cn(
                                    "w-5 h-5 flex-shrink-0 transition-all duration-300",
                                    isActive(item.path) ? "text-foreground scale-110 drop-shadow-[0_0_6px_rgba(200,200,210,0.3)]" : "text-muted-foreground group-hover:text-foreground group-hover:scale-110"
                                )} />
                                {!isCollapsed && <span className="">{item.label}</span>}
                                {isActive(item.path) && !isCollapsed && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-foreground rounded-r-full shadow-[0_0_8px_rgba(200,200,210,0.2)]" />
                                )}
                            </Link>
                        ))}
                    </nav>

                    <div className="border-t border-[var(--glass-border)] pt-4">
                        {!isCollapsed && (
                            <h3 className="px-4 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Library
                            </h3>
                        )}
                        <nav className="space-y-1">
                            {libraryItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={cn(
                                        "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                                        isActive(item.path)
                                            ? "glass-badge active font-semibold"
                                            : "hover:bg-[var(--glass-bg-hover)] text-muted-foreground hover:text-foreground",
                                        isCollapsed && "justify-center px-2"
                                    )}
                                    title={isCollapsed ? item.label : undefined}
                                    onClick={() => window.innerWidth < 1024 && onClose()}
                                >
                                    <item.icon className={cn(
                                        "w-5 h-5 flex-shrink-0 transition-all",
                                        isActive(item.path) ? "text-foreground drop-shadow-[0_0_6px_rgba(200,200,210,0.3)]" : "text-muted-foreground group-hover:text-foreground"
                                    )} />
                                    {!isCollapsed && <span className="">{item.label}</span>}
                                    {isActive(item.path) && !isCollapsed && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-foreground rounded-r-full shadow-[0_0_8px_rgba(200,200,210,0.2)]" />
                                    )}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>
            </aside>
        </>
    )
}

// Mobile toggle button component
export function SidebarToggle({ onClick }) {
    return (
        <button
            onClick={onClick}
            className="p-2 hover:bg-secondary rounded-lg transition-colors text-foreground"
        >
            <Menu className="w-6 h-6" />
        </button>
    )
}
