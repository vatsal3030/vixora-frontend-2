import { createContext, useContext, useEffect } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
    // Always default to dark mode, ignoring conflicting local storage or system prefs
    // We clean up 'light' class on mount just in case
    useEffect(() => {
        // Enforce dark mode permanently
        const root = window.document.documentElement
        root.classList.add('dark')
        root.style.colorScheme = 'dark'
    }, [])

    const theme = 'dark'
    const setTheme = () => { } // No-op
    const toggleTheme = () => { } // No-op

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
