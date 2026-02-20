import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'
import MobileBottomNav from './MobileBottomNav'
import { PageTransition } from './PageTransition'
import { useAuth } from '../../context/AuthContext'
import { cn } from '../../lib/utils'
import { useRealtimeNotifications } from '../../hooks/useRealtimeNotifications'

export function Layout({ children }) {
    // Mobile Open State
    const [sidebarOpen, setSidebarOpen] = useState(false)

    // Desktop Collapsed State (persisted)
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        const saved = localStorage.getItem('sidebarCollapsed')
        return saved ? JSON.parse(saved) : false
    })

    const { user } = useAuth()
    useRealtimeNotifications()

    // Persist collapsed state
    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed))
    }, [sidebarCollapsed])

    const handleMenuClick = () => {
        if (window.innerWidth >= 1024) {
            setSidebarCollapsed(!sidebarCollapsed)
        } else {
            setSidebarOpen(!sidebarOpen)
        }
    }

    // Sidebar width calculation handled in style prop

    return (
        <div className="min-h-screen relative overflow-x-hidden text-foreground selection:bg-primary/20">


            <Navbar
                onMenuClick={handleMenuClick}
                user={user}
            />

            <div className="flex pt-16">
                <Sidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    isCollapsed={sidebarCollapsed}
                />

                <main
                    className={cn(
                        "flex-1 min-h-screen transition-all duration-300 ease-in-out pt-2 w-full",
                        "lg:ml-[var(--sidebar-width)]"
                    )}
                    style={{
                        '--sidebar-width': sidebarCollapsed ? '80px' : '256px'
                    }}
                >
                    <div className="px-3 sm:px-4 lg:px-6 pt-0 pb-20 md:pb-6 relative z-10">
                        <PageTransition>
                            {children || <Outlet />}
                        </PageTransition>
                    </div>
                </main>
            </div>

            {/* Mobile Bottom Navigation */}
            <MobileBottomNav />
        </div>
    )
}
