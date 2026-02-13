import * as React from 'react'
import { Loader2 } from 'lucide-react'

// Suspense Fallback with loading spinner
export function SuspenseFallback({ message = 'Loading...' }) {
    return (
        <div className="flex items-center justify-center min-h-[400px] w-full">
            <div className="text-center space-y-4">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                <p className="text-sm text-muted-foreground">{message}</p>
            </div>
        </div>
    )
}

// Page Loading Placeholder
export function PageLoader() {
    return (
        <div className="flex items-center justify-center min-h-screen w-full">
            <div className="text-center space-y-4">
                <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
                <p className="text-lg font-medium">Loading...</p>
            </div>
        </div>
    )
}

// Component Loading Skeleton
export function ComponentLoader({ className = '' }) {
    return (
        <div className={`flex items-center justify-center p-8 ${className}`}>
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
    )
}
