import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
    // Check local storage or system preference, default to dark
    const [theme, setThemeState] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme')
            if (savedTheme) {
                return savedTheme
            }
            if (window.matchMedia('(prefers-color-scheme: light)').matches) {
                return 'light'
            }
        }
        return 'dark'
    })

    // Set theme with optional animation
    const setTheme = async (newTheme) => {
        if (newTheme === theme) return

        // Fallback if View Transitions API is not supported
        if (!document.startViewTransition) {
            setThemeState(newTheme)
            return
        }

        // View Transition API Logic for Circular Reveal
        try {
            await document.startViewTransition(() => {
                setThemeState(newTheme)
            }).ready

            // Calculate distance to furthest corner from top-right
            const x = window.innerWidth
            const y = 0
            const right = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))

            document.documentElement.animate(
                {
                    clipPath: [
                        `circle(0px at ${x}px ${y}px)`,
                        `circle(${right}px at ${x}px ${y}px)`
                    ]
                },
                {
                    duration: 1200,
                    easing: 'ease-in-out',
                    pseudoElement: '::view-transition-new(root)'
                }
            )
        } catch (e) {
            console.error(e)
            setThemeState(newTheme)
        }
    }

    // Toggle between dark and light
    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark')
    }

    // Apply theme to document and handle system preference
    useEffect(() => {
        const root = window.document.documentElement
        root.classList.remove('light', 'dark')

        // Handle system preference
        if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
            root.classList.add(systemTheme)
        } else {
            root.classList.add(theme)
        }

        localStorage.setItem('theme', theme)
    }, [theme])

    // Listen for system preference changes when in 'system' mode
    useEffect(() => {
        if (theme !== 'system') return

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const handleChange = (e) => {
            const root = window.document.documentElement
            root.classList.remove('light', 'dark')
            root.classList.add(e.matches ? 'dark' : 'light')
        }

        mediaQuery.addEventListener('change', handleChange)
        return () => mediaQuery.removeEventListener('change', handleChange)
    }, [theme])

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}
