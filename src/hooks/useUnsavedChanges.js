import { useState, useEffect, useCallback } from 'react'

/**
 * Custom hook to track unsaved changes and warn user before leaving
 * @param {boolean} hasChanges - Whether there are unsaved changes
 * @param {string} message - Warning message to show (optional)
 */
export function useUnsavedChanges(hasChanges, message = 'You have unsaved changes. Are you sure you want to leave?') {
    const [showWarning, setShowWarning] = useState(false)

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (hasChanges) {
                e.preventDefault()
                e.returnValue = message
                return message
            }
        }

        if (hasChanges) {
            window.addEventListener('beforeunload', handleBeforeUnload)
        }

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)
        }
    }, [hasChanges, message])

    const confirmLeave = useCallback(() => {
        if (hasChanges) {
            return window.confirm(message)
        }
        return true
    }, [hasChanges, message])

    const triggerWarning = useCallback(() => {
        if (hasChanges) {
            setShowWarning(true)
        }
    }, [hasChanges])

    const dismissWarning = useCallback(() => {
        setShowWarning(false)
    }, [])

    return {
        hasUnsavedChanges: hasChanges,
        showWarning,
        confirmLeave,
        triggerWarning,
        dismissWarning
    }
}

export default useUnsavedChanges
