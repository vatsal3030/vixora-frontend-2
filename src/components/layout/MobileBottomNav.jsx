import { Link, useLocation } from 'react-router-dom'
import { Home, TrendingUp, Film, Users, Library } from 'lucide-react'
import { cn } from '../../lib/utils'

const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/trending', icon: TrendingUp, label: 'Trending' },
    { path: '/shorts', icon: Film, label: 'Shorts' },
    { path: '/subscriptions', icon: Users, label: 'Subscriptions' },
    { path: '/library', icon: Library, label: 'Library' },
]

export default function MobileBottomNav() {
    const location = useLocation()

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/'
        return location.pathname.startsWith(path)
    }

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass-panel border-t border-[var(--glass-border)] border-r-0 border-l-0 border-b-0">
            <div className="flex justify-around items-center h-14 px-1">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={cn(
                            "flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 min-w-[48px] min-h-[44px] transition-all duration-200",
                            isActive(item.path)
                                ? "text-primary"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <item.icon className={cn(
                            "w-5 h-5 transition-all duration-200",
                            isActive(item.path) && "filter drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                        )} strokeWidth={isActive(item.path) ? 2.5 : 1.5} />
                        <span className="text-[10px] font-medium leading-none">{item.label}</span>
                    </Link>
                ))}
            </div>
        </nav>
    )
}
