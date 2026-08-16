import { useState, useEffect } from 'react'
import { adminService } from '../../services/api'
import { Users, Film, MessageSquare, Flag, Activity } from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { AdminDashboardSkeleton } from '../../components/skeletons/AdminDashboardSkeleton'
import { formatTimeAgo } from '../../lib/utils'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function AdminDashboard() {
    const [overview, setOverview] = useState(null)
    const [activity, setActivity] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const [overviewRes, activityRes] = await Promise.all([
                    adminService.getDashboardOverview({ period: '7d' }),
                    adminService.getDashboardActivity({ limit: 10 })
                ])
                if (overviewRes.data.success) {
                    setOverview(overviewRes.data.data)
                }
                if (activityRes.data.success) {
                    setActivity(activityRes.data.data?.items || [])
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

    const stats = [
        { label: 'Total Users', value: overview?.totalUsers || 0, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'Total Videos', value: overview?.totalVideos || 0, icon: Film, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        { label: 'Pending Reports', value: overview?.pendingReports || 0, icon: Flag, color: 'text-red-500', bg: 'bg-red-500/10' },
        { label: 'Total Comments', value: overview?.totalComments || 0, icon: MessageSquare, color: 'text-green-500', bg: 'bg-green-500/10' }
    ]

    // Sample data for recharts (ideally this comes from overview.timeSeries)
    const chartData = overview?.timeSeries || [
        { name: 'Mon', users: 400, videos: 24 },
        { name: 'Tue', users: 300, videos: 13 },
        { name: 'Wed', users: 500, videos: 98 },
        { name: 'Thu', users: 278, videos: 39 },
        { name: 'Fri', users: 189, videos: 48 },
        { name: 'Sat', users: 239, videos: 38 },
        { name: 'Sun', users: 349, videos: 43 },
    ]

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display font-bold text-foreground">Admin Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Platform overview and general statistics</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => {
                    const Icon = stat.icon
                    return (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="glass-card p-6 rounded-2xl flex items-center gap-4 hover:bg-white/5 transition-colors"
                        >
                            <div className={`p-4 rounded-xl ${stat.bg}`}>
                                <Icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">
                                    {stat.label}
                                </p>
                                <p className="text-2xl font-bold font-display text-foreground">
                                    {stat.value.toLocaleString()}
                                </p>
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                <div className="glass-card p-6 rounded-2xl min-h-[350px] flex flex-col min-w-0">
                    <h2 className="text-lg font-bold mb-4 font-display">Platform Growth (Weekly)</h2>
                    <div className="flex-1 w-full min-w-0 min-h-[300px]">
                        <ResponsiveContainer width="100%" height={300} minWidth={0} minHeight={200}>
                            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorVideos" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)'}} />
                                <YAxis stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)'}} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="users" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUsers)" />
                                <Area type="monotone" dataKey="videos" stroke="#a855f7" fillOpacity={1} fill="url(#colorVideos)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity List */}
                <div className="glass-card p-6 rounded-2xl min-h-[350px] flex flex-col">
                    <h2 className="text-lg font-bold mb-4">Recent Audit Activity</h2>
                    <div className="flex-1 overflow-y-auto pr-2 space-y-4 no-scrollbar">
                        {activity.length === 0 ? (
                            <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                                No recent activity
                            </div>
                        ) : (
                            activity.map((log) => (
                                <div key={log._id || log.id} className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0">
                                        <Activity className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-foreground">
                                            <span className="font-semibold text-primary">@{log.admin?.username}</span> {log.action.toLowerCase().replace(/_/g, ' ')}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-muted-foreground">{formatTimeAgo(log.createdAt)}</span>
                                            <span className="text-xs text-muted-foreground px-1.5 py-0.5 rounded-md bg-white/5">{log.targetType}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
