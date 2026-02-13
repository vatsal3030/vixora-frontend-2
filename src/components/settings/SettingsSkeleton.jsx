import { cn } from '../../lib/utils'

/**
 * Skeleton loading components for settings sections
 */

export function SettingSkeleton({ className }) {
    return (
        <div className={cn("animate-pulse", className)}>
            <div className="flex items-start justify-between py-4 border-b border-border/50">
                <div className="flex-1 space-y-2">
                    <div className="h-4 w-48 bg-secondary rounded" />
                    <div className="h-3 w-64 bg-secondary/70 rounded" />
                </div>
                <div className="h-6 w-11 bg-secondary rounded-full" />
            </div>
        </div>
    )
}

export function SettingCardSkeleton({ rows = 4, className }) {
    return (
        <div className={cn(
            "bg-card border border-border rounded-xl p-6 animate-pulse",
            className
        )}>
            {/* Header */}
            <div className="flex items-start gap-3 mb-6">
                <div className="w-9 h-9 rounded-lg bg-secondary" />
                <div className="space-y-2">
                    <div className="h-5 w-40 bg-secondary rounded" />
                    <div className="h-3 w-64 bg-secondary/70 rounded" />
                </div>
            </div>

            {/* Rows */}
            <div className="space-y-0">
                {Array.from({ length: rows }).map((_, i) => (
                    <SettingSkeleton key={i} />
                ))}
            </div>
        </div>
    )
}

export function AccountSectionSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="bg-card border border-border rounded-xl p-6">
                {/* Header */}
                <div className="flex items-start gap-3 mb-6">
                    <div className="w-9 h-9 rounded-lg bg-secondary" />
                    <div className="space-y-2">
                        <div className="h-5 w-40 bg-secondary rounded" />
                        <div className="h-3 w-56 bg-secondary/70 rounded" />
                    </div>
                </div>

                {/* Profile Card */}
                <div className="flex items-center gap-4 p-4 bg-accent/30 rounded-xl mb-6">
                    <div className="w-16 h-16 rounded-full bg-secondary" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 w-32 bg-secondary rounded" />
                        <div className="h-3 w-24 bg-secondary/70 rounded" />
                    </div>
                    <div className="h-9 w-28 bg-secondary rounded-lg" />
                </div>

                {/* Divider */}
                <div className="border-t border-border/50 my-6" />

                {/* Email Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-secondary rounded" />
                        <div className="h-5 w-28 bg-secondary rounded" />
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <div className="h-3 w-24 bg-secondary/70 rounded" />
                            <div className="h-4 w-48 bg-secondary rounded" />
                        </div>
                        <div className="space-y-1">
                            <div className="h-3 w-20 bg-secondary/70 rounded" />
                            <div className="h-11 w-full bg-secondary rounded-lg" />
                        </div>
                        <div className="h-10 w-32 bg-secondary rounded-lg" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export function SecuritySectionSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Password Card */}
            <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-start gap-3 mb-6">
                    <div className="w-9 h-9 rounded-lg bg-secondary" />
                    <div className="space-y-2">
                        <div className="h-5 w-36 bg-secondary rounded" />
                        <div className="h-3 w-64 bg-secondary/70 rounded" />
                    </div>
                </div>

                {/* Login Method */}
                <div className="flex items-center gap-3 p-4 bg-accent/30 rounded-xl mb-6">
                    <div className="w-9 h-9 rounded-lg bg-secondary" />
                    <div className="space-y-2 flex-1">
                        <div className="h-4 w-32 bg-secondary rounded" />
                        <div className="h-3 w-48 bg-secondary/70 rounded" />
                    </div>
                </div>

                {/* Password Fields */}
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="space-y-1">
                            <div className="h-3 w-28 bg-secondary/70 rounded" />
                            <div className="h-11 w-full bg-secondary rounded-lg" />
                        </div>
                    ))}
                    <div className="h-10 w-36 bg-secondary rounded-lg" />
                </div>
            </div>

            {/* 2FA Card */}
            <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-start gap-3 mb-6">
                    <div className="w-9 h-9 rounded-lg bg-secondary" />
                    <div className="space-y-2">
                        <div className="h-5 w-48 bg-secondary rounded" />
                        <div className="h-3 w-56 bg-secondary/70 rounded" />
                    </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-accent/30 rounded-xl">
                    <div className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-secondary rounded" />
                        <div className="space-y-1">
                            <div className="h-4 w-20 bg-secondary rounded" />
                            <div className="h-3 w-24 bg-secondary/70 rounded" />
                        </div>
                    </div>
                    <div className="h-9 w-28 bg-secondary rounded-lg" />
                </div>
            </div>
        </div>
    )
}

export function NotificationsSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <SettingCardSkeleton rows={5} />
        </div>
    )
}

export function PrivacySkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="bg-card border border-border rounded-xl p-6">
                {/* Header */}
                <div className="flex items-start gap-3 mb-6">
                    <div className="w-9 h-9 rounded-lg bg-secondary" />
                    <div className="space-y-2">
                        <div className="h-5 w-24 bg-secondary rounded" />
                        <div className="h-3 w-64 bg-secondary/70 rounded" />
                    </div>
                </div>

                {/* Profile Visibility Cards */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="p-4 rounded-xl border-2 border-border bg-secondary/30">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-secondary rounded-lg" />
                            <div className="space-y-1">
                                <div className="h-4 w-16 bg-secondary rounded" />
                                <div className="h-3 w-32 bg-secondary/70 rounded" />
                            </div>
                        </div>
                    </div>
                    <div className="p-4 rounded-xl border-2 border-border bg-secondary/30">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-secondary rounded-lg" />
                            <div className="space-y-1">
                                <div className="h-4 w-16 bg-secondary rounded" />
                                <div className="h-3 w-32 bg-secondary/70 rounded" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Toggle Rows */}
                {Array.from({ length: 4 }).map((_, i) => (
                    <SettingSkeleton key={i} />
                ))}
            </div>
        </div>
    )
}

