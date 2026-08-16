import { useState, useEffect, useCallback } from 'react'
import { Sparkles, Loader2, MessageSquare, RefreshCw, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react'
import { aiService } from '../../services/api'
import { ParsedText } from '../common/ParsedText'
import { cn } from '../../lib/utils'

export default function AISummaryCard({ videoId }) {
    const [summary, setSummary] = useState(null)
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)
    const [copied, setCopied] = useState(false)

    const fetchSummary = useCallback(async () => {
        if (!videoId) return
        try {
            setLoading(true)
            const res = await aiService.getVideoSummary(videoId)
            const s = res.data.data?.summary || null
            setSummary(s)
        } catch {
            setSummary(null)
        } finally {
            setLoading(false)
        }
    }, [videoId])

    useEffect(() => {
        fetchSummary()
    }, [fetchSummary])

    const handleGenerate = async (e) => {
        e?.stopPropagation()
        if (!videoId || generating) return
        setGenerating(true)
        try {
            const res = await aiService.generateVideoSummary(videoId, true)
            setSummary(res.data.data?.summary || null)
            setIsExpanded(true)
        } catch {
            // ignore
        } finally {
            setGenerating(false)
        }
    }

    const openChat = (e) => {
        e?.stopPropagation()
        const btn = document.querySelector('[aria-label="Open Vixora AI"]')
        btn?.click()
    }

    const handleCopy = (e) => {
        e?.stopPropagation()
        if (!summary) return
        navigator.clipboard.writeText(summary)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="w-full rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/[0.08] to-transparent backdrop-blur-xl overflow-hidden shadow-lg transition-all">
            {/* Header */}
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center justify-between px-3.5 py-2.5 bg-primary/10 border-b border-primary/15 cursor-pointer hover:bg-primary/15 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                    </div>
                    <span className="text-xs font-bold text-white font-display tracking-wide">AI Video Summary</span>
                </div>

                <div className="flex items-center gap-1.5">
                    {summary && (
                        <button
                            onClick={handleCopy}
                            title="Copy summary"
                            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                    )}
                    <button
                        onClick={openChat}
                        title="Open AI Chat"
                        className="flex items-center gap-1 text-[10px] font-bold text-primary hover:text-primary/80 px-2 py-0.5 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
                    >
                        <MessageSquare className="w-3 h-3" />
                        Chat
                    </button>
                    <button className="text-zinc-400 hover:text-white p-0.5">
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                </div>
            </div>

            {/* Body */}
            <div className="p-3.5">
                {loading ? (
                    <div className="flex items-center gap-2 py-2">
                        <Loader2 className="w-4 h-4 animate-spin text-primary flex-shrink-0" />
                        <span className="text-xs text-zinc-400">Analyzing video intelligence…</span>
                    </div>
                ) : summary ? (
                    <div className="space-y-2.5">
                        <div className={cn(
                            "text-xs text-zinc-300 leading-relaxed",
                            !isExpanded && "line-clamp-3"
                        )}>
                            <ParsedText text={summary} />
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px]">
                            <button
                                onClick={handleGenerate}
                                disabled={generating}
                                className="flex items-center gap-1 text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
                            >
                                <RefreshCw className={cn("w-3 h-3", generating && "animate-spin")} />
                                {generating ? 'Regenerating…' : 'Regenerate'}
                            </button>

                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="text-primary font-semibold hover:underline"
                            >
                                {isExpanded ? 'Show less' : 'Read more'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-between py-1">
                        <span className="text-xs text-zinc-400">No summary generated yet</span>
                        <button
                            onClick={handleGenerate}
                            disabled={generating}
                            className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors bg-primary/10 hover:bg-primary/20 px-3 py-1 rounded-full"
                        >
                            {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                            Generate AI Summary
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
