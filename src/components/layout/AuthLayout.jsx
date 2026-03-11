import { Outlet, Link } from 'react-router-dom'
import { PageTransition } from './PageTransition'
import { BrandLogo } from '../common/BrandLogo'
import { motion } from 'framer-motion'
import { Sparkles, Play, ShieldCheck, Users } from 'lucide-react'

export function AuthLayout() {
    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-background text-foreground selection:bg-primary/20 overflow-hidden relative">
            {/* Global Seamless Background Elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden h-full w-full">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 opacity-50" />
                <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-primary/10 blur-[100px] rounded-full" />
                <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-primary/10 blur-[100px] rounded-full" />
            </div>

            {/* Left Side: Authentication Forms */}
            <div className="flex-1 flex items-start justify-start p-4 sm:p-8 lg:p-20 lg:pt-8 relative z-10 overflow-y-auto custom-scrollbar">
                <div className="w-full max-w-xl relative z-10">
                    <PageTransition>
                        <Outlet />
                    </PageTransition>
                </div>
            </div>

            {/* Right Side: Visual/Branding (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-start justify-center p-12 lg:pr-20 pt-20">
                <div className="relative z-10 max-w-md space-y-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <Link to="/" className="inline-flex items-center gap-3 group mb-6">
                            <BrandLogo size="xl" className="group-hover:scale-110 transition-transform duration-500 shadow-glow" />
                        </Link>

                        <h2 className="text-3xl sm:text-4xl font-display font-bold leading-[1.1] mb-4">
                            The future of <span className="text-gradient">Cinematic</span> Content Creation.
                        </h2>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            Join over 50k creators in the most immersive video community. Experience Liquid Glass design and AI-powered workflows.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-2 gap-6">
                        {[
                            { icon: Play, label: '4K Streaming' },
                            { icon: Sparkles, label: 'AI Powered' },
                            { icon: ShieldCheck, label: 'Secure Identity' },
                            { icon: Users, label: 'Creator Hub' }
                        ].map((item, id) => (
                            <motion.div
                                key={id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 + (id * 0.1) }}
                                className="flex items-center gap-3"
                            >
                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                    <item.icon className="w-5 h-5 text-primary" />
                                </div>
                                <span className="font-medium text-muted-foreground">{item.label}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
