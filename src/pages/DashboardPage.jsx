import { useState } from 'react'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { dashboardService } from '../services/api'
import { BarChart3, Users, Play, ThumbsUp, TrendingUp, ArrowUpDown, ArrowUp, ArrowDown, Download, Video } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatSubscribers, formatViews } from '../lib/utils'
import { useQuery } from '@tanstack/react-query'
import { DashboardStatsCard } from '../components/dashboard/DashboardStatsCard'
import { DashboardCharts } from '../components/dashboard/DashboardCharts'
import { EmptyDashboardState } from '../components/dashboard/EmptyDashboardState'
import { Button } from '../components/ui/Button'
import { toast } from 'sonner'
import { DashboardSkeleton } from '../components/dashboard/DashboardSkeleton'
import { motion } from 'framer-motion' // eslint-disable-line
const PERIODS = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last Year' }
]

const DEMO_DATA = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return {
        date: d.toISOString(),
        views: Math.floor(Math.random() * 5000) + 1000,
        subscribers: Math.floor(Math.random() * 50) + 5,
        likes: Math.floor(Math.random() * 500) + 50
    }
})

export default function DashboardPage() {
    useDocumentTitle('Creator Dashboard - Vixora')
    const [period, setPeriod] = useState('7d')
    const [sortField, setSortField] = useState('views')
    const [sortOrder, setSortOrder] = useState('desc')
    const [showDemoData, setShowDemoData] = useState(false)

    // Fetch Overview Stats (reactive on period)
    const { data: overview, isLoading: overviewLoading } = useQuery({
        queryKey: ['dashboardOverview', period],
        queryFn: async () => {
            try {
                const res = await dashboardService.getOverview(period)
                return res.data.data
            } catch {
                return null
            }
        },
        retry: 1
    })

    // Fetch Analytics Stats
    const { data: analytics, isLoading: analyticsLoading } = useQuery({
        queryKey: ['dashboardAnalytics', period],
        queryFn: async () => {
            try {
                const res = await dashboardService.getAnalytics(period)
                return res.data.data || {}
            } catch {
                return {}
            }
        }
    })

    // Fetch Top Videos (reactive on period)
    const { data: topVideosRaw, isLoading: videosLoading } = useQuery({
        queryKey: ['dashboardTopVideos', period],
        queryFn: async () => {
            try {
                const res = await dashboardService.getTopVideos({ period })
                return res.data.data
            } catch {
                return null
            }
        },
        retry: 1
    })

    const topVideos = topVideosRaw?.items || []

    const loading = overviewLoading || analyticsLoading || videosLoading

    // Logic to determine if we should show empty state or demo data
    // cards.videos.value is the authoritative field; fallback to legacy flat key
    const hasData = (overview?.cards?.videos?.value ?? overview?.videosCount ?? 0) > 0


    const demoAnalytics = DEMO_DATA



    // Sorting Logic for Videos
    const handleSort = (field) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortOrder('desc')
        }
    }

    const sortedVideos = [...topVideos].sort((a, b) => {
        // metrics are nested under video.metrics.views etc.
        const getVal = (v) => {
            if (sortField === 'views') return v.metrics?.views || v.views || 0
            if (sortField === 'likes') return v.metrics?.likes || v.likes || 0
            if (sortField === 'comments') return v.metrics?.comments || v.comments || 0
            return v[sortField] || 0
        }
        return sortOrder === 'asc' ? getVal(a) - getVal(b) : getVal(b) - getVal(a)
    })

    const renderSortIcon = (field) => {
        if (sortField !== field) return <ArrowUpDown className="w-4 h-4 opacity-40 min-w-[16px]" />
        return sortOrder === 'asc' ? <ArrowUp className="w-4 h-4 min-w-[16px]" /> : <ArrowDown className="w-4 h-4 min-w-[16px]" />
    }

    const handleExport = () => {
        toast.info("Exporting data...", { description: "Download will start shortly." })
        // Mock download
        setTimeout(() => toast.success("Dashboard_Analytics.csv downloaded"), 1000)
    }

    if (loading) {
        return <DashboardSkeleton />
    }

    if (!hasData && !showDemoData) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-7xl animate-in fade-in duration-500">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Channel Dashboard</h1>
                </div>
                <EmptyDashboardState
                    onUpload={() => window.location.href = '/upload'}
                    onDemo={() => setShowDemoData(true)}
                />
            </div>
        )
    }

    // Effective Data (Real or Demo)
    const stats = showDemoData ? {
        subscribers: 1250,
        views: 45000,
        likes: 3200,
        videosCount: 12,
        recentSubscribers: 45,
        recentViews: 5200,
        recentLikes: 350
    } : {
        // Map from API shape: data.cards.subscribers.value etc. (with fallback to legacy flat keys)
        subscribers: overview?.cards?.subscribers?.value ?? overview?.subscribers ?? 0,
        views: overview?.cards?.views?.value ?? overview?.views ?? 0,
        likes: overview?.cards?.likes?.value ?? overview?.likes ?? 0,
        videosCount: overview?.cards?.videos?.value ?? overview?.videosCount ?? 0,
        recentSubscribers: overview?.cards?.subscribers?.trend?.absChange ?? overview?.recentSubscribers ?? 0,
        recentViews: overview?.cards?.views?.trend?.absChange ?? overview?.recentViews ?? 0,
        recentLikes: overview?.cards?.likes?.trend?.absChange ?? overview?.recentLikes ?? 0
    }

    // analytics.chart is the merged timeline from backend (views, subscribers, likes series)
    const chartData = showDemoData ? demoAnalytics : (analytics?.chart || analytics?.viewsChart || [])

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto px-4 py-6 max-w-7xl space-y-8"
        >
            {/* Header */}
            <div className="flex flex-col gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Channel Dashboard</h1>
                    <p className="text-muted-foreground mt-1 text-sm sm:text-base">Overview of your channel's performance.</p>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    {showDemoData && (
                        <Button variant="outline" size="sm" onClick={() => setShowDemoData(false)} className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20 text-xs sm:text-sm">
                            Exit Demo Mode
                        </Button>
                    )}

                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="bg-card border border-border rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium hover:bg-secondary cursor-pointer transition-colors focus:ring-2 focus:ring-primary focus:outline-none"
                    >
                        {PERIODS.map(p => (
                            <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                    </select>

                    <Button variant="outline" size="icon" onClick={handleExport} title="Export Data" className="h-8 w-8 sm:h-9 sm:w-9">
                        <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </Button>

                    <Link to="/upload" className="ml-auto sm:ml-0">
                        <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-lg shadow-primary/25 text-xs sm:text-sm">
                            <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                            <span className="hidden xs:inline">Upload Video</span>
                            <span className="xs:hidden">Upload</span>
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Grid - 1 col mobile, 2 cols tablet, 4 cols desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <DashboardStatsCard
                    title="Total Subscribers"
                    value={formatSubscribers(stats?.subscribers || 0)}
                    icon={Users}
                    trend={stats?.recentSubscribers >= 0 ? 'up' : 'down'}
                    trendValue={Math.round(((stats?.recentSubscribers || 0) / (stats?.subscribers || 1)) * 100)}
                    color="primary"
                    loading={loading}
                    data={chartData.map(d => ({ value: d.subscribers }))}
                />
                <DashboardStatsCard
                    title="Total Views"
                    value={formatViews(stats?.views || 0)}
                    icon={Play}
                    trend={stats?.recentViews >= 0 ? 'up' : 'down'}
                    trendValue={Math.round(((stats?.recentViews || 0) / (stats?.views || 1)) * 100)}
                    color="blue"
                    loading={loading}
                    data={chartData.map(d => ({ value: d.views }))}
                />
                <DashboardStatsCard
                    title="Total Likes"
                    value={formatViews(stats?.likes || 0).replace('views', '')} // Cleaner number
                    icon={ThumbsUp}
                    trend={stats?.recentLikes >= 0 ? 'up' : 'down'}
                    trendValue={Math.round(((stats?.recentLikes || 0) / (stats?.likes || 1)) * 100)}
                    color="green"
                    loading={loading}
                    data={chartData.map(d => ({ value: d.likes }))}
                />
                <DashboardStatsCard
                    title="Total Videos"
                    value={stats?.videosCount || 0}
                    icon={BarChart3}
                    trend="neutral"
                    trendValue={0}
                    color="purple"
                    loading={loading}
                    data={[]} // No sparkline for count
                />
            </div>

            {/* Main Charts */}
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
                <DashboardCharts
                    data={chartData}
                    loading={loading}
                    className="overflow-hidden"
                />
            </div>

            {/* Top Videos */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        Top Performing Videos
                    </h2>
                    {/* Could add 'View All' link later */}
                </div>

                <div className="rounded-xl border border-white/5 glass-card overflow-hidden shadow-sm">
                    {/* Responsive Table Wrapper */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-secondary/30">
                                    <th className="text-left p-4 pl-6 font-medium text-muted-foreground w-[40%]">Video</th>
                                    <th className="text-right p-4 font-medium text-muted-foreground">Date Uploaded</th>
                                    <th
                                        className="text-right p-4 font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none"
                                        onClick={() => handleSort('views')}
                                    >
                                        <div className="flex items-center justify-end gap-1">
                                            Views
                                            {renderSortIcon('views')}
                                        </div>
                                    </th>
                                    <th
                                        className="text-right p-4 font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none"
                                        onClick={() => handleSort('likesCount')}
                                    >
                                        <div className="flex items-center justify-end gap-1">
                                            Likes
                                            {renderSortIcon('likesCount')}
                                        </div>
                                    </th>
                                    <th
                                        className="text-right p-4 pr-6 font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none"
                                        onClick={() => handleSort('commentsCount')}
                                    >
                                        <div className="flex items-center justify-end gap-1">
                                            Comments
                                            {renderSortIcon('commentsCount')}
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {sortedVideos.length === 0 && !showDemoData ? (
                                    <tr>
                                        <td colSpan="5" className="p-12 text-center text-muted-foreground">
                                            No videos found
                                        </td>
                                    </tr>
                                ) : (
                                    (showDemoData ? [1, 2, 3, 4, 5] : sortedVideos).map((video, index) => {
                                        // Mock video data for demo
                                        const isMock = typeof video === 'number'
                                        const v = isMock ? {
                                            _id: index,
                                            title: `Demo Video ${video}: Amazing Content`,
                                            thumbnail: `https://picsum.photos/seed/${index}/320/180`,
                                            createdAt: new Date().toISOString(),
                                            views: (index + 1) * 1234,
                                            likesCount: (index + 1) * 123,
                                            commentsCount: (index + 1) * 12
                                        } : video

                                        return (
                                            <tr key={v._id} className="group hover:bg-secondary/40 transition-colors">
                                                <td className="p-4 pl-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-28 aspect-video bg-black rounded-lg overflow-hidden flex-shrink-0 shadow-sm border border-border/50">
                                                            <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <Link to={isMock ? '#' : `/watch/${v._id}`} className="font-medium text-foreground hover:text-primary transition-colors line-clamp-2 mb-1">
                                                                {v.title}
                                                            </Link>
                                                            {isMock && <span className="text-xs bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">Demo</span>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right text-muted-foreground whitespace-nowrap">
                                                    {new Date(v.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                </td>
                                                <td className="p-4 text-right font-medium tabular-nums">
                                                    {formatViews(v.views).replace('views', '')}
                                                </td>
                                                <td className="p-4 text-right text-muted-foreground tabular-nums">
                                                    {formatViews(v.likesCount).replace('views', '')}
                                                </td>
                                                <td className="p-4 pr-6 text-right text-muted-foreground tabular-nums">
                                                    {v.commentsCount || 0}
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
