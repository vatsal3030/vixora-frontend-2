import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '../ui/Dialog'
import { Button } from '../ui/Button'
import { Copy, Check, Facebook, Twitter, MessageCircle, Mail, Linkedin, X } from 'lucide-react'
import { toast } from 'sonner'

// Custom SVG Icons
const WhatsAppIcon = ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
)

const XTwitterIcon = ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
)

const RedditIcon = ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
    </svg>
)

const TelegramIcon = ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.832.942z" />
    </svg>
)

export function ShareDialog({ title, url, trigger, children, open: controlledOpen, onOpenChange: controlledOnOpenChange }) {
    const [internalOpen, setInternalOpen] = useState(false)
    const [copied, setCopied] = useState(false)

    const isControlled = controlledOpen !== undefined
    const open = isControlled ? controlledOpen : internalOpen
    const setOpen = isControlled ? controlledOnOpenChange : setInternalOpen

    const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '')
    const shareTitle = title || (typeof document !== 'undefined' ? document.title : 'Check this out on Vixora!')

    const copyToClipboard = async () => {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(shareUrl)
            } else {
                const textArea = document.createElement("textarea")
                textArea.value = shareUrl
                document.body.appendChild(textArea)
                textArea.focus()
                textArea.select()
                document.execCommand('copy')
                document.body.removeChild(textArea)
            }
            setCopied(true)
            toast.success('Link copied to clipboard!')
            setTimeout(() => setCopied(false), 2500)
        } catch {
            toast.error('Failed to copy link')
        }
    }

    const socialNetworks = [
        {
            name: 'WhatsApp',
            icon: WhatsAppIcon,
            bg: 'bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-black border-[#25D366]/20',
            url: `https://wa.me/?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`
        },
        {
            name: 'Facebook',
            icon: Facebook,
            bg: 'bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2] hover:text-white border-[#1877F2]/20',
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
        },
        {
            name: 'Twitter',
            icon: XTwitterIcon,
            bg: 'bg-white/10 text-white hover:bg-white hover:text-black border-white/20',
            url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`
        },
        {
            name: 'Reddit',
            icon: RedditIcon,
            bg: 'bg-[#FF4500]/10 text-[#FF4500] hover:bg-[#FF4500] hover:text-white border-[#FF4500]/20',
            url: `https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}`
        },
        {
            name: 'LinkedIn',
            icon: Linkedin,
            bg: 'bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2] hover:text-white border-[#0A66C2]/20',
            url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
        },
        {
            name: 'Telegram',
            icon: TelegramIcon,
            bg: 'bg-[#229ED9]/10 text-[#229ED9] hover:bg-[#229ED9] hover:text-white border-[#229ED9]/20',
            url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`
        },
        {
            name: 'Email',
            icon: Mail,
            bg: 'bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-black border-amber-500/20',
            url: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareUrl)}`
        }
    ]

    const handleShareClick = (networkUrl) => {
        window.open(networkUrl, '_blank', 'width=600,height=450,noopener,noreferrer')
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {(trigger || children) && (
                <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true); }} className="inline-block cursor-pointer">
                    {trigger || children}
                </div>
            )}

            <DialogContent hideClose className="w-[92vw] max-w-[460px] bg-[#1a1a1a]/95 border border-white/10 text-white rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-2xl overflow-hidden">
                {/* Header */}
                <DialogHeader className="p-0 mb-4 sm:mb-5">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-lg sm:text-xl font-bold font-display text-white">Share</DialogTitle>
                        <button
                            onClick={() => setOpen(false)}
                            className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <DialogDescription className="text-zinc-400 text-xs sm:text-sm mt-1 text-left">
                        Share this video with your friends and community.
                    </DialogDescription>
                </DialogHeader>

                {/* Social Networks List (Matching Photo 1) */}
                <div className="space-y-4 sm:space-y-5">
                    <div>
                        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2.5 text-left">
                            SOCIAL NETWORKS
                        </span>
                        <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-white/10">
                            {socialNetworks.map((net) => {
                                const Icon = net.icon
                                return (
                                    <button
                                        key={net.name}
                                        onClick={() => handleShareClick(net.url)}
                                        className="flex flex-col items-center gap-1.5 group shrink-0 w-[58px] sm:w-[62px] transition-transform active:scale-95"
                                    >
                                        <div className={`w-12 h-12 sm:w-13 sm:h-13 rounded-full flex items-center justify-center border transition-all duration-200 shadow-md ${net.bg}`}>
                                            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                                        </div>
                                        <span className="text-[10px] sm:text-[11px] font-medium text-zinc-300 group-hover:text-white transition-colors truncate text-center w-full">
                                            {net.name}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Page Link Field */}
                    <div>
                        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2 text-left">
                            PAGE LINK
                        </span>
                        <div className="flex items-center gap-2 bg-[#121212] border border-white/10 rounded-2xl p-1.5 pl-3.5 w-full overflow-hidden focus-within:border-primary/50 transition-all">
                            <input
                                type="text"
                                readOnly
                                value={shareUrl}
                                onClick={(e) => e.target.select()}
                                className="bg-transparent text-xs sm:text-sm text-zinc-200 font-mono flex-1 min-w-0 outline-none truncate select-all"
                            />
                            <Button
                                onClick={copyToClipboard}
                                size="sm"
                                className={`rounded-xl px-3.5 sm:px-4 font-semibold text-xs h-8 sm:h-9 transition-all shrink-0 ${
                                    copied
                                        ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-600/30'
                                        : 'bg-primary hover:bg-primary/90 text-white shadow-md'
                                }`}
                            >
                                {copied ? (
                                    <span className="flex items-center gap-1">
                                        <Check className="w-3.5 h-3.5" />
                                        Copied
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1">
                                        <Copy className="w-3.5 h-3.5" />
                                        Copy
                                    </span>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
export default ShareDialog
