import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

const TABS = ['Videos', 'Shorts', 'Playlists', 'Tweets', 'About']

export default function ChannelTabs({ activeTab, onChange }) {
    return (
        <div className="border-b border-white/5 sticky top-[56px] glass-nav z-10 w-full overflow-x-auto scrollbar-hide">
            <div className="flex px-4 max-w-7xl mx-auto">
                {TABS.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => onChange(tab)}
                        className={cn(
                            "relative px-8 py-4 text-sm font-medium transition-colors whitespace-nowrap",
                            activeTab === tab ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                        )}
                    >
                        {tab}
                        {activeTab === tab && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                        )}
                    </button>
                ))}
            </div>
        </div>
    )
}
