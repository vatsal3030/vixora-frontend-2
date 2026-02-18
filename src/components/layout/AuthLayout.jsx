
import { Outlet } from 'react-router-dom'
import { PageTransition } from './PageTransition'

export function AuthLayout() {
    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden text-foreground selection:bg-primary/20">


            <div className="w-full max-w-md relative z-10">
                <PageTransition>
                    <Outlet />
                </PageTransition>
            </div>
        </div>
    )
}
