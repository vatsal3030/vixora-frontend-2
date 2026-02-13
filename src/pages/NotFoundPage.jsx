import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Home, AlertCircle, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center">
                <div className="p-8 bg-secondary/30 rounded-full mb-8 animate-pulse shadow-2xl shadow-primary/20">
                    <AlertCircle className="w-24 h-24 text-primary" />
                </div>

                <h1 className="text-8xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500 font-display">404</h1>
                <h2 className="text-3xl font-bold mb-6 text-foreground">Page Not Found</h2>

                <p className="text-muted-foreground max-w-md mb-10 text-lg leading-relaxed">
                    Oops! The page you're looking for seems to have vanished into the digital void.
                </p>

                <div className="flex gap-4">
                    <Link to="/">
                        <Button size="lg" className="gap-2 px-8 rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300">
                            <Home className="w-5 h-5" />
                            Return Home
                        </Button>
                    </Link>
                    <Button variant="outline" size="lg" className="gap-2 px-8 rounded-full" onClick={() => window.history.back()}>
                        <ArrowLeft className="w-5 h-5" />
                        Go Back
                    </Button>
                </div>
            </div>
        </div>
    );
}
