import { notificationService } from '../services/api'
import { Bell, Check, Trash2, Loader2, CheckCheck } from 'lucide-react'
import { formatTimeAgo } from '../lib/utils'
import { Button } from '../components/ui/Button'
import { toast } from 'sonner'
import { Link, useNavigate } from 'react-router-dom'
import { Avatar } from '../components/ui/Avatar'
import { NotificationSkeleton } from '../components/skeletons/NotificationSkeleton'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMediaUrl } from '../lib/media'

export default function NotificationsPage() {
    const queryClient = useQueryClient()
    const navigate = useNavigate()

    // Fetch Notifications
    const { data: notifications = [], isLoading: loading } = useQuery({
        queryKey: ['notifications', 'all'],
        queryFn: async () => {
            const res = await notificationService.getAllNotifications()
            return res.data.data?.items || []
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

    const handleNotificationClick = (notification) => {
        if (!notification.isRead) {
            markAsRead(notification.id || notification._id)
        }
        if (notification.targetUrl) {
            navigate(notification.targetUrl)
        }
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
                <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <NotificationSkeleton key={i} />
                    ))}
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
                            className={`group relative flex items-start gap-4 p-4 rounded-xl border transition-all hover:shadow-md cursor-pointer ${notification.isRead
                                ? 'bg-card border-border hover:bg-white/5'
                                : 'bg-primary/5 border-primary/20 hover:bg-primary/10'
                                }`}
                            onClick={() => handleNotificationClick(notification)}
                        >
                            <Link to={notification.sender?.username ? `/@${notification.sender.username}` : '#'} onClick={(e) => e.stopPropagation()} className="shrink-0">
                                <Avatar
                                    src={getMediaUrl(notification.sender?.avatar)}
                                    alt={notification.sender?.username || 'User'}
                                    className="w-12 h-12 border border-border"
                                />
                            </Link>

                            <div className="flex-1 min-w-0 pt-0.5">
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm font-medium leading-normal">
                                        {notification.sender?.username && (
                                            <Link to={`/@${notification.sender.username}`} className="hover:underline font-bold" onClick={(e) => e.stopPropagation()}>
                                                {notification.sender.username}
                                            </Link>
                                        )}
                                        {' '}
                                        <span className={notification.isRead ? 'text-muted-foreground' : 'text-foreground font-semibold'}>
                                            {notification.message}
                                        </span>
                                    </p>
                                    <span className="text-xs text-muted-foreground mt-1">
                                        {formatTimeAgo(notification.createdAt)}
                                    </span>
                                </div>
                            </div>

                            {notification.video && (
                                <div className="shrink-0 w-[120px] sm:w-[136px] aspect-video rounded-lg overflow-hidden relative border border-white/10 hidden sm:block">
                                    <img src={getMediaUrl(notification.video.thumbnail)} alt={notification.video.title} className="w-full h-full object-cover" />
                                </div>
                            )}

                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity self-center ml-2">
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
