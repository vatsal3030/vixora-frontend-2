import { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    X, Minus, Square, Play, Pause, RotateCcw, RotateCw,
    Maximize, Zap, Subtitles
} from 'lucide-react'
import { useMiniPlayer } from '../../context/MiniPlayerContext'
import { getMediaUrl } from '../../lib/media'
import { formatDuration } from '../../lib/utils'

export default function MiniPlayer() {
    const { isOpen, video, closePlayer } = useMiniPlayer()
    const videoRef = useRef(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [isHovering, setIsHovering] = useState(false)

    const videoSrc = getMediaUrl(video?.videoUrl || video?.videoFile || video?.video)

    useEffect(() => {
        if (isOpen && videoRef.current) {
            videoRef.current.play().catch(() => { })
        }
    }, [isOpen, video])

    const togglePlay = () => {
        if (videoRef.current.paused) {
            videoRef.current.play()
        } else {
            videoRef.current.pause()
        }
    }

    const skip = (seconds) => {
        if (videoRef.current) {
            videoRef.current.currentTime += seconds
        }
    }

    const handleTimeUpdate = () => {
        setCurrentTime(videoRef.current.currentTime)
    }

    const handleLoadedMetadata = () => {
        setDuration(videoRef.current.duration)
    }

    const handleSeek = (e) => {
        const time = parseFloat(e.target.value)
        videoRef.current.currentTime = time
        setCurrentTime(time)
    }

    if (!isOpen || !video) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                drag
                dragMomentum={false}
                className="fixed bottom-24 right-6 z-[60] w-[340px] aspect-video bg-[#0c0c12]/95 backdrop-blur-xl rounded-xl overflow-hidden shadow-2xl border border-white/10 group select-none"
            >
                {/* Window Header */}
                <div className="flex items-center justify-between px-3 py-2 bg-white/5 border-b border-white/10 cursor-move">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded bg-primary flex items-center justify-center">
                            <Zap className="w-3 h-3 text-white fill-white" />
                        </div>
                        <span className="text-[11px] font-medium text-gray-300">localhost:5173</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="text-gray-400 hover:text-white transition-colors">
                            <Minus className="w-3.5 h-3.5" />
                        </button>
                        <button className="text-gray-400 hover:text-white transition-colors">
                            <Square className="w-3 h-3" />
                        </button>
                        <button onClick={closePlayer} className="text-gray-400 hover:text-red-400 transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Video Area */}
                <div
                    className="relative w-full h-full"
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                >
                    <video
                        ref={videoRef}
                        src={videoSrc}
                        className="w-full h-full object-cover"
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onClick={togglePlay}
                        autoPlay
                    />

                    {/* Controls Overlay */}
                    <motion.div
                        initial={false}
                        animate={{ opacity: isHovering ? 1 : 0 }}
                        className="absolute inset-0 bg-black/40 flex flex-col justify-between"
                    >
                        {/* Center Controls */}
                        <div className="flex-1 flex items-center justify-center gap-6">
                            <div className="relative">
                                <button onClick={() => skip(-10)} className="p-2 text-white/80 hover:text-white hover:scale-110 transition-all">
                                    <RotateCcw className="w-6 h-6" />
                                </button>
                                <span className="absolute inset-0 flex items-center justify-center text-[7px] font-bold mt-[2px] pointer-events-none">10</span>
                            </div>

                            <button onClick={togglePlay} className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center text-white hover:scale-110 transition-all shadow-lg">
                                {isPlaying ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white ml-0.5" />}
                            </button>

                            <div className="relative">
                                <button onClick={() => skip(10)} className="p-2 text-white/80 hover:text-white hover:scale-110 transition-all">
                                    <RotateCw className="w-6 h-6" />
                                </button>
                                <span className="absolute inset-0 flex items-center justify-center text-[7px] font-bold mt-[2px] pointer-events-none">10</span>
                            </div>
                        </div>

                        {/* Bottom Controls */}
                        <div className="px-3 pb-2 space-y-1">
                            {/* Seek Bar */}
                            <div className="flex items-center gap-2 group/seek">
                                <input
                                    type="range"
                                    min={0}
                                    max={duration || 0}
                                    value={currentTime}
                                    onChange={handleSeek}
                                    className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-primary group-hover/seek:h-1.5 transition-all"
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="text-[10px] font-medium text-white/90">
                                    {formatDuration(currentTime)} / {formatDuration(duration)}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="text-white/80 hover:text-white">
                                        <Subtitles className="w-3.5 h-3.5" />
                                    </button>
                                    <button className="text-white/80 hover:text-white">
                                        <Maximize className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
