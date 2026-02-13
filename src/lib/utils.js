import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges Tailwind CSS classes with proper precedence
 */
export function cn(...inputs) {
    return twMerge(clsx(inputs))
}

/**
 * Format duration from seconds to MM:SS or HH:MM:SS
 */
export function formatDuration(seconds) {
    if (!seconds || seconds < 0) return '0:00'

    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    if (hrs > 0) {
        return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Format view count (e.g., 1234 -> "1.2K views")
 */
export function formatViews(count) {
    if (!count) return '0 views'

    if (count < 1000) return `${count} views`
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K views`
    if (count < 1000000000) return `${(count / 1000000).toFixed(1)}M views`
    return `${(count / 1000000000).toFixed(1)}B views`
}

/**
 * Format number without label (e.g., 1234 -> "1.2K")
 */
export function formatNumber(count) {
    if (!count && count !== 0) return '0'

    if (count < 1000) return `${count}`
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K`
    if (count < 1000000000) return `${(count / 1000000).toFixed(1)}M`
    return `${(count / 1000000000).toFixed(1)}B`
}

/**
 * Format subscriber count (e.g., 1234 -> "1.2K")
 */
export function formatSubscribers(count) {
    if (!count) return '0 subscribers'

    if (count < 1000) return `${count} subscribers`
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K subscribers`
    if (count < 1000000000) return `${(count / 1000000).toFixed(1)}M subscribers`
    return `${(count / 1000000000).toFixed(1)}B subscribers`
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatTimeAgo(date) {
    if (!date) return ''

    const now = new Date()
    const then = new Date(date)
    const seconds = Math.floor((now - then) / 1000)

    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`
    if (seconds < 2592000) return `${Math.floor(seconds / 604800)} weeks ago`
    if (seconds < 31536000) return `${Math.floor(seconds / 2592000)} months ago`
    return `${Math.floor(seconds / 31536000)} years ago`
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text, maxLength) {
    if (!text) return ''
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength).trim() + '...'
}

/**
 * Get initials from name for avatar fallback
 */
export function getInitials(name) {
    if (!name) return '?'

    const parts = name.trim().split(' ')
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

/**
 * Debounce function
 */
export function debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout)
            func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
    }
}

/**
 * Get video thumbnail URL or placeholder
 */
export function getVideoThumbnail(video) {
    return video?.thumbnail || '/placeholder-video.jpg'
}

/**
 * Get user avatar URL or generate placeholder
 */
export function getUserAvatar(user) {
    return user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || user?.username || 'User')}&background=ef4444&color=fff`
}

/**
 * Parse API error message
 */
export function getErrorMessage(error) {
    if (error.response?.data?.message) {
        return error.response.data.message
    }
    if (error.message) {
        return error.message
    }
    return 'Something went wrong. Please try again.'
}
