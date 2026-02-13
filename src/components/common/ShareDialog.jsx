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
            color: 'bg-green-500 hover:bg-green-600',
            url: `https://wa.me/?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`
        },
        {
            name: 'Facebook',
            icon: Facebook,
            color: 'bg-blue-600 hover:bg-blue-700',
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
        },
        {
            name: 'Twitter',
            icon: Twitter,
            color: 'bg-sky-500 hover:bg-sky-600',
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
            {trigger ? (
                <div onClick={() => setOpen(true)}>
                    {trigger}
                </div>
            ) : (
                children && <div onClick={() => setOpen(true)}>{children}</div>
            )}

            <DialogContent className="sm:max-w-md bg-[#1f1f1f] border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle>Share</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Share this video with others
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-2">
                    {/* Social Share Buttons */}
                    <div className="grid grid-cols-3 gap-3">
                        {shareOptions.map((option) => (
                            <button
                                key={option.name}
                                onClick={() => handleShare(option)}
                                className={`${option.color} text-white p-4 rounded-xl flex flex-col items-center gap-2 transition-transform hover:scale-105 active:scale-95`}
                            >
                                <option.icon className="w-6 h-6" />
                                <span className="text-xs font-semibold">{option.name}</span>
                            </button>
                        ))}
                    </div>

                    {/* Native Share (if available) */}
                    {navigator.share && (
                        <Button
                            onClick={handleNativeShare}
                            variant="outline"
                            className="w-full border-white/10 hover:bg-white/5 text-white"
                        >
                            <Link2 className="w-4 h-4 mr-2" />
                            More share options
                        </Button>
                    )}

                    {/* Copy Link */}
                    <div className="group relative">
                        <div className="flex items-center space-x-2 bg-black/40 border border-white/10 rounded-xl p-1.5 pl-4 focus-within:border-blue-500/50 transition-colors">
                            <div className="flex-1 text-sm text-gray-300 truncate font-mono select-all">
                                {shareUrl}
                            </div>
                            <Button
                                onClick={copyToClipboard}
                                size="sm"
                                className={`flex-shrink-0 rounded-lg px-4 transition-all duration-300 ${copied ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                            >
                                {copied ? (
                                    <Check className="w-4 h-4" />
                                ) : (
                                    <>
                                        <span className="font-medium mr-2">Copy</span>
                                        <Copy className="w-4 h-4" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