export function PlaybackSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-start gap-3 mb-6">
                    <div className="w-9 h-9 rounded-lg bg-secondary" />
                    <div className="space-y-2">
                        <div className="h-5 w-24 bg-secondary rounded" />
                        <div className="h-3 w-56 bg-secondary/70 rounded" />
                    </div>
                </div>

                <SettingSkeleton />

                <div className="border-t border-border/50 my-6" />

                {/* Speed Selector */}
                <div className="space-y-3">
                    <div className="h-4 w-40 bg-secondary rounded" />
                    <div className="flex flex-wrap gap-2">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="h-10 w-16 bg-secondary rounded-lg" />
                        ))}
                    </div>
                </div>

                <div className="border-t border-border/50 my-6" />

                <SettingSkeleton />
                <SettingSkeleton />
            </div>
        </div>
    )
}

export function DisplaySkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-start gap-3 mb-6">
                    <div className="w-9 h-9 rounded-lg bg-secondary" />
                    <div className="space-y-2">
                        <div className="h-5 w-40 bg-secondary rounded" />
                        <div className="h-3 w-56 bg-secondary/70 rounded" />
                    </div>
                </div>

                {/* Theme Cards */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-border bg-secondary/30">
                            <div className="w-12 h-12 bg-secondary rounded-xl" />
                            <div className="h-4 w-12 bg-secondary rounded" />
                            <div className="h-3 w-20 bg-secondary/70 rounded" />
                        </div>
                    ))}
                </div>

                <div className="border-t border-border/50 my-6" />

                {Array.from({ length: 4 }).map((_, i) => (
                    <SettingSkeleton key={i} />
                ))}
            </div>
        </div>
    )
}

export function ContentSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <SettingCardSkeleton rows={3} />
        </div>
    )
}

export function ConnectedAccountsSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-start gap-3 mb-6">
                    <div className="w-9 h-9 rounded-lg bg-secondary" />
                    <div className="space-y-2">
                        <div className="h-5 w-40 bg-secondary rounded" />
                        <div className="h-3 w-56 bg-secondary/70 rounded" />
                    </div>
                </div>

                {/* Account Cards */}
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-secondary/30">
                            <div className="w-10 h-10 bg-secondary rounded-lg" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-20 bg-secondary rounded" />
                                <div className="h-3 w-40 bg-secondary/70 rounded" />
                            </div>
                            <div className="h-9 w-24 bg-secondary rounded-lg" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export function KeyboardShortcutsSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-start gap-3 mb-6">
                    <div className="w-9 h-9 rounded-lg bg-secondary" />
                    <div className="space-y-2">
                        <div className="h-5 w-40 bg-secondary rounded" />
                        <div className="h-3 w-56 bg-secondary/70 rounded" />
                    </div>
                </div>

                {/* Search */}
                <div className="h-10 w-full bg-secondary rounded-lg mb-6" />

                {/* Categories */}
                {[1, 2, 3].map((i) => (
                    <div key={i} className="border border-border rounded-xl overflow-hidden mb-4">
                        <div className="flex items-center gap-3 p-4">
                            <div className="w-5 h-5 bg-secondary rounded" />
                            <div className="h-4 w-36 bg-secondary rounded" />
                            <div className="ml-auto h-3 w-20 bg-secondary/70 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export function AccountManagementSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Data Summary */}
            <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-start gap-3 mb-6">
                    <div className="w-9 h-9 rounded-lg bg-secondary" />
                    <div className="space-y-2">
                        <div className="h-5 w-36 bg-secondary rounded" />
                        <div className="h-3 w-56 bg-secondary/70 rounded" />
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="p-4 bg-secondary/30 rounded-xl text-center">
                            <div className="w-6 h-6 bg-secondary rounded mx-auto mb-2" />
                            <div className="h-6 w-8 bg-secondary rounded mx-auto mb-1" />
                            <div className="h-3 w-16 bg-secondary/70 rounded mx-auto" />
                        </div>
                    ))}
                </div>

                <div className="h-10 w-52 bg-secondary rounded-lg" />
            </div>

            {/* Clear History */}
            <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-start gap-3 mb-6">
                    <div className="w-9 h-9 rounded-lg bg-secondary" />
                    <div className="space-y-2">
                        <div className="h-5 w-36 bg-secondary rounded" />
                        <div className="h-3 w-56 bg-secondary/70 rounded" />
                    </div>
                </div>

                <div className="space-y-3">
                    {[1, 2].map((i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 bg-secondary rounded" />
                                <div className="space-y-1">
                                    <div className="h-4 w-32 bg-secondary rounded" />
                                    <div className="h-3 w-48 bg-secondary/70 rounded" />
                                </div>
                            </div>
                            <div className="h-9 w-16 bg-secondary rounded-lg" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-card border border-red-500/20 rounded-xl p-6">
                <div className="flex items-start gap-3 mb-6">
                    <div className="w-9 h-9 rounded-lg bg-red-500/20" />
                    <div className="space-y-2">
                        <div className="h-5 w-28 bg-secondary rounded" />
                        <div className="h-3 w-56 bg-secondary/70 rounded" />
                    </div>
                </div>
                <div className="h-24 w-full bg-red-500/10 rounded-lg mb-6" />
                <div className="h-10 w-40 bg-red-500/20 rounded-lg" />
            </div>
        </div>
    )
}

export default SettingCardSkeleton
