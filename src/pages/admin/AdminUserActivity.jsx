import { useState, useEffect } from 'react'
import { adminService } from '../../services/api'
import { toast } from 'sonner'
import {
    Activity,
    Search,
    Play,
    Heart,
    HeartOff,
    MessageSquare,
    UserPlus,
    UserMinus,
    Upload,
    MessageCircle,
    LogIn,
    Globe,
    Clock,
    Flame,
    Users,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react'
import { Avatar } from '../../components/ui/Avatar'
import { getMediaUrl } from '../../lib/media'
import { Skeleton } from '../../components/ui/Skeleton'
import { formatTimeAgo } from '../../lib/utils'
import { motion } from 'framer-motion'

function ActivityTableSkeleton({ rows = 8, cols = 5 }) {
    return (
        <tbody className="divide-y divide-white/5">
            {[...Array(rows)].map((_, r) => (
                <tr key={r}>
                    {[...Array(cols)].map((_, c) => (
                        <td key={c} className="p-4">
                            <Skeleton className={`h-4 ${c === 0 ? 'w-40' : c === cols - 1 ? 'w-16 ml-auto' : 'w-24'}`} />
                        </td>
                    ))}
                </tr>
            ))}
        </tbody>
    )
}

const ACTION_CONFIG = {
    WATCH: { label: 'Watched Video', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20', icon: Play },
    LIKE: { label: 'Liked', color: 'text-pink-400 bg-pink-500/10 border-pink-500/20', icon: Heart },
    UNLIKE: { label: 'Unliked', color: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20', icon: HeartOff },
    COMMENT: { label: 'Commented', color: 'text-green-400 bg-green-500/10 border-green-500/20', icon: MessageSquare },
    SUBSCRIBE: { label: 'Subscribed', color: 'text-red-400 bg-red-500/10 border-red-500/20', icon: UserPlus },
    UNSUBSCRIBE: { label: 'Unsubscribed', color: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20', icon: UserMinus },
    UPLOAD: { label: 'Uploaded Video', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', icon: Upload },
    TWEET: { label: 'Posted Tweet', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20', icon: MessageCircle },
    LOGIN: { label: 'Logged In', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', icon: LogIn },
}

const ACTION_OPTIONS = [
    { value: '', label: 'All Actions' },
    { value: 'WATCH', label: 'Watch' },
    { value: 'LIKE', label: 'Like' },
    { value: 'UNLIKE', label: 'Unlike' },
    { value: 'COMMENT', label: 'Comment' },
    { value: 'SUBSCRIBE', label: 'Subscribe' },
    { value: 'UNSUBSCRIBE', label: 'Unsubscribe' },
    { value: 'UPLOAD', label: 'Upload' },
    { value: 'TWEET', label: 'Tweet' },
    { value: 'LOGIN', label: 'Login' },
]

export default function AdminUserActivity() {
    const [activities, setActivities] = useState([])
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [statsLoading, setStatsLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalItems, setTotalItems] = useState(0)

    const [searchQuery, setSearchQuery] = useState('')
    const [actionFilter, setActionFilter] = useState('')
    const [period, setPeriod] = useState('7d')

    const fetchStats = async () => {
        try {
            setStatsLoading(true)
            const res = await adminService.getUserActivityStats({ period })
            if (res.data.success) {
                setStats(res.data.data)
            }
        } catch {
            // non-fatal
        } finally {
            setStatsLoading(false)
        }
    }

    const fetchActivities = async (currentPage = 1) => {
        try {
            setLoading(true)
            const params = {
                page: currentPage,
                limit: 25,
            }
            if (searchQuery) params.search = searchQuery
            if (actionFilter) params.action = actionFilter

            const res = await adminService.getUserActivities(params)
            if (res.data.success) {
                const data = res.data.data
                setActivities(data.items || data.activities || [])
                const pagination = data.pagination || {}
                setTotalPages(pagination.totalPages || 1)
                setTotalItems(pagination.totalItems || 0)
                setPage(pagination.currentPage || currentPage)
            }
        } catch (err) {
            console.error(err)
            toast.error('Failed to load user activities')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStats()
    }, [period])

    useEffect(() => {
        setPage(1)
        fetchActivities(1)
    }, [actionFilter])

    const handleSearch = (e) => {
        e.preventDefault()
        setPage(1)
        fetchActivities(1)
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-title sm:text-title-lg font-display font-bold">User Activity</h1>
                    <p className="text-muted-foreground mt-1">
                        Detailed trail of actions performed by users on the platform
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {['24h', '7d', '30d'].map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-base ${
                                period === p
                                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                                    : 'glass-badge text-muted-foreground hover:text-white'
                            }`}
                        >
                            {p.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-5 rounded-xl flex items-center gap-4"
                >
                    <div className="p-3.5 rounded-xl bg-primary/10 text-primary">
                        <Activity className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground">Total Actions ({period})</p>
                        <p className="text-2xl font-bold font-display text-foreground mt-0.5">
                            {statsLoading ? '...' : (stats?.totalActions || 0).toLocaleString()}
                        </p>
                    </div>
                </motion.div>

                {/* Top Actions breakdown */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="glass-card p-5 rounded-xl md:col-span-2 flex flex-col justify-center"
                >
                    <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-amber-400" /> Action Distribution
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {statsLoading ? (
                            <div className="flex gap-2">
                                <Skeleton className="h-6 w-20 rounded-full" />
                                <Skeleton className="h-6 w-24 rounded-full" />
                                <Skeleton className="h-6 w-16 rounded-full" />
                            </div>
                        ) : stats?.actionBreakdown && stats.actionBreakdown.length > 0 ? (
                            stats.actionBreakdown.map((item) => {
                                const cfg = ACTION_CONFIG[item.action] || { label: item.action, color: 'text-zinc-400 bg-zinc-500/10' }
                                return (
                                    <span
                                        key={item.action}
                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}
                                    >
                                        <span>{cfg.label || item.action}:</span>
                                        <span className="font-bold">{item.count.toLocaleString()}</span>
                                    </span>
                                )
                            })
                        ) : (
                            <span className="text-xs text-muted-foreground">No actions logged in this period</span>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Most Active Users Banner */}
            {stats?.topActiveUsers && stats.topActiveUsers.length > 0 && (
                <div className="glass-card p-4 rounded-xl">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-primary" /> Most Active Users
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                        {stats.topActiveUsers.map((item, idx) => (
                            <div
                                key={item.user?.id || idx}
                                className="flex items-center gap-2.5 p-2.5 rounded-lg bg-secondary/30 border border-white/5"
                            >
                                <Avatar src={getMediaUrl(item.user?.avatar)} alt={item.user?.username} size="sm" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-foreground truncate">
                                        {item.user?.fullName || item.user?.username}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground truncate">
                                        @{item.user?.username}
                                    </p>
                                </div>
                                <span className="text-xs font-bold text-primary px-1.5 py-0.5 rounded bg-primary/10">
                                    {item.actionCount}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
                <form onSubmit={handleSearch} className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by user, email, or action..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-white/10 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-base"
                    />
                </form>
                <select
                    value={actionFilter}
                    onChange={(e) => setActionFilter(e.target.value)}
                    className="px-3 py-2.5 bg-secondary/50 border border-white/10 rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                >
                    {ACTION_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>

            {/* Activity Table */}
            <div className="glass-card rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/5 bg-secondary/30">
                                <th className="text-left p-4 pl-6 font-medium text-muted-foreground">User</th>
                                <th className="text-left p-4 font-medium text-muted-foreground">Action</th>
                                <th className="text-left p-4 font-medium text-muted-foreground">Details</th>
                                <th className="text-left p-4 font-medium text-muted-foreground">IP / Client</th>
                                <th className="text-right p-4 pr-6 font-medium text-muted-foreground">Time</th>
                            </tr>
                        </thead>
                        {loading ? (
                            <ActivityTableSkeleton rows={8} cols={5} />
                        ) : activities.length === 0 ? (
                            <tbody>
                                <tr>
                                    <td colSpan="5" className="p-12 text-center text-muted-foreground">
                                        No activity logs recorded yet
                                    </td>
                                </tr>
                            </tbody>
                        ) : (
                            <tbody className="divide-y divide-white/5">
                                {activities.map((log) => {
                                    const cfg = ACTION_CONFIG[log.action] || {
                                        label: log.action,
                                        color: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20',
                                        icon: Activity,
                                    }
                                    const Icon = cfg.icon

                                    return (
                                        <tr key={log.id} className="hover:bg-secondary/20 transition-colors duration-base">
                                            <td className="p-4 pl-6">
                                                <div className="flex items-center gap-3">
                                                    <Avatar src={getMediaUrl(log.user?.avatar)} alt={log.user?.username} size="sm" />
                                                    <div>
                                                        <div className="font-medium text-foreground">{log.user?.fullName || log.user?.username}</div>
                                                        <div className="text-xs text-muted-foreground">@{log.user?.username}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
                                                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                                                    {cfg.label}
                                                </span>
                                            </td>
                                            <td className="p-4 text-xs text-muted-foreground max-w-[280px] truncate">
                                                {log.targetType && (
                                                    <span className="font-mono text-zinc-300 mr-2 bg-white/5 px-1.5 py-0.5 rounded">
                                                        {log.targetType}
                                                    </span>
                                                )}
                                                {log.metadata ? (
                                                    <span title={JSON.stringify(log.metadata)}>
                                                        {log.metadata.title || log.metadata.preview || log.metadata.query || (log.metadata.progress !== undefined ? `${Math.round(log.metadata.progress)}% progress` : log.targetId || '—')}
                                                    </span>
                                                ) : (
                                                    log.targetId || '—'
                                                )}
                                            </td>
                                            <td className="p-4 text-xs text-muted-foreground">
                                                <div className="flex items-center gap-1.5">
                                                    <Globe className="w-3.5 h-3.5 text-zinc-500" />
                                                    <span className="font-mono">{log.ip || '—'}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 pr-6 text-right text-xs text-muted-foreground whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Clock className="w-3 h-3 text-zinc-500" />
                                                    {formatTimeAgo(log.createdAt)}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        )}
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-white/5 text-xs text-muted-foreground">
                        <span>Showing page {page} of {totalPages} ({totalItems} items)</span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => {
                                    if (page > 1) {
                                        const newPage = page - 1
                                        setPage(newPage)
                                        fetchActivities(newPage)
                                    }
                                }}
                                disabled={page <= 1 || loading}
                                className="p-1.5 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => {
                                    if (page < totalPages) {
                                        const newPage = page + 1
                                        setPage(newPage)
                                        fetchActivities(newPage)
                                    }
                                }}
                                disabled={page >= totalPages || loading}
                                className="p-1.5 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
