import { useState, useEffect } from 'react'
import { adminService } from '../../services/api'
import { Users, Film, MessageSquare, Flag, TrendingUp, Clapperboard, ListVideo, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { AdminDashboardSkeleton } from '../../components/skeletons/AdminDashboardSkeleton'
import { formatTimeAgo } from '../../lib/utils'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Avatar } from '../../components/ui/Avatar'
import { getMediaUrl } from '../../lib/media'

export default function AdminDashboard() {
    const [overview, setOverview] = useState(null)
    const [activityData, setActivityData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const [overviewRes, activityRes] = await Promise.all([
                    adminService.getDashboardOverview({ period: '7d' }),
                    adminService.getDashboardActivity({ period: '7d' })
                ])
                if (overviewRes.data.success) {
                    setOverview(overviewRes.data.data)
                }
                if (activityRes.data.success) {
                    setActivityData(activityRes.data.data)
                }
            } catch (error) {
                toast.error('Failed to load admin dashboard')
            } finally {
                setLoading(false)
            }
        }
        fetchDashboard()
    }, [])

    if (loading) {
        return <AdminDashboardSkeleton />
    }

    const totals = overview?.totals || {}
    const moderation = overview?.moderation || {}

    const stats = [
        { label: 'Total Users', value: totals.users || 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { label: 'Videos', value: totals.videos || 0, icon: Film, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        { label: 'Shorts', value: totals.shorts || 0, icon: Clapperboard, color: 'text-pink-400', bg: 'bg-pink-500/10' },
        { label: 'Tweets', value: totals.tweets || 0, icon: MessageCircle, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
        { label: 'Comments', value: totals.comments || 0, icon: MessageSquare, color: 'text-green-400', bg: 'bg-green-500/10' },
        { label: 'Playlists', value: totals.playlists || 0, icon: ListVideo, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        { label: 'Pending Reports', value: totals.reportsPending || 0, icon: Flag, color: 'text-red-400', bg: 'bg-red-500/10' },
        { label: 'Admin Actions', value: moderation.adminActionsInPeriod || 0, icon: TrendingUp, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    ]

    // Build chart data from backend series
    const series = activityData?.series || {}
    const reportVolume = series.reportVolume || []
    const actionsTaken = series.actionsTaken || []
    const restrictions = series.accountRestrictions || []

    // Merge series into unified chart data by date label
    const chartData = reportVolume.map((item, i) => ({
        name: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
        reports: item.value || 0,
        actions: actionsTaken[i]?.value || 0,
        restrictions: restrictions[i]?.value || 0,
    }))

    // If no real data, show a meaningful empty state
    const hasChartData = chartData.length > 0 && chartData.some(d => d.reports > 0 || d.actions > 0 || d.restrictions > 0)

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-title sm:text-title-lg font-display font-bold text-foreground">Admin Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Platform overview and moderation statistics</p>
                </div>
                {overview?.period && (
                    <span className="text-xs font-medium text-muted-foreground bg-secondary px-3 py-1.5 rounded-full">
                        Last {overview.period}
                    </span>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, i) => {
                    const Icon = stat.icon
                    return (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="glass-card p-4 sm:p-5 rounded-xl flex items-center gap-3 hover:bg-white/5 transition-colors duration-base"
                        >
                            <div className={`p-3 rounded-lg ${stat.bg}`}>
                                <Icon className={`w-5 h-5 ${stat.color}`} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-medium text-muted-foreground truncate">
                                    {stat.label}
                                </p>
                                <p className="text-xl font-bold font-display text-foreground">
                                    {stat.value.toLocaleString()}
                                </p>
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            {/* User Status Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="glass-card p-4 rounded-xl flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm text-muted-foreground">Active Users</span>
                    <span className="ml-auto font-bold text-foreground">{(totals.activeUsers || 0).toLocaleString()}</span>
                </div>
                <div className="glass-card p-4 rounded-xl flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-sm text-muted-foreground">Restricted</span>
                    <span className="ml-auto font-bold text-foreground">{(totals.restrictedUsers || 0).toLocaleString()}</span>
                </div>
                <div className="glass-card p-4 rounded-xl flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-sm text-muted-foreground">Suspended</span>
                    <span className="ml-auto font-bold text-foreground">{(totals.suspendedUsers || 0).toLocaleString()}</span>
                </div>
            </div>

            {/* Chart */}
            <div className="glass-card p-6 rounded-xl min-h-[350px] flex flex-col min-w-0">
                <h2 className="text-lg font-bold mb-4 font-display">Moderation Activity ({overview?.period || '7d'})</h2>
                {hasChartData ? (
                    <div className="flex-1 w-full min-w-0 min-h-[300px]">
                        <ResponsiveContainer width="100%" height={300} minWidth={0} minHeight={200}>
                            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f87171" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorActions" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorRestrictions" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} />
                                <YAxis stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="reports" name="Reports" stroke="#f87171" fillOpacity={1} fill="url(#colorReports)" />
                                <Area type="monotone" dataKey="actions" name="Actions Taken" stroke="#60a5fa" fillOpacity={1} fill="url(#colorActions)" />
                                <Area type="monotone" dataKey="restrictions" name="Restrictions" stroke="#fbbf24" fillOpacity={1} fill="url(#colorRestrictions)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                        No moderation activity in this period
                    </div>
                )}
            </div>
        </div>
    )
}
