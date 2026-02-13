import { formatDistanceToNow, format } from 'date-fns'

/**
 * Format view count with K, M, B suffixes
 * @param {number} count - View count
 * @returns {string} - Formatted view count
 */
export function formatViews(count) {
    if (!count || count === 0) return '0 views'
    if (count === 1) return '1 view'

    if (count < 1000) {
        return `${count} views`
    } else if (count < 1000000) {
        return `${(count / 1000).toFixed(1)}K views`
    } else if (count < 1000000000) {
        return `${(count / 1000000).toFixed(1)}M views`
    } else {
        return `${(count / 1000000000).toFixed(1)}B views`
    }
}

/**
 * Format duration in seconds to MM:SS or HH:MM:SS
 * @param {number} seconds - Duration in seconds
 * @returns {string} - Formatted duration
 */
export function formatDuration(seconds) {
    if (!seconds) return '0:00'

    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
}

/**
 * Format time ago (e.g., "2 days ago", "3 hours ago")
 * @param {string|Date} date - Date to format
 * @returns {string} - Formatted time ago string
 */
export function formatTimeAgo(date) {
    if (!date) return ''
    try {
        return formatDistanceToNow(new Date(date), { addSuffix: true })
    } catch (error) {
        return ''
    }
}

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string} - Formatted number
 */
export function formatNumber(num) {
    if (!num) return '0'
    return num.toLocaleString()
}

/**
 * Format subscriber count with K, M suffixes
 * @param {number} count - Subscriber count
 * @returns {string} - Formatted subscriber count
 */
export function formatSubscribers(count) {
    if (!count || count === 0) return '0 subscribers'
    if (count === 1) return '1 subscriber'

    if (count < 1000) {
        return `${count} subscribers`
    } else if (count < 1000000) {
        return `${(count / 1000).toFixed(1)}K subscribers`
    } else {
        return `${(count / 1000000).toFixed(1)}M subscribers`
    }
}

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @param {string} formatStr - Format string (default: 'MMM d, yyyy')
 * @returns {string} - Formatted date
 */
export function formatDate(date, formatStr = 'MMM d, yyyy') {
    if (!date) return ''
    try {
        return format(new Date(date), formatStr)
    } catch (error) {
        return ''
    }
}
