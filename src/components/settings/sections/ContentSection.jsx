import { SettingCard, SettingSectionHeader, SettingDivider, SettingGroup } from '../SettingCard'
import { SettingRow, SettingToggle } from '../SettingRow'
import { Target, TrendingUp, Sparkles, Film, Zap } from 'lucide-react'

export function ContentSection({ settings, onToggle, isLoading }) {
    return (
        <div className="space-y-6 animate-fade-in">
            <SettingCard>
                <SettingSectionHeader
                    icon={Target}
                    title="Content Preferences"
                    description="Control what content appears in your feed"
                />

                {/* Recommendations */}
                <SettingGroup title="Recommendations">
                    <div className="p-4 bg-secondary/30 rounded-xl space-y-0">
                        <SettingRow
                            label="Personalize Recommendations"
                            description="Use your activity to improve video recommendations"
                        >
                            <SettingToggle
                                id="personalizeRecommendations"
                                checked={settings?.personalizeRecommendations ?? true}
                                onChange={() => onToggle('personalizeRecommendations')}
                                loading={isLoading}
                            />
                        </SettingRow>
                    </div>

                    <div className="mt-3 p-3 bg-accent/20 rounded-lg text-xs text-muted-foreground flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>
                            When enabled, Vixora uses your watch history, likes, and subscriptions to suggest videos you might enjoy.
                        </span>
                    </div>
                </SettingGroup>

                <SettingDivider />

                {/* Feed Content */}
                <SettingGroup title="Feed Content">
                    <div className="p-4 bg-secondary/30 rounded-xl space-y-0">
                        <SettingRow
                            label="Show Trending Content"
                            description="Include trending videos in your feed"
                        >
                            <SettingToggle
                                id="showTrending"
                                checked={settings?.showTrending ?? true}
                                onChange={() => onToggle('showTrending')}
                                loading={isLoading}
                            />
                        </SettingRow>

                        <SettingRow
                            label="Hide Shorts"
                            description="Don't show Shorts in your main feed"
                        >
                            <SettingToggle
                                id="hideShorts"
                                checked={settings?.hideShorts ?? false}
                                onChange={() => onToggle('hideShorts')}
                                loading={isLoading}
                            />
                        </SettingRow>
                    </div>
                </SettingGroup>
            </SettingCard>

            {/* Content Quality (Placeholder) */}
            <SettingCard className="opacity-60">
                <SettingSectionHeader
                    icon={Zap}
                    title="Content Quality"
                    description="Preferences for video quality and data usage"
                    action={
                        <span className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground">
                            Coming Soon
                        </span>
                    }
                />

                <div className="p-4 bg-secondary/30 rounded-xl text-center text-muted-foreground">
                    <p className="text-sm">Quality preferences will be available in a future update</p>
                </div>
            </SettingCard>
        </div>
    )
}

export default ContentSection
