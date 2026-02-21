import React from 'react';
import { Button } from '../ui/Button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
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

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/20 via-background to-background pointer-events-none" />

                    <div className="max-w-md w-full text-center space-y-8 relative z-10 glass-panel p-8 rounded-2xl shadow-premium border-white/10">
                        <div className="flex justify-center">
                            <div className="p-4 bg-red-500/10 rounded-full text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                                <AlertTriangle className="w-12 h-12" />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h1 className="text-3xl font-bold tracking-tight">Something went wrong</h1>
                            <p className="text-muted-foreground text-sm">
                                We've encountered an unexpected error. Our team has been notified.
                            </p>
                        </div>

                        {import.meta.env.DEV && this.state.error && (
                            <div className="text-left bg-black/40 p-4 rounded-lg overflow-auto max-h-48 text-xs font-mono border border-white/5">
                                <p className="text-red-400 font-bold mb-2">{this.state.error.toString()}</p>
                                <pre className="text-muted-foreground">{this.state.errorInfo?.componentStack}</pre>
                            </div>
                        )}

                        <div className="flex gap-4 justify-center">
                            <Button onClick={this.handleReset} className="gap-2 bg-white/10 hover:bg-white/20 text-white border-0">
                                <RefreshCw className="w-4 h-4" />
                                Reload
                            </Button>
                            <Button variant="default" onClick={() => window.location.href = '/'} className="bg-red-600 hover:bg-red-700 text-white">
                                Go Home
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
