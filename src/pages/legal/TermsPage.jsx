import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
    ArrowLeft, Shield, FileText, Lock, ChevronRight, Download,
    Sparkles, CheckCircle2, Trash2, Cpu, Scale, HelpCircle,
    Eye, AlertCircle, Printer, Search
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { BrandLogo } from '../../components/common/BrandLogo'
import { cn } from '../../lib/utils'
import SEO from '../../components/common/SEO'

const LEGAL_SECTIONS = [
    {
        id: 'terms-of-service',
        title: 'Terms of Service',
        subtitle: 'Core Platform Agreement & User Standards',
        icon: Scale,
        badge: 'General',
        color: 'text-rose-500',
        content: [
            {
                heading: '1. Acceptance of Terms',
                body: 'By accessing or utilizing Vixora, including our video streaming infrastructure, creator studio, and native AI capabilities, you enter into a legally binding agreement with Vixora Inc. If you do not agree to these terms, you must refrain from using the platform.'
            },
            {
                heading: '2. User Accounts & Security',
                body: 'You are responsible for safeguarding your authentication credentials, session tokens, and any activity executed under your channel. Vixora employs encrypted HTTP-only session tokens and role-based access control. Promptly notify security@vixora.co.in of any suspected unauthorized access.'
            },
            {
                heading: '3. Streaming & Fair Usage',
                body: 'Vixora provides adaptive multi-bitrate HLS streaming up to 4K 60fps. Automated scrapers, denial-of-service attempts, unauthorized stream ripping, and bulk credential replay attacks are strictly prohibited and result in immediate termination.'
            },
            {
                heading: '4. Termination & Suspension',
                body: 'Vixora reserves the right to suspend or terminate accounts that engage in copyright infringement, malicious behavior, or violation of community guidelines. Suspended users may request a formal appeal via the moderation portal.'
            }
        ]
    },
    {
        id: 'privacy-policy',
        title: 'Privacy & Data Governance',
        subtitle: 'Zero Ad-Tracking & Data Protection',
        icon: Shield,
        badge: 'Privacy',
        color: 'text-emerald-400',
        content: [
            {
                heading: '1. Information We Collect',
                body: 'We collect minimal necessary telemetry: profile information (username, email, avatar), uploaded media metadata, watch history, and playlist curation. We do not sell, rent, or trade your personal data with third-party advertisers.'
            },
            {
                heading: '2. Cookie & Session Storage Policy',
                body: 'Vixora uses secure HTTP-only cookies strictly for authenticated user state, csrf prevention, and personalized video preferences (playback speed, volume levels, theme presets). No invasive cross-site tracking cookies are utilized.'
            },
            {
                heading: '3. Data Retention & Erasure',
                body: 'You may request an export or complete deletion of your account and personal history at any time. When an account is purged, all associated personal identifiers are irrevocably erased from active clusters within 72 hours.'
            },
            {
                heading: '4. International Compliance',
                body: 'Our architecture adheres to global privacy benchmarks including GDPR (EU/EEA) and CCPA (California). Users maintain rights to data access, portability, restriction of processing, and erasure.'
            }
        ]
    },
    {
        id: 'ai-processing',
        title: 'AI & Video Intelligence Policy',
        subtitle: 'Gemini Multi-Tier Engine Transparency',
        icon: Sparkles,
        badge: 'AI Systems',
        color: 'text-primary',
        content: [
            {
                heading: '1. Model Architecture & Pipeline',
                body: 'Vixora operates a multi-tier AI engine powered by Google Gemini (gemini-3.6-flash) combined with high-speed contextual inference. Video transcripts and chat prompts are processed in-flight with sub-second latency to generate summaries, chapter marks, and temporal citations.'
            },
            {
                heading: '2. User Content is NOT Used for Public Model Training',
                body: 'Your private chats, uploaded video transcripts, and viewing questions are strictly utilized for immediate real-time response generation. Vixora does not use your proprietary video content or private prompts to train public foundation models.'
            },
            {
                heading: '3. Accuracy & Hallucination Disclaimers',
                body: 'AI video summaries and conversational responses are synthesized through automated language models. While engineered for high fidelity, AI responses may occasionally misinterpret nuance. Users should verify critical timestamps against original video frames.'
            },
            {
                heading: '4. Daily Quotas & Rate Limits',
                body: 'To ensure democratized access and prevent bot exhaustion, Vixora enforces daily message budgets and token caps per account tier. Fair usage limits automatically replenish every 24 hours UTC.'
            }
        ]
    },
    {
        id: 'creator-ip',
        title: 'Creator IP & Content Rights',
        subtitle: '100% Ownership & Distribution Terms',
        icon: FileText,
        badge: 'Copyright',
        color: 'text-amber-400',
        content: [
            {
                heading: '1. Creators Retain 100% Ownership',
                body: 'You retain full intellectual property ownership of all videos, audio stems, thumbnails, and descriptions you broadcast on Vixora. We assert zero claim of ownership over your creative output.'
            },
            {
                heading: '2. Worldwide Distribution License',
                body: 'By uploading content to Vixora, you grant Vixora a non-exclusive, worldwide, royalty-free license strictly to ingest, transcode (adaptive HLS bitrates), cache, distribute, and display your video to audience members according to your chosen visibility (Public, Unlisted, Private).'
            },
            {
                heading: '3. Digital Millennium Copyright Act (DMCA)',
                body: 'Vixora responds decisively to validated copyright notices conforming to the DMCA. Copyright holders can submit infringement notices with certified proof of rights to dmca@vixora.co.in.'
            },
            {
                heading: '4. Creator Monetization & Revenue',
                body: 'Creators eligible for platform partner programs receive transparent revenue splits calculated from platform subscriptions and creator tipping, with automated monthly payouts and detailed analytics.'
            }
        ]
    },
    {
        id: 'trash-recovery',
        title: '7-Day Trash & Recovery Policy',
        subtitle: 'Soft-Delete Safety Net for Content',
        icon: Trash2,
        badge: 'Data Safety',
        color: 'text-blue-400',
        content: [
            {
                heading: '1. Soft-Delete Protection',
                body: 'To safeguard creators against accidental deletion or unauthorized account breaches, deleted videos are immediately moved to your private Trash vault rather than being permanently destroyed.'
            },
            {
                heading: '2. 7-Day Restoration Window',
                body: 'Videos in the Trash vault remain fully restorable with all associated likes, comments, and analytics intact for exactly 7 calendar days (168 hours). You can restore any video with one click from Your Channel Studio -> Trash.'
            },
            {
                heading: '3. Automated Permanent Pruning',
                body: 'After the 7-day grace period concludes, Vixora\'s automated background worker permanently and irrevocably purges the video files, HLS manifests, and Cloudinary media assets from cloud storage.'
            },
            {
                heading: '4. Immediate Manual Purge',
                body: 'Creators who explicitly require immediate and permanent removal for legal or privacy reasons can select "Delete Forever" inside the Trash vault, bypassing the 7-day safety period.'
            }
        ]
    },
    {
        id: 'community-guidelines',
        title: 'Community Guidelines & Safety',
        subtitle: 'Fostering Constructive, Safe Discussions',
        icon: Lock,
        badge: 'Safety',
        color: 'text-violet-400',
        content: [
            {
                heading: '1. Harassment & Hate Speech',
                body: 'Targeted harassment, hate speech directed at protected characteristics, incitement to violence, and malicious doxxing are met with zero tolerance and immediate account termination.'
            },
            {
                heading: '2. Spam, Deceptive Practices & Bot Manipulation',
                body: 'Artificially inflating view counts, subscribers, likes, or comments through bot networks or click farms is strictly prohibited. Recursive comment threads must remain constructive and genuine.'
            },
            {
                heading: '3. Sensitive & Explicit Content',
                body: 'Sexually explicit material, non-consensual imagery, and extreme gore are strictly disallowed. Age-restricted and mature content must be accurately flagged during the video upload workflow.'
            }
        ]
    }
]

