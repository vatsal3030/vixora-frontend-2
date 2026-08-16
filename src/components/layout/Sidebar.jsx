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
    Trash2,
    Settings,
    Menu,
    X,
    Search,
    Film,
    ChevronRight,
    MessageCircle,
    SquareUser,
    ShieldAlert
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../lib/utils'
import { useAuth } from '../../context/AuthContext'

const sidebarItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: TrendingUp, label: 'Trending', path: '/trending' },
    { icon: Film, label: 'Shorts', path: '/shorts' },
    { icon: MessageCircle, label: 'Community', path: '/tweets' },
    { icon: Users, label: 'Subscriptions', path: '/subscriptions' },
]

const libraryItems = [
    { icon: History, label: 'History', path: '/history' },
    { icon: Clock, label: 'Watch Later', path: '/watch-later' },
    { icon: ThumbsUp, label: 'Liked Videos', path: '/liked' },
    { icon: ListVideo, label: 'Playlists', path: '/playlists' },
    { icon: SquareUser, label: 'Yours', path: '/my-videos' },
    { icon: BarChart2, label: 'Dashboard', path: '/dashboard' },
    { icon: Trash2, label: 'Trash', path: '/trash' },
    { icon: Settings, label: 'Settings', path: '/settings' },
]

export function Sidebar({ isOpen, onClose, isCollapsed }) {
    const location = useLocation()
    const { user } = useAuth()
    const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'MODERATOR'].includes(user?.role)

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/'
        return location.pathname.startsWith(path)
    }

    return (
        <>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside
                className={cn(
                    // Base Layout
                    "fixed top-16 bottom-0 left-0 z-40 bg-black/80 backdrop-blur-3xl overflow-y-auto overflow-x-hidden scrollbar-hide border-r border-white/10",
                    "max-w-[85vw] transition-all duration-300 ease-in-out",
                    // Width control
                    isCollapsed ? "lg:w-[80px]" : "lg:w-[256px]",
                    // Mobile translation
                    isOpen ? "translate-x-0 w-[256px]" : "-translate-x-full lg:translate-x-0"
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
                                    "w-4 h-4 flex-shrink-0 transition-all duration-300",
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
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider group-hover/lib:text-white transition-colors cursor-pointer flex items-center justify-between">
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
                                        "w-[18px] h-[18px] flex-shrink-0 transition-all duration-300 opacity-80",
                                        isActive(item.path) ? "scale-105 opacity-100" : "group-hover:scale-110 group-hover:opacity-100"
                                    )} />
                                    {!isCollapsed && <span className="text-[15px]">{item.label}</span>}
                                    {isActive(item.path) && !isCollapsed && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                    )}
                                </Link>
                            ))}

                            {isAdmin && (
                                <Link
                                    to="/admin"
                                    className={cn(
                                        "flex items-center gap-3 px-3.5 py-2 rounded-xl transition-all duration-200 group relative overflow-hidden text-amber-400 hover:bg-amber-500/10 hover:text-amber-300",
                                        isActive('/admin')
                                            ? "bg-amber-500/15 font-semibold text-amber-300 shadow-inner"
                                            : "opacity-90",
                                        isCollapsed && "justify-center px-2"
                                    )}
                                    title={isCollapsed ? "Admin Panel" : undefined}
                                    onClick={() => window.innerWidth < 1024 && onClose()}
                                >
                                    <ShieldAlert className="w-[18px] h-[18px] flex-shrink-0 text-amber-400" />
                                    {!isCollapsed && <span className="text-[15px] font-bold">Admin Panel</span>}
                                    {isActive('/admin') && !isCollapsed && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-amber-400 rounded-r-full shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                                    )}
                                </Link>
                            )}
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
