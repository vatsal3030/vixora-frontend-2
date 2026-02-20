/**
 * AISummaryCard — WatchPage sidebar launcher.
 *
 * Instead of duplicating the summary UI here, this component acts as a
 * compact teaser that opens the floating VixoraAI chat widget where the
 * user can read the full summary AND ask follow-up questions.
 *
 * The full summary + generate/regenerate controls live inside VixoraAI.jsx
 * (VideoSummaryCard component shown at the top of the chat when on a watch page).
 */
import { useState, useEffect } from 'react'
import { Sparkles, Loader2, MessageSquare } from 'lucide-react'
import { aiService } from '../../services/api'

export default function AISummaryCard({ videoId }) {
    const [hasSummary, setHasSummary] = useState(null) // null = loading
    const [preview, setPreview] = useState('')         // first ~100 chars

    useEffect(() => {
        if (!videoId) return
        let cancelled = false
        aiService.getVideoSummary(videoId)
            .then(res => {
                if (cancelled) return
                const s = res.data.data?.summary || ''
                setHasSummary(!!s)
                setPreview(s.slice(0, 110) + (s.length > 110 ? '…' : ''))
            })
            .catch(() => {
                if (!cancelled) setHasSummary(false)
            })
        return () => { cancelled = true }
    }, [videoId])

    const openChat = () => {
        // Find the floating AI button and click it to open the chat widget
        const btn = document.querySelector('[aria-label="Open Vixora AI"]')
        btn?.click()
    }

    if (hasSummary === null) {
        return (
            <div className="rounded-xl border border-white/8 bg-white/4 p-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary flex-shrink-0" />
                <span className="text-xs text-muted-foreground">Loading AI summary…</span>
            </div>
        )
    }

    return (
        <button
            onClick={openChat}
            className="w-full rounded-xl border border-violet-500/20 bg-violet-500/8 hover:bg-violet-500/14 transition-colors text-left overflow-hidden group"
        >
            {/* Header */}
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-violet-500/12">
                <div className="w-5 h-5 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-3 h-3 text-violet-400" />
                </div>
                <span className="text-xs font-semibold text-violet-300 flex-1">AI Summary</span>
                <span className="text-[10px] text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" /> Open chat
                </span>
            </div>

            {/* Content preview */}
            <div className="px-3 py-2.5">
                {hasSummary && preview ? (
                    <>
                        <p className="text-xs text-gray-300 leading-relaxed line-clamp-3">{preview}</p>
                        <p className="text-[10px] text-violet-400 mt-2 font-medium">
                            Chat with AI to ask follow-up questions →
                        </p>
                    </>
                ) : (
                    <p className="text-xs text-muted-foreground">
                        No summary yet — open the AI chat to generate one.
                    </p>
                )}
            </div>
        </button>
    )
}
