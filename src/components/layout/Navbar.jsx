import { Link, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import {
    Search,
    Upload,
    User,
    Menu,
    X,
    Sun,
    Moon,
    LogOut,
    Video,
    Plus,
    ArrowLeft
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
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'sonner'

export function Navbar({ onMenuClick, user }) {
    const { toggleTheme } = useTheme()
    const { logout } = useAuth()

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
        <header className="fixed top-0 left-0 right-0 z-50 w-full glass-nav transition-colors duration-300">
            {/* Mobile Search Overlay */}
            {showMobileSearch && (
                <div className="md:hidden absolute inset-0 z-50 glass-panel flex items-center px-2 gap-2 h-16">
                    <button
                        onClick={() => setShowMobileSearch(false)}
                        className="p-2 hover:bg-secondary rounded-full transition-colors flex-shrink-0"
                    >
                        <ArrowLeft className="w-5 h-5 text-foreground" />
                    </button>
                    <form onSubmit={handleSearch} className="flex-1 relative">
                        <input
                            ref={mobileSearchRef}
                            type="text"
                            placeholder="Search videos..."
                            className="w-full h-10 pl-4 pr-12 rounded-full glass-input text-sm text-foreground placeholder:text-muted-foreground"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoComplete="off"
                        />
                        <button
                            type="submit"
                            className="absolute right-0 top-0 h-10 px-4 rounded-r-full hover:bg-muted transition-colors flex items-center justify-center text-muted-foreground hover:text-foreground"
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

                    <Link to="/" className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">V</span>
                        </div>
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
                        className="md:hidden p-2 hover:bg-secondary rounded-full transition-colors"
                    >
                        <Search className="w-5 h-5 text-foreground" />
                    </button>

                    {user ? (
                        <>
                            {/* Theme Toggle */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full relative overflow-hidden hover:bg-primary/10 transition-colors duration-200"
                                onClick={toggleTheme}
                            >
                                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 text-foreground" />
                                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 text-foreground" />
                                <span className="sr-only">Toggle theme</span>
                            </Button>

                            {/* Upload Button — hidden on mobile */}
                            <Link to="/upload" className="hidden md:block">
                                <Button variant="ghost" className="rounded-full gap-2 text-foreground font-medium hover:bg-secondary/80">
                                    <Upload className="w-5 h-5" />
                                    <span className="hidden sm:inline">Upload</span>
                                </Button>
                            </Link>

                            {/* Notifications */}
                            <NotificationDropdown />

                            {/* User Menu */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Avatar
                                        src={user?.avatar}
                                        alt={user?.fullName || user?.username}
                                        size="sm"
                                        className="cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all select-none"
                                    />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-64 p-2">
                                    <Link to={`/@${user?.username}`} className="flex items-center gap-3 p-2 mb-2 hover:bg-secondary/50 rounded-lg transition-colors">
                                        <Avatar
                                            src={user?.avatar}
                                            alt={user?.username}
                                            size="md"
                                        />
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="font-semibold truncate text-sm">{user?.fullName || user?.username}</span>
                                            <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
                                        </div>
                                    </Link>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="cursor-pointer" asChild>
                                        <Link to="/profile" className="flex items-center gap-2 w-full">
                                            <User className="w-4 h-4" />
                                            <span>Profile</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="cursor-pointer" asChild>
                                        <Link to={`/@${user?.username}`} className="flex items-center gap-2 w-full">
                                            <Video className="w-4 h-4" />
                                            <span>My Channel</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="cursor-pointer text-muted-foreground" onClick={() => toast.info('Feature coming soon!')}>
                                        <div className="flex items-center gap-2 w-full">
                                            <Plus className="w-4 h-4" />
                                            <span>Add Account</span>
                                        </div>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="cursor-pointer text-red-500 hover:text-red-500 focus:text-red-500 hover:bg-red-500/10 focus:bg-red-500/10 mt-1"
                                        onClick={logout}
                                    >
                                        <div className="flex items-center gap-2 w-full">
                                            <LogOut className="w-4 h-4" />
                                            <span>Log out</span>
                                        </div>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <Link to="/login">
                            <Button variant="outline" size="sm" className="gap-2">
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
