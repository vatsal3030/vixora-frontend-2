import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '../ui/Dialog'
import { Button } from '../ui/Button'
import { Copy, Check, Facebook, Twitter, MessageCircle, Mail, Linkedin, MoreHorizontal, X } from 'lucide-react'
import { toast } from 'sonner'

// Simple SVG icons for missing Lucide ones
const RedditIcon = ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
    </svg>
)

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

    const canShare = typeof navigator !== 'undefined' && navigator.share

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
        },
        {
            name: 'Reddit',
            icon: RedditIcon,
            color: 'hover:text-orange-500 hover:border-orange-500/30 hover:bg-orange-500/10',
            url: `https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}`
        },
        {
            name: 'LinkedIn',
            icon: Linkedin,
            color: 'hover:text-blue-600 hover:border-blue-600/30 hover:bg-blue-600/10',
            url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
        },
        {
            name: 'Email',
            icon: Mail,
            color: 'hover:text-gray-400 hover:border-gray-500/30 hover:bg-gray-500/10',
            url: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareUrl)}`
        }
    ]

    const handleShare = (option) => {
        window.open(option.url, '_blank', 'width=600,height=400')
    }

    const handleNativeShare = async () => {
        if (canShare) {
            try {
                await navigator.share({
                    title: shareTitle,
                    url: shareUrl
                })
            } catch {
                // User cancelled
            }
        } else {
            toast.error("Sharing is not supported on this device/browser.")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <div onClick={() => setOpen(true)} className="contents">
                {trigger || children}
            </div>

            <DialogContent hideClose className="w-[92vw] max-w-md sm:max-w-[480px] max-h-[85vh] overflow-y-auto glass-panel border-white/10 text-foreground shadow-premium bg-[#1a1a1a]/95 backdrop-blur-xl p-0 gap-0 rounded-2xl sm:rounded-3xl">
                {/* Header */}
                <DialogHeader className="p-5 pb-3">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-lg font-bold font-display">Share</DialogTitle>
                        <button
                            onClick={() => setOpen(false)}
                            className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-muted-foreground hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <DialogDescription className="text-muted-foreground text-sm mt-1">
                        Share this video with your friends and community.
                    </DialogDescription>
                </DialogHeader>

                <div className="px-5 pb-5 space-y-5">
                    {/* Social Share Buttons — responsive grid */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Social Networks</label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                            {shareOptions.map((option) => (
                                <button
                                    key={option.name}
                                    onClick={() => handleShare(option)}
                                    className="flex flex-col items-center gap-2 group transition-all duration-200 py-2"
                                >
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-white/[0.06] border border-white/10 group-hover:scale-110 transition-all duration-200 ${option.color}`}>
                                        <option.icon className="w-5 h-5" />
                                    </div>
                                    <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">{option.name}</span>
                                </button>
                            ))}

                            {canShare && (
                                <button
                                    onClick={handleNativeShare}
                                    className="flex flex-col items-center gap-2 group transition-all duration-200 py-2"
                                >
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white/[0.06] border border-white/10 group-hover:bg-white/10 group-hover:scale-110 transition-all duration-200">
                                        <MoreHorizontal className="w-5 h-5 text-foreground" />
                                    </div>
                                    <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">More</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Page Link */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Page Link</label>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 min-w-0 rounded-xl px-3 py-2.5 text-sm text-muted-foreground font-mono truncate border border-white/10 bg-white/[0.03] select-all overflow-hidden">
                                {shareUrl}
                            </div>
                            <Button
                                onClick={copyToClipboard}
                                className={`h-10 px-4 rounded-xl font-medium transition-all duration-200 shrink-0 ${copied
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/20 hover:bg-green-500/30'
                                    : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}
                            >
                                {copied ? (
                                    <div className="flex items-center gap-1.5">
                                        <Check className="w-4 h-4" />
                                        <span className="text-sm">Copied</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5">
                                        <Copy className="w-4 h-4" />
                                        <span className="text-sm">Copy</span>
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
