import { useState, useEffect } from 'react'
import { adminService } from '../../services/api'
import { toast } from 'sonner'
import { MoreVertical, Shield, UserX, UserCheck, Check } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Avatar } from '../../components/ui/Avatar'
import { getMediaUrl } from '../../lib/media'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../components/ui/DropdownMenu"

export default function AdminUsers() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const res = await adminService.getUsers({ limit: 50 })
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
    }, [])

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
                <h1 className="text-3xl font-display font-bold">Users</h1>
                <p className="text-muted-foreground mt-1">Manage platform users, roles, and status</p>
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
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center text-muted-foreground">
                                        Loading users...
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center text-muted-foreground">
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user._id || user.id} className="hover:bg-secondary/20 transition-colors">
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
                                                user.status === 'SUSPENDED' ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'
                                            }`}>
                                                {user.status || 'ACTIVE'}
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
                                                        <DropdownMenuItem onClick={() => handleUpdateRole(user._id || user.id, 'MODERATOR')}>
                                                            <Shield className="w-4 h-4 mr-2" /> Make Moderator
                                                        </DropdownMenuItem>
                                                    )}
                                                    {user.role !== 'USER' && (
                                                        <DropdownMenuItem onClick={() => handleUpdateRole(user._id || user.id, 'USER')}>
                                                            <UserCheck className="w-4 h-4 mr-2" /> Revoke Permissions
                                                        </DropdownMenuItem>
                                                    )}
                                                    {user.status === 'SUSPENDED' ? (
                                                        <DropdownMenuItem onClick={() => handleUpdateStatus(user._id || user.id, 'ACTIVE')} className="text-green-500">
                                                            <Check className="w-4 h-4 mr-2" /> Reactivate User
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem onClick={() => handleUpdateStatus(user._id || user.id, 'SUSPENDED')} className="text-red-500">
                                                            <UserX className="w-4 h-4 mr-2" /> Suspend User
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
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
