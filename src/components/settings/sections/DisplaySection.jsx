import { SettingCard, SettingSectionHeader, SettingDivider, SettingGroup } from '../SettingCard'
import { SettingRow, SettingToggle } from '../SettingRow'
import { Palette, Sun, Moon, Monitor, BarChart3, Clock, User, Eye } from 'lucide-react'
import { useTheme } from '../../../context/ThemeContext'
import { cn } from '../../../lib/utils'

export function DisplaySection({ settings, onToggle, isLoading }) {
    const { theme, setTheme } = useTheme()

    const themes = [
        { id: 'dark', label: 'Dark', icon: Moon, description: 'Easier on the eyes' },
        { id: 'light', label: 'Light', icon: Sun, description: 'Classic bright mode' },
        { id: 'system', label: 'System', icon: Monitor, description: 'Match your device' },
    ]

    return (
        <div className="space-y-6 animate-fade-in">
            <SettingCard>
                <SettingSectionHeader
                    icon={Palette}
                    title="Display & Appearance"
                    description="Customize how Vixora looks and feels"
                />

                {/* Theme Selection */}
                <SettingGroup title="Theme">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {themes.map((t) => {
                            const Icon = t.icon
                            const isActive = theme === t.id

                            return (
                                <button
                                    key={t.id}
                                    onClick={() => setTheme(t.id)}
                                    className={cn(
                                        "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
                                        isActive
                                            ? "border-primary bg-primary/10"
                                            : "border-border hover:border-muted-foreground/50 bg-secondary/30"
                                    )}
                                >
                                    <div className={cn(
                                        "p-3 rounded-xl",
                                        isActive ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
                                    )}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <div className="text-center">
                                        <p className="font-medium text-sm">{t.label}</p>
                                        <p className="text-xs text-muted-foreground">{t.description}</p>
                                    </div>
                                    {isActive && (
                                        <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                                            <div className="w-2 h-2 rounded-full bg-white" />
                                        </div>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </SettingGroup>

                <SettingDivider />

                {/* Video Thumbnail Display */}
                <SettingGroup title="Video Display Options">
                    <div className="p-3 bg-secondary/30 rounded-xl space-y-0">
                        <SettingRow
                            label="Show Progress Bar"
                            description="Display watch progress on video thumbnails"
                        >
                            <SettingToggle
                                id="showProgressBar"
                                checked={settings?.showProgressBar ?? true}
                                onChange={() => onToggle('showProgressBar')}
                                loading={isLoading}
                            />
                        </SettingRow>

                        <SettingRow
                            label="Show View Count"
                            description="Display view counts on videos"
                        >
                            <SettingToggle
                                id="showViewCount"
                                checked={settings?.showViewCount ?? true}
                                onChange={() => onToggle('showViewCount')}
                                loading={isLoading}
                            />
                        </SettingRow>

                        <SettingRow
                            label="Show Video Duration"
                            description="Display video length on thumbnails"
                        >
                            <SettingToggle
                                id="showVideoDuration"
                                checked={settings?.showVideoDuration ?? true}
                                onChange={() => onToggle('showVideoDuration')}
                                loading={isLoading}
                            />
                        </SettingRow>

                        <SettingRow
                            label="Show Channel Name"
                            description="Display channel names under videos"
                        >
                            <SettingToggle
                                id="showChannelName"
                                checked={settings?.showChannelName ?? true}
                                onChange={() => onToggle('showChannelName')}
                                loading={isLoading}
                            />
                        </SettingRow>
                    </div>
                </SettingGroup>
            </SettingCard>

            {/* Preview Card */}
            <SettingCard>
                <h3 className="text-sm font-medium text-muted-foreground mb-4">Preview</h3>
                <div className="bg-secondary/50 rounded-xl p-4">
                    <div className="aspect-video bg-muted rounded-lg mb-3 relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                            <Eye className="w-8 h-8" />
                        </div>
                        {settings?.showProgressBar && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted-foreground/30">
                                <div className="h-full w-1/3 bg-primary" />
                            </div>
                        )}
                        {settings?.showVideoDuration && (
                            <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 rounded text-xs text-white font-medium">
                                12:34
                            </div>
                        )}
                    </div>
                    <div className="space-y-1">
                        <p className="font-medium text-sm line-clamp-2">Example Video Title Goes Here</p>
                        {settings?.showChannelName && (
                            <p className="text-xs text-muted-foreground">Channel Name</p>
                        )}
                        {settings?.showViewCount && (
                            <p className="text-xs text-muted-foreground">1.2K views • 2 days ago</p>
                        )}
                    </div>
                </div>
            </SettingCard>
        </div>
    )
}

export default DisplaySection
