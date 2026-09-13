import { useSearchParams } from 'react-router-dom'
import { useCallback } from 'react'

/**
 * Production-grade hook to synchronize tab state with URL search params.
 * Ensures that page refresh, sharing, or bookmarking retains the exact active tab.
 *
 * @param {string} defaultTab - Fallback tab if no query param is present
 * @param {string} paramKey - Query parameter name (default: 'tab')
 * @returns {[string, (newTab: string) => void]}
 */
export function useTabQuery(defaultTab, paramKey = 'tab') {
    const [searchParams, setSearchParams] = useSearchParams()
    const activeTab = searchParams.get(paramKey) || defaultTab

    const setTab = useCallback((newTab) => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev)
            if (!newTab || newTab === defaultTab) {
                next.delete(paramKey)
            } else {
                next.set(paramKey, newTab)
            }
            return next
        }, { replace: true })
    }, [defaultTab, paramKey, setSearchParams])

    return [activeTab, setTab]
}
