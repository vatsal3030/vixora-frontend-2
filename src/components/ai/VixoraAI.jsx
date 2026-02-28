import { useState, useEffect, useRef, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    X, Send, Plus, ChevronLeft, Sparkles, Loader2,
    MessageSquare, FileText, RefreshCw, Maximize2, Minimize2,
    Search, Trash2, Edit2, Copy, Check, ThumbsUp, ThumbsDown, Share2, RotateCcw
} from 'lucide-react'
import { useVixoraAI } from '../../hooks/useVixoraAI'
import { useAuth } from '../../context/AuthContext'
import { aiService } from '../../services/api'
import { cn, formatTimeAgo } from '../../lib/utils'
import { BrandLogo } from '../common/BrandLogo'

// ─── Quick question suggestions ──────────────────────────────────────────────
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
        <div className="flex gap-1.2 items-center py-2 px-1">
            {[0, 1, 2].map(i => (
                <motion.span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-primary"
                    animate={{ opacity: [0.4, 1, 0.4], y: [0, -4, 0] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                />
            ))}
        </div>
    )
}

function MessageBubble({ message, onRegenerate }) {
    const isUser = message.role === 'user'
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(message.content)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className={cn('flex group mb-4', isUser ? 'justify-end' : 'justify-start')}>
            {!isUser && (
                <BrandLogo size="sm" className="mr-3 mt-1" />
            )}
            <div className="flex flex-col gap-1 max-w-[85%]">
                <div className={cn(
                    'rounded-2xl px-4 py-3 text-sm leading-relaxed relative',
                    isUser
                        ? 'bg-primary text-white rounded-tr-sm'
                        : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-sm'
                )}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                </div>

                {/* Footer Actions & Timestamp */}
                <div className={cn(
                    "flex items-center gap-3 mt-1.5 px-0.5 min-h-[20px]",
                    isUser ? "flex-row-reverse" : "flex-row"
                )}>
                    <p className="text-[10px] text-white/30 font-medium">
                        {formatTimeAgo(message.createdAt)}
                    </p>

                    <div className={cn(
                        "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                        isUser && "hidden" // Usually don't show actions for own messages in this style, but keep it for AI
                    )}>
                        <button
                            onClick={handleCopy}
                            title="Copy to clipboard"
                            className="p-1 px-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white transition-colors"
                        >
                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        {!isUser && (
                            <>
                                <button className="p-1 px-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white transition-colors">
                                    <ThumbsUp className="w-3.5 h-3.5" />
                                </button>
                                <button className="p-1 px-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white transition-colors">
                                    <ThumbsDown className="w-3.5 h-3.5" />
                                </button>
                                <button className="p-1 px-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white transition-colors">
                                    <Share2 className="w-3.5 h-3.5" />
                                </button>
                                {onRegenerate && (
                                    <button
                                        onClick={onRegenerate}
                                        title="Regenerate response"
                                        className="p-1 px-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white transition-colors"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

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
        <div className="rounded-xl border border-primary/20 bg-primary/5 overflow-hidden mb-5">
            <button
                onClick={() => setCollapsed(v => !v)}
                className="w-full flex items-center gap-2 px-4 py-3 hover:bg-white/4 transition-colors"
            >
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-sm font-semibold text-white/90 flex-1 text-left">
                    Video Insight
                </span>
                <ChevronLeft className={cn("w-4 h-4 text-muted-foreground transition-transform duration-200", !collapsed && "-rotate-90")} />
            </button>

            <AnimatePresence initial={false}>
                {!collapsed && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 space-y-3">
                            {loading ? (
                                <div className="flex items-center gap-2 py-1">
                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                                    <span className="text-xs text-muted-foreground">Analyzing video content…</span>
                                </div>
                            ) : summary ? (
                                <>
                                    <p className="text-xs text-gray-300 leading-relaxed font-normal">{summary}</p>
                                    <div className="flex items-center justify-between pt-2">
                                        <button
                                            onClick={handleGenerate}
                                            disabled={generating}
                                            className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-white transition-colors disabled:opacity-50"
                                        >
                                            <RefreshCw className={cn('w-3.5 h-3.5', generating && 'animate-spin')} />
                                            Update Summary
                                        </button>
                                        <button
                                            onClick={() => onAsk('Can you explain this summary in more detail?')}
                                            className="text-[11px] text-primary hover:underline transition-colors font-medium"
                                        >
                                            Ask follow-up
                                        </button>
                                    </div>
                                    {context && (
                                        <div className="pt-3 mt-1 border-t border-white/5 flex flex-col gap-2.5">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className={cn(
                                                        "w-2 h-2 rounded-full",
                                                        context.quality === 'RICH' ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]" :
                                                            context.quality === 'LIMITED' ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]" :
                                                                "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]"
                                                    )} />
                                                    <span className="text-[10px] font-bold tracking-wider uppercase text-white/50">
                                                        AI Depth: {context.quality}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] text-muted-foreground font-medium">
                                                    {context.transcriptChars > 0 ? `${(context.transcriptChars / 1000).toFixed(1)}k chars` : 'No text'}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="flex items-center justify-between py-1">
                                    <p className="text-xs text-muted-foreground">Insight data unavailable.</p>
                                    <button
                                        onClick={handleGenerate}
                                        disabled={generating}
                                        className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 disabled:opacity-40 transition-colors font-bold"
                                    >
                                        {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                                        Generate Now
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
        loadSessions, createSession, renameSession, deleteSession, clearAllSessions,
        switchSession, sendMessage, setMessages
    } = useVixoraAI()

    const [isOpen, setIsOpen] = useState(false)
    const [isMaximized, setIsMaximized] = useState(false)
    const [showSidebar, setShowSidebar] = useState(true) // Sidebar always visible on larger screens
    const [searchQuery, setSearchQuery] = useState('')
    const [editingSessionId, setEditingSessionId] = useState(null)
    const [editTitle, setEditTitle] = useState('')

    const [size, setSize] = useState({ width: 850, height: 620 })
    const DEFAULT_SIZE = { width: 850, height: 620 }
    const [isResizing, setIsResizing] = useState(false)
    const [input, setInput] = useState('')
    const messagesEndRef = useRef(null)
    const inputRef = useRef(null)
    const chatRef = useRef(null)

    const videoIdMatch = location.pathname.match(/\/watch\/([^/?]+)/)
    const currentVideoId = videoIdMatch?.[1] || null

    const authRoutes = ['/login', '/register', '/forgot-password', '/verify-email', '/restore-account']
    const isAuthRoute = authRoutes.includes(location.pathname)

    const startResizing = useCallback((e) => {
        e.preventDefault()
        setIsResizing(true)
    }, [])

    // ─── Shared Side Effects ─────────────────────────────────────────────

    useEffect(() => {
        if (isOpen && user && sessions.length === 0) {
            loadSessions()
        }
    }, [isOpen, user, loadSessions, sessions.length])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isSending])

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 300)
        }
    }, [isOpen, activeSessionId])

    // Click outside to close
    useEffect(() => {
        function handleClickOutside(event) {
            if (isOpen && chatRef.current && !chatRef.current.contains(event.target)) {
                const triggerBtn = document.querySelector('[aria-label="Open Vixora AI"]')
                if (triggerBtn && !triggerBtn.contains(event.target)) {
                    setIsOpen(false)
                }
            }
        }

        function handleGlobalEsc(event) {
            if (event.key === 'Escape' && isOpen) {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
            document.addEventListener('keydown', handleGlobalEsc)
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('keydown', handleGlobalEsc)
        }
    }, [isOpen])


    useEffect(() => {
        if (!isResizing) return
        const handleMouseMove = (e) => {
            const newWidth = Math.max(700, window.innerWidth - e.clientX - 24)
            const newHeight = Math.max(500, window.innerHeight - e.clientY - 24)
            setSize({ width: newWidth, height: newHeight })
        }
        const handleMouseUp = () => setIsResizing(false)
        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', handleMouseUp)
        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }
    }, [isResizing])

    if (!user || isAuthRoute) return null

    const handleOpen = () => {
        setIsOpen(true)
        // Sessions will be loaded by useEffect, but we don't auto-create one anymore
    }

    const handleNewChat = async () => {
        await createSession(
            currentVideoId
                ? { videoId: currentVideoId, title: 'Video Context Chat' }
                : { title: 'New Conversation' }
        )
    }

    const handleRename = async (sessionId, e) => {
        e?.stopPropagation()
        if (!editTitle.trim()) {
            setEditingSessionId(null)
            return
        }
        await renameSession(sessionId, editTitle.trim())
        setEditingSessionId(null)
    }

    const startRename = (sessionId, currentTitle, e) => {
        e?.stopPropagation()
        setEditingSessionId(sessionId)
        setEditTitle(currentTitle || 'Chat Session')
    }

    const handleDelete = async (sessionId, e) => {
        e?.stopPropagation()
        if (confirm('Are you sure you want to delete this conversation?')) {
            await deleteSession(sessionId)
        }
    }

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

        // Send message (lazy session creation is handled inside sendMessage)
        await sendMessage(msg, {
            videoId: currentVideoId,
            title: currentVideoId ? 'Video Context Chat' : 'New Conversation'
        })
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            if (window.innerWidth >= 768 || e.ctrlKey || e.metaKey) {
                e.preventDefault()
                handleSend(e)
            }
        }
        if (e.key === 'Escape') {
            setIsOpen(false)
        }
    }

    const handleRegenerate = async () => {
        if (messages.length < 2 || isSending) return
        const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')
        if (lastUserMsg) {
            // Remove the last AI message
            setMessages(prev => prev.slice(0, -1))
            await sendMessage(lastUserMsg.content)
        }
    }

    const handleResetSize = () => {
        setSize(DEFAULT_SIZE)
        setIsMaximized(false)
    }

    const filteredSessions = sessions.filter(s =>
        (s.title || 'Chat Session').toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <>
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.94 }}
                        onClick={handleOpen}
                        className="fixed bottom-20 md:bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary shadow-lg shadow-primary/30 flex items-center justify-center border border-white/10 backdrop-blur-sm group"
                    >
                        <Sparkles className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
                        <motion.div
                            className="absolute inset-0 rounded-full bg-primary/20"
                            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                            transition={{ duration: 2.5, repeat: Infinity }}
                        />
                    </motion.button>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        ref={chatRef}
                        initial={{ opacity: 0, y: 20, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.98 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                        className={cn(
                            "fixed flex flex-row rounded-2xl overflow-hidden border border-white/10 shadow-3xl shadow-black/60 transition-all duration-500 glass-panel",
                            isMaximized
                                ? "inset-4 md:inset-6 z-[200]"
                                : "bottom-4 md:bottom-6 left-2 right-2 md:left-auto md:right-6 z-[100]"
                        )}
                        style={{
                            width: isMaximized ? 'auto' : (window.innerWidth >= 768 ? `${size.width}px` : 'auto'),
                            height: isMaximized ? 'auto' : (window.innerWidth >= 768 ? `${size.height}px` : 'calc(100svh - 80px)'),
                            maxWidth: isMaximized ? 'none' : 'calc(100vw - 16px)',
                            background: 'rgba(8, 8, 12, 0.98)',
                        }}
                    >
                        {!isMaximized && (
                            <div
                                onMouseDown={startResizing}
                                className="absolute top-0 left-0 w-8 h-8 cursor-nw-resize z-[300] hidden md:flex items-start justify-start p-1.5 group"
                            >
                                <div className="w-3 h-3 border-t-2 border-l-2 border-white/20 rounded-tl-sm group-hover:border-primary/60 transition-colors" />
                            </div>
                        )}

                        {/* ─── Sidebar (History & Management) ────────────────── */}
                        <AnimatePresence>
                            {showSidebar && (
                                <motion.aside
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{ width: window.innerWidth < 768 ? '100%' : (isMaximized ? 300 : 260), opacity: 1 }}
                                    exit={{ width: 0, opacity: 0 }}
                                    className={cn(
                                        "flex flex-col border-r border-white/10 bg-black/95 flex-shrink-0 relative z-[220]",
                                        window.innerWidth < 768 && "absolute inset-0 w-full"
                                    )}
                                >
                                    {/* Sidebar Header */}
                                    <div className="p-4 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <button
                                                onClick={() => {
                                                    handleNewChat();
                                                    if (window.innerWidth < 768) setShowSidebar(false);
                                                }}
                                                className="flex-1 flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/90 hover:bg-white/10 hover:border-white/20 transition-all group"
                                            >
                                                <Plus className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                                                <span className="text-xs font-bold tracking-tight">New Conversation</span>
                                            </button>
                                            <button
                                                onClick={() => setShowSidebar(false)}
                                                className="ml-2 w-10 h-10 rounded-xl hover:bg-white/5 flex items-center justify-center text-muted-foreground"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>

                                        {/* Search Box */}
                                        <div className="relative group">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                            <input
                                                type="text"
                                                placeholder="Search chats..."
                                                value={searchQuery}
                                                onChange={e => setSearchQuery(e.target.value)}
                                                className="w-full bg-white/5 border border-white/8 rounded-xl pl-9 pr-3 py-2 text-[11px] text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Session List */}
                                    <div className="flex-1 overflow-y-auto px-2 space-y-1 custom-scrollbar">
                                        {filteredSessions.length === 0 ? (
                                            <div className="py-12 text-center space-y-2">
                                                <MessageSquare className="w-8 h-8 text-white/5 mx-auto" />
                                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">No results</p>
                                            </div>
                                        ) : (
                                            filteredSessions.map(s => (
                                                <div
                                                    key={s.id}
                                                    onClick={() => {
                                                        switchSession(s.id);
                                                        if (window.innerWidth < 768) setShowSidebar(false);
                                                    }}
                                                    className={cn(
                                                        "group relative w-full flex flex-col p-3 rounded-xl transition-all cursor-pointer border border-transparent mb-1",
                                                        s.id === activeSessionId
                                                            ? "bg-primary/10 border-primary/20"
                                                            : "hover:bg-white/5"
                                                    )}
                                                >
                                                    <div className="flex items-center justify-between gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            {editingSessionId === s.id ? (
                                                                <input
                                                                    autoFocus
                                                                    value={editTitle}
                                                                    onChange={e => setEditTitle(e.target.value)}
                                                                    onBlur={(e) => handleRename(s.id, e)}
                                                                    onKeyDown={e => e.key === 'Enter' && handleRename(s.id)}
                                                                    className="bg-transparent border-none text-xs text-white p-0 focus:ring-0 w-full"
                                                                />
                                                            ) : (
                                                                <span className={cn(
                                                                    "block text-xs font-semibold truncate",
                                                                    s.id === activeSessionId ? "text-white" : "text-gray-400 group-hover:text-gray-200"
                                                                )}>
                                                                    {s.title || 'Untitled Chat'}
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={(e) => startRename(s.id, s.title, e)}
                                                                className="p-1 hover:text-white text-muted-foreground transition-colors"
                                                            >
                                                                <Edit2 className="w-3 h-3" />
                                                            </button>
                                                            <button
                                                                onClick={(e) => handleDelete(s.id, e)}
                                                                className="p-1 hover:text-rose-500 text-muted-foreground transition-colors"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <span className="text-[9px] text-muted-foreground mt-1 tabular-nums font-medium">
                                                        {formatTimeAgo(s.updatedAt || s.createdAt)}
                                                    </span>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Sidebar Footer (User) */}
                                    <div className="p-4 border-t border-white/5 bg-black/20">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 bg-white/5">
                                                <img
                                                    src={user.avatar || '/default-avatar.png'}
                                                    alt={user.fullName}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-white truncate">{user.fullName}</p>
                                                <p className="text-[9px] text-muted-foreground truncate uppercase tracking-tighter">Premium Account</p>
                                            </div>
                                            <button
                                                onClick={() => clearAllSessions()}
                                                title="Clear all conversations"
                                                className="p-1.5 hover:text-rose-400 text-muted-foreground transition-colors rounded-lg hover:bg-white/5"
                                            >
                                                <RefreshCw className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.aside>
                            )}
                        </AnimatePresence>

                        {/* ─── Main Chat Area ────────────────────────────────── */}
                        <main className="flex-1 flex flex-col min-w-0 bg-transparent relative z-10">
                            {/* Header */}
                            <header className="flex items-center justify-between px-6 py-4 border-b border-white/8 backdrop-blur-md">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setShowSidebar(!showSidebar)}
                                        className="w-9 h-9 rounded-xl hover:bg-white/5 flex items-center justify-center text-muted-foreground transition-all"
                                    >
                                        <ChevronLeft className={cn("w-5 h-5 transition-transform duration-300", !showSidebar && "rotate-180")} />
                                    </button>
                                    <div className="flex items-center gap-3">
                                        <BrandLogo size="sm" />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-white leading-none">Vixora AI</span>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <span className="text-[9px] text-emerald-400 font-medium flex items-center gap-1">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                    Online
                                                </span>
                                                <span className="text-[9px] text-white/20">•</span>
                                                <span className="text-[9px] text-primary/60 font-bold uppercase tracking-wider">Powered by Gemini</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {quota && (
                                        <div className="hidden md:flex items-center px-2.5 py-1 rounded-full bg-white/5 border border-white/10 mr-2">
                                            <span className="text-[10px] font-bold tabular-nums text-white/70">
                                                {quota.remaining} / {quota.dailyLimit} <span className="text-[8px] text-muted-foreground ml-0.5">USED</span>
                                            </span>
                                        </div>
                                    )}
                                    <button
                                        onClick={handleResetSize}
                                        title="Reset to default size"
                                        className="w-9 h-9 rounded-xl hover:bg-white/5 flex items-center justify-center text-muted-foreground hover:text-white transition-all"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setIsMaximized(!isMaximized)}
                                        className="w-9 h-9 rounded-xl hover:bg-white/5 flex items-center justify-center text-muted-foreground hover:text-white transition-all"
                                    >
                                        {isMaximized ? <Minimize2 className="w-4.5 h-4.5" /> : <Maximize2 className="w-4.5 h-4.5" />}
                                    </button>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="w-9 h-9 rounded-xl hover:bg-primary/20 flex items-center justify-center text-muted-foreground hover:text-primary transition-all"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </header>

                            {/* Messages Container */}
                            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 custom-scrollbar scroll-smooth">
                                {currentVideoId && !isLoading && messages.length < 5 && (
                                    <VideoSummaryCard videoId={currentVideoId} onAsk={handleQuickAsk} context={contextHealth} />
                                )}

                                {isLoading ? (
                                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                        <div className="relative">
                                            <Loader2 className="w-10 h-10 animate-spin text-primary/40" />
                                            <Sparkles className="absolute inset-0 m-auto w-4 h-4 text-primary animate-pulse" />
                                        </div>
                                        <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-bold">Synchronizing Thoughts</p>
                                    </div>
                                ) : (
                                    <>
                                        {messages.length === 0 && (
                                            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto py-12">
                                                <div className="w-16 h-16 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 relative">
                                                    <Sparkles className="w-8 h-8 text-primary" />
                                                    <div className="absolute -inset-4 bg-primary/10 rounded-full animate-pulse blur-2xl -z-10" />
                                                </div>
                                                <h1 className="text-xl font-bold text-white mb-2">How can I help you today?</h1>
                                                <p className="text-xs text-muted-foreground leading-relaxed mb-8">
                                                    Explore video insights, ask complex questions, or simply start a fresh conversation.
                                                </p>

                                                {currentVideoId && (
                                                    <div className="w-full space-y-2">
                                                        <p className="text-[10px] text-primary font-bold uppercase tracking-widest text-left mb-3 px-1">Video Deep Dive</p>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                            {VIDEO_CHIPS.map(chip => (
                                                                <button
                                                                    key={chip}
                                                                    onClick={() => handleQuickAsk(chip)}
                                                                    className="text-left text-[11px] p-3 rounded-xl bg-white/5 border border-white/8 text-gray-300 hover:bg-white/10 hover:border-primary/40 hover:text-white transition-all"
                                                                >
                                                                    {chip}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {messages.map(msg => (
                                            <MessageBubble
                                                key={msg.id}
                                                message={msg}
                                                onRegenerate={msg.role === 'assistant' ? handleRegenerate : null}
                                            />
                                        ))}
                                        {isSending && (
                                            <div className="flex justify-start">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                                                    <Sparkles className="w-4 h-4 text-primary" />
                                                </div>
                                                <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-2.5">
                                                    <TypingDots />
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                                <div ref={messagesEndRef} className="h-4" />
                            </div>

                            {/* Input Form */}
                            <div className="px-6 py-6 bg-gradient-to-t from-black/20 to-transparent">
                                <form
                                    onSubmit={handleSend}
                                    className="relative flex items-end gap-3 max-w-4xl mx-auto"
                                >
                                    <div className="flex-1 relative">
                                        <textarea
                                            ref={inputRef}
                                            value={input}
                                            onChange={e => setInput(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            rows={1}
                                            placeholder={isSending ? 'AI is processing...' : 'Message Vixora AI...'}
                                            disabled={isSending}
                                            className="w-full resize-none bg-white/5 border border-white/12 text-white text-sm rounded-2xl pl-4 pr-12 py-3.5 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 disabled:opacity-40 max-h-[200px] leading-relaxed transition-all shadow-inner"
                                            style={{ scrollbarWidth: 'none' }}
                                        />
                                        <div className="absolute right-3 bottom-3 flex items-center gap-1.5">
                                            <button
                                                type="submit"
                                                disabled={!input.trim() || isSending}
                                                className="w-8 h-8 rounded-xl bg-primary text-white shadow-lg shadow-primary/30 flex items-center justify-center disabled:opacity-40 disabled:grayscale transition-all hover:scale-105 active:scale-95"
                                            >
                                                {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                                <p className="text-[9px] text-center mt-3 text-muted-foreground font-medium tracking-tighter uppercase opacity-50">
                                    Vixora AI may provide inaccurate info. Verify important facts.
                                </p>
                            </div>
                        </main>
                    </motion.div >
                )}
            </AnimatePresence >
        </>
    )
}
