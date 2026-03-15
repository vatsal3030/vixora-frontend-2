export default function ShortsSkeleton() {
    return (
        <div className="w-full h-[calc(100vh-64px)] snap-start snap-always flex justify-center items-center bg-[#0f0f0f] sm:py-4">
            <div className="flex flex-col sm:flex-row h-full w-full sm:w-auto relative justify-center gap-0 sm:gap-4 animate-pulse">
                
                {/* Video Skeleton */}
                <div className="relative h-full w-full sm:w-[400px] xl:w-[450px] sm:aspect-[9/16] bg-white/5 sm:rounded-2xl shrink-0 border border-white/5" />
                
                {/* Desktop Side Actions Skeleton */}
                <div className="hidden sm:flex flex-col justify-end pb-0 pt-4 pr-2 gap-6 w-16">
                    <div className="w-12 h-12 rounded-full bg-white/5 mx-auto" />
                    <div className="w-12 h-12 rounded-full bg-white/5 mx-auto" />
                    <div className="w-12 h-12 rounded-full bg-white/5 mx-auto" />
                    <div className="w-12 h-12 rounded-full bg-white/5 mx-auto" />
                    <div className="w-12 h-12 rounded-full bg-white/5 mx-auto" />
                </div>

                {/* Mobile Side Actions Overlay Skeleton */}
                <div className="sm:hidden absolute bottom-20 right-2 z-20 flex flex-col items-center gap-5">
                    <div className="w-12 h-12 rounded-full bg-white/10" />
                    <div className="w-12 h-12 rounded-full bg-white/10" />
                    <div className="w-12 h-12 rounded-full bg-white/10" />
                    <div className="w-12 h-12 rounded-full bg-white/10" />
                    <div className="w-12 h-12 rounded-full bg-white/10" />
                </div>
                
                {/* Mobile Bottom Info Skeleton */}
                <div className="sm:hidden absolute bottom-0 left-0 right-0 p-4 pt-12 z-20 pb-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-white/10" />
                        <div className="w-32 h-4 rounded-full bg-white/10" />
                    </div>
                    <div className="w-3/4 h-3 rounded-full bg-white/10 mb-2" />
                    <div className="w-1/2 h-3 rounded-full bg-white/10" />
                </div>
            </div>
        </div>
    )
}
