import { Link } from 'react-router-dom'
import { Home, Search, Compass } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export default function NotFoundPage() {
    useDocumentTitle('Page Not Found - Vixora')

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center animate-in fade-in zoom-in duration-500">
            <div className="relative mb-8">
                <h1 className="text-9xl font-black text-white/5 select-none tracking-tighter">404</h1>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Compass className="w-24 h-24 text-primary animate-pulse" />
                </div>
            </div>
            
            <h2 className="text-3xl font-bold mb-4 tracking-tight">Lost in the Void</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto text-lg">
                The page you're looking for doesn't exist or has been moved to another universe.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto">
                <Link to="/" className="flex-1">
                    <Button
                        variant="default"
                        className="w-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                    >
                        <Home className="w-4 h-4 mr-2" />
                        Back to Home
                    </Button>
                </Link>
                <Link to="/search" className="flex-1">
                    <Button variant="outline" className="w-full">
                        <Search className="w-4 h-4 mr-2" />
                        Search
                    </Button>
                </Link>
            </div>
        </div>
    )
}
