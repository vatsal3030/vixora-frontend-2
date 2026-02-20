import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'

/**
 * Polls the unread notification count every 30 seconds.
 * Replaces the socket.io approach — works without socket.io-client installed.
 * When socket.io-client is available in the future, this can be swapped back.
 */
export function useRealtimeNotifications() {
    const { user } = useAuth()
    const queryClient = useQueryClient()
    const timerRef = useRef(null)

    useEffect(() => {
        if (!user) return

        const poll = async () => {
            try {
                await queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] })
            } catch {
                // Non-critical — polling failure is silent
            }
        }

        // Poll immediately then every 30 seconds
        poll()
        timerRef.current = setInterval(poll, 30_000)

        return () => {
            clearInterval(timerRef.current)
            timerRef.current = null
        }
    }, [user, queryClient])
}
