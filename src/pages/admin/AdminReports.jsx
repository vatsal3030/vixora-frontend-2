import { useState, useEffect } from 'react'
import { adminService } from '../../services/api'
import { toast } from 'sonner'
import { Flag, Check, X, Eye } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { formatTimeAgo } from '../../lib/utils'

export default function AdminReports() {
    const [reports, setReports] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchReports = async () => {
        try {
            setLoading(true)
            const res = await adminService.getReports({ limit: 50 })
            setReports(res.data.data?.items || [])
        } catch (err) {
            console.error(err)
            toast.error('Failed to load reports')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchReports()
    }, [])

    const handleResolve = async (reportId, resolution, actionTaken) => {
        try {
            await adminService.resolveReport(reportId, { resolution, actionTaken })
            toast.success(`Report marked as ${resolution}`)
            fetchReports()
        } catch (err) {
            console.error(err)
            toast.error('Failed to resolve report')
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-display font-bold">Reports</h1>
                <p className="text-muted-foreground mt-1">Review and resolve user reports</p>
            </div>

            <div className="glass-card rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/5 bg-secondary/30">
                                <th className="text-left p-4 pl-6 font-medium text-muted-foreground">Target</th>
                                <th className="text-left p-4 font-medium text-muted-foreground">Reason</th>
                                <th className="text-left p-4 font-medium text-muted-foreground">Reporter</th>
                                <th className="text-right p-4 font-medium text-muted-foreground">Status</th>
                                <th className="text-right p-4 pr-6 font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center text-muted-foreground">
                                        Loading reports...
                                    </td>
                                </tr>
                            ) : reports.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center text-muted-foreground">
                                        No pending reports found
                                    </td>
                                </tr>
                            ) : (
                                reports.map((report) => (
                                    <tr key={report._id || report.id} className="hover:bg-secondary/20 transition-colors">
                                        <td className="p-4 pl-6">
                                            <div className="font-medium flex items-center gap-2">
                                                <span className="text-xs px-2 py-0.5 rounded-md bg-secondary text-foreground uppercase">{report.targetType}</span>
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1 truncate max-w-[200px]">{report.targetId}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium text-red-400 capitalize">{report.reason.replace(/_/g, ' ')}</div>
                                            <div className="text-xs text-muted-foreground mt-1 line-clamp-2 max-w-[300px]">{report.description || 'No description provided'}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm">@{report.reporter?.username}</div>
                                            <div className="text-xs text-muted-foreground mt-1">{formatTimeAgo(report.createdAt)}</div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                report.status === 'RESOLVED' ? 'bg-green-500/20 text-green-500' :
                                                report.status === 'DISMISSED' ? 'bg-secondary text-muted-foreground' :
                                                'bg-yellow-500/20 text-yellow-500'
                                            }`}>
                                                {report.status}
                                            </span>
                                        </td>
                                        <td className="p-4 pr-6 text-right">
                                            {report.status === 'PENDING' && (
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="text-green-500 hover:text-green-400 hover:bg-green-500/10"
                                                        onClick={() => handleResolve(report._id || report.id, 'RESOLVED', 'ACTION_TAKEN')}
                                                    >
                                                        <Check className="w-4 h-4 mr-1" /> Resolve
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="text-muted-foreground hover:text-white"
                                                        onClick={() => handleResolve(report._id || report.id, 'DISMISSED', 'NO_ACTION')}
                                                    >
                                                        <X className="w-4 h-4 mr-1" /> Dismiss
                                                    </Button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
