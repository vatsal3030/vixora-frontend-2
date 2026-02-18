import { createContext, useContext, useState, useRef, useCallback } from 'react';

const VideoHoverContext = createContext(null);

export function VideoHoverProvider({ children }) {
    const [hoveredVideoId, setHoveredVideoId] = useState(null);
    const timeoutRef = useRef(null);

    const onHover = useCallback((id) => {
        // Clear any pending clear action
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        // Set the new hovered video after a short delay to prevent accidental triggers
        // and to allow the previous one to clear if moving fast
        timeoutRef.current = setTimeout(() => {
            setHoveredVideoId(id);
        }, 200);
    }, []);

    const onLeave = useCallback((id) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        // Immediate clear or short delay? 
        // Immediate clear feels snappier for "stop playing".
        if (hoveredVideoId === id) {
            setHoveredVideoId(null);
        }
    }, [hoveredVideoId]);

    return (
        <VideoHoverContext.Provider value={{ hoveredVideoId, onHover, onLeave }}>
            {children}
        </VideoHoverContext.Provider>
    );
}

export function useVideoHover() {
    return useContext(VideoHoverContext);
}
