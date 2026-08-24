import { useState, useEffect } from 'react'
import { adminService } from '../../services/api'
import { toast } from 'sonner'
import { MoreVertical, Shield, UserX, UserCheck, Check, Search, Filter } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Avatar } from '../../components/ui/Avatar'
import { getMediaUrl } from '../../lib/media'
import { Skeleton } from '../../components/ui/Skeleton'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../components/ui/DropdownMenu"

function AdminTableSkeleton({ rows = 6, cols = 5 }) {
    return (
        <tbody className="divide-y divide-white/5">
            {[...Array(rows)].map((_, r) => (
                <tr key={r}>
                    {[...Array(cols)].map((_, c) => (
                        <td key={c} className="p-4">
                            <Skeleton className={`h-4 ${c === 0 ? 'w-40' : c === cols - 1 ? 'w-8 ml-auto' : 'w-24'}`} />
                        </td>
                    ))}
                </tr>
            ))}
        </tbody>
    )
}

const STATUS_OPTIONS = [
    { value: '', label: 'All Status' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'RESTRICTED', label: 'Restricted' },
    { value: 'SUSPENDED', label: 'Suspended' },
]

const ROLE_OPTIONS = [
    { value: '', label: 'All Roles' },
    { value: 'USER', label: 'User' },
    { value: 'MODERATOR', label: 'Moderator' },
    { value: 'ADMIN', label: 'Admin' },
    { value: 'SUPER_ADMIN', label: 'Super Admin' },
]

const statusColors = {
    ACTIVE: 'bg-green-500/20 text-green-400',
    RESTRICTED: 'bg-amber-500/20 text-amber-400',
    SUSPENDED: 'bg-red-500/20 text-red-400',
}

export default function AdminUsers() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [roleFilter, setRoleFilter] = useState('')

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const params = { limit: 50 }
            if (searchQuery) params.search = searchQuery
            if (statusFilter) params.status = statusFilter
            if (roleFilter) params.role = roleFilter
            const res = await adminService.getUsers(params)
            setUsers(res.data.data?.users || res.data.data?.items || [])
        } catch (err) {
            console.error(err)
            toast.error('Failed to load users')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [statusFilter, roleFilter])

    const handleSearch = (e) => {
        e.preventDefault()
        fetchUsers()
    }

    const handleUpdateRole = async (userId, role) => {
        try {
            await adminService.updateUserRole(userId, { role, reason: 'Admin panel update' })
            toast.success(`Role updated to ${role}`)
            fetchUsers()
        } catch (err) {
            console.error(err)
            toast.error('Failed to update role')
        }
    }

    const handleUpdateStatus = async (userId, status) => {
        try {
            await adminService.updateUserStatus(userId, { status, reason: 'Admin panel status change' })
            toast.success(`User status updated to ${status}`)
            fetchUsers()
        } catch (err) {
            console.error(err)
            toast.error('Failed to update status')
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-title sm:text-title-lg font-display font-bold">Users</h1>
                <p className="text-muted-foreground mt-1">Manage platform users, roles, and status</p>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
                <form onSubmit={handleSearch} className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by username or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-white/10 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-base"
                    />
                </form>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2.5 bg-secondary/50 border border-white/10 rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                >
                    {STATUS_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-3 py-2.5 bg-secondary/50 border border-white/10 rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                >
                    {ROLE_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>

            <div className="glass-card rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/5 bg-secondary/30">
                                <th className="text-left p-4 pl-6 font-medium text-muted-foreground">User</th>
                                <th className="text-left p-4 font-medium text-muted-foreground">Email</th>
                                <th className="text-center p-4 font-medium text-muted-foreground">Role</th>
                                <th className="text-center p-4 font-medium text-muted-foreground">Status</th>
                                <th className="text-right p-4 pr-6 font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        {loading ? (
                            <AdminTableSkeleton rows={8} cols={5} />
                        ) : users.length === 0 ? (
                            <tbody>
                                <tr>
                                    <td colSpan="5" className="p-12 text-center text-muted-foreground">
                                        No users found
                                    </td>
                                </tr>
                            </tbody>
                        ) : (
                            <tbody className="divide-y divide-white/5">
                                {users.map((user) => {
                                    const userId = user._id || user.id
                                    const status = user.moderationStatus || 'ACTIVE'
                                    return (
                                        <tr key={userId} className="hover:bg-secondary/20 transition-colors duration-base">
                                            <td className="p-4 pl-6">
                                                <div className="flex items-center gap-3">
                                                    <Avatar src={getMediaUrl(user.avatar)} alt={user.username} size="sm" />
                                                    <div>
                                                        <div className="font-medium text-foreground">{user.fullName}</div>
                                                        <div className="text-xs text-muted-foreground">@{user.username}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-muted-foreground truncate max-w-[200px]">
                                                {user.email}
                                            </td>
                                            <td className="p-4">
                                                <div className={`mx-auto w-max px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                    user.role === 'USER' ? 'bg-secondary text-muted-foreground' : 'bg-primary/20 text-primary'
                                                }`}>
                                                    {user.role}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className={`mx-auto w-max px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                    statusColors[status] || statusColors.ACTIVE
                                                }`}>
                                                    {status}
                                                </div>
                                            </td>
                                            <td className="p-4 pr-6 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        {user.role === 'USER' && (
                                                            <DropdownMenuItem onClick={() => handleUpdateRole(userId, 'MODERATOR')}>
                                                                <Shield className="w-4 h-4 mr-2" /> Make Moderator
                                                            </DropdownMenuItem>
                                                        )}
                                                        {user.role !== 'USER' && (
                                                            <DropdownMenuItem onClick={() => handleUpdateRole(userId, 'USER')}>
                                                                <UserCheck className="w-4 h-4 mr-2" /> Revoke Permissions
                                                            </DropdownMenuItem>
                                                        )}
                                                        {status === 'SUSPENDED' ? (
                                                            <DropdownMenuItem onClick={() => handleUpdateStatus(userId, 'ACTIVE')} className="text-green-500">
                                                                <Check className="w-4 h-4 mr-2" /> Reactivate User
                                                            </DropdownMenuItem>
                                                        ) : (
                                                            <DropdownMenuItem onClick={() => handleUpdateStatus(userId, 'SUSPENDED')} className="text-red-500">
                                                                <UserX className="w-4 h-4 mr-2" /> Suspend User
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        )}
                    </table>
                </div>
            </div>
        </div>
    )
}
