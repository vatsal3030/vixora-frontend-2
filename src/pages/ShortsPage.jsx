import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { feedService, videoService } from '../services/api'
import ShortsPlayer from '../components/shorts/ShortsPlayer'
import { Loader2, ChevronUp, ChevronDown } from 'lucide-react'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { toast } from 'sonner'

export default function ShortsPage() {
    useDocumentTitle('Shorts - Vixora')
    const { videoId } = useParams()
    const navigate = useNavigate()

    const [shorts, setShorts] = useState([])
    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [activeShortId, setActiveShortId] = useState(null)
    const [isGlobalMuted, setIsGlobalMuted] = useState(true)
    const containerRef = useRef(null)
    const [initialLoad, setInitialLoad] = useState(true)

    const fetchShorts = useCallback(async (pageNum) => {
        if (loading || !hasMore) return

        try {
            setLoading(true)
            let newShorts = []

            try {
                const res = await feedService.getShortsFeed({ page: pageNum, limit: 20 })
                const data = res.data?.data
                newShorts = data?.items || (Array.isArray(data) ? data : [])
            } catch (err) {
                console.warn("[Shorts] Feed fetch error", err)
            }

            if (newShorts.length === 0) {
                setHasMore(false)
            } else {
                setShorts(prev => {
                    const combined = [...prev, ...newShorts]
                    const valid = combined.filter(s => s && (s._id || s.id))
                    const unique = Array.from(new Map(valid.map(s => [s._id || s.id, s])).values())
                    return unique
                })

                if (newShorts.length < 20) {
                    setHasMore(false)
                }
            }
        } catch (error) {
            console.error("[Shorts] Failed to fetch shorts:", error)
            toast.error("Failed to load Shorts. Please try again.")
        } finally {
            setLoading(false)
            setInitialLoad(false)
        }
    }, [hasMore, loading])

    // Fetch initial specific short if videoId is provided in URL
    useEffect(() => {
        const loadInitialData = async () => {
            if (videoId) {
                try {
                    setLoading(true)
                    const res = await videoService.getVideo(videoId)
                    const initialShort = res.data?.data
                    if (initialShort) {
                        setShorts([initialShort])
                        setActiveShortId(initialShort._id || initialShort.id)
                    }
                } catch (err) {
                    console.error("Failed to load requested short", err)
                }
            }
            fetchShorts(1)
        }
        
        loadInitialData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (shorts.length > 0 && !activeShortId) {
            setActiveShortId(shorts[0]._id || shorts[0].id)
        }
        if (containerRef.current) {
            containerRef.current.focus()
        }
        
        if (activeShortId) {
            window.history.replaceState(null, '', `/shorts/${activeShortId}`)
        }
    }, [shorts, activeShortId])

    const activeIndex = shorts.findIndex(s => (s._id || s.id) === activeShortId)

    // Intersection Observer for Active Short Detection
    useEffect(() => {
        if (!containerRef.current) return

        const observerOptions = {
            root: containerRef.current,
            rootMargin: '0px',
            threshold: 0.5
        }

        const handleIntersect = (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const shortId = entry.target.getAttribute('data-short-id')
                    if (shortId) {
                        setActiveShortId(prev => (prev !== shortId ? shortId : prev))
                    }
                }
            })
        }

        const observer = new IntersectionObserver(handleIntersect, observerOptions)

        const timeoutId = setTimeout(() => {
            if (containerRef.current) {
                const elements = containerRef.current.querySelectorAll('[data-short-id]')
                elements.forEach((el) => observer.observe(el))
            }
        }, 50)

        return () => {
            clearTimeout(timeoutId)
            observer.disconnect()
        }
    }, [shorts])

    // Infinite Scroll trigger
    const onScroll = useCallback(() => {
        if (!containerRef.current) return
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current

        if (hasMore && !loading && (scrollHeight - scrollTop <= clientHeight * 1.8)) {
            setPage(prev => {
                const nextPage = prev + 1
                fetchShorts(nextPage)
                return nextPage
            })
        }
    }, [hasMore, loading, fetchShorts])

    useEffect(() => {
        const container = containerRef.current
        if (!container) return
        container.addEventListener('scroll', onScroll)
        return () => container.removeEventListener('scroll', onScroll)
    }, [onScroll])

    // Navigation functions (Up & Down)
    const scrollToNext = useCallback(() => {
        if (!containerRef.current || shorts.length === 0) return
        const currentIdx = shorts.findIndex(s => (s._id || s.id) === activeShortId)
        const nextIndex = currentIdx + 1
        if (nextIndex < shorts.length) {
            const nextId = shorts[nextIndex]._id || shorts[nextIndex].id
            const nextEl = containerRef.current.querySelector(`[data-short-id="${nextId}"]`)
            nextEl?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
    }, [activeShortId, shorts])

    const scrollToPrev = useCallback(() => {
        if (!containerRef.current || shorts.length === 0) return
        const currentIdx = shorts.findIndex(s => (s._id || s.id) === activeShortId)
        const prevIndex = currentIdx - 1
        if (prevIndex >= 0) {
            const prevId = shorts[prevIndex]._id || shorts[prevIndex].id
            const prevEl = containerRef.current.querySelector(`[data-short-id="${prevId}"]`)
            prevEl?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
    }, [activeShortId, shorts])

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ignore keystrokes if typing inside input / textarea
            if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return

            if (e.key === 'ArrowDown' || e.key === 'j' || e.key === 'J') {
                e.preventDefault()
                scrollToNext()
            } else if (e.key === 'ArrowUp' || e.key === 'k' || e.key === 'K') {
                e.preventDefault()
                scrollToPrev()
            } else if (e.key === 'm' || e.key === 'M') {
                e.preventDefault()
                setIsGlobalMuted(prev => !prev)
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [scrollToNext, scrollToPrev])

    if (initialLoad && loading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-64px)] bg-black">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="relative w-full h-[calc(100vh-64px)] bg-[#0f0f0f] overflow-hidden">
            {/* Scrollable Container with Snap Scroll */}
            <div
                ref={containerRef}
                tabIndex={-1}
                className="h-full w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide bg-[#0f0f0f] outline-none"
            >
                {shorts.map((short, index) => {
                    const isVisible = Math.abs(index - activeIndex) <= 2
                    const shortId = short._id || short.id

                    return (
                        <div
                            key={shortId}
                            data-short-id={shortId}
                            className="w-full h-[calc(100vh-64px)] snap-start snap-always flex justify-center items-center relative"
                        >
                            {isVisible ? (
                                <ShortsPlayer
                                    video={short}
                                    isActive={activeShortId === shortId}
                                    isGlobalMuted={isGlobalMuted}
                                    onToggleMute={() => setIsGlobalMuted(prev => !prev)}
                                />
                            ) : (
                                <div className="w-full h-full flex justify-center items-center sm:py-2">
                                    <div className="relative h-full w-full sm:w-auto sm:aspect-[9/16] bg-zinc-900 sm:rounded-2xl" />
                                </div>
                            )}
                        </div>
                    )
                })}

                {!hasMore && shorts.length > 0 && (
                    <div className="h-20 w-full flex justify-center items-center snap-start text-muted-foreground text-sm">
                        You're all caught up with Shorts
                    </div>
                )}

                {shorts.length === 0 && !loading && (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
                        <p className="text-base font-semibold text-white">No Shorts available</p>
                        <p className="text-xs">Check back later or upload your own short video!</p>
                    </div>
                )}

                {loading && !initialLoad && (
                    <div className="h-20 w-full flex justify-center items-center snap-start">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                )}
            </div>

            {/* Desktop Floating Navigation Buttons (Matching YouTube Shorts screenshot 3 & 4) */}
            <div className="hidden lg:flex fixed right-8 top-1/2 -translate-y-1/2 flex-col gap-3 z-40">
                <button
                    onClick={scrollToPrev}
                    disabled={activeIndex <= 0}
                    className="w-12 h-12 rounded-full bg-[#272727]/90 hover:bg-[#3f3f3f] disabled:opacity-30 disabled:pointer-events-none text-white flex items-center justify-center shadow-2xl backdrop-blur-md transition-all active:scale-95 border border-white/10"
                    title="Previous short (k / ArrowUp)"
                >
                    <ChevronUp className="w-6 h-6" />
                </button>
                <button
                    onClick={scrollToNext}
                    disabled={activeIndex >= shorts.length - 1}
                    className="w-12 h-12 rounded-full bg-[#272727]/90 hover:bg-[#3f3f3f] disabled:opacity-30 disabled:pointer-events-none text-white flex items-center justify-center shadow-2xl backdrop-blur-md transition-all active:scale-95 border border-white/10"
                    title="Next short (j / ArrowDown)"
                >
                    <ChevronDown className="w-6 h-6" />
                </button>
            </div>
        </div>
    )
}