export default function TermsPage() {
    const [activeTab, setActiveTab] = useState('terms-of-service')
    const [searchQuery, setSearchQuery] = useState('')

    // Set document title
    useEffect(() => {
        document.title = 'Vixora Legal Center - Terms, Privacy & AI Governance'
    }, [])

    const handlePrint = () => {
        window.print()
    }

    const filteredSections = LEGAL_SECTIONS.filter(section => {
        if (!searchQuery.trim()) return true
        const query = searchQuery.toLowerCase()
        return (
            section.title.toLowerCase().includes(query) ||
            section.subtitle.toLowerCase().includes(query) ||
            section.content.some(c => c.heading.toLowerCase().includes(query) || c.body.toLowerCase().includes(query))
        )
    })

    const currentSection = LEGAL_SECTIONS.find(s => s.id === activeTab) || LEGAL_SECTIONS[0]

    return (
        <div className="min-h-screen bg-[#050507] text-[#f7f8f8] selection:bg-primary/30 font-sans relative overflow-x-hidden">
            <SEO
                title="Terms of Service, Privacy & AI Governance"
                description="Official legal policies governing Vixora streaming services, creator IP ownership, privacy standards, 7-day trash recovery, and Gemini AI processing rules."
                keywords="Vixora terms, Vixora privacy policy, Vixora AI policy, creator IP rights, DMCA, streaming agreement"
                url="https://app.vixora.co.in/terms"
            />
            {/* Ambient Background Backlights (Hidden on Print) */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden print:hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-primary/15 via-red-600/5 to-transparent rounded-full blur-[140px]" />
                <div className="absolute top-[45%] -right-48 w-[600px] h-[600px] bg-red-600/5 rounded-full blur-[160px]" />
                <div className="absolute top-[75%] -left-48 w-[600px] h-[600px] bg-emerald-600/5 rounded-full blur-[160px]" />
            </div>

            {/* PRINT-ONLY OFFICIAL LEGAL HEADER */}
            <div className="hidden print:block p-8 border-b-2 border-black text-black">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h1 className="text-2xl font-bold font-serif tracking-tight">VIXORA PLATFORM LEGAL SPECIFICATION</h1>
                        <p className="text-xs text-gray-600 mt-1">Official Terms of Service, Privacy Charter & Native AI Governance</p>
                    </div>
                    <div className="text-right text-xs font-mono text-gray-500">
                        <p>Document Ref: VX-LEGAL-2026</p>
                        <p>Effective Date: September 2026</p>
                        <p>Status: Production Certified</p>
                    </div>
                </div>
            </div>

            {/* SCREEN NAVIGATION HEADER (Hidden on Print) */}
            <header className="sticky top-0 z-50 backdrop-blur-2xl bg-[#050507]/80 print:hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3 group">
                        <BrandLogo size="md" className="group-hover:scale-105 transition-transform duration-300" />
                        <span className="font-display font-bold text-xl tracking-tight text-white">
                            Vixora
                        </span>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-muted-foreground ml-1">
                            Legal Center
                        </span>
                    </Link>

                    <div className="flex items-center gap-3">
                        <Button
                            onClick={handlePrint}
                            className="bg-white/10 hover:bg-white/15 text-white border border-white/10 rounded-full px-4 py-2 text-xs font-medium flex items-center gap-2 transition-all hover:scale-[1.02] shadow-sm"
                        >
                            <Download className="w-3.5 h-3.5 text-primary" />
                            Download PDF / Print
                        </Button>
                        <Link to="/">
                            <Button
                                variant="outline"
                                className="border-white/10 hover:border-white/20 bg-transparent text-white rounded-full px-4 py-2 text-xs font-medium"
                            >
                                Back to Vixora
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT WRAPPER */}
            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-24 print:p-0 print:m-0">
                {/* HERO BANNER (Hidden on Print) */}
                <div className="text-center max-w-3xl mx-auto mb-12 print:hidden">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-4">
                        <Shield className="w-3.5 h-3.5" />
                        Updated for 2026 Production Standards
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-display font-bold tracking-tight text-white leading-tight">
                        Terms, Privacy & <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-red-400 to-rose-300">
                            AI Intelligence Governance
                        </span>
                    </h1>
                    <p className="text-sm sm:text-base text-[#8a8f98] mt-4 leading-relaxed">
                        Clear, transparent, and developer-grade legal principles governing Vixora streaming, native AI models, creator ownership, and user data rights.
                    </p>

                    {/* Quick Search */}
                    <div className="mt-6 relative max-w-md mx-auto">
                        <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search policies (e.g. AI, copyright, trash, privacy)..."
                            className="w-full h-10 pl-10 pr-4 rounded-full bg-white/[0.03] border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                    </div>
                </div>

                {/* TWO-COLUMN LAYOUT: TABS / SIDEBAR (LEFT) + ACTIVE POLICY DOCUMENT (RIGHT) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* LEFT SIDEBAR: SECTIONS LIST (Screen only) */}
                    <aside className="lg:col-span-4 space-y-2 print:hidden sticky top-24">
                        <div className="p-2 rounded-2xl bg-[#0b0c0e] border border-white/10 shadow-xl space-y-1">
                            <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-[#8a8f98] font-semibold flex items-center justify-between">
                                <span>Policy Modules</span>
                                <span>{filteredSections.length} Articles</span>
                            </div>

                            {filteredSections.map((sec) => {
                                const Icon = sec.icon
                                const isActive = activeTab === sec.id
                                return (
                                    <button
                                        key={sec.id}
                                        onClick={() => setActiveTab(sec.id)}
                                        className={cn(
                                            "w-full text-left px-3.5 py-3 rounded-xl text-xs transition-all flex items-center gap-3 relative group",
                                            isActive
                                                ? "bg-white/10 text-white font-semibold shadow-inner border border-white/10"
                                                : "text-[#8a8f98] hover:text-white hover:bg-white/[0.04] border border-transparent"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                                            isActive ? "bg-primary/20 text-primary" : "bg-white/5 text-zinc-400 group-hover:text-white"
                                        )}>
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <span className="truncate">{sec.title}</span>
                                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-zinc-400 border border-white/5">
                                                    {sec.badge}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-zinc-500 truncate mt-0.5">{sec.subtitle}</p>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>

                        {/* PDF Quick Download Box */}
                        <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/10 via-[#0b0c0e] to-[#0b0c0e] border border-primary/20 space-y-3">
                            <div className="flex items-center gap-2 text-white text-xs font-semibold">
                                <Printer className="w-4 h-4 text-primary" />
                                <span>Official Legal Copy</span>
                            </div>
                            <p className="text-[11px] text-[#8a8f98] leading-relaxed">
                                Need an offline PDF for compliance or legal review? Export the entire authenticated document bundle formatted for printing.
                            </p>
                            <Button
                                onClick={handlePrint}
                                size="sm"
                                className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                            >
                                <Download className="w-3.5 h-3.5" />
                                Export Legal PDF
                            </Button>
                        </div>
                    </aside>

                    {/* RIGHT CONTENT AREA: DOCUMENT READER (Screen + Print) */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Print Mode: Render ALL sections sequentially */}
                        <div className="hidden print:block space-y-8 text-black font-serif">
                            {LEGAL_SECTIONS.map((sec, idx) => (
                                <div key={sec.id} className="pb-6 border-b border-gray-300 page-break-inside-avoid">
                                    <h2 className="text-xl font-bold tracking-tight mb-1 text-black font-sans">
                                        Section {idx + 1}: {sec.title}
                                    </h2>
                                    <p className="text-xs text-gray-500 mb-4 font-sans uppercase tracking-wider">{sec.subtitle}</p>
                                    <div className="space-y-4 text-sm leading-relaxed text-gray-800">
                                        {sec.content.map((item, cIdx) => (
                                            <div key={cIdx}>
                                                <h3 className="font-semibold text-gray-900 font-sans text-sm mb-1">{item.heading}</h3>
                                                <p className="text-xs text-gray-700 leading-normal">{item.body}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Screen Mode: Render Active Policy Module with rich dark glass styling */}
                        <div className="print:hidden">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentSection.id}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -12 }}
                                    transition={{ duration: 0.25 }}
                                    className="rounded-3xl bg-[#0b0c0e] border border-white/10 p-6 sm:p-10 shadow-2xl relative overflow-hidden"
                                >
                                    {/* Top ambient highlight */}
                                    <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

                                    {/* Section Header */}
                                    <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
                                                <currentSection.icon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h2 className="text-2xl font-bold font-display tracking-tight text-white">
                                                        {currentSection.title}
                                                    </h2>
                                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-primary border border-primary/20">
                                                        {currentSection.badge}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-[#8a8f98] mt-0.5">{currentSection.subtitle}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-xs font-mono text-[#8a8f98]">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                            <span>Active Governance</span>
                                        </div>
                                    </div>

                                    {/* Clauses / Content Body */}
                                    <div className="mt-8 space-y-6">
                                        {currentSection.content.map((item, idx) => (
                                            <div
                                                key={idx}
                                                className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
                                            >
                                                <h3 className="text-sm font-bold text-white tracking-wide mb-2 flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                    {item.heading}
                                                </h3>
                                                <p className="text-xs sm:text-sm text-[#d0d6e0] leading-relaxed font-light">
                                                    {item.body}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Key Highlight Banner */}
                                    <div className="mt-8 p-4 rounded-2xl bg-gradient-to-r from-primary/15 via-primary/5 to-transparent border border-primary/20 flex items-start gap-3">
                                        <AlertCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                        <div className="text-xs text-[#d0d6e0] leading-relaxed">
                                            <strong className="text-white">Continuous Compliance Guarantee:</strong> Vixora undergoes periodic security and privacy audits. Any material updates to this policy are notified via in-app broadcast alerts 14 days prior to implementation.
                                        </div>
                                    </div>

                                    {/* Footer / Navigation Next Section */}
                                    <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-between text-xs text-[#8a8f98]">
                                        <span>Last revised: September 2026</span>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={handlePrint}
                                                className="hover:text-white flex items-center gap-1.5 transition-colors"
                                            >
                                                <Printer className="w-3.5 h-3.5" /> Print Article
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </main>

            {/* PRINT MEDIA STYLES */}
            <style>{`
                @media print {
                    body {
                        background: white !important;
                        color: black !important;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                    .print\\:block {
                        display: block !important;
                    }
                    .page-break-inside-avoid {
                        page-break-inside: avoid;
                    }
                }
            `}</style>
        </div>
    )
}
