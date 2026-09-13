import { useState, useEffect, useRef } from 'react'
import { Sparkles, Send, Loader2, Bot, User, Clock, RefreshCw, Copy, Check } from 'lucide-react'
import { aiService } from '../../services/api'
import MarkdownRenderer from '../common/MarkdownRenderer'
import { cn } from '../../lib/utils'
import { toast } from 'sonner'

export default function WatchAiChatPanel({ videoId, videoTitle, currentTime, onSeek }) {
    const [messages, setMessages] = useState([
        {
            id: 'welcome',
            role: 'ASSISTANT',
            content: `Hi! I'm your **Vixora AI Copilot** for this video. Ask me anything about the content, request a summary, or extract key takeaways!`,
            createdAt: new Date().toISOString()
        }
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [copiedId, setCopiedId] = useState(null)
    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, loading])

    const handleSendMessage = async (textToSend) => {
        const text = (textToSend || input).trim()
        if (!text || loading) return

        const userMsg = {
            id: 'user-' + Date.now(),
            role: 'USER',
            content: text,
            createdAt: new Date().toISOString()
        }

        setMessages(prev => [...prev, userMsg])
        setInput('')
        setLoading(true)

        try {
            const res = await aiService.askVideoQuestion(videoId, text)
            const aiAnswer = res.data?.data?.answer || res.data?.data?.text || "I've analyzed the video but couldn't formulate a response."

            const aiMsg = {
                id: 'ai-' + Date.now(),
                role: 'ASSISTANT',
                content: aiAnswer,
                createdAt: new Date().toISOString()
            }
            setMessages(prev => [...prev, aiMsg])
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to get answer from Vixora AI')
            const errorMsg = {
                id: 'err-' + Date.now(),
                role: 'ASSISTANT',
                content: 'Sorry, I ran into an issue analyzing this question. Please try again.',
                createdAt: new Date().toISOString()
            }
            setMessages(prev => [...prev, errorMsg])
        } finally {
            setLoading(false)
        }
    }

    const handleQuickPrompt = (prompt) => {
        handleSendMessage(prompt)
    }

    const copyMessage = (id, content) => {
        navigator.clipboard.writeText(content)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    // Helper to parse timestamp clicks in answers
    const parseTimecode = (text) => {
        if (!onSeek) return
        const match = text.match(/(\d{1,2}):(\d{2})/);
        if (match) {
            const mins = parseInt(match[1], 10)
            const secs = parseInt(match[2], 10)
            onSeek(mins * 60 + secs)
        }
    }

    return (
        <div className="flex flex-col h-[560px] rounded-2xl bg-[#0b0c0e] border border-white/10 overflow-hidden shadow-xl">
            {/* Header */}
            <div className="px-4 py-3 bg-[#111215] border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
                        <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-white leading-tight">Vixora AI Copilot</h4>
                        <p className="text-[10px] text-muted-foreground font-mono truncate max-w-[200px]">
                            {videoTitle || 'Live Video Intelligence'}
                        </p>
                    </div>
                </div>
                <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Connected
                </span>
            </div>

            {/* Quick Prompt Chips (If only 1 or 2 messages) */}
            {messages.length <= 2 && (
                <div className="p-2.5 bg-white/[0.02] border-b border-white/5 flex flex-wrap gap-1.5">
                    {[
                        'Summarize this video',
                        'Top 3 key takeaways',
                        'Extract chapter timestamps',
                        'Explain main concept'
                    ].map((chip, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleQuickPrompt(chip)}
                            disabled={loading}
                            className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/5 hover:border-white/15 transition-colors disabled:opacity-50"
                        >
                            {chip}
                        </button>
                    ))}
                </div>
            )}

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 custom-scrollbar text-xs">
                {messages.map((m) => {
                    const isUser = m.role === 'USER'
                    return (
                        <div
                            key={m.id}
                            className={cn(
                                "flex gap-2.5 max-w-[92%]",
                                isUser ? "ml-auto flex-row-reverse" : "mr-auto"
                            )}
                        >
                            <div className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5",
                                isUser ? "bg-primary text-white" : "bg-white/10 text-primary border border-primary/30"
                            )}>
                                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                            </div>

                            <div className={cn(
                                "p-3 rounded-xl leading-relaxed relative group",
                                isUser
                                    ? "bg-primary text-white rounded-tr-none font-medium"
                                    : "bg-[#141519] border border-white/5 text-zinc-200 rounded-tl-none shadow-sm"
                            )}>
                                {isUser ? (
                                    <span>{m.content}</span>
                                ) : (
                                    <div className="space-y-1">
                                        <MarkdownRenderer content={m.content} compact className="text-xs text-zinc-200" />
                                        <div className="flex items-center justify-between pt-1 text-[10px] text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => copyMessage(m.id, m.content)}
                                                className="hover:text-zinc-300 flex items-center gap-1"
                                            >
                                                {copiedId === m.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                                <span>Copy</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}

                {loading && (
                    <div className="flex items-center gap-2 text-muted-foreground text-xs py-1">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        <span>Analyzing transcript & speech…</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form
                onSubmit={(e) => {
                    e.preventDefault()
                    handleSendMessage()
                }}
                className="p-2.5 bg-[#111215] border-t border-white/5 flex items-center gap-2"
            >
                <input
                    type="text"
                    placeholder="Ask anything about this video..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={loading}
                    className="flex-1 h-9 px-3 rounded-lg bg-[#18191d] border border-white/10 text-white placeholder:text-muted-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
                <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="h-9 w-9 rounded-lg bg-primary hover:bg-primary/90 text-white flex items-center justify-center disabled:opacity-40 transition-colors shadow-sm"
                >
                    <Send className="w-4 h-4" />
                </button>
            </form>
        </div>
    )
}
