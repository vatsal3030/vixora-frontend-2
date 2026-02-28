import { useState, useEffect } from 'react'
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, Flag, Film, MessageSquare, Shield, Activity, ListVideo, LogOut } from 'lucide-react'
import { Navbar } from './Navbar'
import { useAuth } from '../../context/AuthContext'
import { cn } from '../../lib/utils'

function AdminSidebar({ isOpen, isMobile, onClose }) {
    const location = useLocation()
    const { logout, user } = useAuth()
    const navigate = useNavigate()

    // Determine role display correctly based on robust /admin/me fetch, but user.role is fallback
    const roleColors = {
        SUPER_ADMIN: 'text-red-400 bg-red-400/10',
        ADMIN: 'text-purple-400 bg-purple-400/10',
        MODERATOR: 'text-blue-400 bg-blue-400/10'
    }
    const userRole = user?.role || 'MODERATOR'

    const navigation = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Reports', href: '/admin/reports', icon: Flag },
        { name: 'Users', href: '/admin/users', icon: Users },
        { name: 'Videos', href: '/admin/videos', icon: Film },
        { name: 'Tweets', href: '/admin/tweets', icon: MessageSquare },
        { name: 'Playlists', href: '/admin/playlists', icon: ListVideo },
        { name: 'Audit Logs', href: '/admin/audit-logs', icon: Activity }
    ]

    return (
        <>
            {/* Mobile Overlay */}
            {isMobile && isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[45] animate-in fade-in duration-200"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed top-16 bottom-0 z-[45] flex flex-col glass-sidebar transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] will-change-transform pt-4 overflow-y-auto no-scrollbar",
                    isMobile ? "w-64 -translate-x-full border-r border-[var(--glass-border)] shadow-2xl" : "w-64 md:border-r md:border-[var(--glass-border)]",
                    isMobile && isOpen && "translate-x-0"
                )}
            >
                <div className="px-4 mb-6">
                    <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Control Panel
                    </h2>
                    <div className={cn("inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase", roleColors[userRole] || roleColors['MODERATOR'])}>
                        {userRole.replace('_', ' ')}
                    </div>
                </div>

                <nav className="flex-1 px-3 space-y-1">
                    {navigation.map((item) => {
                        const Icon = item.icon
                        const isActive = location.pathname.startsWith(item.href)

                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                onClick={isMobile ? onClose : undefined}
                                className={cn(
                                    "flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 group relative",
                                    isActive
                                        ? "bg-primary/20 text-primary font-medium"
                                        : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                                )}
                            >
                                <Icon className={cn("w-5 h-5 transition-transform duration-200", isActive ? "" : "group-hover:scale-110")} />
                                <span className="text-sm">{item.name}</span>
                            </Link>
                        )
                    })}
                </nav>

                {/* Bottom Actions */}
                <div className="p-4 mt-auto border-t border-[var(--glass-border)] space-y-2">
                    <Link
                        to="/"
                        className="flex items-center gap-4 px-3 py-3 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-foreground transition-all duration-200"
                    >
                        <Shield className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm whitespace-nowrap">Exit Admin</span>
                    </Link>
                </div>
            </aside>
        </>
    )
}

export function AdminLayout() {
    const { user } = useAuth()
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isMobile, setIsMobile] = useState(false)

    // Handle resize
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768
            setIsMobile(mobile)
            if (!mobile) setIsSidebarOpen(true)
            else setIsSidebarOpen(false)
        }

        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 flex flex-col font-sans">
            {/* Top Navigation */}
            <Navbar
                onMenuClick={() => setIsSidebarOpen(prev => !prev)}
                user={user}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex pt-16 relative">
                {/* Admin Sidebar */}
                <AdminSidebar
                    isOpen={isSidebarOpen}
                    isMobile={isMobile}
                    onClose={() => setIsSidebarOpen(false)}
                />

                {/* Main Content */}
                <main
                    className={cn(
                        "flex-1 relative transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] min-w-0 bg-background/50",
                        !isMobile && "ml-64"
                    )}
                >
                    <div className="w-full h-full max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 animate-in fade-in duration-500">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}
