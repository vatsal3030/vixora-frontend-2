
import { useState } from 'react'
import { cn } from '../../lib/utils'

export default function VideoDescription({ description, views, timestamp }) {
    const [isExpanded, setIsExpanded] = useState(false)

    return (
        <div
            className={cn(
                "bg-gray-800/50 rounded-xl p-4 cursor-pointer hover:bg-gray-800/70 transition-colors",
                isExpanded ? "h-auto" : "h-[100px] overflow-hidden relative"
            )}
            onClick={() => setIsExpanded(!isExpanded)}
        >
            <div className="flex gap-2 font-medium text-sm mb-2">
                <span>{views} views</span>
                <span>{timestamp}</span>
            </div>

            <div className={cn(
                "text-sm text-gray-200 whitespace-pre-wrap leading-relaxed",
                !isExpanded && "line-clamp-2"
            )}>
                {description || "No description available."}
            </div>

            {!isExpanded && (
                <div className="absolute bottom-0 left-0 right-0 h-1/2 p-4 flex items-end font-medium text-sm">
                    Show more
                </div>
            )}

            {isExpanded && (
                <button
                    className="mt-4 font-medium text-sm text-gray-400 hover:text-white"
                    onClick={(e) => {
                        e.stopPropagation()
                        setIsExpanded(false)
                    }}
                >
                    Show less
                </button>
            )}
        </div>
    )
}
