import {
    Check, ChevronRight, ChevronLeft,
    Gauge, Subtitles, MonitorPlay, Keyboard
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

// Sub-components defined outside to prevent re-creation on render
const SubMenuHeader = ({ title, onBack }) => (
    <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5 text-white mb-1">
        <button onClick={onBack} className="p-1 hover:bg-white/10 rounded-full transition-colors">
            <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-medium">{title}</span>
    </div>
)

const MainMenu = ({ onNavigate, onToggleCaptions, onShowShortcuts, playbackSpeed, quality, showCaptions }) => (
    <div className="py-2 min-w-[200px]">
        <button
            className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/10 text-sm text-white/90 hover:text-white transition-colors"
            onClick={() => onNavigate('speed')}
        >
            <div className="flex items-center gap-3">
                <Gauge className="w-4 h-4" />
                <span>Playback Speed</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-white/50">
                {playbackSpeed === 1 ? 'Normal' : `${playbackSpeed}x`}
                <ChevronRight className="w-4 h-4" />
            </div>
        </button>

        <button
            className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/10 text-sm text-white/90 hover:text-white transition-colors"
            onClick={() => onNavigate('quality')}
        >
            <div className="flex items-center gap-3">
                <MonitorPlay className="w-4 h-4" />
                <span>Quality</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-white/50">
                {quality}
                <ChevronRight className="w-4 h-4" />
            </div>
        </button>

        <button
            className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/10 text-sm text-white/90 hover:text-white transition-colors"
            onClick={onToggleCaptions}
        >
            <div className="flex items-center gap-3">
                <Subtitles className="w-4 h-4" />
                <span>Captions</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-white/50">
                {showCaptions ? 'On' : 'Off'}
            </div>
        </button>

        {onShowShortcuts && (
            <button
                className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/10 text-sm text-white/90 hover:text-white transition-colors"
                onClick={onShowShortcuts}
            >
                <div className="flex items-center gap-3">
                    <Keyboard className="w-4 h-4" />
                    <span>Keyboard shortcuts</span>
                </div>
            </button>
        )}
    </div>
)

const SpeedMenu = ({ playbackSpeed, onSpeedChange, onBack }) => {
    const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
    return (
        <div>
            <SubMenuHeader title="Playback Speed" onBack={onBack} />
            <div className="py-1 max-h-[200px] overflow-y-auto scrollbar-thin">
                {speeds.map(speed => (
                    <button
                        key={speed}
                        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-white/10 text-sm text-white/90 transition-colors"
                        onClick={() => onSpeedChange(speed)}
                    >
                        {playbackSpeed === speed && <Check className="w-4 h-4 text-white" />}
                        <span className={playbackSpeed === speed ? 'ml-0' : 'ml-7'}>
                            {speed === 1 ? 'Normal' : speed}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    )
}

const QualityMenu = ({ quality, onQualityChange, onBack }) => {
    const qualities = ['Auto', '1080p', '720p', '480p', '360p']
    return (
        <div>
            <SubMenuHeader title="Quality" onBack={onBack} />
            <div className="py-1">
                {qualities.map(q => (
                    <button
                        key={q}
                        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-white/10 text-sm text-white/90 transition-colors"
                        onClick={() => onQualityChange(q)}
                    >
                        {quality === q && <Check className="w-4 h-4 text-white" />}
                        <span className={quality === q ? 'ml-0' : 'ml-7'}>
                            {q}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    )
}

export function PlayerSettingsMenu({
    playbackSpeed,
    onSpeedChange,
    quality,
    onQualityChange,
    showCaptions,
    onToggleCaptions,
    onShowShortcuts,
    isOpen,
    onClose
}) {
    const [activeSubmenu, setActiveSubmenu] = useState(null) // 'speed' | 'quality' | null
    const menuRef = useRef(null)

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose()
                setActiveSubmenu(null)
            }
        }
        if (isOpen) document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isOpen, onClose])

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={menuRef}
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.15 }}
                    // Positioned above the settings button
                    className="absolute bottom-full right-0 mb-4 glass-card border border-white/10 shadow-glass-hover overflow-hidden min-w-[250px] z-[50] transform origin-bottom-right"
                >
                    {!activeSubmenu && (
                        <MainMenu
                            onNavigate={setActiveSubmenu}
                            onToggleCaptions={onToggleCaptions}
                            onShowShortcuts={() => { onShowShortcuts?.(); onClose(); }}
                            playbackSpeed={playbackSpeed}
                            quality={quality}
                            showCaptions={showCaptions}
                        />
                    )}
                    {activeSubmenu === 'speed' && (
                        <SpeedMenu
                            playbackSpeed={playbackSpeed}
                            onSpeedChange={(s) => { onSpeedChange(s); onClose(); setActiveSubmenu(null); }}
                            onBack={() => setActiveSubmenu(null)}
                        />
                    )}
                    {activeSubmenu === 'quality' && (
                        <QualityMenu
                            quality={quality}
                            onQualityChange={(q) => { onQualityChange(q); onClose(); setActiveSubmenu(null); }}
                            onBack={() => setActiveSubmenu(null)}
                        />
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    )
}
