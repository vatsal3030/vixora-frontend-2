import { SettingCard, SettingSectionHeader, SettingDivider, SettingGroup } from '../SettingCard'
import { SettingRow, SettingToggle } from '../SettingRow'
import { Bell, Mail, MessageSquare, Users, Video, Megaphone } from 'lucide-react'

export function NotificationsSection({ settings, onToggle, isLoading }) {
    return (
        <div className="space-y-6 animate-fade-in">
            <SettingCard>
                <SettingSectionHeader
                    icon={Bell}
                    title="Notifications"
                    description="Control how and when you receive notifications"
                />

                {/* Master Toggle */}
                <div className="p-3 bg-accent/30 rounded-xl mb-6">
                    <SettingRow
                        label="Email Notifications"
                        description="Master switch for all email notifications"
                        className="border-0 py-0"
                    >
                        <SettingToggle
                            id="emailNotifications"
                            checked={settings?.emailNotifications ?? true}
                            onChange={() => onToggle('emailNotifications')}
                            loading={isLoading}
                        />
                    </SettingRow>
                </div>

                <SettingDivider className="my-4" />

                {/* Comments & Mentions */}
                <SettingGroup title="Comments & Mentions">
                    <div className="p-3 bg-secondary/30 rounded-xl space-y-0">
                        <SettingRow
                            label="Comment Notifications"
                            description="Get notified when someone comments on your videos"
                            badge={settings?.commentNotifications ? 'On' : 'Off'}
                        >
                            <SettingToggle
                                id="commentNotifications"
                                checked={settings?.commentNotifications ?? true}
                                onChange={() => onToggle('commentNotifications')}
                                loading={isLoading}
                                disabled={!settings?.emailNotifications}
                            />
                        </SettingRow>
                    </div>
                </SettingGroup>

                <SettingDivider className="my-4" />

                {/* Channel & Subscribers */}
                <SettingGroup title="Channel & Subscribers">
                    <div className="p-3 bg-secondary/30 rounded-xl space-y-0">
                        <SettingRow
                            label="Subscription Notifications"
                            description="Get notified when you get a new subscriber"
                        >
                            <SettingToggle
                                id="subscriptionNotifications"
                                checked={settings?.subscriptionNotifications ?? true}
                                onChange={() => onToggle('subscriptionNotifications')}
                                loading={isLoading}
                                disabled={!settings?.emailNotifications}
                            />
                        </SettingRow>
                    </div>
                </SettingGroup>

                <SettingDivider className="my-4" />

                {/* System Updates */}
                <SettingGroup title="System & Updates">
                    <div className="p-3 bg-secondary/30 rounded-xl space-y-0">
                        <SettingRow
                            label="System Announcements"
                            description="Important updates about Vixora platform"
                        >
                            <SettingToggle
                                id="systemAnnouncements"
                                checked={settings?.systemAnnouncements ?? true}
                                onChange={() => onToggle('systemAnnouncements')}
                                loading={isLoading}
                                disabled={!settings?.emailNotifications}
                            />
                        </SettingRow>
                    </div>
                </SettingGroup>
            </SettingCard>

            {/* Quick Info */}
            <div className="flex items-start gap-3 p-3 bg-accent/20 rounded-xl text-sm">
                <Mail className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                    <p className="font-medium text-foreground">Email Delivery</p>
                    <p className="text-muted-foreground mt-1">
                        Notifications are sent to your verified email address.
                        You can update your email in the Account section.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default NotificationsSection
