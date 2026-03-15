import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { feedService } from '../services/api'
import ShortsPlayer from '../components/shorts/ShortsPlayer'
import ShortsSkeleton from '../components/skeletons/ShortsSkeleton'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { toast } from 'sonner'

export default function ShortsPage() {
    useDocumentTitle('Shorts - Vixora')
    const { videoId: urlVideoId } = useParams()

    const [shorts, setShorts] = useState([])
    const [loading, setLoading] = useState(false)
    const pageRef = useRef(1)
    const [hasMore, setHasMore] = useState(true)
    const [activeIndex, setActiveIndex] = useState(0)
    const containerRef = useRef(null)
    const [initialLoad, setInitialLoad] = useState(true)
    const fetchingRef = useRef(false)

    const getShortId = (short) => short?._id || short?.id

    const fetchShorts = useCallback(async (pageNum) => {
        if (fetchingRef.current || !hasMore) return
        fetchingRef.current = true

        try {
            setLoading(true)
            let newShorts = []

            try {
                const res = await feedService.getShortsFeed({ page: pageNum, limit: 20 })
                const data = res.data?.data
                newShorts = data?.items || (Array.isArray(data) ? data : [])
            } catch {
                // Silently handle
            }

            if (newShorts.length === 0) {
                setHasMore(false)
            } else {
                setShorts(prev => {
                    const combined = [...prev, ...newShorts]
                    const valid = combined.filter(s => s && getShortId(s))
                    const unique = Array.from(new Map(valid.map(s => [getShortId(s), s])).values())
                    return unique
                })
                if (newShorts.length < 20) setHasMore(false)
            }
        } catch (error) {
            console.error("[Shorts] Failed to fetch shorts:", error)
            toast.error("Failed to load Shorts. Please try again.")
        } finally {
            setLoading(false)
            setInitialLoad(false)
            fetchingRef.current = false
        }
    }, [hasMore])

    // Initial Load
    useEffect(() => {
        fetchShorts(1)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Set initial active index from URL
    useEffect(() => {
        if (shorts.length > 0 && urlVideoId) {
            const idx = shorts.findIndex(s => getShortId(s) === urlVideoId)
            if (idx >= 0) setActiveIndex(idx)
        }
        // Force focus so arrows work immediately
        if (containerRef.current) {
            containerRef.current.focus()
        }
    }, [shorts, urlVideoId])

    // Update browser URL when active index changes
    useEffect(() => {
        if (shorts.length > 0 && shorts[activeIndex]) {
            const id = getShortId(shorts[activeIndex])
            if (id) {
                const targetPath = `/shorts/${id}`
                if (window.location.pathname !== targetPath) {
                    window.history.replaceState(null, '', targetPath)
                }
            }
        }
    }, [activeIndex, shorts])

    // Scroll to index helper
    const scrollToIndex = useCallback((index) => {
        if (index < 0 || index >= shorts.length) return
        const el = containerRef.current?.children[index]
        if (el && containerRef.current) {
            containerRef.current.scrollTo({
                top: el.offsetTop,
                behavior: 'smooth'
            })
        }
    }, [shorts.length])

    // Intersection Observer — detect which short is in view
    useEffect(() => {
        if (!containerRef.current || shorts.length === 0) return

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const idx = Number(entry.target.getAttribute('data-index'))
                        if (!isNaN(idx)) setActiveIndex(idx)
                    }
                })
            },
            { root: containerRef.current, rootMargin: '0px', threshold: 0.6 }
        )

        Array.from(containerRef.current.children).forEach((el) => {
            if (el.hasAttribute('data-index')) observer.observe(el)
        })

        return () => observer.disconnect()
    }, [shorts])

    // Infinite Scroll
    const onScroll = useCallback(() => {
        if (!containerRef.current) return
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current
        if (hasMore && !fetchingRef.current && (scrollHeight - scrollTop <= clientHeight * 1.5)) {
            pageRef.current += 1
            fetchShorts(pageRef.current)
        }
    }, [hasMore, fetchShorts])

    useEffect(() => {
        const container = containerRef.current
        if (!container) return
        container.addEventListener('scroll', onScroll)
        return () => container.removeEventListener('scroll', onScroll)
    }, [onScroll])

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault()
                setActiveIndex(prev => {
                    const next = Math.min(prev + 1, shorts.length - 1)
                    scrollToIndex(next)
                    return next
                })
            } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setActiveIndex(prev => {
                    const next = Math.max(prev - 1, 0)
                    scrollToIndex(next)
                    return next
                })
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [shorts.length, scrollToIndex])

    // Button-based navigation
    const goToNext = () => {
        const next = Math.min(activeIndex + 1, shorts.length - 1)
        setActiveIndex(next)
        scrollToIndex(next)
    }
    const goToPrev = () => {
        const prev = Math.max(activeIndex - 1, 0)
        setActiveIndex(prev)
        scrollToIndex(prev)
    }

    if (initialLoad && loading) {
        return (
            <div className="h-[calc(100vh-64px)] w-full bg-[#0f0f0f] overflow-hidden">
                <ShortsSkeleton />
            </div>
        )
    }

    return (
        <div className="relative h-[calc(100vh-64px)] w-full bg-[#0f0f0f]">
            {/* Scrollable shorts container */}
            <div
                ref={containerRef}
                tabIndex={-1}
                className="h-full w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide outline-none"
            >
                {shorts.map((short, index) => {
                    const shouldRender = Math.abs(index - activeIndex) <= 1
                    const shortId = getShortId(short)

                    return (
                        <div
                            key={shortId}
                            data-index={index}
                            className="w-full h-full snap-start snap-always flex items-center justify-center bg-[#0f0f0f]"
                        >
                            {shouldRender ? (
                                <ShortsPlayer
                                    video={short}
                                    isActive={activeIndex === index}
                                />
                            ) : (
                                <div className="w-full h-full flex justify-center items-center">
                                    <div className="h-full w-full sm:w-[400px] sm:max-h-[calc(100vh-96px)] sm:aspect-[9/16] bg-zinc-900/30 sm:rounded-2xl" />
                                </div>
                            )}
                        </div>
                    )
                })}

                {!hasMore && shorts.length > 0 && (
                    <div className="h-24 w-full flex justify-center items-center snap-start text-muted-foreground text-sm">
                        No more shorts
                    </div>
                )}

                {shorts.length === 0 && !loading && (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        No Shorts found
                    </div>
                )}

                {loading && !initialLoad && (
                    <div className="h-24 w-full flex justify-center items-center snap-start">
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                )}
            </div>

            {/* Navigation Arrows (Desktop only) */}
            <div className="hidden sm:flex flex-col gap-3 fixed right-6 top-1/2 -translate-y-1/2 z-30">
                <button
                    onClick={goToPrev}
                    disabled={activeIndex <= 0}
                    className="w-11 h-11 rounded-full bg-white/[0.08] hover:bg-white/15 border border-white/10 flex items-center justify-center text-white transition-all duration-200 disabled:opacity-25 disabled:cursor-not-allowed backdrop-blur-sm"
                >
                    <ChevronUp className="w-5 h-5" />
                </button>
                <button
                    onClick={goToNext}
                    disabled={activeIndex >= shorts.length - 1}
                    className="w-11 h-11 rounded-full bg-white/[0.08] hover:bg-white/15 border border-white/10 flex items-center justify-center text-white transition-all duration-200 disabled:opacity-25 disabled:cursor-not-allowed backdrop-blur-sm"
                >
                    <ChevronDown className="w-5 h-5" />
                </button>
            </div>
        </div>
    )
}
