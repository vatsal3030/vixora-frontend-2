import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    Sparkles, Play, Shield, Zap, Video, Users, ArrowRight,
    CheckCircle2, Compass, MessageSquare, BarChart3, Clock,
    Share2, Layers, Cpu, ChevronRight, Lock
} from 'lucide-react'
import { BrandLogo } from '../components/common/BrandLogo'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export default function LandingPage() {
    useDocumentTitle('Vixora - Next-Gen Video Streaming & Creator AI')
    const { user } = useAuth()
    const navigate = useNavigate()
    const [activeAiTab, setActiveAiTab] = useState('summary')

    const features = [
        {
            icon: Sparkles,
            title: 'YouTube-Grade Video AI',
            desc: 'Instant video summaries, timestamp breakdowns, contextual Q&A, and smart conversation auto-naming without delays.',
            badge: 'AI Powered',
            color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30'
        },
        {
            icon: Zap,
            title: 'Ultra-Fast 4K HLS Streaming',
            desc: 'Adaptive multi-bitrate HLS streaming engine ensures instantaneous playback start with zero buffering across any connection.',
            badge: 'High Performance',
            color: 'from-blue-500/20 to-cyan-500/20 text-cyan-400 border-cyan-500/30'
        },
        {
            icon: Video,
            title: 'Creator Studio & Shorts',
            desc: 'Powerful creator workflow supporting vertical Shorts, drag-and-drop thumbnail cropping, visibility toggles, and metadata optimization.',
            badge: 'Creator Suite',
            color: 'from-primary/20 to-rose-500/20 text-primary border-primary/30'
        },
        {
            icon: Users,
            title: 'Interactive Community Posts',
            desc: 'Engage with viewers through community tweets, polls, and deep nested tree comment threads matching YouTube discussion standards.',
            badge: 'Social & Feed',
            color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30'
        },
        {
            icon: Layers,
            title: 'Smart Library & Playlists',
            desc: 'Curate your viewing experience with Watch Later, Liked Videos, custom public/private playlists, and 7-day trash recovery.',
            badge: 'Organization',
            color: 'from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30'
        },
        {
            icon: Shield,
            title: 'Enterprise Safety & Moderation',
            desc: 'Strict role-based governance with Super Admin controls, real-time audit logging, content moderation, and anti-abuse safeguards.',
            badge: 'Security',
            color: 'from-indigo-500/20 to-blue-500/20 text-indigo-400 border-indigo-500/30'
        }
    ]

    const stats = [
        { label: 'Startup Latency', value: '< 400ms' },
        { label: 'Video Fidelity', value: '4K UHD' },
        { label: 'AI Intelligence', value: 'Multi-Tier LLM' },
        { label: 'Platform Availability', value: '99.99%' },
    ]

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-foreground selection:bg-primary/25 overflow-x-hidden font-sans">
            {/* Ambient Background Glows */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-primary/15 rounded-full blur-[140px]" />
                <div className="absolute top-[35%] -left-32 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px]" />
                <div className="absolute top-[60%] -right-32 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[140px]" />
            </div>

            {/* Header / Navbar */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0a0c]/80 border-b border-white/5 transition-all">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3 group">
                        <BrandLogo size="md" className="group-hover:scale-105 transition-transform duration-300" />
                        <span className="font-display font-bold text-2xl tracking-tight text-white flex items-center gap-1.5">
                            Vixora
                            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                                AI
                            </span>
                        </span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
                        <a href="#features" className="hover:text-white transition-colors">Features</a>
                        <a href="#ai-engine" className="hover:text-white transition-colors">AI Intelligence</a>
                        <a href="#creator-studio" className="hover:text-white transition-colors">Creator Studio</a>
                        <a href="#stats" className="hover:text-white transition-colors">Metrics</a>
                    </nav>

                    <div className="flex items-center gap-3">
                        {user ? (
                            <Button
                                onClick={() => navigate('/')}
                                className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 font-semibold shadow-lg shadow-primary/25 flex items-center gap-2"
                            >
                                <Play className="w-4 h-4 fill-current" /> Launch App
                            </Button>
                        ) : (
                            <>
                                <Link to="/login">
                                    <Button variant="ghost" className="text-white hover:bg-white/5 rounded-full text-sm font-semibold px-4">
                                        Sign In
                                    </Button>
                                </Link>
                                <Link to="/register">
                                    <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-5 font-semibold text-sm shadow-lg shadow-primary/25 flex items-center gap-1.5">
                                        Get Started <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative z-10 pt-20 pb-24 md:pt-28 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-white/90 mb-8 backdrop-blur-md shadow-inner"
                >
                    <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                    <span>Next-Generation Video Ecosystem Powered by AI</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold tracking-tight text-white leading-[1.1] max-w-5xl mx-auto"
                >
                    The Video Platform for Creators,{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-amber-400">
                        Supercharged by AI.
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="mt-6 text-base sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
                >
                    Stream high-fidelity videos with sub-second startup latency, ask your personal AI assistant anything about any video, and publish content seamlessly with built-in creator analytics.
                </motion.p>

                {/* Hero CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.3 }}
                    className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <Button
                        size="lg"
                        onClick={() => navigate(user ? '/' : '/register')}
                        className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white rounded-full px-8 h-13 font-bold text-base shadow-xl shadow-primary/30 flex items-center justify-center gap-2 group"
                    >
                        <Play className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
                        {user ? 'Open Vixora Platform' : 'Start Watching Free'}
                    </Button>

                    <Button
                        size="lg"
                        variant="outline"
                        onClick={() => {
                            const aiSection = document.getElementById('ai-engine')
                            aiSection?.scrollIntoView({ behavior: 'smooth' })
                        }}
                        className="w-full sm:w-auto rounded-full px-8 h-13 font-semibold text-base border-white/10 hover:bg-white/5 text-white flex items-center justify-center gap-2"
                    >
                        <Sparkles className="w-5 h-5 text-primary" />
                        Explore Vixora AI
                    </Button>
                </motion.div>

                {/* Interactive Product Mockup */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="mt-16 relative mx-auto max-w-5xl rounded-2xl overflow-hidden border border-white/10 bg-[#121216]/90 backdrop-blur-2xl shadow-2xl shadow-black/80"
                >
                    {/* Window Controls */}
                    <div className="h-11 bg-white/5 border-b border-white/5 flex items-center px-4 justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500/80" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                            <div className="w-3 h-3 rounded-full bg-green-500/80" />
                        </div>
                        <span className="text-xs text-muted-foreground font-mono">vixora.co.in/watch</span>
                        <div className="w-12" />
                    </div>

                    {/* Preview Grid: Video player + Vixora AI Chat */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 bg-[#0f0f13]">
                        {/* Video Mockup */}
                        <div className="lg:col-span-2 p-6 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/5">
                            <div className="aspect-video w-full rounded-xl bg-gradient-to-br from-zinc-900 via-black to-zinc-950 border border-white/10 relative overflow-hidden flex items-center justify-center group cursor-pointer shadow-inner">
                                <div className="absolute inset-0 bg-radial from-primary/20 via-transparent to-transparent opacity-40 group-hover:opacity-60 transition-opacity" />
                                <div className="w-16 h-16 rounded-full bg-primary/90 text-white flex items-center justify-center shadow-xl shadow-primary/40 group-hover:scale-110 transition-transform">
                                    <Play className="w-7 h-7 fill-current ml-1" />
                                </div>
                                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white/80">
                                    <span className="font-semibold bg-black/60 px-2.5 py-1 rounded-md backdrop-blur-md">4K Ultra HD • 60 FPS</span>
                                    <span className="bg-primary/90 text-white px-2 py-0.5 rounded font-bold text-[10px]">LIVE AI CONTEXT</span>
                                </div>
                            </div>

                            <div className="mt-4 text-left">
                                <h3 className="text-lg font-bold text-white">Mastering Cloud Architecture & Distributed Systems</h3>
                                <p className="text-xs text-muted-foreground mt-1">Vixora Originals • 42.8K views • 2 hours ago</p>
                            </div>
                        </div>

                        {/* AI Mockup Panel */}
                        <div className="p-5 flex flex-col justify-between bg-[#14141a]/95 text-left">
                            <div>
                                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-primary" />
                                        <span className="text-xs font-bold text-white">Vixora AI Assistant</span>
                                    </div>
                                    <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                        Online
                                    </span>
                                </div>

                                <div className="mt-4 space-y-3 text-xs leading-relaxed">
                                    <div className="bg-primary/15 border border-primary/20 p-2.5 rounded-lg text-primary-foreground text-left ml-4 font-medium">
                                        "Summarize the key architectural takeaways"
                                    </div>
                                    <div className="bg-white/5 border border-white/10 p-3 rounded-lg text-gray-300 space-y-1.5">
                                        <p className="font-bold text-white flex items-center gap-1.5">
                                            <span>🎬 Key Insights</span>
                                        </p>
                                        <p>1. Microservices decoupled with distributed event messaging.</p>
                                        <p>2. Multi-tier Redis caching reducing database reads by 78%.</p>
                                        <p>3. Zero-downtime blue/green deployment strategy.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-muted-foreground">
                                <span>Unique Chat Auto-Naming Active</span>
                                <span className="text-primary font-bold">100% Free Tier</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Platform Stats Bar */}
            <section id="stats" className="border-y border-white/5 bg-white/[0.02] py-12 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {stats.map((stat, i) => (
                            <div key={i} className="space-y-1">
                                <div className="text-3xl sm:text-4xl font-extrabold text-white font-display tracking-tight text-gradient">
                                    {stat.value}
                                </div>
                                <div className="text-xs sm:text-sm text-muted-foreground font-medium">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Core Features Grid */}
            <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Engineered for Excellence</h2>
                    <h3 className="text-3xl sm:text-5xl font-display font-bold text-white tracking-tight">
                        Everything You Need in a Modern Video Platform
                    </h3>
                    <p className="mt-4 text-base text-muted-foreground">
                        Built from the ground up with cutting-edge streaming protocols, responsive aesthetics, and intelligent AI models.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feat, i) => {
                        const Icon = feat.icon
                        return (
                            <div
                                key={i}
                                className="group relative rounded-2xl p-7 bg-white/[0.03] border border-white/8 hover:border-primary/30 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-5">
                                        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Icon className="w-6 h-6 text-primary" />
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${feat.color}`}>
                                            {feat.badge}
                                        </span>
                                    </div>
                                    <h4 className="text-lg font-bold text-white mb-2 group-hover:text-primary transition-colors">
                                        {feat.title}
                                    </h4>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {feat.desc}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </section>

            {/* Dedicated AI Showcase Section */}
            <section id="ai-engine" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
                <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] via-white/[0.02] to-transparent p-8 sm:p-12 lg:p-16 relative overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary mb-4">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Multi-Tier Intelligence</span>
                            </div>
                            <h3 className="text-3xl sm:text-4xl font-display font-extrabold text-white leading-tight">
                                Smarter Video Understanding, Powered by OpenRouter & Gemini
                            </h3>
                            <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
                                Whether asking complex general knowledge questions or analyzing hours of video content, Vixora AI utilizes high-performance models (`nemotron-3.5-lightning` & `gemini-3.6-flash`) with automatic fallback to guarantee instant, reliable answers.
                            </p>

                            <div className="mt-8 space-y-4">
                                {[
                                    'Natural responses to general questions (health, science, daily routines, coding)',
                                    'Deep video breakdown: timestamps, executive summary, key takeaways',
                                    'Intelligent automatic conversation naming with unique per-user title guarantees',
                                    '100% free multi-model failover architecture',
                                ].map((item, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                                        <span className="text-sm text-gray-300 font-medium">{item}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8">
                                <Button
                                    onClick={() => navigate(user ? '/' : '/login')}
                                    className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 font-bold text-sm shadow-lg shadow-primary/30 flex items-center gap-2"
                                >
                                    Try Vixora AI Now <ArrowRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Interactive Feature Tabs */}
                        <div className="bg-[#111116] border border-white/10 rounded-2xl p-6 shadow-2xl">
                            <div className="flex gap-2 border-b border-white/10 pb-4 mb-5">
                                {[
                                    { id: 'summary', label: 'Video Summary' },
                                    { id: 'general', label: 'General Q&A' },
                                    { id: 'autoname', label: 'Unique Naming' },
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveAiTab(tab.id)}
                                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                            activeAiTab === tab.id
                                                ? 'bg-primary text-white shadow-md'
                                                : 'text-muted-foreground hover:text-white hover:bg-white/5'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {activeAiTab === 'summary' && (
                                <div className="space-y-3 text-left">
                                    <div className="flex items-center gap-2 text-xs text-primary font-bold">
                                        <Sparkles className="w-4 h-4" /> Structured Video Summary
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-xs text-gray-300 space-y-2">
                                        <p className="font-bold text-white">📋 Executive Overview</p>
                                        <p className="text-muted-foreground">Comprehensive walkthrough of microservices architecture with hands-on cloud demonstrations.</p>
                                        <p className="font-bold text-white pt-1">💡 Key Takeaways</p>
                                        <p>• Zero downtime deployments using automated health check gates.</p>
                                        <p>• Optimized query indexing reducing 95th percentile latency to 12ms.</p>
                                    </div>
                                </div>
                            )}

                            {activeAiTab === 'general' && (
                                <div className="space-y-3 text-left">
                                    <div className="bg-primary/20 text-white text-xs p-3 rounded-lg ml-6 font-medium">
                                        "How much should someone shower in a day?"
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-xs text-gray-300 space-y-2">
                                        <p>Dermatologists generally recommend showering <strong>once a day or every other day</strong> for most people.</p>
                                        <p className="text-muted-foreground">Short, lukewarm showers (5-10 minutes) preserve your skin's natural moisture barrier while maintaining personal hygiene.</p>
                                    </div>
                                </div>
                            )}

                            {activeAiTab === 'autoname' && (
                                <div className="space-y-3 text-left">
                                    <div className="text-xs text-muted-foreground">
                                        Conversations are automatically analyzed and given clean, unique descriptive titles:
                                    </div>
                                    <div className="space-y-2">
                                        {['Daily Shower Routine Advice', 'Quantum Computing Essentials', 'Video Architecture Breakdown'].map((t, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/5 text-xs font-semibold text-white">
                                                <span>{t}</span>
                                                <span className="text-[10px] text-emerald-400 font-mono">UNIQUE #0{idx+1}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Creator Studio Highlights */}
            <section id="creator-studio" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 text-center">
                <h2 className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Built for Creators</h2>
                <h3 className="text-3xl sm:text-5xl font-display font-bold text-white tracking-tight">
                    Manage, Analyze & Scale Your Channel
                </h3>
                <p className="mt-4 text-base text-muted-foreground max-w-2xl mx-auto">
                    Everything you need to organize your videos, publish vertical shorts, engage with subscribers, and track metrics.
                </p>

                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/8 space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Video className="w-5 h-5" />
                        </div>
                        <h4 className="text-base font-bold text-white">Videos & Shorts Ownership</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Full video ownership with inline editing, trash recovery, public/private toggles, and direct link sharing.
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/8 space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                            <Layers className="w-5 h-5" />
                        </div>
                        <h4 className="text-base font-bold text-white">Persistent Tab Routing</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Production-grade URL dynamic routing keeps you on your active tab even after full page refreshes.
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/8 space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                            <Shield className="w-5 h-5" />
                        </div>
                        <h4 className="text-base font-bold text-white">Role-Based Admin Protection</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Moderator and Super Admin panels with permission-filtered sidebars and audit tracking.
                        </p>
                    </div>
                </div>
            </section>

            {/* Bottom Call to Action */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center relative z-10">
                <div className="rounded-3xl p-10 sm:p-16 bg-gradient-to-b from-primary/20 via-primary/5 to-transparent border border-primary/20 shadow-2xl relative overflow-hidden">
                    <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />

                    <h3 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight">
                        Experience the Future of Video Today
                    </h3>
                    <p className="mt-4 text-base text-muted-foreground max-w-xl mx-auto">
                        Join creators and viewers on Vixora. Stream in 4K, interact with AI, and grow your audience.
                    </p>

                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button
                            size="lg"
                            onClick={() => navigate(user ? '/' : '/register')}
                            className="w-full sm:w-auto bg-white text-black hover:bg-white/90 rounded-full px-8 h-12 font-bold text-sm shadow-xl flex items-center justify-center gap-2"
                        >
                            Get Started Free <ArrowRight className="w-4 h-4" />
                        </Button>
                        <Button
                            size="lg"
                            variant="ghost"
                            onClick={() => navigate('/login')}
                            className="w-full sm:w-auto text-white hover:bg-white/10 rounded-full px-8 h-12 font-semibold text-sm"
                        >
                            Sign In to Existing Account
                        </Button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/5 bg-[#070709] py-12 relative z-10 text-xs text-muted-foreground">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <BrandLogo size="sm" />
                        <span className="font-bold text-sm text-white">Vixora</span>
                        <span>• Next-Gen Video Streaming Platform</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                        <Link to="/" className="hover:text-white transition-colors">Video Feed</Link>
                        <Link to="/login" className="hover:text-white transition-colors">Account Login</Link>
                    </div>

                    <div className="text-center sm:text-right">
                        © {new Date().getFullYear()} Vixora. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    )
}
