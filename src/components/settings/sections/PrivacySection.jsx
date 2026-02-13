import { SettingCard, SettingSectionHeader, SettingDivider, SettingGroup } from '../SettingCard'
import { SettingRow, SettingToggle } from '../SettingRow'
import { Shield, Eye, EyeOff, MessageCircle, AtSign, Users, Heart, Globe, Lock } from 'lucide-react'
import { cn } from '../../../lib/utils'

export function PrivacySection({ settings, onToggle, onSettingChange, isLoading }) {
    const isPublic = settings?.profileVisibility === 'PUBLIC'

    return (
        <div className="space-y-6 animate-fade-in">
            <SettingCard>
                <SettingSectionHeader
                    icon={Shield}
                    title="Privacy"
                    description="Control who can see your activity and interact with you"
                />

                {/* Profile Visibility */}
                <SettingGroup title="Profile Visibility">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                            onClick={() => onSettingChange?.('profileVisibility', 'PUBLIC')}
                            className={cn(
                                "flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200",
                                isPublic
                                    ? "border-primary bg-primary/10"
                                    : "border-border hover:border-muted-foreground/50 bg-secondary/30"
                            )}
                        >
                            <div className={cn(
                                "p-2 rounded-lg",
                                isPublic ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
                            )}>
                                <Globe className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <p className="font-medium">Public</p>
                                <p className="text-xs text-muted-foreground">Anyone can see your profile</p>
                            </div>
                            {isPublic && (
                                <div className="ml-auto w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-white" />
                                </div>
                            )}
                        </button>

                        <button
                            onClick={() => onSettingChange?.('profileVisibility', 'PRIVATE')}
                            className={cn(
                                "flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200",
                                !isPublic
                                    ? "border-primary bg-primary/10"
                                    : "border-border hover:border-muted-foreground/50 bg-secondary/30"
                            )}
                        >
                            <div className={cn(
                                "p-2 rounded-lg",
                                !isPublic ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
                            )}>
                                <Lock className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <p className="font-medium">Private</p>
                                <p className="text-xs text-muted-foreground">Only approved followers</p>
                            </div>
                            {!isPublic && (
                                <div className="ml-auto w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-white" />
                                </div>
                            )}
                        </button>
                    </div>
                </SettingGroup>

                <SettingDivider />

                {/* Activity Visibility */}
                <SettingGroup title="Activity Visibility">
                    <div className="p-3 bg-secondary/30 rounded-xl space-y-0">
                        <SettingRow
                            label="Show Subscriptions"
                            description="Let others see channels you're subscribed to"
                        >
                            <SettingToggle
                                id="showSubscriptions"
                                checked={settings?.showSubscriptions ?? true}
                                onChange={() => onToggle('showSubscriptions')}
                                loading={isLoading}
                            />
                        </SettingRow>

                        <SettingRow
                            label="Show Liked Videos"
                            description="Allow others to see videos you've liked"
                        >
                            <SettingToggle
                                id="showLikedVideos"
                                checked={settings?.showLikedVideos ?? true}
                                onChange={() => onToggle('showLikedVideos')}
                                loading={isLoading}
                            />
                        </SettingRow>
                    </div>
                </SettingGroup>

                <SettingDivider />

                {/* Interaction Settings */}
                <SettingGroup title="Interaction Settings">
                    <div className="p-3 bg-secondary/30 rounded-xl space-y-0">
                        <SettingRow
                            label="Allow Comments"
                            description="Let others comment on your videos"
                        >
                            <SettingToggle
                                id="allowComments"
                                checked={settings?.allowComments ?? true}
                                onChange={() => onToggle('allowComments')}
                                loading={isLoading}
                            />
                        </SettingRow>

                        <SettingRow
                            label="Allow Mentions"
                            description="Let others @mention you in comments"
                        >
                            <SettingToggle
                                id="allowMentions"
                                checked={settings?.allowMentions ?? true}
                                onChange={() => onToggle('allowMentions')}
                                loading={isLoading}
                            />
                        </SettingRow>
                    </div>
                </SettingGroup>
            </SettingCard>

            {/* Privacy Tips */}
            <div className="flex items-start gap-3 p-3 bg-accent/20 rounded-xl text-sm">
                <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                    <p className="font-medium text-foreground">Privacy Tip</p>
                    <p className="text-muted-foreground mt-1">
                        Even with a private profile, your public videos and comments will still be visible to everyone.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default PrivacySection
