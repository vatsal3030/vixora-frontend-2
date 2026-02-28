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
    Film,
    ChevronRight
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
                    // Base Layout - Glass Panel
                    "fixed top-16 bottom-0 left-0 z-40 glass-panel overflow-y-auto scrollbar-hide transition-all duration-300 ease-in-out shadow-premium border-r border-white/5",
                    // Mobile: Slide in/out
                    isOpen ? "translate-x-0" : "-translate-x-full",
                    // Desktop: Always visible, width controlled by prop
                    "lg:translate-x-0",
                    isCollapsed ? "w-[80px]" : "w-[256px] max-w-[85vw]"
                )}
            >
                {/* Mobile Close Button (Top Right of Sidebar) */}
                <button
                    onClick={onClose}
                    className="lg:hidden absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg text-foreground transition-colors"
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
                                    "flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden",
                                    isActive(item.path)
                                        ? "bg-white/10 font-semibold text-white shadow-inner"
                                        : "hover:bg-white/5 text-muted-foreground hover:text-white",
                                    isCollapsed && "justify-center px-2"
                                )}
                                title={isCollapsed ? item.label : undefined}
                                onClick={() => window.innerWidth < 1024 && onClose()}
                            >
                                <item.icon className={cn(
                                    "w-[18px] h-[18px] flex-shrink-0 transition-all duration-300",
                                    isActive(item.path) ? "scale-110" : "group-hover:scale-110"
                                )} />
                                {!isCollapsed && <span className="text-[14px]">{item.label}</span>}
                                {isActive(item.path) && !isCollapsed && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                )}
                            </Link>
                        ))}
                    </nav>

                    <div className="border-t border-white/5 pt-4">
                        {!isCollapsed && (
                            <Link to="/library" className="group/lib block px-4 mb-2">
                                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider group-hover/lib:text-white transition-colors cursor-pointer flex items-center justify-between">
                                    Library
                                    <ChevronRight className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover/lib:opacity-100 group-hover/lib:translate-x-0 transition-all duration-300" />
                                </h3>
                            </Link>
                        )}
                        <nav className="space-y-1">
                            {libraryItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={cn(
                                        "flex items-center gap-3 px-3.5 py-2 rounded-xl transition-all duration-200 group relative overflow-hidden",
                                        isActive(item.path)
                                            ? "bg-white/10 font-semibold text-white shadow-inner"
                                            : "hover:bg-white/5 text-muted-foreground hover:text-white",
                                        isCollapsed && "justify-center px-2"
                                    )}
                                    title={isCollapsed ? item.label : undefined}
                                    onClick={() => window.innerWidth < 1024 && onClose()}
                                >
                                    <item.icon className={cn(
                                        "w-4.5 h-4.5 flex-shrink-0 transition-all duration-300",
                                        isActive(item.path) ? "scale-105" : "group-hover:scale-110"
                                    )} />
                                    {!isCollapsed && <span className="text-[13px]">{item.label}</span>}
                                    {isActive(item.path) && !isCollapsed && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
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
