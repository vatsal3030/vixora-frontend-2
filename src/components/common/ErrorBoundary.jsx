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
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.reload();
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-background p-4">
                    <div className="max-w-md w-full text-center space-y-6">
                        <div className="flex justify-center">
                            <div className="p-4 bg-red-500/10 rounded-full text-red-500">
                                <AlertTriangle className="w-12 h-12" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold">Something went wrong</h1>
                            <p className="text-muted-foreground">
                                We've encountered an unexpected error. Our team has been notified.
                            </p>
                        </div>

                        {import.meta.env.DEV && this.state.error && (
                            <div className="text-left bg-muted p-4 rounded-lg overflow-auto max-h-48 text-xs font-mono">
                                <p className="text-red-500 font-bold mb-2">{this.state.error.toString()}</p>
                                <pre>{this.state.errorInfo?.componentStack}</pre>
                            </div>
                        )}

                        <div className="flex gap-4 justify-center">
                            <Button onClick={this.handleReset} className="gap-2">
                                <RefreshCw className="w-4 h-4" />
                                Reload Page
                            </Button>
                            <Button variant="outline" onClick={() => window.location.href = '/'}>
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
