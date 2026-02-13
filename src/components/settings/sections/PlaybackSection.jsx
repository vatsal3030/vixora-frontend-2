import { SettingCard, SettingSectionHeader, SettingDivider, SettingGroup } from '../SettingCard'
import { SettingRow, SettingToggle } from '../SettingRow'
import { Play, FastForward, History, Subtitles, RotateCcw, Trash2 } from 'lucide-react'
import { Button } from '../../ui/Button'
import { cn } from '../../../lib/utils'
import { useMutation } from '@tanstack/react-query'
import { watchHistoryService } from '../../../services/api'
import { toast } from 'sonner'

const playbackSpeeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]

export function PlaybackSection({ settings, onToggle, onSettingChange, isLoading }) {
    const clearHistoryMutation = useMutation({
        mutationFn: () => watchHistoryService.clearHistory(),
        onSuccess: () => {
            toast.success('Watch history cleared')
        },
        onError: () => {
            toast.error('Failed to clear watch history')
        }
    })

    return (
        <div className="space-y-6 animate-fade-in">
            <SettingCard>
                <SettingSectionHeader
                    icon={Play}
                    title="Playback"
                    description="Customize your video watching experience"
                />

                {/* Autoplay */}
                <SettingGroup title="Autoplay">
                    <div className="p-3 bg-secondary/30 rounded-xl space-y-0">
                        <SettingRow
                            label="Autoplay Next Video"
                            description="Automatically play the next video when current ends"
                        >
                            <SettingToggle
                                id="autoplayNext"
                                checked={settings?.autoplayNext ?? true}
                                onChange={() => onToggle('autoplayNext')}
                                loading={isLoading}
                            />
                        </SettingRow>
                    </div>
                </SettingGroup>

                <SettingDivider />

                {/* Default Playback Speed */}
                <SettingGroup title="Default Playback Speed">
                    <div className="p-3 bg-secondary/30 rounded-xl">
                        <p className="text-sm text-muted-foreground mb-3">
                            Select your preferred default playback speed
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {playbackSpeeds.map((speed) => (
                                <button
                                    key={speed}
                                    onClick={() => onSettingChange?.('defaultPlaybackSpeed', speed)}
                                    className={cn(
                                        "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                                        settings?.defaultPlaybackSpeed === speed
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-secondary hover:bg-secondary/80 text-foreground"
                                    )}
                                >
                                    {speed === 1 ? 'Normal' : `${speed}x`}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-3">
                            Currently: {settings?.defaultPlaybackSpeed === 1 ? 'Normal (1.0x)' : `${settings?.defaultPlaybackSpeed || 1}x`}
                        </p>
                    </div>
                </SettingGroup>

                <SettingDivider />

                {/* Watch History */}
                <SettingGroup title="Watch History">
                    <div className="p-3 bg-secondary/30 rounded-xl space-y-0">
                        <SettingRow
                            label="Save Watch History"
                            description="Keep track of videos you watch"
                        >
                            <SettingToggle
                                id="saveWatchHistory"
                                checked={settings?.saveWatchHistory ?? true}
                                onChange={() => onToggle('saveWatchHistory')}
                                loading={isLoading}
                            />
                        </SettingRow>
                    </div>

                    <div className="mt-3 flex items-center justify-between p-3 bg-accent/30 rounded-xl">
                        <div className="flex items-center gap-3">
                            <History className="w-5 h-5 text-muted-foreground" />
                            <div>
                                <p className="font-medium text-sm">Clear Watch History</p>
                                <p className="text-xs text-muted-foreground">Remove all videos from your history</p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                if (confirm('Are you sure you want to clear your watch history? This cannot be undone.')) {
                                    clearHistoryMutation.mutate()
                                }
                            }}
                            disabled={clearHistoryMutation.isPending}
                            className="text-destructive hover:text-destructive"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Clear
                        </Button>
                    </div>
                </SettingGroup>
            </SettingCard>

            {/* Subtitle Settings (Placeholder) */}
            <SettingCard className="opacity-60">
                <SettingSectionHeader
                    icon={Subtitles}
                    title="Subtitles & Captions"
                    description="Configure subtitle preferences"
                    action={
                        <span className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground">
                            Coming Soon
                        </span>
                    }
                />

                <div className="p-3 bg-secondary/30 rounded-xl text-center text-muted-foreground">
                    <p className="text-sm">Subtitle settings will be available in a future update</p>
                </div>
            </SettingCard>
        </div>
    )
}

export default PlaybackSection
