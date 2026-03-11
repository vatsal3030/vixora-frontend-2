import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft, Shield, AlertTriangle, FileText, Lock, ChevronRight } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { useEffect, useState } from 'react'
import { cn } from '../../lib/utils'

const SECTIONS = [
    { id: 'status', title: 'Experimental Status', icon: AlertTriangle, color: 'text-yellow-500' },
    { id: 'privacy', title: 'Data & Privacy', icon: Shield, color: 'text-primary' },
    { id: 'responsibility', title: 'User Responsibility', icon: Lock, color: 'text-blue-500' },
]

export default function TermsPage() {
    const [activeSection, setActiveSection] = useState('')

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id)
                    }
                })
            },
            { threshold: 0.5 }
        )

        SECTIONS.forEach((section) => {
            const el = document.getElementById(section.id)
            if (el) observer.observe(el)
        })

        return () => observer.disconnect()
    }, [])

    const scrollToSection = (id) => {
        const el = document.getElementById(id)
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
    }

    return (
        <div className="min-h-screen relative overflow-hidden bg-[#050505] selection:bg-primary/30">
            {/* --- PREMIUM BACKGROUND DECORATIONS --- */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden print:hidden">
                {/* Primary floating glow */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                        x: [0, 50, 0],
                        y: [0, -30, 0]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-10%] left-[-10%] w-[60%] aspect-square bg-primary/10 blur-[120px] rounded-full"
                />

                {/* Secondary accent glow */}
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.2, 0.4, 0.2],
                        x: [0, -40, 0],
                        y: [0, 60, 0]
                    }}
                    transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute bottom-[-20%] right-[-10%] w-[50%] aspect-square bg-blue-500/5 blur-[100px] rounded-full"
                />

                {/* Subtle mesh grid overlay */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] contrast-150 brightness-150" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-28 pb-20">
                {/* Back Link */}
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8 print:hidden"
                >
                    <Link to="/register">
                        <Button variant="ghost" size="sm" className="gap-2 group pl-0 hover:bg-white/5 pr-4 rounded-full text-muted-foreground hover:text-foreground transition-all">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Back to Register
                        </Button>
                    </Link>
                </motion.div>

                <div className="grid lg:grid-cols-4 gap-12 items-start">
                    {/* Sticky Sidebar Navigation */}
                    <aside className="hidden lg:block sticky top-32 space-y-6 print:hidden">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="glass-card p-2 rounded-3xl border-white/5 backdrop-blur-xl bg-white/[0.02]"
                        >
                            <div className="px-4 pt-4 pb-2">
                                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4 opacity-50">Legal Framework</h3>
                            </div>
                            <nav className="space-y-1">
                                {SECTIONS.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => scrollToSection(section.id)}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm transition-all duration-500 group relative overflow-hidden",
                                            activeSection === section.id
                                                ? "text-foreground"
                                                : "text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
                                        )}
                                    >
                                        {activeSection === section.id && (
                                            <motion.div
                                                layoutId="activeTab"
                                                className="absolute inset-0 bg-gradient-to-r from-white/[0.08] to-transparent border-l-2 border-primary z-0"
                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            />
                                        )}
                                        <section.icon className={cn("w-4 h-4 relative z-10 transition-colors duration-500",
                                            activeSection === section.id ? section.color : "opacity-40"
                                        )} />
                                        <span className="font-medium relative z-10">{section.title}</span>
                                        {activeSection === section.id && (
                                            <motion.div
                                                initial={{ opacity: 0, x: -5 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="ml-auto relative z-10"
                                            >
                                                <ChevronRight className="w-4 h-4 text-primary" />
                                            </motion.div>
                                        )}
                                    </button>
                                ))}
                            </nav>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="p-6 rounded-3xl bg-gradient-to-br from-primary/5 to-transparent border border-white/5 backdrop-blur-md"
                        >
                            <h4 className="text-xs font-bold mb-2">Need clarification?</h4>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                Join our community for live support regarding these alpha terms and development roadmap.
                            </p>
                            <Button size="sm" variant="link" className="h-auto p-0 mt-3 text-primary text-[11px] hover:translate-x-1 transition-transform">
                                Contact Support →
                            </Button>
                        </motion.div>
                    </aside>

                    {/* Content Area */}
                    <div className="lg:col-span-3 space-y-24 pb-20">
                        {/* Hero Section */}
                        <motion.section
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold uppercase tracking-wider text-primary">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                </span>
                                System Protocol v1.0-alpha
                            </div>
                            <h1 className="text-5xl sm:text-7xl font-display font-bold tracking-tight leading-[1.1]">
                                Engineering <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-red-400 to-orange-400">
                                    Trust & Protocol
                                </span>
                            </h1>
                            <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed">
                                Our community is built on transparency. These terms outline our experimental framework, data handling, and user standards during the alpha testing phase.
                            </p>
                            <div className="flex items-center gap-6 pt-4 text-xs font-medium text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-[1px] bg-white/10" />
                                    Last updated: March 11, 2026
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-[1px] bg-white/10" />
                                    Read time: 4 mins
                                </div>
                            </div>
                        </motion.section>

                        {/* Sections List */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="space-y-20"
                        >
                            <section id="status" className="scroll-mt-32 group">
                                <div className="glass-card p-8 sm:p-12 rounded-[2.5rem] border-white/5 hover:border-white/10 transition-all duration-700 shadow-glass-heavy relative overflow-hidden bg-white/[0.01]">
                                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-yellow-500/10 blur-[100px] rounded-full group-hover:bg-yellow-500/15 transition-colors duration-700" />

                                    <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-10">
                                        <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20 group-hover:scale-110 transition-transform duration-500">
                                            <AlertTriangle className="w-7 h-7 text-yellow-500" />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-bold font-display tracking-tight text-foreground group-hover:translate-x-1 transition-transform duration-500">Experimental Status</h2>
                                            <p className="text-yellow-500/60 text-sm font-medium">Important Development Disclosure</p>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-5 gap-8">
                                        <div className="md:col-span-3 space-y-6 text-muted-foreground leading-relaxed text-lg font-light">
                                            <p>
                                                Vixora is currently in <span className="text-foreground font-semibold px-2 py-0.5 rounded-md bg-white/5 border border-white/5 shadow-sm">Development Mode</span>.
                                                This platform is a high-performance prototype designed for architectural validation.
                                            </p>
                                            <p>
                                                By interacting with Vixora, you acknowledge that the system is experimental, subject to frequent breaking changes, and may experience periods of instability. We do not provide an uptime SLA during this alpha phase.
                                            </p>
                                        </div>
                                        <div className="md:col-span-2 space-y-4">
                                            {[
                                                'Frequent breaking changes',
                                                'No uptime guarantees',
                                                'Architectural validation',
                                                'API endpoint mutations'
                                            ].map((text, i) => (
                                                <div key={i} className="flex items-center gap-3 text-sm text-foreground/80 font-medium p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                                                    {text}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section id="privacy" className="scroll-mt-32 group">
                                <div className="glass-card p-8 sm:p-12 rounded-[2.5rem] border-white/5 hover:border-white/10 transition-all duration-700 shadow-glass-heavy relative overflow-hidden bg-white/[0.01]">
                                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 blur-[100px] rounded-full group-hover:bg-primary/15 transition-colors duration-700" />

                                    <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-10">
                                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform duration-500">
                                            <Shield className="w-7 h-7 text-primary" />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-bold font-display tracking-tight text-foreground group-hover:translate-x-1 transition-transform duration-500">Data & Privacy</h2>
                                            <p className="text-primary/60 text-sm font-medium">Digital Identity & Asset Governance</p>
                                        </div>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-6">
                                        {[
                                            { title: 'Transient Storage', desc: 'Content uploaded (videos, posts, transcripts) is considered temporary and may be deleted during maintenance windows.' },
                                            { title: 'Secure Identity', desc: 'Authentication data is stored using industry-standard encryption, but currently exists within a sandbox environment.' },
                                            { title: 'Account Governance', desc: 'We reserve the right to prune inactive or testing accounts to optimize resource allocation during the alpha phase.' },
                                            { title: 'Beta Analytics', desc: 'System usage is monitored strictly to improve AI transcript accuracy and streaming performance benchmarks.' }
                                        ].map((item, idx) => (
                                            <div key={idx} className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all duration-500 group/item">
                                                <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                    {item.title}
                                                </h4>
                                                <p className="text-sm text-muted-foreground leading-relaxed font-light">{item.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            <section id="responsibility" className="scroll-mt-32 group">
                                <div className="glass-card p-8 sm:p-12 rounded-[2.5rem] border-white/5 hover:border-white/10 transition-all duration-700 shadow-glass-heavy relative overflow-hidden bg-white/[0.01]">
                                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full group-hover:bg-blue-500/15 transition-colors duration-700" />

                                    <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-10">
                                        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform duration-500">
                                            <Lock className="w-7 h-7 text-blue-500" />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-bold font-display tracking-tight text-foreground group-hover:translate-x-1 transition-transform duration-500">User Responsibility</h2>
                                            <p className="text-blue-500/60 text-sm font-medium">Protocol Compliance & Stewardship</p>
                                        </div>
                                    </div>

                                    <div className="space-y-10">
                                        <div className="relative">
                                            <div className="absolute -left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-blue-500/20 to-transparent" />
                                            <p className="text-2xl sm:text-3xl font-display font-medium text-foreground/90 leading-tight tracking-tight italic">
                                                "You are the sole custodian of your cryptographic identity and all content broadcasted through your account."
                                            </p>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-10 text-muted-foreground font-light leading-relaxed">
                                            <p>
                                                Users are responsible for ensuring their content complies with international safety standards and intellectual property protocols. Vixora acts as a conduit for experimental distribution.
                                            </p>
                                            <p>
                                                Vixora is not liable for systemic outputs, including but not limited to AI-generated transcript inaccuracies, rendering failures, or algorithmic routing errors during this phase.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </motion.div>

                        <footer className="pt-20 border-t border-white/5 print:pt-10 print:mt-10">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                className="glass-card p-12 rounded-[3rem] text-center space-y-8 bg-gradient-to-b from-white/[0.02] to-transparent border-white/5 print:border-none print:shadow-none print:bg-transparent print:p-0"
                            >
                                <div className="space-y-4 max-w-xl mx-auto">
                                    <h3 className="text-3xl font-bold font-display print:text-xl">Ready to Proceed?</h3>
                                    <p className="text-muted-foreground leading-relaxed print:text-sm">
                                        By continuing to use Vixora, you acknowledge and accept these experimental protocols in their entirety.
                                    </p>
                                </div>
                                <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4 print:hidden">
                                    <Link to="/register?accepted=true">
                                        <Button size="lg" className="h-16 px-12 bg-primary hover:shadow-[0_0_40px_rgba(239,68,68,0.3)] rounded-2xl text-lg font-bold group transition-all duration-500">
                                            I Accept Protocol
                                            < ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </Link>
                                    <Button
                                        size="lg"
                                        variant="ghost"
                                        className="h-16 px-12 rounded-2xl text-lg hover:bg-white/5 border border-white/5"
                                        onClick={() => window.print()}
                                    >
                                        Print PDF
                                    </Button>
                                </div>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.3em] print:block">
                                    Digital Signature Required for Node Access
                                </p>
                            </motion.div>
                        </footer>
                    </div>
                </div>
            </div>
        </div>
    )
}
