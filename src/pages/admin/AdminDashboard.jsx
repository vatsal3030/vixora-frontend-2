import { useState, useEffect } from 'react'
import { adminService } from '../../services/api'
import { Users, Film, MessageSquare, Flag } from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { AdminDashboardSkeleton } from '../../components/skeletons/AdminDashboardSkeleton'

export default function AdminDashboard() {
    const [overview, setOverview] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchOverview = async () => {
            try {
                const res = await adminService.getDashboardOverview({ period: '7d' })
                if (res.data.success) {
                    setOverview(res.data.data)
                }
            } catch (error) {
                toast.error('Failed to load admin overview')
            } finally {
                setLoading(false)
            }
        }
        fetchOverview()
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
                            className="glass-card p-6 rounded-2xl flex items-center gap-4"
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
                {/* Placeholder for future charts or recent activity lists */}
                <div className="glass-card p-6 rounded-2xl min-h-[300px] flex items-center justify-center text-muted-foreground">
                    Activity Chart (Coming Soon)
                </div>
                <div className="glass-card p-6 rounded-2xl min-h-[300px] flex items-center justify-center text-muted-foreground">
                    Recent Reports (Coming Soon)
                </div>
            </div>
        </div>
    )
}
