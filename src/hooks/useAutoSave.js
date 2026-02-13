import { useState, useCallback, useRef, useEffect } from 'react'

/**
 * Custom hook for debounced auto-save functionality
 * @param {Function} saveFn - The save function to call
 * @param {number} delay - Debounce delay in milliseconds (default: 1000)
 */
export function useAutoSave(saveFn, delay = 1000) {
    const [status, setStatus] = useState('idle') // 'idle' | 'saving' | 'saved' | 'error'
    const timeoutRef = useRef(null)
    const saveTimeoutRef = useRef(null)

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
        }
    }, [])

    const save = useCallback(async (data) => {
        // Clear any pending save
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current)
        }

        // Debounce the save
        timeoutRef.current = setTimeout(async () => {
            setStatus('saving')

            try {
                await saveFn(data)
                setStatus('saved')

                // Reset to idle after 2 seconds
                saveTimeoutRef.current = setTimeout(() => {
                    setStatus('idle')
                }, 2000)
            } catch (error) {
                setStatus('error')
                console.error('Auto-save failed:', error)

                // Reset to idle after 3 seconds on error
                saveTimeoutRef.current = setTimeout(() => {
                    setStatus('idle')
                }, 3000)
            }
        }, delay)
    }, [saveFn, delay])

    const saveImmediate = useCallback(async (data) => {
        // Clear any pending debounced save
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current)
        }

        setStatus('saving')

        try {
            await saveFn(data)
            setStatus('saved')

            saveTimeoutRef.current = setTimeout(() => {
                setStatus('idle')
            }, 2000)
        } catch (error) {
            setStatus('error')
            console.error('Save failed:', error)

            saveTimeoutRef.current = setTimeout(() => {
                setStatus('idle')
            }, 3000)
        }
    }, [saveFn])

    const reset = useCallback(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
        setStatus('idle')
    }, [])

    return {
        status,
        save,
        saveImmediate,
        reset,
        isSaving: status === 'saving',
        isSaved: status === 'saved',
        isError: status === 'error'
    }
}

export default useAutoSave
