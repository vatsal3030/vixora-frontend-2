import { X, Keyboard } from 'lucide-react'
import { useEffect } from 'react'

export function KeyboardShortcutsModal({ isOpen, onClose }) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#0f0f0f] border border-white/10 rounded-xl w-full max-w-2xl overflow-hidden shadow-premium transform transition-all scale-100">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Keyboard className="w-5 h-5 text-primary" />
                        Keyboard Shortcuts
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 grid grid-cols-2 gap-x-12 gap-y-4 text-sm">
                    {/* Playback */}
                    <div className="space-y-4">
                        <h3 className="text-base font-semibold text-white mb-2">Playback</h3>
                        <ShortcutItem label="Play / Pause" keys={['Space', 'K']} />
                        <ShortcutItem label="Rewind 5s" keys={['←']} />
                        <ShortcutItem label="Forward 5s" keys={['→']} />
                        <ShortcutItem label="Rewind 10s" keys={['J']} />
                        <ShortcutItem label="Forward 10s" keys={['L']} />
                        <ShortcutItem label="Jump to %" keys={['0-9']} />
                        <ShortcutItem label="Previous Frame" keys={[',']} />
                        <ShortcutItem label="Next Frame" keys={['.']} />
                    </div>

                    {/* Volume & Display */}
                    <div className="space-y-4">
                        <h3 className="text-base font-semibold text-white mb-2">Volume & Display</h3>
                        <ShortcutItem label="Mute / Unmute" keys={['M']} />
                        <ShortcutItem label="Volume Up" keys={['↑']} />
                        <ShortcutItem label="Volume Down" keys={['↓']} />
                        <ShortcutItem label="Fullscreen" keys={['F']} />
                        <ShortcutItem label="PiP Mode" keys={['I']} />
                        <ShortcutItem label="Captions" keys={['C']} />
                    </div>
                </div>

                <div className="p-4 bg-white/5 text-center text-xs text-muted-foreground border-t border-white/10">
                    Press <span className="font-bold text-white">?</span> (Shift + /) at any time to toggle this list
                </div>
            </div>
        </div>
    )
}

function ShortcutItem({ label, keys }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{label}</span>
            <div className="flex gap-1">
                {keys.map((key, idx) => (
                    <kbd key={idx} className="px-2 py-1 bg-white/10 rounded text-xs font-mono min-w-[24px] text-center border border-white/10">
                        {key}
                    </kbd>
                ))}
            </div>
        </div>
    )
}
