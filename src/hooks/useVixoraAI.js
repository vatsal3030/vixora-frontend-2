import { useState, useCallback } from 'react'
import { aiService } from '../services/api'
import { toast } from 'sonner'

/**
 * Normalises a raw message object from the backend into a consistent shape
 * the UI can rely on:
 *   { id, role: 'user'|'assistant', content: string, createdAt }
 *
 * Handles the backend's aliased fields:
 *  - role via: roleLower ("user"/"assistant") or role enum ("USER"/"ASSISTANT")
 *  - text via: content || text || message
 */
function normalizeMessage(msg) {
    const role = (msg.roleLower || msg.role || '').toLowerCase()
    const content = msg.content ?? msg.text ?? msg.message ?? ''
    return {
        id: msg.id || `msg-${Date.now()}-${Math.random()}`,
        role: role === 'assistant' ? 'assistant' : 'user',
        content,
        createdAt: msg.createdAt || new Date().toISOString(),
    }
}

export function useVixoraAI() {
    const [sessions, setSessions] = useState([])
    const [activeSessionId, setActiveSessionId] = useState(null)
    const [messages, setMessages] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [isSending, setIsSending] = useState(false)
    const [quota, setQuota] = useState(null) // { usedToday, dailyLimit, remaining }
    const [contextHealth, setContextHealth] = useState(null) // { hasTranscript, quality, ... }

    const loadSessions = useCallback(async () => {
        try {
            const res = await aiService.getSessions({ limit: 50 })
            const allSessions = res.data.data?.items || []
            // Sort by updatedAt descending
            const sorted = [...allSessions].sort((a, b) =>
                new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
            )
            setSessions(sorted)
        } catch {
            // non-critical — failure doesn't block chat
        }
    }, [])

    const loadMessages = useCallback(async (sessionId) => {
        if (!sessionId) return
        setIsLoading(true)
        try {
            const res = await aiService.getSessionMessages(sessionId, { limit: 100 })
            const raw = res.data.data?.items || []
            setMessages(raw.map(normalizeMessage))
        } catch {
            setMessages([])
        } finally {
            setIsLoading(false)
        }
    }, [])

    const createSession = useCallback(async ({ videoId, title } = {}) => {
        try {
            const res = await aiService.createSession({ videoId, title })
            const session = res.data.data
            setSessions(prev => [session, ...prev])
            setActiveSessionId(session.id)
            setMessages([])
            return session
        } catch {
            toast.error('Failed to start AI session')
            return null
        }
    }, [])

    const renameSession = useCallback(async (sessionId, newTitle) => {
        try {
            const res = await aiService.updateSession(sessionId, { title: newTitle })
            const updated = res.data.data
            setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, title: updated.title } : s))
            toast.success('Session renamed')
            return true
        } catch {
            toast.error('Failed to rename session')
            return false
        }
    }, [])

    const deleteSession = useCallback(async (sessionId) => {
        try {
            await aiService.deleteSession(sessionId)
            setSessions(prev => prev.filter(s => s.id !== sessionId))
            if (activeSessionId === sessionId) {
                setActiveSessionId(null)
                setMessages([])
            }
            toast.success('Session deleted')
            return true
        } catch {
            toast.error('Failed to delete session')
            return false
        }
    }, [activeSessionId])

    const clearAllSessions = useCallback(async () => {
        try {
            await aiService.clearAllSessions()
            setSessions([])
            setActiveSessionId(null)
            setMessages([])
            toast.success('All sessions cleared')
        } catch {
            toast.error('Failed to clear sessions')
        }
    }, [])

    const switchSession = useCallback(async (sessionId) => {
        setActiveSessionId(sessionId)
        await loadMessages(sessionId)
    }, [loadMessages])

    const sendMessage = useCallback(async (message, options = {}) => {
        let sessionId = activeSessionId
        const isNewSession = !sessionId

        if (isNewSession && isSending) return
        if (!isNewSession && isSending) return

        setIsSending(true)

        // Optimistically add user message
        const tempId = `temp-${Date.now()}`
        const userMsg = { id: tempId, role: 'user', content: message, createdAt: new Date().toISOString() }
        setMessages(prev => [...prev, userMsg])

        try {
            // 1. Lazy Session Creation
            if (isNewSession) {
                const sessionRes = await aiService.createSession({
                    videoId: options.videoId,
                    title: options.title || (message.length > 20 ? message.substring(0, 20) + '...' : message)
                })
                const session = sessionRes.data.data
                sessionId = session.id
                setSessions(prev => [session, ...prev])
                setActiveSessionId(sessionId)
            }

            // 2. Send Message
            const res = await aiService.sendMessage(sessionId, message)
            const data = res.data.data

            const aiText = data?.reply ?? data?.answer ?? data?.assistantMessage?.text ?? ''
            const resolvedUserMsgId = data?.userMessage?.id ?? tempId
            const aiMsgId = data?.assistantMessage?.id ?? `ai-${Date.now()}`

            const confirmedUserMsg = {
                id: resolvedUserMsgId,
                role: 'user',
                content: data?.userMessage?.content ?? message,
                createdAt: data?.userMessage?.createdAt ?? userMsg.createdAt,
            }
            const aiMsg = {
                id: aiMsgId,
                role: 'assistant',
                content: aiText,
                createdAt: data?.assistantMessage?.createdAt ?? new Date().toISOString(),
            }

            setMessages(prev => [
                ...prev.filter(m => m.id !== tempId),
                confirmedUserMsg,
                aiMsg,
            ])

            // Update session's updatedAt locally for sorting
            setSessions(prev => {
                const updated = prev.find(s => s.id === sessionId)
                if (updated) {
                    updated.updatedAt = new Date().toISOString()
                    return [updated, ...prev.filter(s => s.id !== sessionId)]
                }
                return prev
            })

            if (data?.ai?.quota) setQuota(data.ai.quota)
            if (data?.context) setContextHealth(data.context)
        } catch {
            setMessages(prev => prev.filter(m => m.id !== tempId))
            toast.error('Failed to send message')
        } finally {
            setIsSending(false)
        }
    }, [activeSessionId, isSending])

    const askAboutVideo = useCallback(async (videoId, question) => {
        setIsSending(true)
        try {
            const res = await aiService.askAboutVideo(videoId, question)
            return res.data.data?.answer ?? res.data.data?.reply ?? ''
        } catch {
            toast.error('Failed to get answer')
            return null
        } finally {
            setIsSending(false)
        }
    }, [])

    return {
        sessions,
        activeSessionId,
        messages,
        isLoading,
        isSending,
        quota,
        contextHealth,
        loadSessions,
        loadMessages,
        createSession,
        renameSession,
        deleteSession,
        clearAllSessions,
        switchSession,
        sendMessage,
        askAboutVideo,
        setActiveSessionId,
        setMessages,
    }
}
