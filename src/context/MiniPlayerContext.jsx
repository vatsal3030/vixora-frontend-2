/* eslint-disable react-refresh/only-export-components */
// @refresh reset
import { createContext, useContext, useState, useCallback } from 'react'

const MiniPlayerContext = createContext({
    isOpen: false,
    video: null,
    openPlayer: () => { },
    closePlayer: () => { },
})

export function MiniPlayerProvider({ children }) {
    const [isOpen, setIsOpen] = useState(false)
    const [video, setVideo] = useState(null)

    const openPlayer = useCallback((videoData) => {
        setVideo(videoData)
        setIsOpen(true)
    }, [])

    const closePlayer = useCallback(() => {
        setIsOpen(false)
        setVideo(null)
    }, [])

    return (
        <MiniPlayerContext.Provider value={{ isOpen, video, openPlayer, closePlayer }}>
            {children}
        </MiniPlayerContext.Provider>
    )
}

export const useMiniPlayer = () => useContext(MiniPlayerContext)
