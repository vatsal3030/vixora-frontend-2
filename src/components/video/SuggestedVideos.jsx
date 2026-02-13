
import VideoCard from './VideoCard'

export default function SuggestedVideos({ videos }) {
    return (
        <div className="flex flex-col gap-4">
            {videos.slice(0, 8).map((video) => (
                <div key={video.id} className="w-full">
                    {/* Reuse VideoCard but maybe we want a smaller/horizontal version later */}
                    <VideoCard video={video} />
                </div>
            ))}
        </div>
    )
}
