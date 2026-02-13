import { useState } from 'react'
import { SettingCard, SettingSectionHeader, SettingDivider } from '../SettingCard'
import { Keyboard, Search, Play, Navigation, Maximize } from 'lucide-react'
import { cn } from '../../../lib/utils'

const shortcutCategories = [
    {
        id: 'playback',
        title: 'Playback Controls',
        icon: Play,
        shortcuts: [
            { keys: ['Space', 'K'], action: 'Play / Pause' },
            { keys: ['L', '→'], action: 'Seek forward 10s' },
            { keys: ['J', '←'], action: 'Seek backward 10s' },
            { keys: ['↑'], action: 'Volume up' },
            { keys: ['↓'], action: 'Volume down' },
            { keys: ['M'], action: 'Mute / Unmute' },
            { keys: ['<'], action: 'Decrease speed' },
            { keys: ['>'], action: 'Increase speed' },
        ]
    },
    {
        id: 'navigation',
        title: 'Navigation',
        icon: Navigation,
        shortcuts: [
            { keys: ['/'], action: 'Focus search' },
            { keys: ['G', 'H'], action: 'Go to Home' },
            { keys: ['G', 'T'], action: 'Go to Trending' },
            { keys: ['G', 'S'], action: 'Go to Subscriptions' },
            { keys: ['G', 'L'], action: 'Go to Liked Videos' },
            { keys: ['Esc'], action: 'Close modal / menu' },
        ]
    },
    {
        id: 'player',
        title: 'Player',
        icon: Maximize,
        shortcuts: [
            { keys: ['F'], action: 'Toggle fullscreen' },
            { keys: ['T'], action: 'Toggle theater mode' },
            { keys: ['I'], action: 'Toggle mini player' },
            { keys: ['C'], action: 'Toggle captions' },
            { keys: ['0-9'], action: 'Seek to 0%-90%' },
        ]
    }
]

function KeyBadge({ children }) {
    return (
        <kbd className={cn(
            "inline-flex items-center justify-center min-w-[28px] h-7 px-2",
            "bg-secondary border border-border rounded-md",
            "text-xs font-mono font-medium text-foreground",
            "shadow-sm"
        )}>
            {children}
        </kbd>
    )
}

export function KeyboardShortcutsSection() {
    const [searchQuery, setSearchQuery] = useState('')
    const [expandedCategory, setExpandedCategory] = useState('playback')

    const filteredCategories = shortcutCategories.map(category => ({
        ...category,
        shortcuts: category.shortcuts.filter(shortcut =>
            shortcut.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
            shortcut.keys.some(key => key.toLowerCase().includes(searchQuery.toLowerCase()))
        )
    })).filter(category => category.shortcuts.length > 0)

    return (
        <div className="space-y-6 animate-fade-in">
            <SettingCard>
                <SettingSectionHeader
                    icon={Keyboard}
                    title="Keyboard Shortcuts"
                    description="Quick reference for keyboard shortcuts"
                />

                {/* Search */}
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search shortcuts..."
                        className={cn(
                            "w-full h-10 pl-10 pr-4 rounded-lg",
                            "bg-secondary/50 border border-border",
                            "text-sm text-foreground placeholder:text-muted-foreground",
                            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                            "transition-all duration-200"
                        )}
                    />
                </div>

                {/* Categories */}
                <div className="space-y-4">
                    {filteredCategories.map((category) => {
                        const Icon = category.icon
                        const isExpanded = expandedCategory === category.id

                        return (
                            <div
                                key={category.id}
                                className="border border-border rounded-xl overflow-hidden"
                            >
                                <button
                                    onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                                    className={cn(
                                        "w-full flex items-center gap-3 p-4 transition-colors",
                                        isExpanded ? "bg-secondary/50" : "hover:bg-secondary/30"
                                    )}
                                >
                                    <Icon className="w-5 h-5 text-primary" />
                                    <span className="font-medium flex-1 text-left">{category.title}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {category.shortcuts.length} shortcuts
                                    </span>
                                </button>

                                {isExpanded && (
                                    <div className="px-4 pb-4 space-y-2">
                                        {category.shortcuts.map((shortcut, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/30"
                                            >
                                                <span className="text-sm text-muted-foreground">
                                                    {shortcut.action}
                                                </span>
                                                <div className="flex items-center gap-1">
                                                    {shortcut.keys.map((key, keyIndex) => (
                                                        <span key={keyIndex} className="flex items-center gap-1">
                                                            <KeyBadge>{key}</KeyBadge>
                                                            {keyIndex < shortcut.keys.length - 1 && (
                                                                <span className="text-muted-foreground text-xs mx-1">or</span>
                                                            )}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                {filteredCategories.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        <Keyboard className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No shortcuts found for "{searchQuery}"</p>
                    </div>
                )}
            </SettingCard>

            {/* Tip */}
            <div className="flex items-start gap-3 p-4 bg-accent/20 rounded-xl text-sm">
                <Keyboard className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                    <p className="font-medium text-foreground">Pro Tip</p>
                    <p className="text-muted-foreground mt-1">
                        Press <KeyBadge>?</KeyBadge> anywhere to quickly view all keyboard shortcuts.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default KeyboardShortcutsSection
