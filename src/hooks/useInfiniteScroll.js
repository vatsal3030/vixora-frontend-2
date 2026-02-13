import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'

export default function useInfiniteScroll(fetchFunction, key = 0, initialLimit = 12) {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [hasMore, setHasMore] = useState(true)
    const [error, setError] = useState(null)
    const [page, setPage] = useState(1)

    // Use a ref to keep track of the observer
    const observerRef = useRef()

    // Reset state when key changes (e.g., sort change, search query change)
    useEffect(() => {
        setData([])
        setLoading(true)
        setHasMore(true)
        setError(null)
        setPage(1)
    }, [key])



    // Fetch data when page or key changes
    useEffect(() => {
        let isMounted = true

        const fetchData = async () => {
            setLoading(true)
            try {
                const response = await fetchFunction({ page, limit: initialLimit })

                if (!isMounted) return

                if (response.data.success) {
                    const newItems = response.data.data.docs || []
                    const { hasNextPage } = response.data.data

                    setData(prev => {
                        // If page is 1, return new items. Else append.
                        // We also filter duplicates just in case
                        return page === 1
                            ? newItems
                            : [...prev, ...newItems.filter(item => !prev.some(p => p._id === item._id))]
                    })
                    setHasMore(hasNextPage)
                }
            } catch (err) {
                if (!isMounted) return
                console.error('Fetch error:', err)
                setError(err.message || 'Failed to load data')
                if (page > 1) {
                    toast.error('Failed to load more items')
                }
            } finally {
                if (isMounted) {
                    setLoading(false)
                }
            }
        }

        fetchData()

        return () => {
            isMounted = false
        }
    }, [page, key, fetchFunction, initialLimit])

    // Intersection Observer callback
    const lastItemRef = useCallback(node => {
        if (loading) return
        if (observerRef.current) observerRef.current.disconnect()

        observerRef.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prev => prev + 1)
            }
        })

        if (node) observerRef.current.observe(node)
    }, [loading, hasMore])

    // Manual refresh function
    const refresh = () => {
        setPage(1)
        setData([])
        setLoading(true)
    }

    return {
        data,
        loading,
        hasMore,
        error,
        lastItemRef,
        refresh
    }
}
