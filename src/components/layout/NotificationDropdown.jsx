import { useState } from 'react'
import { notificationService } from '../../services/api'
import { Bell, Trash2, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatTimeAgo } from '../../lib/utils'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator
} from "../ui/DropdownMenu"
import { Button } from '../ui/Button'
import { toast } from 'sonner'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export default function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false)
    const queryClient = useQueryClient()

    // Query for Notifications List - refetch on window focus or open can be handled by Query keys
    const { data: notifications = [], isLoading: listLoading } = useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            const res = await notificationService.getAllNotifications()
            return res.data.data.notifications || []
        },
        enabled: isOpen // Only fetch when open
    })

    // Query for Unread Count - poll occasionally?
    const { data: unreadCount = 0 } = useQuery({
        queryKey: ['unreadCount'],
        queryFn: async () => {
            const res = await notificationService.getUnreadCount()
            return res.data.data.unreadCount || 0
        },
        refetchInterval: 60000 // Poll every minute
    })

    const markReadMutation = useMutation({
        mutationFn: (id) => notificationService.markAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
            queryClient.invalidateQueries({ queryKey: ['unreadCount'] })
        }
    })

    const markAllReadMutation = useMutation({
        mutationFn: () => notificationService.markAllAsRead(),
        onSuccess: () => {
            toast.success('All marked as read')
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
            queryClient.invalidateQueries({ queryKey: ['unreadCount'] })
        },
        onError: () => toast.error('Failed to mark all as read')
    })

    const deleteMutation = useMutation({
        mutationFn: (id) => notificationService.deleteNotification(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
            queryClient.invalidateQueries({ queryKey: ['unreadCount'] })
        }
    })

    const handleOpenChange = (open) => {
        setIsOpen(open)
    }

    const markAsRead = (id) => {
        markReadMutation.mutate(id)
    }

    const markAllAsRead = () => {
        markAllReadMutation.mutate()
    }

    const deleteNotification = (e, id) => {
        e.stopPropagation()
        deleteMutation.mutate(id)
    }

    return (
        <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
            <DropdownMenuTrigger asChild>
                <button className="relative p-2 hover:bg-secondary rounded-full transition-colors outline-none">
                    <Bell className="w-5 h-5 text-foreground" />
                    {unreadCount > 0 && (
                        <span className="absolute top-0.5 right-0.5 h-2.5 w-2.5 rounded-full bg-primary animate-pulse border-2 border-background box-content" />
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 max-h-[500px] overflow-hidden flex flex-col notification-dropdown">
                <DropdownMenuLabel className="flex justify-between items-center bg-popover z-10 py-3 px-4 border-b">
                    <span className="font-bold">Notifications</span>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllAsRead}
                            disabled={markAllReadMutation.isPending}
                            className="h-6 text-xs px-2 text-primary hover:text-primary hover:bg-primary/10"
                        >
                            Mark all read
                        </Button>
                    )}
                </DropdownMenuLabel>

                {listLoading && notifications.length === 0 ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                        <Bell className="w-8 h-8 opacity-20" />
                        No notifications
                    </div>
                ) : (
                    <div className="py-1 overflow-y-auto notification-list">
                        {notifications.map((notification) => (
                            <DropdownMenuItem
                                key={notification._id}
                                className={`flex flex-col items-start gap-1 p-3 cursor-pointer mb-1 mx-1 rounded-lg ${!notification.isRead ? 'bg-primary/5' : ''}`}
                                onClick={() => !notification.isRead && markAsRead(notification._id)}
                            >
                                <div className="flex justify-between w-full gap-2">
                                    <p className="text-sm line-clamp-2 leading-snug">
                                        <span className="font-semibold">{notification.sender?.username}</span> {notification.message}
                                    </p>
                                    <button
                                        onClick={(e) => deleteNotification(e, notification._id)}
                                        className="text-muted-foreground hover:text-destructive transition-colors shrink-0 p-1 rounded-md hover:bg-destructive/10"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                                <span className="text-[10px] text-muted-foreground font-medium">
                                    {formatTimeAgo(notification.createdAt)}
                                </span>
                            </DropdownMenuItem>
                        ))}
                    </div>
                )}
                {notifications.length > 0 && (
                    <div className="p-2 border-t sticky bottom-0 bg-popover text-center">
                        <Link to="/notifications" onClick={() => setIsOpen(false)}>
                            <Button variant="ghost" size="sm" className="w-full text-xs">
                                View All Notifications
                            </Button>
                        </Link>
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
