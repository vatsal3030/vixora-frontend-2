
export default function ChannelBanner({ bannerUrl }) {
    return (
        <div className="w-full aspect-[16/9] sm:aspect-[4/1] md:aspect-[5/1] lg:aspect-[6/1] bg-gray-800 relative overflow-hidden">
            {bannerUrl ? (
                <img
                    src={bannerUrl}
                    alt="Channel Banner"
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="w-full h-full bg-gradient-to-r from-gray-800 to-gray-700" />
            )}
        </div>
    )
}
