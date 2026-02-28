import { Link, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import {
    Search,
    Upload,
    User,
    Menu,
    X,
    LogOut,
    Video,
    Plus,
    ArrowLeft,
    Shield
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "../ui/DropdownMenu"
import { Avatar } from '../ui/Avatar'
import { Button } from '../ui/Button'
import { SidebarToggle } from './Sidebar'
import NotificationDropdown from './NotificationDropdown'
import { BrandLogo } from '../common/BrandLogo'

import { useAuth } from '../../context/AuthContext'


export function Navbar({ onMenuClick, user }) {
    const { logout, availableAccounts, switchAccount } = useAuth()

    const [searchQuery, setSearchQuery] = useState('')
    const [showMobileSearch, setShowMobileSearch] = useState(false)
    const mobileSearchRef = useRef(null)
    const navigate = useNavigate()

    const handleSearch = (e) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
            setShowMobileSearch(false)
            setSearchQuery('')
        }
    }

    // Focus mobile search input when opened
    useEffect(() => {
        if (showMobileSearch && mobileSearchRef.current) {
            mobileSearchRef.current.focus()
        }
    }, [showMobileSearch])

    // Close mobile search on escape
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') setShowMobileSearch(false)
        }
        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
    }, [])

    return (
        <header className="fixed top-0 left-0 right-0 z-50 w-full glass-nav transition-all duration-300">
            {/* Mobile Search Overlay */}
            {showMobileSearch && (
                <div className="md:hidden absolute inset-0 z-[60] glass-panel flex items-center px-4 gap-3 h-16 animate-in fade-in slide-in-from-top-2 duration-200">
                    <button
                        onClick={() => setShowMobileSearch(false)}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
                    >
                        <ArrowLeft className="w-5 h-5 text-foreground" />
                    </button>
                    <form onSubmit={handleSearch} className="flex-1 relative">
                        <input
                            ref={mobileSearchRef}
                            type="text"
                            placeholder="Search videos..."
                            className="w-full h-10 pl-4 pr-12 rounded-full glass-input text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoComplete="off"
                        />
                        <button
                            type="submit"
                            className="absolute right-0 top-0 h-10 px-4 rounded-r-full hover:bg-white/10 transition-colors flex items-center justify-center text-muted-foreground hover:text-foreground"
                        >
                            <Search className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            )}

            <div className="flex h-16 items-center justify-between px-4 lg:px-6">
                {/* Left: Logo + Menu */}
                <div className="flex items-center gap-4">
                    <SidebarToggle onClick={onMenuClick} />

                    <Link to="/" className="flex items-center gap-2 group">
                        <BrandLogo size="md" className="group-hover:scale-105 transition-transform" />
                        <span className="font-display font-bold text-xl text-gradient hidden sm:block">
                            Vixora
                        </span>
                    </Link>
                </div>

                {/* Center: Search - Desktop Only */}
                <div className="flex-1 max-w-2xl mx-4 hidden md:block group">
                    <form onSubmit={handleSearch} className="relative">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                placeholder="Search videos..."
                                className="w-full h-10 pl-4 pr-12 rounded-full glass-input text-sm text-foreground placeholder:text-muted-foreground shadow-sm group-hover:shadow-md"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="absolute right-0 top-0 h-10 px-5 rounded-r-full hover:bg-[var(--glass-bg-hover)] border-l border-[var(--glass-border)] transition-colors flex items-center justify-center text-muted-foreground hover:text-foreground"
                            >
                                <Search className="w-4 h-4" />
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2">
                    {/* Mobile Search Button */}
                    <button
                        onClick={() => setShowMobileSearch(true)}
                        className="md:hidden p-2 hover:bg-white/10 rounded-full transition-colors text-foreground"
                    >
                        <Search className="w-5 h-5" />
                    </button>

                    {user ? (
                        <>
                            {/* Upload Button - Always visible, glass style */}
                            <Link to="/upload" className="flex items-center justify-center">
                                <Button variant="ghost" size="icon" className="rounded-full text-foreground hover:bg-white/10 glass-btn border-0 w-10 h-10">
                                    <Upload className="w-5 h-5" />
                                    <span className="sr-only">Upload</span>
                                </Button>
                            </Link>

                            {/* Notifications */}
                            <NotificationDropdown />

                            {/* User Menu */}
                            <DropdownMenu>
                                <DropdownMenuTrigger className="outline-none focus:outline-none ring-0 focus:ring-0">
                                    <Avatar
                                        src={user?.avatar}
                                        alt={user?.fullName || user?.username}
                                        size="sm"
                                        className="cursor-pointer transition-all hover:ring-2 hover:ring-white/20 select-none touch-manipulation"
                                    />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-64 p-2 scale-100 animate-in fade-in zoom-in-95 duration-200 glass-panel border-white/10">
                                    <Link to={user?.username ? `/@${user.username}` : '/profile'} className="flex items-center gap-3 p-3 mb-2 hover:bg-white/5 rounded-xl transition-colors group">
                                        <Avatar
                                            src={user?.avatar}
                                            alt={user?.username}
                                            size="md"
                                        />
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="font-semibold truncate text-sm text-foreground group-hover:text-white transition-colors">{user?.fullName || user?.username || 'User'}</span>
                                            <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
                                        </div>
                                    </Link>
                                    <DropdownMenuSeparator className="bg-white/10" />
                                    <DropdownMenuItem className="cursor-pointer rounded-lg focus:bg-white/10 px-3" asChild>
                                        <Link to="/profile" className="flex items-center gap-3 w-full py-2.5">
                                            <User className="w-4 h-4" />
                                            <span>Profile</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="cursor-pointer rounded-lg focus:bg-white/10 px-3" asChild>
                                        <Link to={`/@${user?.username}`} className="flex items-center gap-3 w-full py-2.5">
                                            <Video className="w-4 h-4" />
                                            <span>My Channel</span>
                                        </Link>
                                    </DropdownMenuItem>

                                    {availableAccounts?.filter(acc => acc.id !== (user?.id || user?._id)).length > 0 && (
                                        <>
                                            <DropdownMenuSeparator className="bg-white/10" />
                                            <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                Switch Account
                                            </div>
                                            {availableAccounts
                                                .filter(acc => acc.id !== (user?.id || user?._id))
                                                .map(acc => (
                                                    <DropdownMenuItem
                                                        key={acc.id}
                                                        className="cursor-pointer rounded-lg focus:bg-white/10 px-3"
                                                        onClick={() => switchAccount(acc.accountSwitchToken)}
                                                    >
                                                        <div className="flex items-center gap-3 w-full py-2">
                                                            <Avatar src={acc.avatar} alt={acc.username} size="sm" />
                                                            <div className="flex flex-col overflow-hidden max-w-[150px]">
                                                                <span className="font-medium text-sm text-foreground truncate">{acc.fullName || acc.username}</span>
                                                                <span className="text-xs text-muted-foreground truncate">{acc.email}</span>
                                                            </div>
                                                        </div>
                                                    </DropdownMenuItem>
                                                ))
                                            }
                                        </>
                                    )}

                                    <DropdownMenuSeparator className="bg-white/10" />

                                    {['SUPER_ADMIN', 'ADMIN', 'MODERATOR'].includes(user?.role) && (
                                        <DropdownMenuItem className="cursor-pointer rounded-lg focus:bg-white/10 px-3" asChild>
                                            <Link to="/admin/dashboard" className="flex items-center gap-3 w-full py-2.5 text-blue-400">
                                                <Shield className="w-4 h-4" />
                                                <span>Admin Panel</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    )}

                                    <DropdownMenuItem className="cursor-pointer rounded-lg focus:bg-white/10 px-3" asChild>
                                        <Link to="/login" className="flex items-center gap-3 w-full py-2.5 text-foreground">
                                            <Plus className="w-4 h-4" />
                                            <span>Add Account</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="cursor-pointer rounded-lg text-red-400 hover:text-red-400 focus:text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 px-3"
                                        onClick={logout}
                                    >
                                        <div className="flex items-center gap-3 w-full py-2.5">
                                            <LogOut className="w-4 h-4" />
                                            <span>Log out</span>
                                        </div>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <Link to="/login">
                            <Button variant="outline" size="sm" className="gap-2 glass-btn border-white/10 hover:bg-white/10 rounded-full">
                                <User className="w-4 h-4" />
                                <span className="hidden sm:inline">Sign In</span>
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    )
}
