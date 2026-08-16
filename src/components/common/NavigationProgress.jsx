import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import NProgress from 'nprogress'

NProgress.configure({ showSpinner: false, minimum: 0.2 })

export function NavigationProgress() {
    const location = useLocation()

    useEffect(() => {
        NProgress.start()
        
        // Use a short timeout to complete the progress bar after render
        const timeout = setTimeout(() => {
            NProgress.done()
        }, 100)

        return () => {
            clearTimeout(timeout)
            NProgress.done()
        }
    }, [location.pathname, location.search])

    return null
}
