import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Flag, Loader2 } from 'lucide-react'
import { feedbackService } from '../../services/api'
import { toast } from 'sonner'

const REPORT_TARGET_TYPES = ['VIDEO', 'COMMENT', 'USER', 'CHANNEL']

const REPORT_REASONS = {
    VIDEO: [
        'Spam or misleading',
        'Hateful or abusive content',
        'Violence or dangerous content',
        'Sexual content',
        'Copyright infringement',
        'Privacy violation',
        'Other',
    ],
    COMMENT: [
        'Spam or misleading',
        'Hateful or abusive content',
        'Harassment',
        'Other',
    ],
    USER: [
        'Spam or bot',
        'Impersonation',
        'Harassment',
        'Other',
    ],
    CHANNEL: [
        'Spam or misleading',
        'Hateful or abusive content',
        'Copyright infringement',
        'Other',
    ],
}

const OVERLAY_STYLE = {
    background: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(8px)',
}
const PANEL_STYLE = {
    background: 'rgba(16, 16, 22, 0.9)',
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
}

export function ReportDialog({ targetType = 'VIDEO', targetId, trigger }) {
    const [isOpen, setIsOpen] = useState(false)
    const [reason, setReason] = useState('')
    const [description, setDescription] = useState('')

    const reasons = REPORT_REASONS[targetType] || REPORT_REASONS.VIDEO

    const mutation = useMutation({
        mutationFn: () => feedbackService.report({ targetType, targetId, reason, description: description || undefined }),
        onSuccess: () => {
            toast.success('Report submitted. Thank you for helping keep Vixora safe.')
            setIsOpen(false)
            setReason('')
            setDescription('')
        },
        onError: (err) => {
            if (err?.response?.status === 429) {
                toast.error('You have already reported this content.')
            } else {
                toast.error('Failed to submit report. Please try again.')
            }
        }
    })

    const handleOpen = (e) => {
        e?.preventDefault()
        e?.stopPropagation()
        setIsOpen(true)
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!reason) { toast.error('Please select a reason.'); return }
        mutation.mutate()
    }

    return (
        <>
            {/* Trigger element */}
            <span onClick={handleOpen}>{trigger}</span>

            {/* Modal overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-[200] flex items-center justify-center p-4"
                    style={OVERLAY_STYLE}
                    onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false) }}
                >
                    <div
                        className="w-full max-w-md rounded-2xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden"
                        style={PANEL_STYLE}
                    >
                        {/* Header */}
                        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/8">
                            <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                                <Flag className="w-4 h-4 text-orange-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-sm">Report {targetType.charAt(0) + targetType.slice(1).toLowerCase()}</h3>
                                <p className="text-[11px] text-muted-foreground">Help us understand the problem</p>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Reason</label>
                                <div className="grid gap-2">
                                    {reasons.map(r => (
                                        <button
                                            key={r}
                                            type="button"
                                            onClick={() => setReason(r)}
                                            className={`w-full text-left text-sm px-3.5 py-2.5 rounded-xl border transition-all ${reason === r
                                                    ? 'bg-primary/20 border-primary/50 text-white'
                                                    : 'bg-white/4 border-white/8 text-gray-300 hover:bg-white/8'
                                                }`}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                    Additional details <span className="normal-case font-normal">(optional)</span>
                                </label>
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="Tell us more..."
                                    rows={3}
                                    maxLength={500}
                                    className="w-full resize-none text-sm bg-white/6 border border-white/12 text-white rounded-xl px-3.5 py-2.5 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 leading-relaxed"
                                />
                            </div>

                            <div className="flex gap-3 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="flex-1 py-2.5 rounded-xl bg-white/8 hover:bg-white/12 text-sm text-gray-300 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!reason || mutation.isPending}
                                    className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                                >
                                    {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {mutation.isPending ? 'Submitting…' : 'Report'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
