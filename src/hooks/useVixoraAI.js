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
    const [rateLimitRetryAt, setRateLimitRetryAt] = useState(null)
    const [quota, setQuota] = useState(null) // { usedToday, dailyLimit, remaining }
    const [contextHealth, setContextHealth] = useState(null) // { hasTranscript, quality, ... }

    const loadSessions = useCallback(async () => {
        try {
            const res = await aiService.getSessions({ limit: 20 })
            setSessions(res.data.data?.items || [])
        } catch {
            // non-critical — failure doesn't block chat
        }
    }, [])

    const loadMessages = useCallback(async (sessionId) => {
        if (!sessionId) return
        setIsLoading(true)
        try {
            const res = await aiService.getSessionMessages(sessionId, { limit: 50 })
            const raw = res.data.data?.items || []
            // roleLower is preferred; fall back to uppercased role enum
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

    const switchSession = useCallback(async (sessionId) => {
        setActiveSessionId(sessionId)
        await loadMessages(sessionId)
    }, [loadMessages])

    const sendMessage = useCallback(async (message) => {
        if (!activeSessionId || isSending) return

        // Optimistically add user message while request is in-flight
        const tempId = `temp-${Date.now()}`
        const userMsg = { id: tempId, role: 'user', content: message, createdAt: new Date().toISOString() }
        setMessages(prev => [...prev, userMsg])
        setIsSending(true)

        try {
            const res = await aiService.sendMessage(activeSessionId, message)
            const data = res.data.data

            // ── AI reply text  (per API contract) ──────────────────────────
            // Primary:   data.reply                        (top-level alias)
            // Fallbacks: data.assistantMessage.text / .message / .content
            const aiText =
                data?.reply ??
                data?.answer ??
                data?.assistantMessage?.text ??
                data?.assistantMessage?.message ??
                data?.assistantMessage?.content ??
                ''

            // ── IDs ──────────────────────────────────────────────────────────
            const resolvedUserMsgId =
                data?.userMessage?.id ?? data?.userMessageId ?? tempId
            const aiMsgId =
                data?.assistantMessage?.id ?? `ai-${Date.now()}`

            // Replace optimistic message with confirmed version + append AI reply
            const confirmedUserMsg = {
                id: resolvedUserMsgId,
                role: 'user',
                content: data?.userMessage?.content ?? data?.userMessage?.text ?? message,
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

            // Track quota and context from response
            if (data?.ai?.quota) setQuota(data.ai.quota)
            if (data?.context) setContextHealth(data.context)
        } catch (err) {
            // Roll back the optimistic message
            setMessages(prev => prev.filter(m => m.id !== tempId))
            if (err?.response?.status === 429) {
                const retryAfter = parseInt(err.response.headers?.['retry-after'] || '60', 10)
                setRateLimitRetryAt(Date.now() + retryAfter * 1000)
                toast.error('AI daily limit reached. Try again later.')
            } else {
                toast.error('Failed to send message')
            }
        } finally {
            setIsSending(false)
        }
    }, [activeSessionId, isSending])

    const askAboutVideo = useCallback(async (videoId, question) => {
        setIsSending(true)
        try {
            const res = await aiService.askAboutVideo(videoId, question)
            // Backend returns both `answer` and `reply` as aliases
            return res.data.data?.answer ?? res.data.data?.reply ?? ''
        } catch (err) {
            if (err?.response?.status === 429) {
                toast.error('AI daily limit reached.')
            } else {
                toast.error('Failed to get answer')
            }
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
        rateLimitRetryAt,
        quota,
        contextHealth,
        loadSessions,
        loadMessages,
        createSession,
        switchSession,
        sendMessage,
        askAboutVideo,
        setActiveSessionId,
        setMessages,
    }
}
