import { useState, useEffect, useRef, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion' // eslint-disable-line no-unused-vars
import { X, Send, Plus, ChevronLeft, Sparkles, Loader2, MessageSquare, FileText, RefreshCw } from 'lucide-react'
import { useVixoraAI } from '../../hooks/useVixoraAI'
import { useAuth } from '../../context/AuthContext'
import { aiService } from '../../services/api'
import { cn } from '../../lib/utils'
import { formatTimeAgo } from '../../lib/utils'

// ─── Quick question suggestions shown when watching a video ─────────────────
const VIDEO_CHIPS = [
    'Summarize this video',
    'What are the key points?',
    'Explain this for beginners',
    'What is the main topic?',
    'Are there any important timestamps?',
]

// ─── Sub-components ──────────────────────────────────────────────────────────

function TypingDots() {
    return (
        <div className="flex gap-1 items-center py-1 px-1">
            {[0, 1, 2].map(i => (
                <motion.span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-primary/70"
                    animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                />
            ))}
        </div>
    )
}

function MessageBubble({ message }) {
    const isUser = message.role === 'user'
    return (
        <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
            {!isUser && (
                <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                </div>
            )}
            <div className={cn(
                'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                isUser
                    ? 'bg-primary text-white rounded-tr-sm'
                    : 'bg-white/8 border border-white/10 text-gray-200 rounded-tl-sm'
            )}>
                <p className="whitespace-pre-wrap">{message.content}</p>
                <p className={cn('text-[10px] mt-1', isUser ? 'text-white/60' : 'text-white/40')}>
                    {formatTimeAgo(message.createdAt)}
                </p>
            </div>
        </div>
    )
}

/**
 * Pinned video summary card shown at the top of the chat (inside messages area)
 * when on a watch page.
 */
function VideoSummaryCard({ videoId, onAsk, context }) {
    const [summary, setSummary] = useState(null)
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState(false)
    const [collapsed, setCollapsed] = useState(false)

    const fetchSummary = useCallback(async () => {
        try {
            const res = await aiService.getVideoSummary(videoId)
            setSummary(res.data.data?.summary || null)
        } catch {
            setSummary(null)
        } finally {
            setLoading(false)
        }
    }, [videoId])

    useEffect(() => {
        if (videoId) fetchSummary()
    }, [videoId, fetchSummary])

    const handleGenerate = async () => {
        setGenerating(true)
        try {
            const res = await aiService.generateVideoSummary(videoId, true)
            setSummary(res.data.data?.summary || null)
        } catch {
            // ignore
        } finally {
            setGenerating(false)
        }
    }

    return (
        <div className="rounded-xl border border-violet-500/20 bg-violet-500/8 overflow-hidden mb-3">
            {/* Card Header */}
            <button
                onClick={() => setCollapsed(v => !v)}
                className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-white/4 transition-colors"
            >
                <div className="w-5 h-5 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-3 h-3 text-violet-400" />
                </div>
                <span className="text-xs font-semibold text-violet-300 flex-1 text-left">
                    Video Summary
                </span>
                <span className="text-[10px] text-muted-foreground">{collapsed ? 'Show' : 'Hide'}</span>
            </button>

            {/* Card Body */}
            <AnimatePresence initial={false}>
                {!collapsed && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-3 pb-3 space-y-2.5">
                            {loading ? (
                                <div className="flex items-center gap-2 py-1">
                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-400" />
                                    <span className="text-xs text-muted-foreground">Loading summary…</span>
                                </div>
                            ) : summary ? (
                                <>
                                    <p className="text-xs text-gray-300 leading-relaxed">{summary}</p>
                                    <div className="flex items-center justify-between">
                                        <button
                                            onClick={handleGenerate}
                                            disabled={generating}
                                            className="flex items-center gap-1 text-[10px] text-violet-400 hover:text-violet-300 transition-colors disabled:opacity-50"
                                        >
                                            <RefreshCw className={cn('w-3 h-3', generating && 'animate-spin')} />
                                            Regenerate
                                        </button>
                                        <button
                                            onClick={() => onAsk('Can you explain this summary in more detail?')}
                                            className="text-[10px] text-primary hover:text-primary/80 transition-colors"
                                        >
                                            Ask a follow-up →
                                        </button>
                                    </div>

                                    {/* ── Context Quality Badge ── */}
                                    {context && (
                                        <div className="pt-2.5 mt-2.5 border-t border-white/5 flex flex-col gap-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1.5">
                                                    <div className={cn(
                                                        "w-1.5 h-1.5 rounded-full animate-pulse",
                                                        context.quality === 'RICH' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" :
                                                            context.quality === 'LIMITED' ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" :
                                                                "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
                                                    )} />
                                                    <span className="text-[10px] font-bold tracking-tight uppercase text-white/70">
                                                        AI Context: {context.quality}
                                                    </span>
                                                </div>
                                                <span className="text-[9px] text-muted-foreground italic">
                                                    {context.transcriptChars > 0 ? `${context.transcriptChars} chars analyzed` : 'No transcript'}
                                                </span>
                                            </div>

                                            {/* Action for poor context */}
                                            {context.quality !== 'RICH' && !context.hasTranscript && (
                                                <div className="bg-white/4 rounded-lg px-2 py-1.5 flex items-center justify-between group">
                                                    <span className="text-[9px] text-gray-400">Add transcript for better 100% video coverage</span>
                                                    <button className="text-[9px] font-bold text-primary hover:underline">Add →</button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-muted-foreground">No summary yet.</p>
                                    <button
                                        onClick={handleGenerate}
                                        disabled={generating}
                                        className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 disabled:opacity-50 transition-colors font-medium"
                                    >
                                        {generating
                                            ? <><Loader2 className="w-3 h-3 animate-spin" /> Generating…</>
                                            : <><Sparkles className="w-3 h-3" /> Generate</>
                                        }
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function VixoraAI() {
    const { user } = useAuth()
    const location = useLocation()
    const {
        sessions, activeSessionId, messages, isLoading, isSending, quota, contextHealth,
        loadSessions, createSession, switchSession, sendMessage
    } = useVixoraAI()

    const [isOpen, setIsOpen] = useState(false)
    const [showSessions, setShowSessions] = useState(false)
    const [input, setInput] = useState('')
    const hasLoadedRef = useRef(false)
    const messagesEndRef = useRef(null)
    const inputRef = useRef(null)

    // Extract videoId from current URL (watch page context)
    const videoIdMatch = location.pathname.match(/\/watch\/([^/?]+)/)
    const currentVideoId = videoIdMatch?.[1] || null

    // Load sessions when opened first time
    useEffect(() => {
        if (isOpen && !hasLoadedRef.current && user) {
            hasLoadedRef.current = true
            loadSessions()
        }
    }, [isOpen, user, loadSessions])

    // Scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isSending])

    // Focus input when opened
    useEffect(() => {
        if (isOpen && !showSessions) {
            setTimeout(() => inputRef.current?.focus(), 300)
        }
    }, [isOpen, showSessions, activeSessionId])

    if (!user) return null

    const handleOpen = async () => {
        setIsOpen(true)
        if (!activeSessionId) {
            await handleNewChat()
        }
    }

    const handleNewChat = async () => {
        const session = await createSession(
            currentVideoId
                ? { videoId: currentVideoId, title: 'Video Chat' }
                : { title: 'New Chat' }
        )
        if (session) {
            setShowSessions(false)
        }
    }

    // Called by chips or the summary card "Ask a follow-up" button
    const handleQuickAsk = async (question) => {
        if (isSending) return
        setInput('')
        await sendMessage(question)
    }

    const handleSend = async (e) => {
        e?.preventDefault()
        const msg = input.trim()
        if (!msg || isSending) return
        setInput('')
        await sendMessage(msg)
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <>
            {/* Floating Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.94 }}
                        onClick={handleOpen}
                        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary via-violet-500 to-indigo-600 shadow-lg shadow-primary/30 flex items-center justify-center border border-white/10 backdrop-blur-sm"
                        aria-label="Open Vixora AI"
                    >
                        <Sparkles className="w-6 h-6 text-white" />
                        <motion.div
                            className="absolute inset-0 rounded-full bg-primary/20"
                            animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                            transition={{ duration: 2.5, repeat: Infinity }}
                        />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                        className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-24px)] h-[620px] max-h-[82vh] flex flex-col rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/40"
                        style={{
                            background: 'rgba(12, 12, 18, 0.85)',
                            backdropFilter: 'blur(32px) saturate(180%)',
                            WebkitBackdropFilter: 'blur(32px) saturate(180%)',
                        }}
                    >
                        {/* Header */}
                        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/8 flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center flex-shrink-0">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-sm text-white">Vixora AI</h3>
                                <p className="text-[10px] text-muted-foreground">
                                    {quota
                                        ? `${quota.remaining}/${quota.dailyLimit} messages left today`
                                        : currentVideoId
                                            ? 'Ask me anything about this video'
                                            : 'Powered by Gemini'
                                    }
                                </p>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => setShowSessions(v => !v)}
                                    className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-white transition-colors"
                                    title="Chat history"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={handleNewChat}
                                    className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-white transition-colors"
                                    title="New chat"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-white transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Sessions sidebar overlay */}
                        <AnimatePresence>
                            {showSessions && (
                                <motion.div
                                    initial={{ x: '-100%' }}
                                    animate={{ x: 0 }}
                                    exit={{ x: '-100%' }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                    className="absolute inset-0 top-[57px] z-10 flex flex-col"
                                    style={{ background: 'rgba(12, 12, 18, 0.97)', backdropFilter: 'blur(24px)' }}
                                >
                                    <div className="flex items-center gap-2 px-4 py-3 border-b border-white/8">
                                        <button
                                            onClick={() => setShowSessions(false)}
                                            className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-white"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        <span className="text-sm font-semibold text-white">Chat History</span>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                                        {sessions.length === 0 && (
                                            <p className="text-center text-sm text-muted-foreground py-8">No chat history yet.</p>
                                        )}
                                        {sessions.map(s => (
                                            <button
                                                key={s.id}
                                                onClick={() => { switchSession(s.id); setShowSessions(false) }}
                                                className={cn(
                                                    'w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors',
                                                    s.id === activeSessionId
                                                        ? 'bg-primary/20 text-white border border-primary/30'
                                                        : 'hover:bg-white/8 text-gray-300'
                                                )}
                                            >
                                                <p className="font-medium line-clamp-1">{s.title || 'Chat Session'}</p>
                                                <p className="text-[10px] text-muted-foreground mt-0.5">{formatTimeAgo(s.createdAt)}</p>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Messages area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {/* ── Video Summary Card (pinned at top when on watch page) ── */}
                            {currentVideoId && !isLoading && (
                                <VideoSummaryCard
                                    videoId={currentVideoId}
                                    onAsk={handleQuickAsk}
                                    context={contextHealth}
                                />
                            )}

                            {isLoading && (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                </div>
                            )}

                            {/* ── Empty state + quick question chips ── */}
                            {!isLoading && messages.length === 0 && (
                                <div className="flex flex-col items-center text-center gap-3 pt-2 pb-4">
                                    {!currentVideoId && (
                                        <>
                                            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                                                <Sparkles className="w-5 h-5 text-primary" />
                                            </div>
                                            <p className="text-xs text-muted-foreground max-w-[220px] leading-relaxed">
                                                Ask me anything. I can help with summaries, questions, explanations and more.
                                            </p>
                                        </>
                                    )}

                                    {/* Quick-ask chips — only shown for video context */}
                                    {currentVideoId && (
                                        <div className="w-full space-y-1.5 pt-1">
                                            <p className="text-[11px] text-muted-foreground font-medium text-left mb-2">
                                                Quick questions about this video:
                                            </p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {VIDEO_CHIPS.map(chip => (
                                                    <button
                                                        key={chip}
                                                        onClick={() => handleQuickAsk(chip)}
                                                        disabled={isSending}
                                                        className="text-[11px] bg-primary/12 border border-primary/20 text-primary/90 px-2.5 py-1.5 rounded-full hover:bg-primary/22 hover:border-primary/40 disabled:opacity-40 transition-all text-left"
                                                    >
                                                        {chip}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── Message list ── */}
                            {messages.map(msg => (
                                <MessageBubble key={msg.id} message={msg} />
                            ))}

                            {/* ── Quick chips after messages too (only on watch page, only when not sending) ── */}
                            {!isSending && messages.length > 0 && currentVideoId && (
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                    {VIDEO_CHIPS.slice(0, 3).map(chip => (
                                        <button
                                            key={chip}
                                            onClick={() => handleQuickAsk(chip)}
                                            disabled={isSending}
                                            className="text-[10px] bg-white/6 border border-white/12 text-gray-400 px-2 py-1 rounded-full hover:bg-white/10 hover:text-gray-200 disabled:opacity-40 transition-all"
                                        >
                                            {chip}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Typing indicator */}
                            {isSending && (
                                <div className="flex justify-start">
                                    <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                                    </div>
                                    <div className="bg-white/8 border border-white/10 rounded-2xl rounded-tl-sm px-3.5 py-2.5">
                                        <TypingDots />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Row */}
                        <form onSubmit={handleSend} className="flex items-end gap-2 px-3 py-3 border-t border-white/8 flex-shrink-0">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                rows={1}
                                placeholder={
                                    isSending
                                        ? 'Vixora AI is thinking…'
                                        : currentVideoId
                                            ? 'Ask about this video…'
                                            : 'Ask anything…'
                                }
                                disabled={isSending}
                                className="flex-1 resize-none bg-white/6 border border-white/12 text-white text-sm rounded-xl px-3.5 py-2.5 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 disabled:opacity-50 max-h-[120px] leading-relaxed"
                                style={{ scrollbarWidth: 'none' }}
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isSending}
                                className="w-9 h-9 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0 transition-all"
                            >
                                {isSending ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Send className="w-4 h-4 text-white" />}
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
