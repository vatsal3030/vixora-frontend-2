import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, AlignLeft, Loader2 } from 'lucide-react'
import { transcriptService } from '../../services/api'
import { cn } from '../../lib/utils'

/**
 * Format milliseconds → "m:ss" or "h:mm:ss"
 */
function msToTime(ms) {
    const s = Math.floor(ms / 1000)
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    return `${m}:${String(sec).padStart(2, '0')}`
}

/**
 * YouTube-style transcript panel.
 *
 * Props:
 *  - videoId: string
 *  - currentTime: number (seconds, from player)
 *  - onSeek: (seconds: number) => void
 */
export default function TranscriptPanel({ videoId, currentTime = 0, onSeek }) {
    const [items, setItems] = useState([])          // normalized cue objects
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [search, setSearch] = useState('')
    const [autoScroll, setAutoScroll] = useState(true)
    const activeCueRef = useRef(null)
    const listRef = useRef(null)
    const searchInputRef = useRef(null)

    // ── Normalize all cue shapes from backend ────────────────────────────────
    const normalizeItem = (cue) => {
        const startMs = cue.startMs ?? cue.start_ms ?? (cue.start != null ? cue.start * 1000 : 0)
        const endMs = cue.endMs ?? cue.end_ms ?? (cue.end != null ? cue.end * 1000 : startMs + 2000)
        return {
            id: cue.id || `${startMs}`,
            text: cue.text || cue.content || '',
            startMs,
            endMs,
            startS: startMs / 1000,
        }
    }

    // ── Fetch transcript ──────────────────────────────────────────────────────
    useEffect(() => {
        if (!videoId) return
        let cancelled = false
        setLoading(true)
        setError(null)

        transcriptService.getWatchTranscript(videoId, { limit: 200 })
            .then(res => {
                if (cancelled) return
                const raw = res.data.data?.items || res.data.data?.cues || []
                setItems(raw.map(normalizeItem))
            })
            .catch(() => {
                if (!cancelled) setError('No transcript available for this video.')
            })
            .finally(() => { if (!cancelled) setLoading(false) })

        return () => { cancelled = true }
    }, [videoId]) // eslint-disable-line react-hooks/exhaustive-deps

    // ── Active cue (currentTime-based) ────────────────────────────────────────
    const activeCueId = useCallback(() => {
        // Find the last cue whose startMs <= currentTime*1000
        const timeMs = currentTime * 1000
        let active = null
        for (const item of items) {
            if (item.startMs <= timeMs) active = item
            else break
        }
        return active?.id ?? null
    }, [items, currentTime])

    const currentActiveId = activeCueId()

    // ── Auto-scroll to active cue ─────────────────────────────────────────────
    useEffect(() => {
        if (!autoScroll || !activeCueRef.current || !listRef.current) return
        activeCueRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }, [currentActiveId, autoScroll])

    // ── Filtered cues ─────────────────────────────────────────────────────────
    const searchLower = search.toLowerCase()
    const filtered = search
        ? items.filter(item => item.text.toLowerCase().includes(searchLower))
        : items

    // ── Render ────────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading transcript…</span>
            </div>
        )
    }

    if (error || items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
                <AlignLeft className="w-8 h-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">{error || 'No transcript available.'}</p>
                <p className="text-xs text-muted-foreground/60">
                    Video owners can add a transcript via the Studio dashboard.
                </p>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
            {/* ── Toolbar ── */}
            <div className="flex items-center gap-2 mb-3 flex-shrink-0">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                    <input
                        ref={searchInputRef}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search in transcript…"
                        className="w-full bg-white/6 border border-white/10 rounded-lg pl-8 pr-8 py-1.5 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
                {/* Auto-scroll toggle */}
                <button
                    onClick={() => setAutoScroll(v => !v)}
                    title={autoScroll ? 'Disable auto-scroll' : 'Enable auto-scroll'}
                    className={cn(
                        'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors text-xs border',
                        autoScroll
                            ? 'bg-primary/20 border-primary/40 text-primary'
                            : 'bg-white/6 border-white/10 text-muted-foreground hover:text-white'
                    )}
                >
                    ↕
                </button>
            </div>

            {/* ── Cue list ── */}
            <div
                ref={listRef}
                className="flex-1 overflow-y-auto space-y-0.5 pr-1"
                style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}
                onScroll={() => setAutoScroll(false)} // user scroll → disable auto-scroll
            >
                {filtered.length === 0 ? (
                    <p className="text-center text-xs text-muted-foreground py-6">No results for "{search}"</p>
                ) : filtered.map(item => {
                    const isActive = item.id === currentActiveId && !search
                    return (
                        <button
                            key={item.id}
                            ref={isActive ? activeCueRef : null}
                            onClick={() => {
                                onSeek?.(item.startS)
                                setAutoScroll(true)
                            }}
                            className={cn(
                                'w-full text-left flex items-start gap-3 px-2 py-2 rounded-lg transition-colors group',
                                isActive
                                    ? 'bg-primary/15 border border-primary/25'
                                    : 'hover:bg-white/6 border border-transparent'
                            )}
                        >
                            {/* Timestamp pill */}
                            <span className={cn(
                                'flex-shrink-0 text-[11px] font-mono font-semibold mt-0.5 px-1.5 py-0.5 rounded-md transition-colors',
                                isActive
                                    ? 'bg-primary/20 text-primary'
                                    : 'text-muted-foreground group-hover:text-primary/80'
                            )}>
                                {msToTime(item.startMs)}
                            </span>
                            {/* Text — highlight search matches */}
                            <span className={cn(
                                'text-xs leading-relaxed',
                                isActive ? 'text-white font-medium' : 'text-gray-300'
                            )}>
                                {search ? (
                                    highlightMatch(item.text, search)
                                ) : item.text}
                            </span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

/** Wrap matching text in a <mark> span */
function highlightMatch(text, query) {
    const idx = text.toLowerCase().indexOf(query.toLowerCase())
    if (idx === -1) return text
    return (
        <>
            {text.slice(0, idx)}
            <mark className="bg-primary/30 text-white rounded px-0.5">{text.slice(idx, idx + query.length)}</mark>
            {text.slice(idx + query.length)}
        </>
    )
}
