
export default function ChannelBanner({ bannerUrl }) {
    return (
        <div className="w-full aspect-[16/9] sm:aspect-[4/1] md:aspect-[5/1] lg:aspect-[6/1] bg-gray-900 relative overflow-hidden group">
            {bannerUrl ? (
                <img
                    src={bannerUrl}
                    alt="Channel Banner"
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/40 via-black to-black">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                </div>
            )}
        </div>
    )
}
