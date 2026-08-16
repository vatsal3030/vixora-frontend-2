import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Play, Repeat, Repeat1, Shuffle, X, ListVideo } from 'lucide-react'
import { getMediaUrl } from '../../lib/media'
import { formatDuration } from '../../lib/utils'

export function PlaylistWatchPanel({
    playlist,
    currentVideoId,
    playlistId,
    onClose,
    isShuffle,
    onToggleShuffle,
    loopMode,
    onToggleLoop
}) {
    const navigate = useNavigate()
    const listRef = useRef(null)
    const activeItemRef = useRef(null)

    const rawItems = playlist?.items || playlist?.videos || []
    const items = rawItems.map(item => item?.video || item)
    const totalCount = playlist?.videoCount ?? items.length

    const currentIndex = items.findIndex(v => (v?._id || v?.id) === currentVideoId)
    const activeIndex = currentIndex >= 0 ? currentIndex : 0

    // Auto-scroll to active video in the list
    useEffect(() => {
        if (activeItemRef.current) {
            activeItemRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            })
        }
    }, [currentVideoId])

    if (!playlist) return null

    return (
        <div className="bg-[#181818] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col w-full mb-4">
            {/* Header (Matching YouTube's Playlist Panel) */}
            <div className="p-3.5 bg-[#202020] border-b border-white/10 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <Link
                            to={`/playlist/${playlistId}`}
                            className="font-bold text-[15px] text-white hover:text-primary transition-colors line-clamp-1 block"
                            title={playlist.name}
                        >
                            {playlist.name}
                        </Link>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-0.5">
                            <span className="truncate max-w-[140px]">
                                {playlist.owner?.username || playlist.owner?.fullName || 'Playlist'}
                            </span>
                            <span>•</span>
                            <span className="text-zinc-300 font-medium">
                                {activeIndex + 1} / {totalCount}
                            </span>
                        </div>
                    </div>

                    {/* Close / Dismiss Playlist Button */}
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors"
                            title="Exit playlist mode"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Control Actions: Loop & Shuffle */}
                <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                    {/* Loop Toggle Button */}
                    <button
                        onClick={onToggleLoop}
                        className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                            loopMode === 'all'
                                ? 'bg-primary text-white shadow-md shadow-primary/20'
                                : loopMode === 'one'
                                ? 'bg-primary/80 text-white'
                                : 'text-zinc-400 hover:text-white hover:bg-white/10'
                        }`}
                        title={
                            loopMode === 'all'
                                ? 'Looping all videos'
                                : loopMode === 'one'
                                ? 'Looping this video'
                                : 'Loop off'
                        }
                    >
                        {loopMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
                        <span className="text-[11px] capitalize">{loopMode === 'off' ? 'Loop' : loopMode}</span>
                    </button>

                    {/* Shuffle Toggle Button */}
                    <button
                        onClick={onToggleShuffle}
                        className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                            isShuffle
                                ? 'bg-primary text-white shadow-md shadow-primary/20'
                                : 'text-zinc-400 hover:text-white hover:bg-white/10'
                        }`}
                        title={isShuffle ? 'Shuffle on' : 'Shuffle off'}
                    >
                        <Shuffle className="w-4 h-4" />
                        <span className="text-[11px]">{isShuffle ? 'Shuffled' : 'Shuffle'}</span>
                    </button>
                </div>
            </div>

            {/* Scrollable Playlist Video List */}
            <div ref={listRef} className="max-h-[360px] overflow-y-auto divide-y divide-white/5 scrollbar-thin scrollbar-thumb-white/10">
                {items.length === 0 ? (
                    <div className="p-6 text-center text-xs text-zinc-500">
                        No videos in this playlist
                    </div>
                ) : (
                    items.map((video, index) => {
                        const vidId = video?._id || video?.id
                        const isCurrent = vidId === currentVideoId
                        const rawProgress = video?.watchProgress
                        const progress = typeof rawProgress === 'object' && rawProgress !== null
                            ? Number(rawProgress.progress || 0)
                            : Number(rawProgress || 0)

                        return (
                            <Link
                                key={vidId || index}
                                ref={isCurrent ? activeItemRef : null}
                                to={`/watch/${vidId}?list=${playlistId}${isShuffle ? '&shuffle=1' : ''}`}
                                className={`flex items-center gap-2.5 p-2.5 transition-colors group ${
                                    isCurrent
                                        ? 'bg-white/15 border-l-4 border-primary pl-2'
                                        : 'hover:bg-white/5'
                                }`}
                            >
                                {/* Left Indicator: Play icon or Index number */}
                                <div className="w-5 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-zinc-400">
                                    {isCurrent ? (
                                        <Play className="w-3 h-3 fill-white text-white" />
                                    ) : (
                                        <span className="group-hover:text-white transition-colors">{index + 1}</span>
                                    )}
                                </div>

                                {/* Thumbnail */}
                                <div className="relative w-24 aspect-video rounded-lg overflow-hidden bg-black/40 flex-shrink-0 border border-white/5">
                                    <img
                                        src={getMediaUrl(video?.thumbnail)}
                                        alt={video?.title || 'Video'}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                    {video?.duration ? (
                                        <div className="absolute bottom-0.5 right-0.5 bg-black/80 text-[10px] text-white font-medium px-1 rounded">
                                            {formatDuration(video.duration)}
                                        </div>
                                    ) : null}
                                    {progress > 0 && (
                                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/20">
                                            <div className="h-full bg-red-600" style={{ width: `${progress}%` }} />
                                        </div>
                                    )}
                                </div>

                                {/* Metadata */}
                                <div className="min-w-0 flex-1">
                                    <p className={`text-xs font-semibold line-clamp-2 leading-tight ${isCurrent ? 'text-white font-bold' : 'text-zinc-200 group-hover:text-white'}`}>
                                        {video?.title || 'Untitled Video'}
                                    </p>
                                    <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                                        {video?.owner?.username || video?.owner?.fullName || playlist?.owner?.username || 'Channel'}
                                    </p>
                                </div>
                            </Link>
                        )
                    })
                )}
            </div>
        </div>
    )
}
