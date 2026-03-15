import React from 'react';
import { Button } from '../ui/Button';
import { 
    AlertTriangle, 
    RefreshCw, 
    Home, 
    ChevronDown, 
    ChevronUp, 
    Copy, 
    Check,
    Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            showDetails: false,
            copied: false
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        if (import.meta.env.DEV) {
            console.error("Uncaught error:", error, errorInfo);
        }
        this.setState({ errorInfo });
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.reload();
    }

    handleCopyDetails = () => {
        const details = `${this.state.error?.toString()}\n\n${this.state.errorInfo?.componentStack}`;
        navigator.clipboard.writeText(details);
        this.setState({ copied: true });
        toast.success("Technical details copied to clipboard");
        setTimeout(() => this.setState({ copied: false }), 2000);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4 relative overflow-hidden font-sans">
                    {/* Dynamic Background */}
                    <div className="absolute inset-0 z-0">
                        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/10 blur-[120px] rounded-full animate-pulse" />
                        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
                    </div>

                    <motion.div 
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="max-w-2xl w-full relative z-10"
                    >
                        <div className="glass-panel border-white/5 p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                            {/* Decorative elements */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl -mr-16 -mt-16 rounded-full" />
                            
                            <div className="flex flex-col items-center text-center space-y-8">
                                {/* Icon with Glow */}
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                    className="relative"
                                >
                                    <div className="absolute inset-0 bg-red-600/30 blur-2xl rounded-full scale-150 animate-pulse" />
                                    <div className="relative p-6 bg-red-500/10 rounded-2xl text-red-500 border border-red-500/20 shadow-inner">
                                        <AlertTriangle className="w-16 h-16" strokeWidth={1.5} />
                                    </div>
                                </motion.div>

                                <div className="space-y-4">
                                    <motion.h1 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-4xl md:text-5xl font-bold tracking-tight text-white bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent"
                                    >
                                        Oops! Something slipped.
                                    </motion.h1>
                                    <motion.p 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.4 }}
                                        className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed"
                                    >
                                        Vixora ran into an unexpected hiccup. Don't worry, even the best orbits need a course correction sometimes.
                                    </motion.p>
                                </div>

                                {/* Action Buttons */}
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="flex flex-wrap gap-4 mt-4 justify-center"
                                >
                                    <Button 
                                        onClick={this.handleReset} 
                                        className="h-12 px-8 rounded-full gap-3 bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 transition-all hover:scale-105 active:scale-95 border-0 font-medium"
                                    >
                                        <RefreshCw className="w-5 h-5" />
                                        Repair & Reload
                                    </Button>
                                    <Button 
                                        variant="outline"
                                        onClick={() => window.location.href = '/'} 
                                        className="h-12 px-8 rounded-full gap-3 glass-card border-white/10 hover:bg-white/5 text-white transition-all hover:scale-105 active:scale-95 font-medium"
                                    >
                                        <Home className="w-5 h-5" />
                                        Back to Safety
                                    </Button>
                                </motion.div>

                                {/* Technical Details Accordion */}
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                    className="w-full pt-8 border-t border-white/5"
                                >
                                    <button 
                                        onClick={() => this.setState({ showDetails: !this.state.showDetails })}
                                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors mx-auto"
                                    >
                                        <Cpu className="w-4 h-4" />
                                        <span>Technical breakdown</span>
                                        {this.state.showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" /> }
                                    </button>

                                    <AnimatePresence>
                                        {this.state.showDetails && (
                                            <motion.div 
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden mt-6"
                                            >
                                                <div className="relative group">
                                                    <div className="text-left bg-[#0f0f0f]/80 backdrop-blur-md p-6 rounded-2xl border border-white/10 max-h-64 overflow-auto scrollbar-thin scrollbar-thumb-white/10">
                                                        <div className="flex justify-between items-start mb-4 sticky top-0 bg-[#0f0f0f]/50 backdrop-blur-sm py-1">
                                                            <span className="text-xs font-semibold uppercase tracking-wider text-red-500/80">Diagnostic Log</span>
                                                            <button 
                                                                onClick={this.handleCopyDetails}
                                                                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-muted-foreground hover:text-white"
                                                                title="Copy details"
                                                            >
                                                                {this.state.copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                                            </button>
                                                        </div>
                                                        <p className="text-red-400 font-mono text-sm mb-4 leading-relaxed">
                                                            {this.state.error?.toString()}
                                                        </p>
                                                        {this.state.errorInfo && (
                                                            <pre className="text-muted-foreground font-mono text-xs leading-5 whitespace-pre-wrap">
                                                                {this.state.errorInfo.componentStack}
                                                            </pre>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            </div>
                        </div>
                        
                        {/* Footer Hint */}
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="text-center mt-6 text-xs text-muted-foreground/50 uppercase tracking-[0.2em]"
                        >
                            Error Protocol V2.4 // Vixora Core
                        </motion.p>
                    </motion.div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
