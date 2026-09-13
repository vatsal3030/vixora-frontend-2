import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Sparkles, Play, Pause, Shield, Zap, Video, Users, ArrowRight,
    CheckCircle2, Compass, MessageSquare, BarChart3, Clock,
    Share2, Layers, Cpu, ChevronRight, Lock, Terminal, Activity,
    Sliders, Smartphone, Film, Eye, Flame, Check, CornerDownRight,
    Command, RefreshCw, Volume2, VolumeX, Maximize2, Radio
} from 'lucide-react'
import { BrandLogo } from '../components/common/BrandLogo'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import SEO from '../components/common/SEO'

export default function LandingPage() {
    useDocumentTitle('Vixora - Cinematic Video Streaming & Native Creator AI')
    const { user } = useAuth()
    const navigate = useNavigate()

    // Interactive Hero State
    const videoRef = useRef(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isMuted, setIsMuted] = useState(true)
    const [videoProgress, setVideoProgress] = useState(25)
    const [currentTimeStr, setCurrentTimeStr] = useState('01:24')
    const [durationStr, setDurationStr] = useState('12:14')
    const [activePromptIndex, setActivePromptIndex] = useState(0)
    const [aspectRatio, setAspectRatio] = useState('16:9')
    const [playgroundQuery, setPlaygroundQuery] = useState('')
    const [playgroundResult, setPlaygroundResult] = useState(null)
    const [isGenerating, setIsGenerating] = useState(false)

    const togglePlay = () => {
        if (!videoRef.current) return
        if (isPlaying) {
            videoRef.current.pause()
            setIsPlaying(false)
        } else {
            videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {})
        }
    }

    const toggleMute = (e) => {
        e?.stopPropagation()
        if (!videoRef.current) return
        videoRef.current.muted = !isMuted
        setIsMuted(!isMuted)
    }

    const formatTime = (secs) => {
        if (!Number.isFinite(secs) || secs < 0) return '00:00'
        const m = Math.floor(secs / 60)
        const s = Math.floor(secs % 60)
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    }

    const handleTimeUpdate = () => {
        if (!videoRef.current) return
        const current = videoRef.current.currentTime
        const total = videoRef.current.duration || 1
        setVideoProgress((current / total) * 100)
        setCurrentTimeStr(formatTime(current))
        if (Number.isFinite(total) && total > 0) {
            setDurationStr(formatTime(total))
        }
    }

    const handleScrub = (e) => {
        if (!videoRef.current) return
        const rect = e.currentTarget.getBoundingClientRect()
        const clickX = e.clientX - rect.left
        const percent = Math.max(0, Math.min(1, clickX / rect.width))
        const total = videoRef.current.duration || 1
        videoRef.current.currentTime = percent * total
        setVideoProgress(percent * 100)
    }

    const handleJumpToTimestamp = (timeStr) => {
        if (!videoRef.current) return
        const parts = timeStr.split(':')
        if (parts.length === 2) {
            const secs = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10)
            videoRef.current.currentTime = secs
            if (!isPlaying) {
                videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {})
            }
        }
    }

    const heroAiPrompts = [
        {
            title: 'Summarize 4K Keynote',
            query: 'What are the 3 biggest technical takeaways from this keynote?',
            response: {
                title: 'Keynote Synthesis: Next-Gen Video Streaming',
                keyTakeaways: [
                    { time: '01:24', text: 'HLS adaptive multi-bitrate pipeline achieves sub-400ms startup latency across cellular networks.' },
                    { time: '04:15', text: 'Multi-tier LLM intelligence analyzes complete video transcripts without RAG overhead.' },
                    { time: '08:50', text: 'Recursive comment trees scale to 10+ levels of nesting with zero layout jitter.' }
                ],
                insight: 'The platform prioritizes client-side fluidity by combining GPU-accelerated canvas rendering with predictive chunk prefetching.'
            }
        },
        {
            title: 'Extract Timestamps',
            query: 'Generate structured timestamps with chapter titles for video indexing.',
            response: {
                title: 'Automatic Chapter Indexing',
                keyTakeaways: [
                    { time: '00:00', text: 'Introduction & Platform Vision' },
                    { time: '02:18', text: 'Liquid Glass Design Architecture' },
                    { time: '05:40', text: 'Creator Aspect Cropping & Shorts Engine' },
                    { time: '09:12', text: 'Super Admin Governance & Audit Streams' }
                ],
                insight: 'Each timestamp links directly to the exact frame offset with instant scrubber alignment.'
            }
        },
        {
            title: 'Actionable Insights',
            query: 'Extract practical steps creators can apply immediately to boost audience engagement.',
            response: {
                title: 'Creator Strategy Recommendations',
                keyTakeaways: [
                    { time: '03:10', text: 'Repurpose high-retention 16:9 sections into vertical 9:16 Shorts within 2 clicks.' },
                    { time: '06:45', text: 'Engage in nested discussion threads to increase viewer community retention by 42%.' },
                    { time: '11:20', text: 'Utilize AI-generated descriptions and tags to maximize search discoverability.' }
                ],
                insight: 'Audience retention peaks when community posts and shorts are cross-linked to long-form uploads.'
            }
        }
    ]

    const activeDemo = heroAiPrompts[activePromptIndex]

    const handlePlaygroundSubmit = (e) => {
        e?.preventDefault()
        if (!playgroundQuery.trim()) return

        setIsGenerating(true)
        setTimeout(() => {
            setPlaygroundResult({
                query: playgroundQuery,
                answer: `Based on Vixora's video intelligence engine: "${playgroundQuery}" is processed natively. The system uses high-speed context mapping, extracting temporal moments, chapter summaries, and semantic meaning in under 350ms without buffering.`,
                tokens: 84,
                latency: '184ms'
            })
            setIsGenerating(false)
        }, 500)
    }

    const setSampleQuery = (q) => {
        setPlaygroundQuery(q)
        setIsGenerating(true)
        setTimeout(() => {
            setPlaygroundResult({
                query: q,
                answer: `Vixora AI Analysis: "${q}"\n\n1. Instant Video Context: Complete speech transcripts are indexed into semantic chapter vectors.\n2. Deep Tree Search: Video segments are matched directly to relevant comments and community polls.\n3. Frictionless Playback: Clicking generated timestamps seamlessly moves the player head to the designated marker.`,
                tokens: 112,
                latency: '210ms'
            })
            setIsGenerating(false)
        }, 450)
    }

    return (
        <div className="min-h-screen bg-[#050507] text-[#f7f8f8] selection:bg-primary/25 overflow-x-hidden font-sans">
            <SEO
                title="Cinematic Video Streaming & Native Creator AI"
                description="Stream 4K 60fps HDR videos, generate instant AI summaries with native Gemini intelligence, explore deep comment trees, and build your audience on Vixora."
                keywords="Vixora, Vixora AI, video streaming platform, AI video summary, Gemini AI, 4K HLS player, creator studio, YouTube alternative"
                url="https://app.vixora.co.in/landing"
            />
            {/* Ambient Resend-Style Ray Tracing Backlights */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute -top-48 left-1/2 -translate-x-1/2 w-[850px] h-[550px] bg-gradient-to-b from-primary/15 via-primary/5 to-transparent rounded-full blur-[140px]" />
                <div className="absolute top-[40%] -left-48 w-[600px] h-[600px] bg-red-600/5 rounded-full blur-[160px]" />
                <div className="absolute top-[65%] -right-48 w-[600px] h-[600px] bg-rose-600/5 rounded-full blur-[160px]" />
            </div>

            {/* Apple + Linear Top Glass Navigation */}
            <header className="sticky top-0 z-50 backdrop-blur-2xl bg-[#050507]/80 transition-all">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3 group">
                        <BrandLogo size="md" className="group-hover:scale-105 transition-transform duration-300" />
                        <span className="font-display font-bold text-xl tracking-tight text-white flex items-center gap-2">
                            Vixora
                        </span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#8a8f98]">
                        <a href="#hero-demo" className="hover:text-white transition-colors">Product Demo</a>
                        <a href="#bento-showcase" className="hover:text-white transition-colors">Bento Architecture</a>
                        <a href="#interactive-ai" className="hover:text-white transition-colors">AI Playground</a>
                        <a href="#comparison" className="hover:text-white transition-colors">Comparison</a>
                    </nav>

                    <div className="flex items-center gap-3">
                        {user ? (
                            <Button
                                onClick={() => navigate('/')}
                                className="bg-primary hover:bg-primary/90 text-white rounded-full px-5 py-2 text-sm font-medium shadow-lg shadow-primary/20 flex items-center gap-2 transition-all hover:scale-[1.02]"
                            >
                                <Play className="w-3.5 h-3.5 fill-current" /> Enter Vixora
                            </Button>
                        ) : (
                            <>
                                <Link to="/login">
                                    <button className="text-sm font-medium text-[#d0d6e0] hover:text-white px-4 py-2 rounded-full hover:bg-white/5 transition-colors">
                                        Sign In
                                    </button>
                                </Link>
                                <Link to="/register">
                                    <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-5 py-2 text-sm font-medium shadow-lg shadow-primary/25 flex items-center gap-1.5 transition-all hover:scale-[1.02]">
                                        Get Started <ArrowRight className="w-3.5 h-3.5" />
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* HERO SECTION */}
            <section className="relative z-10 pt-16 pb-20 md:pt-24 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
                {/* Linear Style Eyebrow Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-xs font-medium text-[#d0d6e0] mb-8 backdrop-blur-md shadow-inner"
                >
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-muted-foreground">Engineered for Fluidity:</span>
                    <span className="text-white font-semibold">4K HLS + Multi-Tier AI Intelligence</span>
                    <ChevronRight className="w-3 h-3 text-muted-foreground" />
                </motion.div>

                {/* Editorial Negative-Tracking Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-4xl sm:text-6xl lg:text-7xl font-display font-semibold tracking-[-0.03em] text-white leading-[1.08] max-w-5xl mx-auto"
                >
                    Cinema-grade streaming.{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-amber-300">
                        Supercharged by native AI.
                    </span>
                </motion.h1>

                {/* Subtitle with High-Contrast Typography */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-lg sm:text-xl text-[#8a8f98] max-w-3xl mx-auto mt-6 leading-relaxed font-normal"
                >
                    Zero-buffer adaptive HLS delivery, deep nested YouTube-grade discussion trees, and an instantaneous multi-tier AI copilot that indexes every frame, transcript, and key takeaway.
                </motion.p>

                {/* CTA Action Cluster */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex flex-wrap items-center justify-center gap-4 mt-9"
                >
                    <Link to="/register">
                        <Button className="h-12 px-7 rounded-full bg-primary hover:bg-primary/90 text-white font-medium text-base shadow-xl shadow-primary/25 flex items-center gap-2 hover:scale-[1.02] transition-all">
                            Start Watching Free <ArrowRight className="w-4 h-4" />
                        </Button>
                    </Link>
                    <a href="#interactive-ai">
                        <Button variant="outline" className="h-12 px-6 rounded-full border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.06] text-[#f7f8f8] font-medium text-base backdrop-blur-md flex items-center gap-2 transition-all">
                            <Sparkles className="w-4 h-4 text-primary" /> Test Drive AI
                        </Button>
                    </a>
                </motion.div>

                {/* Key Metric Strips */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto mt-14 pt-10 border-t border-white/5 text-left">
                    {[
                        { label: 'Startup Latency', val: '< 380ms', sub: 'Adaptive chunk prefetch' },
                        { label: 'Video Quality', val: '4K 60fps HDR', sub: 'Multi-bitrate HLS' },
                        { label: 'AI Intelligence', val: 'Multi-Tier LLM', sub: 'Zero-latency failover' },
                        { label: 'Comment Depth', val: 'Unlimited Trees', sub: 'YouTube-standard visual' }
                    ].map((item, idx) => (
                        <div key={idx} className="p-3">
                            <div className="text-xl sm:text-2xl font-semibold tracking-tight text-white font-mono">{item.val}</div>
                            <div className="text-xs font-medium text-[#d0d6e0] mt-1">{item.label}</div>
                            <div className="text-[11px] text-[#8a8f98]">{item.sub}</div>
                        </div>
                    ))}
                </div>

                {/* HERO PRODUCT CANVAS (In-Situ Living Console) */}
                <motion.div
                    id="hero-demo"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.35 }}
                    className="mt-14 relative rounded-2xl p-1 bg-gradient-to-b from-white/10 via-white/5 to-transparent shadow-2xl"
                >
                    <div className="rounded-[18px] bg-[#0b0c0e] border border-white/10 overflow-hidden shadow-2xl text-left">
                        {/* Console Window Header */}
                        <div className="px-5 py-3.5 bg-[#0e0f13] border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]/80" />
                                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]/80" />
                                    <div className="w-3 h-3 rounded-full bg-[#27c93f]/80" />
                                </div>
                                <div className="h-4 w-[1px] bg-white/10 ml-2" />
                                <span className="text-xs font-mono text-[#8a8f98] flex items-center gap-2">
                                    <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                                    vixora://stream/neural-codec-4k-master.m3u8
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs font-mono text-[#8a8f98]">
                                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                                    2160p 60fps
                                </span>
                                <span className="hidden sm:inline text-white/40">|</span>
                                <span className="hidden sm:inline">HLS Adaptive Buffer: 14.8s</span>
                            </div>
                        </div>

                        {/* Split Stage: 4K Cinema Player (Left) & AI Copilot (Right) */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                            {/* Left: 4K Player Preview */}
                            <div className="lg:col-span-7 bg-[#050507] p-5 sm:p-6 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/5 relative group">
                                {/* Video Surface Viewport */}
                                <div className="relative aspect-video rounded-xl overflow-hidden bg-neutral-950 border border-white/10 group/player">
                                    <video
                                        ref={videoRef}
                                        src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
                                        poster="https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80"
                                        playsInline
                                        muted={isMuted}
                                        loop
                                        onTimeUpdate={handleTimeUpdate}
                                        onPlay={() => setIsPlaying(true)}
                                        onPause={() => setIsPlaying(false)}
                                        onClick={togglePlay}
                                        className="w-full h-full object-cover cursor-pointer"
                                    />

                                    {/* Ambient Play Overlay */}
                                    <div 
                                        onClick={togglePlay}
                                        className={`absolute inset-0 bg-black/30 transition-opacity flex items-center justify-center cursor-pointer ${
                                            isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100'
                                        }`}
                                    >
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                togglePlay()
                                            }}
                                            className="w-16 h-16 rounded-full bg-primary/90 hover:bg-primary backdrop-blur-xl border border-white/20 flex items-center justify-center text-white transition-all transform hover:scale-110 shadow-2xl"
                                        >
                                            {isPlaying ? (
                                                <Pause className="w-7 h-7 fill-white" />
                                            ) : (
                                                <Play className="w-7 h-7 fill-white translate-x-0.5" />
                                            )}
                                        </button>
                                    </div>

                                    {/* Audio Mute/Unmute Toggle */}
                                    <button
                                        onClick={toggleMute}
                                        title={isMuted ? "Unmute" : "Mute"}
                                        className="absolute bottom-3 right-3 z-10 p-2 rounded-lg bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/10 transition-colors"
                                    >
                                        {isMuted ? <VolumeX className="w-4 h-4 text-zinc-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                                    </button>

                                    {/* Audio Spectrum Frequency Bars */}
                                    <div className="absolute bottom-3 left-3 flex items-end gap-1 h-6 z-10 bg-black/50 backdrop-blur-md px-2 py-1 rounded-md border border-white/10">
                                        {[60, 95, 45, 80, 100, 30, 75, 90, 50, 85].map((h, i) => (
                                            <div
                                                key={i}
                                                className="w-1 bg-red-400 rounded-full transition-all duration-300"
                                                style={{
                                                    height: isPlaying ? `${h}%` : '20%',
                                                    opacity: 0.7 + (i * 0.03)
                                                }}
                                            />
                                        ))}
                                    </div>

                                    {/* 4K Resolution Stamp */}
                                    <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-[11px] font-mono font-semibold text-white border border-white/10 flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        4K HDR • 60 FPS
                                    </div>
                                </div>

                                {/* Scrubber & Video Controls */}
                                <div className="mt-4 space-y-2">
                                    <div className="flex items-center justify-between text-xs font-mono text-[#8a8f98]">
                                        <span className="text-white font-medium">{currentTimeStr} / {durationStr}</span>
                                        <span className="text-white/80 font-medium">Chapter: {activeDemo.response.title}</span>
                                    </div>
                                    {/* Scrubber Bar with Chapter Ticks */}
                                    <div 
                                        onClick={handleScrub}
                                        className="relative w-full h-2 bg-white/10 hover:h-2.5 rounded-full overflow-hidden cursor-pointer transition-all group"
                                    >
                                        <div 
                                            className="absolute left-0 top-0 bottom-0 bg-primary rounded-full shadow-[0_0_12px_rgba(239,68,68,0.8)] transition-all duration-100" 
                                            style={{ width: `${videoProgress}%` }}
                                        />
                                        <div className="absolute left-[25%] top-0 bottom-0 w-0.5 bg-white/40" />
                                        <div className="absolute left-[50%] top-0 bottom-0 w-0.5 bg-white/40" />
                                        <div className="absolute left-[75%] top-0 bottom-0 w-0.5 bg-white/40" />
                                    </div>
                                </div>
                            </div>

                            {/* Right: Live Vixora AI Copilot Panel */}
                            <div className="lg:col-span-5 bg-[#0b0c0e] p-5 sm:p-6 flex flex-col justify-between">
                                <div>
                                    {/* AI Header */}
                                    <div className="flex items-center justify-between pb-4 border-b border-white/5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
                                                <Sparkles className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-semibold text-white">Vixora AI Copilot</h4>
                                                <p className="text-[11px] text-muted-foreground font-mono">Real-time Stream Intelligence</p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-[#8a8f98] border border-white/10">
                                            Active
                                        </span>
                                    </div>

                                    {/* Interactive Prompt Pills */}
                                    <div className="flex flex-wrap gap-1.5 mt-4">
                                        {heroAiPrompts.map((p, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setActivePromptIndex(idx)}
                                                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                                                    activePromptIndex === idx
                                                        ? 'bg-white/15 text-white border border-white/20 shadow-sm'
                                                        : 'bg-white/[0.03] text-[#8a8f98] hover:text-white hover:bg-white/[0.08] border border-transparent'
                                                }`}
                                            >
                                                {p.title}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Active Prompt Output Card */}
                                    <div className="mt-4 p-4 rounded-xl bg-[#111215] border border-white/10 space-y-3">
                                        <div className="flex items-center justify-between text-xs text-[#8a8f98]">
                                            <span className="font-semibold text-white">{activeDemo.response.title}</span>
                                            <span className="font-mono text-[10px] text-emerald-400">● 140ms</span>
                                        </div>

                                        <div className="space-y-2.5">
                                            {activeDemo.response.keyTakeaways.map((item, idx) => (
                                                <div key={idx} className="flex items-start gap-2.5 text-xs text-[#d0d6e0] leading-relaxed">
                                                    <button 
                                                        onClick={() => handleJumpToTimestamp(item.time)}
                                                        title={`Seek video to ${item.time}`}
                                                        className="px-1.5 py-0.5 rounded bg-primary/15 hover:bg-primary/30 text-primary border border-primary/20 font-mono text-[10px] font-semibold flex-shrink-0 transition-colors cursor-pointer"
                                                    >
                                                        {item.time}
                                                    </button>
                                                    <span>{item.text}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="pt-2.5 border-t border-white/5 text-[11px] text-[#8a8f98] italic">
                                            {activeDemo.response.insight}
                                        </div>
                                    </div>
                                </div>

                                {/* Chat Input Mock */}
                                <div className="mt-5 pt-3 border-t border-white/5 flex items-center gap-2">
                                    <div className="flex-1 px-3 py-2 rounded-lg bg-[#141519] border border-white/10 text-xs text-[#8a8f98] flex items-center justify-between">
                                        <span>Ask anything about this video...</span>
                                        <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono text-white/60">⌘K</kbd>
                                    </div>
                                    <button className="w-8 h-8 rounded-lg bg-primary hover:bg-primary/90 text-white flex items-center justify-center shadow-md">
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* ASYMMETRICAL BENTO GRID SHOWCASE (Linear + Framer Style) */}
            <section id="bento-showcase" className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-xs font-mono uppercase tracking-widest text-primary font-semibold">
                        System Architecture
                    </h2>
                    <h3 className="text-3xl sm:text-5xl font-display font-semibold tracking-tight text-white mt-3 leading-tight">
                        Crafted for extreme scale.
                        <br />
                        <span className="text-[#8a8f98] font-normal">Engineered without compromise.</span>
                    </h3>
                </div>

                {/* 5-Tile Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* BENTO TILE 1: Cognitive Video AI (2 columns, Large) */}
                    <div className="md:col-span-2 rounded-2xl bg-[#0b0c0e] border border-white/10 p-6 sm:p-8 relative overflow-hidden group hover:border-white/20 transition-all">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/5 rounded-full blur-[100px] pointer-events-none" />
                        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-primary font-semibold mb-3">
                            <Sparkles className="w-3.5 h-3.5" /> Native Video Intelligence
                        </div>
                        <h4 className="text-2xl font-semibold text-white tracking-tight mb-2">
                            Instant Video Understanding & Timestamps
                        </h4>
                        <p className="text-sm text-[#8a8f98] leading-relaxed max-w-xl mb-6">
                            No RAG database indexing latency. Vixora extracts frame-accurate semantics directly from the complete media stream, answering complex queries in under 350ms.
                        </p>

                        {/* Interactive Session Mockup */}
                        <div className="rounded-xl bg-[#111215] border border-white/10 p-4 font-mono text-xs space-y-3">
                            <div className="flex items-center justify-between pb-2 border-b border-white/5 text-[#8a8f98]">
                                <span className="text-white font-semibold">Session: "Quantum Computing Hardware Architecture"</span>
                                <span className="text-emerald-400">● 99.4% Confidence</span>
                            </div>
                            <div className="text-[#8a8f98]">
                                <span className="text-primary font-bold">&gt; User: </span>
                                "At what point does the speaker explain cryogenic cooling requirements?"
                            </div>
                            <div className="p-3 rounded-lg bg-[#18191d] border border-white/5 text-[#d0d6e0] leading-relaxed">
                                <span className="text-emerald-400 font-bold">&gt; Vixora AI: </span>
                                Cryogenic refrigeration is detailed at{' '}
                                <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/30 font-bold cursor-pointer">
                                    06:42
                                </span>
                                , where dilution refrigerators maintain qubits at 15 millikelvin to suppress thermal decoherence.
                            </div>
                        </div>
                    </div>

                    {/* BENTO TILE 2: Zero-Latency HLS Telemetry (1 column) */}
                    <div className="rounded-2xl bg-[#0b0c0e] border border-white/10 p-6 sm:p-8 relative overflow-hidden group hover:border-white/20 transition-all flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold mb-3">
                                <Zap className="w-3.5 h-3.5" /> High-Throughput HLS
                            </div>
                            <h4 className="text-xl font-semibold text-white tracking-tight mb-2">
                                Adaptive Bitrate Engine
                            </h4>
                            <p className="text-xs text-[#8a8f98] leading-relaxed mb-4">
                                Dynamic stream switching with sub-400ms startup latency and zero player stall events.
                            </p>
                        </div>

                        {/* Live Telemetry Meter */}
                        <div className="rounded-xl bg-[#111215] border border-white/10 p-4 space-y-3 font-mono">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Throughput</span>
                                <span className="text-white font-semibold">21.8 Mbps</span>
                            </div>
                            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-cyan-400 h-full w-[82%] rounded-full shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
                            </div>
                            <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] border-t border-white/5">
                                <div>
                                    <div className="text-muted-foreground">Ping</div>
                                    <div className="text-emerald-400 font-bold">18ms</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Dropped</div>
                                    <div className="text-white font-bold">0 frames</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* BENTO TILE 3: Creator Aspect Cropper (1 column) */}
                    <div className="rounded-2xl bg-[#0b0c0e] border border-white/10 p-6 sm:p-8 relative overflow-hidden group hover:border-white/20 transition-all flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold mb-3">
                                <Film className="w-3.5 h-3.5" /> Creator Studio
                            </div>
                            <h4 className="text-xl font-semibold text-white tracking-tight mb-2">
                                Aspect Ratio Studio
                            </h4>
                            <p className="text-xs text-[#8a8f98] leading-relaxed mb-4">
                                Repurpose horizontal uploads into viral vertical Shorts with smart crop focus.
                            </p>
                        </div>

                        {/* Interactive Aspect Toggle */}
                        <div className="rounded-xl bg-[#111215] border border-white/10 p-4 space-y-3">
                            <div className="flex items-center justify-center gap-2 bg-[#0b0c0e] p-1 rounded-lg border border-white/5">
                                <button
                                    onClick={() => setAspectRatio('16:9')}
                                    className={`text-xs px-3 py-1 rounded-md font-medium transition-all ${
                                        aspectRatio === '16:9' ? 'bg-white/20 text-white shadow' : 'text-[#8a8f98]'
                                    }`}
                                >
                                    16:9 Cinema
                                </button>
                                <button
                                    onClick={() => setAspectRatio('9:16')}
                                    className={`text-xs px-3 py-1 rounded-md font-medium transition-all ${
                                        aspectRatio === '9:16' ? 'bg-primary text-white shadow' : 'text-[#8a8f98]'
                                    }`}
                                >
                                    9:16 Shorts
                                </button>
                            </div>

                            <div className="flex items-center justify-center h-28 bg-[#050507] rounded-lg border border-white/5 overflow-hidden relative">
                                <div
                                    className={`border-2 border-dashed border-primary transition-all duration-300 flex items-center justify-center text-[10px] font-mono text-primary font-bold ${
                                        aspectRatio === '16:9' ? 'w-36 h-20 rounded-md' : 'w-16 h-24 rounded-md'
                                    }`}
                                >
                                    {aspectRatio}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* BENTO TILE 4: Nested Discussion Tree (2 columns, Large) */}
                    <div className="md:col-span-2 rounded-2xl bg-[#0b0c0e] border border-white/10 p-6 sm:p-8 relative overflow-hidden group hover:border-white/20 transition-all">
                        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold mb-3">
                            <Users className="w-3.5 h-3.5" /> Community Hierarchy
                        </div>
                        <h4 className="text-2xl font-semibold text-white tracking-tight mb-2">
                            YouTube-Standard Recursive Comment Trees
                        </h4>
                        <p className="text-sm text-[#8a8f98] leading-relaxed max-w-xl mb-6">
                            Deep nested discussion hierarchy supporting 5+ levels of tree depth, author badges, timestamp auto-linking, and real-time upvotes.
                        </p>

                        {/* Real Tree Visual Representation */}
                        <div className="rounded-xl bg-[#111215] border border-white/10 p-4 space-y-4">
                            {/* Top Level Comment */}
                            <div className="flex items-start gap-3 text-xs">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold flex-shrink-0 text-xs">
                                    AL
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-white">Alex Lawson</span>
                                        <span className="text-[10px] text-muted-foreground">3 hours ago</span>
                                    </div>
                                    <p className="text-[#d0d6e0]">
                                        The explanation of adaptive HLS chunk buffering at <span className="text-primary font-bold cursor-pointer">04:15</span> was incredibly clear. Best technical breakdown on this topic!
                                    </p>
                                </div>
                            </div>

                            {/* Nested Reply 1 (Indented with Tree Connector Line) */}
                            <div className="ml-6 pl-4 border-l border-white/10 flex items-start gap-3 text-xs">
                                <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center text-white font-bold flex-shrink-0 text-[10px]">
                                    VX
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-white">Vixora Creator</span>
                                        <span className="px-1.5 py-0.2 rounded bg-primary/20 text-primary text-[9px] font-bold">CREATOR</span>
                                        <span className="text-[10px] text-muted-foreground">2 hours ago</span>
                                    </div>
                                    <p className="text-[#d0d6e0]">
                                        Appreciate it Alex! We built our segment scheduler specifically to eliminate player stalls on high-packet-loss networks.
                                    </p>
                                </div>
                            </div>

                            {/* Nested Reply 2 (Depth 3) */}
                            <div className="ml-12 pl-4 border-l border-white/10 flex items-start gap-2.5 text-xs text-[#8a8f98]">
                                <CornerDownRight className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                                <span>3 more nested replies in this thread</span>
                            </div>
                        </div>
                    </div>

                    {/* BENTO TILE 5: Enterprise Governance & Real-Time Audit (Full Width 3 cols) */}
                    <div className="md:col-span-3 rounded-2xl bg-[#0b0c0e] border border-white/10 p-6 sm:p-8 relative overflow-hidden group hover:border-white/20 transition-all">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div>
                                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold mb-2">
                                    <Shield className="w-3.5 h-3.5" /> Enterprise RBAC Governance
                                </div>
                                <h4 className="text-2xl font-semibold text-white tracking-tight">
                                    Super Admin Control & Cryptographic Audit Logs
                                </h4>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                Real-time WebSocket Stream
                            </div>
                        </div>

                        {/* Monospace Audit Terminal Feed */}
                        <div className="rounded-xl bg-[#111215] border border-white/10 p-4 font-mono text-xs space-y-2 overflow-x-auto">
                            {[
                                { ts: '23:14:02.184', actor: 'superadmin_master', role: 'SUPER_ADMIN', action: 'POLICY_UPDATE', detail: 'HLS adaptive rate ladder set to 2160p max' },
                                { ts: '23:12:44.912', actor: 'moderator_lead', role: 'MODERATOR', action: 'FLAG_RESOLVED', detail: 'Report #4829 resolved with no violation' },
                                { ts: '23:09:18.004', actor: 'auth_security_gate', role: 'SYSTEM', action: 'TOKEN_ROTATION', detail: 'Account switch token refreshed successfully' }
                            ].map((log, idx) => (
                                <div key={idx} className="flex items-center gap-3 text-[#8a8f98] hover:text-white transition-colors py-1">
                                    <span className="text-white/40">{log.ts}</span>
                                    <span className="px-1.5 py-0.5 rounded bg-white/5 text-amber-300 text-[10px] font-bold border border-white/10">
                                        {log.role}
                                    </span>
                                    <span className="text-white font-medium">{log.action}</span>
                                    <span className="text-[#8a8f98] truncate">{log.detail}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* INTERACTIVE AI PLAYGROUND (Test Drive Right On the Page) */}
            <section id="interactive-ai" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
                <div className="rounded-3xl bg-gradient-to-b from-[#111215] to-[#0b0c0e] border border-white/10 p-8 sm:p-12 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

                    <div className="max-w-2xl mx-auto text-center mb-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-mono font-semibold mb-3 border border-primary/25">
                            <Terminal className="w-3.5 h-3.5" /> Interactive Playground
                        </div>
                        <h3 className="text-3xl sm:text-4xl font-display font-semibold tracking-tight text-white">
                            Test drive Vixora AI right now.
                        </h3>
                        <p className="text-sm text-[#8a8f98] mt-3">
                            Click any sample question or type your own to test our real-time video intelligence model.
                        </p>
                    </div>

                    {/* Quick Sample Chips */}
                    <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
                        {[
                            'How does HLS adaptive streaming work?',
                            'Summarize quantum physics lecture in 3 bullets',
                            'How to organize playlists with 7-day trash recovery?',
                            'Create 3 viral Shorts concepts from podcast'
                        ].map((q, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSampleQuery(q)}
                                className="text-xs px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-[#d0d6e0] transition-all"
                            >
                                {q}
                            </button>
                        ))}
                    </div>

                    {/* Input Form */}
                    <form onSubmit={handlePlaygroundSubmit} className="relative max-w-2xl mx-auto">
                        <input
                            type="text"
                            placeholder="Type a video query, concept, or summary request..."
                            value={playgroundQuery}
                            onChange={(e) => setPlaygroundQuery(e.target.value)}
                            className="w-full h-14 pl-5 pr-32 rounded-full bg-[#18191d] border border-white/15 text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm shadow-inner"
                        />
                        <button
                            type="submit"
                            disabled={isGenerating || !playgroundQuery.trim()}
                            className="absolute right-2 top-2 bottom-2 px-6 rounded-full bg-primary hover:bg-primary/90 text-white font-medium text-sm flex items-center gap-1.5 disabled:opacity-50 transition-all shadow-md"
                        >
                            {isGenerating ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    Run AI <ArrowRight className="w-3.5 h-3.5" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Response Card */}
                    <AnimatePresence>
                        {playgroundResult && (
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="mt-8 max-w-2xl mx-auto p-5 rounded-2xl bg-[#0e0f13] border border-white/10 text-left space-y-3 shadow-xl font-mono text-xs"
                            >
                                <div className="flex items-center justify-between pb-3 border-b border-white/5 text-[#8a8f98]">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                                        <span className="text-white font-semibold">Vixora Intelligence Engine</span>
                                    </div>
                                    <span className="text-emerald-400">● {playgroundResult.latency}</span>
                                </div>
                                <div className="text-[#f7f8f8] whitespace-pre-line leading-relaxed font-sans text-sm">
                                    {playgroundResult.answer}
                                </div>
                                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-[#8a8f98]">
                                    <span>Tokens processed: {playgroundResult.tokens}</span>
                                    <span className="text-emerald-400">Zero RAG Overhead</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </section>

            {/* ARCHITECTURE COMPARISON TABLE */}
            <section id="comparison" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <h3 className="text-3xl font-display font-semibold text-white tracking-tight">
                        Built different from day one.
                    </h3>
                    <p className="text-sm text-[#8a8f98] mt-2">
                        How Vixora compares to legacy video platforms and basic clones.
                    </p>
                </div>

                <div className="rounded-2xl bg-[#0b0c0e] border border-white/10 overflow-hidden shadow-xl font-mono text-xs">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#111215] border-b border-white/10 text-[#d0d6e0]">
                                <th className="p-4 font-semibold">Capability</th>
                                <th className="p-4 font-semibold text-primary">Vixora Platform</th>
                                <th className="p-4 font-semibold text-[#8a8f98]">Legacy Video Clones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-[#d0d6e0]">
                            {[
                                { cap: '4K HLS Startup Latency', vixora: '< 380ms Adaptive Buffer', legacy: '1.8s - 3.4s Static MP4' },
                                { cap: 'AI Video Analysis', vixora: 'Native Multi-Tier LLM (Instant)', legacy: 'None or heavy RAG overhead' },
                                { cap: 'Comment Thread Hierarchy', vixora: 'Recursive Trees (YouTube-Grade)', legacy: 'Flat 1-level list' },
                                { cap: 'Creator Aspect Studio', vixora: 'Interactive 16:9 to 9:16 Cropper', legacy: 'Manual external editing' },
                                { cap: 'Enterprise Governance', vixora: 'Super Admin + Live Audit Stream', legacy: 'Simple binary admin toggle' },
                                { cap: 'Deleted Media Recovery', vixora: '7-Day Atomic Trash Restore', legacy: 'Permanent data loss' }
                            ].map((row, idx) => (
                                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="p-4 font-medium text-white">{row.cap}</td>
                                    <td className="p-4 text-emerald-400 font-semibold flex items-center gap-1.5">
                                        <Check className="w-4 h-4 text-emerald-400" /> {row.vixora}
                                    </td>
                                    <td className="p-4 text-[#8a8f98]">{row.legacy}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* BOTTOM CALL TO ACTION */}
            <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
                <div className="rounded-3xl bg-gradient-to-b from-[#141519] to-[#0b0c0e] border border-white/10 p-10 sm:p-16 shadow-2xl relative overflow-hidden">
                    <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />

                    <h3 className="text-3xl sm:text-5xl font-display font-semibold tracking-tight text-white mb-4">
                        Experience video without compromise.
                    </h3>
                    <p className="text-base text-[#8a8f98] max-w-xl mx-auto mb-8 font-normal">
                        Join creators and viewers enjoying ultra-fast 4K streaming, native AI intelligence, and liquid glass design.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <Link to="/register">
                            <Button className="h-12 px-8 rounded-full bg-primary hover:bg-primary/90 text-white font-medium text-base shadow-xl shadow-primary/25 hover:scale-[1.02] transition-all">
                                Create Account Free <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                        </Link>
                        <Link to="/login">
                            <Button variant="outline" className="h-12 px-7 rounded-full border-white/10 hover:border-white/20 bg-white/[0.02] text-white font-medium text-base hover:bg-white/[0.06] transition-all">
                                Sign In
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* MINIMALIST LINEAR-GRADE FOOTER */}
            <footer className="relative z-10 border-t border-white/5 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-xs text-[#8a8f98]">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <BrandLogo size="sm" />
                        <span className="font-semibold text-white">Vixora Platform</span>
                        <span className="text-white/30">•</span>
                        <span className="flex items-center gap-1.5 font-mono text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            All Systems Operational
                        </span>
                    </div>

                    <div className="flex items-center gap-6">
                        <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                        <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
                        <Link to="/register" className="hover:text-white transition-colors">Create Account</Link>
                        <span className="font-mono text-[11px] text-white/30 hidden sm:inline">
                            [Shift + ? for shortcuts]
                        </span>
                    </div>
                </div>
            </footer>
        </div>
    )
}
