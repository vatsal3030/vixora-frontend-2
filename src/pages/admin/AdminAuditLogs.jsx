import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminService } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'sonner'
import { formatTimeAgo } from '../../lib/utils'
import { AdminTableSkeleton } from '../../components/skeletons/AdminTableSkeleton'
import { ShieldAlert } from 'lucide-react'

export default function AdminAuditLogs() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const isSuperAdmin = user?.role === 'SUPER_ADMIN'

    const fetchLogs = async () => {
        if (!isSuperAdmin) {
            setLoading(false)
            return
        }
        try {
            setLoading(true)
            const res = await adminService.getAuditLogs({ limit: 50 })
            setLogs(res.data.data?.items || [])
        } catch (err) {
            console.error(err)
            toast.error('Failed to load audit logs')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!isSuperAdmin) {
            navigate('/admin/dashboard', { replace: true })
            return
        }
        fetchLogs()
    }, [isSuperAdmin])

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-title sm:text-title-lg font-display font-bold">Audit Logs</h1>
                <p className="text-muted-foreground mt-1">Track administrative actions across the platform</p>
            </div>

            <div className="glass-card rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/5 bg-secondary/30">
                                <th className="text-left p-4 pl-6 font-medium text-muted-foreground">Admin</th>
                                <th className="text-left p-4 font-medium text-muted-foreground">Action</th>
                                <th className="text-left p-4 font-medium text-muted-foreground">Target</th>
                                <th className="text-right p-4 pr-6 font-medium text-muted-foreground">Timestamp</th>
                            </tr>
                        </thead>
                        {loading ? (
                            <AdminTableSkeleton rows={8} cols={4} />
                        ) : logs.length === 0 ? (
                            <tbody>
                                <tr>
                                    <td colSpan="4" className="p-12 text-center text-muted-foreground">
                                        No audit logs found
                                    </td>
                                </tr>
                            </tbody>
                        ) : (
                            <tbody className="divide-y divide-white/5">
                                {logs.map((log) => (
                                    <tr key={log._id || log.id} className="hover:bg-secondary/20 transition-colors">
                                        <td className="p-4 pl-6">
                                            <div className="text-sm font-medium">@{log.admin?.username}</div>
                                            <div className="text-xs text-muted-foreground mt-1">{log.ipAddress}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className="inline-flex px-2 py-0.5 rounded border border-white/10 bg-white/5 text-xs font-mono font-medium text-foreground">
                                                {log.action}
                                            </span>
                                            {log.reason && <div className="text-xs text-muted-foreground mt-1">Reason: {log.reason}</div>}
                                        </td>
                                        <td className="p-4">
                                            <div className="text-xs font-mono text-muted-foreground uppercase">{log.targetType}</div>
                                            <div className="text-xs text-foreground mt-1">{log.targetId}</div>
                                        </td>
                                        <td className="p-4 pr-6 text-right">
                                            <div className="text-xs text-muted-foreground">{formatTimeAgo(log.createdAt)}</div>
                                            <div className="text-[10px] text-muted-foreground/60 mt-1">{new Date(log.createdAt).toLocaleString()}</div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        )}
                    </table>
                </div>
            </div>
        </div>
    )
}
