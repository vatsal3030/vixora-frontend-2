import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function KeyboardShortcuts() {
    const navigate = useNavigate()

    useEffect(() => {
        const handleKeyDown = (e) => {
            // Do not trigger shortcuts if user is typing in an input or textarea
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
                return
            }

            // Global search shortcut '/'
            if (e.key === '/') {
                e.preventDefault()
                const searchInput = document.getElementById('search-input')
                if (searchInput) {
                    searchInput.focus()
                    // If it's a mobile layout, we might need to trigger the mobile search overlay
                    // but the desktop one works out of the box with this ID
                }
            }

            // Global home shortcut 'h' + shift (optional)
            if (e.key === 'H' && e.shiftKey) {
                e.preventDefault()
                navigate('/')
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [navigate])

    return null
}
