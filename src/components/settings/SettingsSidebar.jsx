import { useState, useRef, useEffect } from 'react'
import { cn } from '../../lib/utils'
import {
    User,
    Lock,
    Bell,
    Shield,
    Play,
    Palette,
    Target,
    Link2,
    Keyboard,
    Trash2,
    ChevronRight,
    ChevronDown,
    Settings
} from 'lucide-react'

const settingsSections = [
    {
        category: 'User Settings',
        items: [
            { id: 'account', label: 'Account & Profile', icon: User, description: 'Email, username, profile', keywords: ['email', 'username', 'profile', 'avatar', 'name'] },
            { id: 'security', label: 'Security', icon: Lock, description: 'Password, 2FA, sessions', keywords: ['password', '2fa', 'two-factor', 'authentication', 'sessions', 'delete'] },
            { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Email & push notifications', keywords: ['email', 'push', 'alerts', 'subscribe', 'mentions'] },
            { id: 'privacy', label: 'Privacy', icon: Shield, description: 'Visibility & interactions', keywords: ['visibility', 'public', 'private', 'block', 'comments'] },
        ]
    },
    {
        category: 'Preferences',
        items: [
            { id: 'playback', label: 'Playback', icon: Play, description: 'Video player settings', keywords: ['autoplay', 'quality', 'speed', 'subtitles', 'captions'] },
            { id: 'display', label: 'Display & Appearance', icon: Palette, description: 'Theme & layout', keywords: ['theme', 'dark', 'light', 'mode', 'appearance'] },
            { id: 'content', label: 'Content Preferences', icon: Target, description: 'Recommendations & feed', keywords: ['recommendations', 'trending', 'shorts', 'algorithm'] },
            { id: 'shortcuts', label: 'Keyboard Shortcuts', icon: Keyboard, description: 'Hotkeys & controls', keywords: ['keyboard', 'hotkey', 'shortcut', 'controls'] },
        ]
    },
    {
        category: 'Connections',
        items: [
            { id: 'connected', label: 'Connected Accounts', icon: Link2, description: 'Linked services', keywords: ['google', 'github', 'facebook', 'oauth', 'linked'] },
        ]
    },
    {
        category: 'Advanced',
        items: [
            { id: 'management', label: 'Account Management', icon: Trash2, description: 'Data & deletion', danger: true, keywords: ['delete', 'data', 'export', 'download', 'clear', 'history'] },
        ]
    }
]

// Get all items flattened
const getAllItems = () => settingsSections.flatMap(group => group.items)

// Find item by ID
const getItemById = (id) => getAllItems().find(item => item.id === id)

/**
 * Mobile Dropdown Selector for Settings Sections
 */
export function MobileSettingsSelector({ activeSection, onSectionChange, searchQuery }) {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef(null)
    const activeItem = getItemById(activeSection)
    const Icon = activeItem?.icon || Settings

    // Filter items based on search
    const filteredSections = searchQuery
        ? settingsSections.map(group => ({
            ...group,
            items: group.items.filter(item =>
                item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.keywords?.some(kw => kw.toLowerCase().includes(searchQuery.toLowerCase()))
            )
        })).filter(group => group.items.length > 0)
        : settingsSections

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Close on escape
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') setIsOpen(false)
        }
        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
    }, [])

    const handleSelect = (id) => {
        onSectionChange(id)
        setIsOpen(false)
    }

    return (
        <div className="relative lg:hidden" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl",
                    "bg-card border border-border",
                    "text-left transition-all duration-200",
                    "hover:bg-accent/50",
                    isOpen && "ring-2 ring-primary"
                )}
            >
                <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{activeItem?.label || 'Select Section'}</p>
                    <p className="text-xs text-muted-foreground truncate">{activeItem?.description}</p>
                </div>
                <ChevronDown className={cn(
                    "w-5 h-5 text-muted-foreground transition-transform duration-200",
                    isOpen && "rotate-180"
                )} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className={cn(
                    "absolute top-full left-0 right-0 z-50 mt-2",
                    "bg-card border border-border rounded-xl shadow-lg",
                    "max-h-[60vh] overflow-y-auto",
                    "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2"
                )}>
                    {filteredSections.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground text-sm">
                            No settings found for "{searchQuery}"
                        </div>
                    ) : (
                        filteredSections.map((group) => (
                            <div key={group.category} className="p-2">
                                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1.5">
                                    {group.category}
                                </h3>
                                {group.items.map((item) => {
                                    const ItemIcon = item.icon
                                    const isActive = activeSection === item.id

                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => handleSelect(item.id)}
                                            className={cn(
                                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
                                                isActive
                                                    ? "bg-primary text-primary-foreground"
                                                    : cn(
                                                        "hover:bg-accent text-foreground",
                                                        item.danger && "hover:bg-destructive/10 hover:text-destructive"
                                                    )
                                            )}
                                        >
                                            <ItemIcon className={cn(
                                                "w-4 h-4 flex-shrink-0",
                                                isActive ? "text-primary-foreground" : item.danger ? "text-destructive" : "text-muted-foreground"
                                            )} />
                                            <div className="flex-1 text-left">
                                                <span className="block font-medium">{item.label}</span>
                                                <span className={cn(
                                                    "block text-xs",
                                                    isActive ? "text-primary-foreground/70" : "text-muted-foreground"
                                                )}>{item.description}</span>
                                            </div>
                                            {isActive && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
                                        </button>
                                    )
                                })}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}

/**
 * Desktop Sidebar for Settings Sections
 */
export function SettingsSidebar({ activeSection, onSectionChange, searchQuery, className }) {
    // Filter items based on search
    const filteredSections = searchQuery
        ? settingsSections.map(group => ({
            ...group,
            items: group.items.filter(item =>
                item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.keywords?.some(kw => kw.toLowerCase().includes(searchQuery.toLowerCase()))
            )
        })).filter(group => group.items.length > 0)
        : settingsSections

    return (
        <aside className={cn("w-72 flex-shrink-0 hidden lg:block", className)}>
            <nav className="lg:sticky lg:top-4 space-y-6">
                {filteredSections.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground text-sm">
                        No settings found for "{searchQuery}"
                    </div>
                ) : (
                    filteredSections.map((group) => (
                        <div key={group.category}>
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                                {group.category}
                            </h3>
                            <div className="space-y-1">
                                {group.items.map((item) => {
                                    const Icon = item.icon
                                    const isActive = activeSection === item.id

                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => onSectionChange(item.id)}
                                            className={cn(
                                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                                                isActive
                                                    ? "bg-primary text-primary-foreground shadow-md"
                                                    : cn(
                                                        "hover:bg-accent text-muted-foreground hover:text-foreground",
                                                        item.danger && "hover:bg-destructive/10 hover:text-destructive"
                                                    )
                                            )}
                                        >
                                            <Icon className={cn(
                                                "w-5 h-5 flex-shrink-0",
                                                isActive ? "text-primary-foreground" : item.danger ? "text-destructive" : "text-muted-foreground"
                                            )} />
                                            <div className="flex-1 text-left">
                                                <span className="block">{item.label}</span>
                                            </div>
                                            <ChevronRight className={cn(
                                                "w-4 h-4 flex-shrink-0 transition-transform",
                                                isActive && "rotate-90"
                                            )} />
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    ))
                )}
            </nav>
        </aside>
    )
}

export { settingsSections, getAllItems, getItemById }
export default SettingsSidebar
