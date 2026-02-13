import { cn } from '../../lib/utils'
import { Search, ChevronRight, Home, Settings } from 'lucide-react'
import { Link } from 'react-router-dom'

/**
 * Breadcrumb navigation for settings
 */
export function SettingsBreadcrumb({ currentSection }) {
    const sectionLabels = {
        account: 'Account & Profile',
        security: 'Security',
        notifications: 'Notifications',
        privacy: 'Privacy',
        playback: 'Playback',
        display: 'Display & Appearance',
        content: 'Content Preferences',
        shortcuts: 'Keyboard Shortcuts',
        connected: 'Connected Accounts',
        management: 'Account Management'
    }

    return (
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link
                to="/"
                className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Home</span>
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link
                to="/settings"
                className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
                <Settings className="w-4 h-4 sm:hidden" />
                <span>Settings</span>
            </Link>
            {currentSection && sectionLabels[currentSection] && (
                <>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-foreground font-medium truncate">
                        {sectionLabels[currentSection]}
                    </span>
                </>
            )}
        </nav>
    )
}

/**
 * Search input for settings
 */
export function SettingsSearch({ value, onChange, placeholder = "Search settings..." }) {
    return (
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={cn(
                    "w-full h-10 pl-10 pr-4 rounded-lg",
                    "bg-secondary/50 border border-border",
                    "text-sm text-foreground placeholder:text-muted-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                    "transition-all duration-200"
                )}
            />
        </div>
    )
}

/**
 * Main settings header with breadcrumb and search
 */
export function SettingsHeader({
    currentSection,
    searchValue,
    onSearchChange,
    showSearch = true
}) {
    return (
        <div className="mb-8">
            <SettingsBreadcrumb currentSection={currentSection} />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4">
                <h1 className="text-3xl font-bold text-foreground">Settings</h1>
                {showSearch && (
                    <div className="w-full sm:w-64">
                        <SettingsSearch
                            value={searchValue}
                            onChange={onSearchChange}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}

export default SettingsHeader
