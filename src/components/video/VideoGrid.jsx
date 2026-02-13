
import VideoCard from './VideoCard'

export default function VideoGrid({ videos, isLoading = false }) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                        <div className="aspect-video bg-gray-800 rounded-xl mb-3" />
                        <div className="flex gap-3">
                            <div className="w-9 h-9 bg-gray-800 rounded-full shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-800 rounded w-3/4" />
                                <div className="h-3 bg-gray-800 rounded w-1/2" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (!videos?.length) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <p className="text-xl font-semibold">No videos found</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
            {videos.map((video) => (
                <VideoCard key={video.id} video={video} />
            ))}
        </div>
    )
}
