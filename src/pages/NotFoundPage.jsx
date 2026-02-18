import { Link } from 'react-router-dom'
import { Home, ArrowLeft, Search } from 'lucide-react'
import { Button } from '../components/ui/Button'

export default function NotFoundPage() {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-background">


            <div className="relative z-10 flex flex-col items-center text-center p-8 max-w-2xl animate-fade-in">
                <h1 className="text-[150px] font-bold leading-none text-transparent bg-clip-text bg-gradient-to-b from-white/10 to-transparent select-none blur-sm absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    404
                </h1>

                <div className="glass-card p-12 rounded-3xl border border-white/10 flex flex-col items-center backdrop-blur-xl shadow-premium">
                    <div className="w-24 h-24 mb-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
                        <Search className="w-10 h-10 text-muted-foreground" />
                    </div>

                    <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                        Page Not Found
                    </h2>

                    <p className="text-muted-foreground mb-8 text-lg max-w-md">
                        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <Link to="/">
                            <Button size="lg" className="w-full sm:w-auto gap-2 rounded-full shadow-glow">
                                <Home className="w-5 h-5" />
                                Go Home
                            </Button>
                        </Link>
                        <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2 rounded-full" onClick={() => window.history.back()}>
                            <ArrowLeft className="w-5 h-5" />
                            Go Back
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
