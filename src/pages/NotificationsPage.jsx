import { notificationService } from '../services/api'
import { Bell, Check, Trash2, Loader2, CheckCheck } from 'lucide-react'
import { formatTimeAgo } from '../lib/utils'
import { Button } from '../components/ui/Button'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'
import { Avatar } from '../components/ui/Avatar'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export default function NotificationsPage() {
    const queryClient = useQueryClient()

    // Fetch Notifications
    const { data: notifications = [], isLoading: loading } = useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            const res = await notificationService.getAllNotifications()
            return res.data.data.notifications || []
        }
    })

    // Mark as Read Mutation
    const markReadMutation = useMutation({
        mutationFn: (id) => notificationService.markAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
            queryClient.invalidateQueries({ queryKey: ['unreadCount'] })
        }
    })

    // Mark All as Read Mutation
    const markAllReadMutation = useMutation({
        mutationFn: () => notificationService.markAllAsRead(),
        onSuccess: () => {
            toast.success('All marked as read')
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
            queryClient.invalidateQueries({ queryKey: ['unreadCount'] })
        },
        onError: () => toast.error('Failed to mark all as read')
    })

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: (id) => notificationService.deleteNotification(id),
        onSuccess: () => {
            toast.success('Notification deleted')
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
            queryClient.invalidateQueries({ queryKey: ['unreadCount'] })
        },
        onError: () => toast.error('Failed to delete notification')
    })

    // Delete All Mutation
    const deleteAllMutation = useMutation({
        mutationFn: () => notificationService.deleteAllNotifications(),
        onSuccess: () => {
            toast.success('All notifications deleted')
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
            queryClient.invalidateQueries({ queryKey: ['unreadCount'] })
        },
        onError: () => toast.error('Failed to delete all notifications')
    })


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

    const deleteAllNotifications = () => {
        if (!window.confirm('Are you sure you want to delete all notifications?')) return
        deleteAllMutation.mutate()
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-red-500/10 rounded-full text-primary">
                        <Bell className="w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-bold">Notifications</h1>
                </div>

                {notifications.length > 0 && (
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={markAllAsRead}
                            disabled={markAllReadMutation.isPending}
                            className="flex-1 sm:flex-none"
                        >
                            <CheckCheck className="w-4 h-4 mr-2" />
                            Mark all read
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={deleteAllNotifications}
                            disabled={deleteAllMutation.isPending}
                            className="flex-1 sm:flex-none hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Clear all
                        </Button>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-card rounded-2xl border border-border">
                    <div className="p-4 bg-secondary rounded-full">
                        <Bell className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold">No notifications</h3>
                        <p className="text-muted-foreground">You're all caught up!</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {notifications.map((notification) => (
                        <div
                            key={notification._id}
                            className={`group relative flex items-start gap-4 p-4 rounded-xl border transition-all hover:shadow-md ${notification.isRead
                                ? 'bg-card border-border'
                                : 'bg-primary/5 border-primary/20'
                                }`}
                            onClick={() => !notification.isRead && markAsRead(notification._id)}
                        >
                            <Link to={notification.sender?.username ? `/channel/${notification.sender.username}` : '#'} onClick={(e) => e.stopPropagation()}>
                                <Avatar
                                    src={notification.sender?.avatar}
                                    alt={notification.sender?.username || 'User'}
                                    className="w-10 h-10 border border-border"
                                />
                            </Link>

                            <div className="flex-1 min-w-0 pt-0.5">
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm font-medium leading-normal">
                                        <Link to={notification.sender?.username ? `/channel/${notification.sender.username}` : '#'} className="hover:underline font-bold" onClick={(e) => e.stopPropagation()}>
                                            {notification.sender?.username}
                                        </Link>
                                        {' '}
                                        <span className={notification.isRead ? 'text-muted-foreground' : 'text-foreground'}>
                                            {notification.message}
                                        </span>
                                    </p>
                                    <span className="text-xs text-muted-foreground">
                                        {formatTimeAgo(notification.createdAt)}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                {!notification.isRead && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 hover:text-green-500"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            markAsRead(notification._id)
                                        }}
                                        title="Mark as read"
                                    >
                                        <Check className="w-4 h-4" />
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 hover:text-destructive hover:bg-destructive/10"
                                    onClick={(e) => deleteNotification(e, notification._id)}
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
