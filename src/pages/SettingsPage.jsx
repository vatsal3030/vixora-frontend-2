import { useState, useCallback } from 'react'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { settingsService } from '../services/api'
import { toast } from 'sonner'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'

// Settings Components
import {
    SettingsSidebar,
    MobileSettingsSelector,
    SettingsHeader,
    SaveIndicator,
    AccountSectionSkeleton,
    SecuritySectionSkeleton,
    NotificationsSkeleton,
    PrivacySkeleton,
    PlaybackSkeleton,
    DisplaySkeleton,
    ContentSkeleton,
    ConnectedAccountsSkeleton,
    KeyboardShortcutsSkeleton,
    AccountManagementSkeleton
} from '../components/settings'

// Settings Sections
import {
    AccountSection,
    SecuritySection,
    NotificationsSection,
    PrivacySection,
    PlaybackSection,
    DisplaySection,
    ContentSection,
    ConnectedAccountsSection,
    KeyboardShortcutsSection,
    AccountManagementSection
} from '../components/settings/sections'

export default function SettingsPage() {
    useDocumentTitle('Settings - Vixora')
    const queryClient = useQueryClient()

    // State
    const [activeSection, setActiveSection] = useState('account')
    const [searchQuery, setSearchQuery] = useState('')
    const [saveStatus, setSaveStatus] = useState('idle')

    // Fetch Settings
    const { data: settings, isLoading: settingsLoading } = useQuery({
        queryKey: ['userSettings'],
        queryFn: async () => {
            const res = await settingsService.getSettings()
            return res.data.data
        }
    })

    // Update Settings Mutation with debounced saves
    const updateSettingsMutation = useMutation({
        mutationFn: (data) => settingsService.updateSettings(data),
        onMutate: () => {
            setSaveStatus('saving')
        },
        onSuccess: () => {
            setSaveStatus('saved')
            queryClient.invalidateQueries({ queryKey: ['userSettings'] })
            setTimeout(() => setSaveStatus('idle'), 2000)
        },
        onError: () => {
            setSaveStatus('error')
            toast.error('Failed to update settings')
            setTimeout(() => setSaveStatus('idle'), 3000)
        }
    })

    // Toggle handler for boolean settings
    const handleToggle = useCallback((key) => {
        const currentValue = settings?.[key]
        updateSettingsMutation.mutate({ [key]: !currentValue })
    }, [settings, updateSettingsMutation])

    // Handler for non-boolean settings
    const handleSettingChange = useCallback((key, value) => {
        updateSettingsMutation.mutate({ [key]: value })
    }, [updateSettingsMutation])

    // Get skeleton for current section
    const renderSkeleton = () => {
        switch (activeSection) {
            case 'account':
                return <AccountSectionSkeleton />
            case 'security':
                return <SecuritySectionSkeleton />
            case 'notifications':
                return <NotificationsSkeleton />
            case 'privacy':
                return <PrivacySkeleton />
            case 'playback':
                return <PlaybackSkeleton />
            case 'display':
                return <DisplaySkeleton />
            case 'content':
                return <ContentSkeleton />
            case 'connected':
                return <ConnectedAccountsSkeleton />
            case 'shortcuts':
                return <KeyboardShortcutsSkeleton />
            case 'management':
                return <AccountManagementSkeleton />
            default:
                return <AccountSectionSkeleton />
        }
    }

    // Render active section
    const renderSection = () => {
        // Show skeleton while loading
        if (settingsLoading) {
            return renderSkeleton()
        }

        const commonProps = {
            settings,
            onToggle: handleToggle,
            onSettingChange: handleSettingChange,
            isLoading: updateSettingsMutation.isPending
        }

        switch (activeSection) {
            case 'account':
                return <AccountSection />
            case 'security':
                return <SecuritySection />
            case 'notifications':
                return <NotificationsSection {...commonProps} />
            case 'privacy':
                return <PrivacySection {...commonProps} />
            case 'playback':
                return <PlaybackSection {...commonProps} />
            case 'display':
                return <DisplaySection {...commonProps} />
            case 'content':
                return <ContentSection {...commonProps} />
            case 'connected':
                return <ConnectedAccountsSection />
            case 'shortcuts':
                return <KeyboardShortcutsSection />
            case 'management':
                return <AccountManagementSection />
            default:
                return <AccountSection />
        }
    }

    return (
        <div className="container mx-auto px-4 py-6 max-w-6xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                <SettingsHeader
                    currentSection={activeSection}
                    searchValue={searchQuery}
                    onSearchChange={setSearchQuery}
                    showSearch={true}
                />
                <div className="hidden sm:block">
                    <SaveIndicator status={saveStatus} />
                </div>
            </div>

            {/* Mobile Section Selector */}
            <div className="mb-6">
                <MobileSettingsSelector
                    activeSection={activeSection}
                    onSectionChange={setActiveSection}
                    searchQuery={searchQuery}
                />
            </div>

            {/* Main Layout */}
            <div className="flex gap-8">
                {/* Desktop Sidebar - Hidden on mobile */}
                <SettingsSidebar
                    activeSection={activeSection}
                    onSectionChange={setActiveSection}
                    searchQuery={searchQuery}
                    className="lg:sticky lg:top-20 lg:self-start"
                />

                {/* Content Area */}
                <main className="flex-1 min-w-0">
                    {/* Mobile Save Indicator */}
                    <div className="sm:hidden mb-4">
                        <SaveIndicator status={saveStatus} />
                    </div>

                    {/* Active Section Content */}
                    <div className="min-h-[400px]">
                        {renderSection()}
                    </div>
                </main>
            </div>
        </div>
    )
}
