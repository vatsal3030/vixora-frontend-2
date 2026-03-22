import { useState, useEffect, useRef, useCallback } from 'react'
import { feedService } from '../services/api'
import ShortsPlayer from '../components/shorts/ShortsPlayer'
import { Loader2 } from 'lucide-react'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { toast } from 'sonner'

export default function ShortsPage() {
    useDocumentTitle('Shorts - Vixora')
    const [shorts, setShorts] = useState([])
    const [loading, setLoading] = useState(false)
    // eslint-disable-next-line no-unused-vars
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [activeShortId, setActiveShortId] = useState(null)
    const containerRef = useRef(null)
    const [initialLoad, setInitialLoad] = useState(true)

    const fetchShorts = useCallback(async (pageNum) => {
        if (loading || !hasMore) return

        try {
            setLoading(true)
            let newShorts = []

            // Fetch from dedicated shorts feed endpoint
            try {
                const res = await feedService.getShortsFeed({ page: pageNum, limit: 20 })
                const data = res.data?.data
                newShorts = data?.items || (Array.isArray(data) ? data : [])
            } catch {
                // Silently handle — empty array will trigger "No Shorts found" UI
            }

            if (newShorts.length === 0) {
                setHasMore(false)
            } else {
                setShorts(prev => {
                    const combined = [...prev, ...newShorts]
                    // Strict Validation & Deduplication
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

    // Initial Load
    useEffect(() => {
        fetchShorts(1)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Set initial active short
    useEffect(() => {
        if (shorts.length > 0 && !activeShortId) {
            setActiveShortId(shorts[0]._id)
        }
        if (containerRef.current) {
            containerRef.current.focus()
        }
    }, [shorts, activeShortId]) // Added activeShortId

    // Derived active index for windowing
    const activeIndex = shorts.findIndex(s => s._id === activeShortId)

    // Intersection Observer for Active Short Detection
    useEffect(() => {
        if (!containerRef.current) return;

        const observerOptions = {
            root: containerRef.current,
            rootMargin: '0px',
            threshold: 0.6 // Trigger when 60% of the video is in view
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

        // Observe current elements tightly restricted to this container
        const elements = containerRef.current.querySelectorAll('[data-short-id]')
        elements.forEach((el) => observer.observe(el))

        return () => observer.disconnect()
    }, [shorts])

    // Infinite Scroll trigger remains on scroll
    const onScroll = useCallback(() => {
        if (!containerRef.current) return
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current

        // Infinite Load Trigger (1.5 viewports from bottom)
        if (hasMore && !loading && (scrollHeight - scrollTop <= clientHeight * 1.5)) {
            setPage(prev => {
                const nextPage = prev + 1
                fetchShorts(nextPage)
                return nextPage
            })
        }
    }, [hasMore, loading, fetchShorts])

    // Add scroll listener
    useEffect(() => {
        const container = containerRef.current
        if (!container) return
        container.addEventListener('scroll', onScroll)
        return () => container.removeEventListener('scroll', onScroll)
    }, [onScroll])

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!containerRef.current) return
            // activeIndex is derived from state in render, we need fresh logic here or dependency
            // Re-calculating index for simplicity inside effect or using state
            const currentIdx = shorts.findIndex(s => s._id === activeShortId)

            if (e.key === 'ArrowDown') {
                e.preventDefault()
                const nextIndex = currentIdx + 1
                if (nextIndex < shorts.length) {
                    const nextEl = containerRef.current.querySelector(`[data-short-id="${shorts[nextIndex]._id}"]`)
                    nextEl?.scrollIntoView({ behavior: 'smooth' })
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                const prevIndex = currentIdx - 1
                if (prevIndex >= 0) {
                    const prevEl = containerRef.current.querySelector(`[data-short-id="${shorts[prevIndex]._id}"]`)
                    prevEl?.scrollIntoView({ behavior: 'smooth' })
                }
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [activeShortId, shorts])


    if (initialLoad && loading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-64px)] bg-black">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>
        )
    }

    return (
        <div
            ref={containerRef}
            tabIndex={-1}
            className="h-[calc(100vh-64px)] w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide bg-[#0f0f0f] outline-none"
        >
            {shorts.map((short, index) => {
                // Aggressive Windowing: Keep +/- 1
                const shouldRender = Math.abs(index - activeIndex) <= 1

                return (
                    <div
                        key={short._id}
                        data-short-id={short._id}
                        className="w-full h-[calc(100vh-64px)] snap-start snap-always flex justify-center relative"
                    >
                        {shouldRender ? (
                            <ShortsPlayer
                                video={short}
                                isActive={activeShortId === short._id}
                            />
                        ) : (
                            <div className="w-full h-full flex justify-center sm:py-4">
                                <div className="relative h-full w-full sm:w-auto sm:aspect-[9/16] bg-zinc-900 sm:rounded-2xl" />
                            </div>
                        )}
                    </div>
                )
            })}

            {!hasMore && shorts.length > 0 && (
                <div className="h-20 w-full flex justify-center items-center snap-start text-muted-foreground text-sm">
                    No more shorts
                </div>
            )}

            {shorts.length === 0 && !loading && (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                    No Shorts found
                </div>
            )}

            {loading && !initialLoad && (
                <div className="h-20 w-full flex justify-center items-center snap-start">
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                </div>
            )}
        </div>
    )
}
