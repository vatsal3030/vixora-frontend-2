import { Skeleton } from "../ui/Skeleton"
// import { cn } from "../../lib/utils"

export function AppSkeleton() {
    return (
        <div className="min-h-screen bg-background">
            {/* Navbar Skeleton */}
            <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-white/5 bg-background/80 backdrop-blur-xl flex items-center px-4 gap-4">
                <div className="flex items-center gap-4">
                    <Skeleton className="w-8 h-8 rounded-lg" />
                    <Skeleton className="w-24 h-6 rounded-md hidden sm:block" />
                </div>
                <div className="flex-1 max-w-2xl mx-auto px-4 hidden md:block">
                    <Skeleton className="w-full h-10 rounded-full" />
                </div>
                <div className="flex items-center gap-3 ml-auto">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <Skeleton className="w-8 h-8 rounded-full" />
                </div>
            </header>

            <div className="flex pt-16 h-screen">
                {/* Sidebar Skeleton - Hidden on mobile, generic width on desktop */}
                <aside className="hidden lg:flex flex-col w-64 border-r border-white/5 bg-background/50 h-full p-4 gap-2 fixed left-0 top-16 bottom-0">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-3">
                            <Skeleton className="w-5 h-5 rounded" />
                            <Skeleton className="h-4 w-32 rounded" />
                        </div>
                    ))}
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 lg:ml-64 p-6 overflow-y-auto">
                    {/* Page Header Skeleton */}
                    <div className="mb-8 space-y-4">
                        <Skeleton className="w-48 h-8 rounded-lg" />
                        <div className="flex gap-4">
                            <Skeleton className="w-24 h-8 rounded-full" />
                            <Skeleton className="w-24 h-8 rounded-full" />
                            <Skeleton className="w-24 h-8 rounded-full" />
                        </div>
                    </div>

                    {/* Content Grid Skeleton */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="space-y-3">
                                <Skeleton className="w-full aspect-video rounded-xl" />
                                <div className="flex gap-3">
                                    <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="w-full h-4 rounded" />
                                        <Skeleton className="w-2/3 h-3 rounded" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    )
}
