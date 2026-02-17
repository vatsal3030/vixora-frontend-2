import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '../ui/Dialog'
import { Button } from '../ui/Button'
import { Copy, Check, Facebook, Twitter, MessageCircle, Link2 } from 'lucide-react'
import { toast } from 'sonner'

export function ShareDialog({ title, url, trigger, children }) {
    const [open, setOpen] = useState(false)
    const [copied, setCopied] = useState(false)

    const shareUrl = url || window.location.href
    const shareTitle = title || document.title

    const copyToClipboard = async () => {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(shareUrl)
                setCopied(true)
                toast.success('Link copied to clipboard!')
            } else {
                // Fallback
                const textArea = document.createElement("textarea");
                textArea.value = shareUrl;
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                try {
                    document.execCommand('copy');
                    setCopied(true)
                    toast.success('Link copied to clipboard!')
                } catch {
                    throw new Error('Fallback copy failed')
                }
                document.body.removeChild(textArea);
            }
            setTimeout(() => setCopied(false), 2000)
        } catch {
            console.error('Copy failed')
            toast.error('Failed to copy link')
        }
    }

    const shareOptions = [
        {
            name: 'WhatsApp',
            icon: MessageCircle,
            color: 'hover:text-green-400 hover:border-green-500/30 hover:bg-green-500/10',
            url: `https://wa.me/?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`
        },
        {
            name: 'Facebook',
            icon: Facebook,
            color: 'hover:text-blue-400 hover:border-blue-500/30 hover:bg-blue-500/10',
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
        },
        {
            name: 'Twitter',
            icon: Twitter,
            color: 'hover:text-sky-400 hover:border-sky-500/30 hover:bg-sky-500/10',
            url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`
        }
    ]

    const handleShare = (option) => {
        window.open(option.url, '_blank', 'width=600,height=400')
    }

    // Use web share API if available
    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: shareTitle,
                    url: shareUrl
                })
            } catch {
                // User cancelled or error occurred
            }
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {/* Trigger remains same, just ensure it doesn't break layout */}
            <div onClick={() => setOpen(true)} className="contents">
                {trigger || children}
            </div>

            <DialogContent className="sm:max-w-md glass-panel border-white/5 text-foreground shadow-2xl bg-black/40 backdrop-blur-xl p-0 overflow-hidden gap-0">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="text-xl font-bold font-display">Share</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Share this video with your friends and community.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6 space-y-6">
                    {/* Social Share Buttons */}
                    <div className="grid grid-cols-3 gap-3">
                        {shareOptions.map((option) => (
                            <button
                                key={option.name}
                                onClick={() => handleShare(option)}
                                className={`glass-btn p-4 rounded-xl flex flex-col items-center gap-3 transition-all duration-300 group hover:scale-[1.02] border border-white/5 ${option.color}`}
                            >
                                <div className="p-3 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                                    <option.icon className="w-6 h-6 transition-transform group-hover:scale-110 duration-300" />
                                </div>
                                <span className="text-xs font-semibold tracking-wide">{option.name}</span>
                            </button>
                        ))}
                    </div>

                    {/* Native Share (if available) */}
                    {navigator.share && (
                        <Button
                            onClick={handleNativeShare}
                            variant="outline"
                            className="w-full glass-btn border-white/5 hover:bg-white/5 text-foreground h-12 rounded-xl"
                        >
                            <Link2 className="w-4 h-4 mr-2" />
                            More share options
                        </Button>
                    )}

                    {/* Copy Link */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider ml-1">Page Link</label>
                        <div className="flex items-center gap-2 glass-input rounded-xl p-1.5 pl-3 focus-within:ring-2 focus-within:ring-primary/20 transition-all border border-white/5 bg-white/5">
                            <div className="flex-1 text-sm text-foreground/80 truncate font-mono select-all">
                                {shareUrl}
                            </div>
                            <Button
                                onClick={copyToClipboard}
                                size="sm"
                                className={`flex-shrink-0 rounded-lg px-4 h-9 shadow-lg transition-all duration-300 ${copied ? 'bg-green-500/20 text-green-500 border border-green-500/20' : 'bg-primary text-primary-foreground shadow-primary/25'}`}
                            >
                                {copied ? (
                                    <div className="flex items-center gap-2">
                                        <Check className="w-3.5 h-3.5" />
                                        <span className="text-xs font-bold">Copied</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Copy className="w-3.5 h-3.5" />
                                        <span className="text-xs font-bold">Copy</span>
                                    </div>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
