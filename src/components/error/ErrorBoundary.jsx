import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import { Button } from '../ui/Button';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center animate-in fade-in zoom-in duration-500">
                    <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
                        <AlertCircle className="w-12 h-12 text-red-500" />
                    </div>
                    <h1 className="text-3xl font-bold mb-4">Oops! Something went wrong.</h1>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                        We're sorry, but an unexpected error occurred. Please try refreshing the page or navigating back to the home page.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button
                            variant="default"
                            onClick={() => window.location.reload()}
                            className="bg-primary hover:bg-primary/90 min-w-[140px]"
                        >
                            <RefreshCcw className="w-4 h-4 mr-2" />
                            Refresh Page
                        </Button>
                        {/* We use an anchor tag for Home to force a full reload and clear React state */}
                        <a href="/">
                            <Button variant="outline" className="min-w-[140px] w-full">
                                <Home className="w-4 h-4 mr-2" />
                                Go Home
                            </Button>
                        </a>
                    </div>
                    {process.env.NODE_ENV === 'development' && (
                        <div className="mt-12 text-left max-w-2xl w-full p-4 bg-red-500/10 rounded-lg overflow-auto border border-red-500/20">
                            <p className="text-red-400 font-mono text-sm break-words">
                                {this.state.error?.toString()}
                            </p>
                        </div>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}
