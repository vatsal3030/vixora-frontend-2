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
            return res.data.data?.items || []
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
            <DropdownMenuContent
                align="end"
                sideOffset={8}
                collisionPadding={16}
                className="w-[380px] max-w-[calc(100vw-32px)] max-h-[500px] overflow-hidden flex flex-col notification-dropdown rounded-2xl border-white/10 shadow-premium bg-black/80 backdrop-blur-xl"
            >
                <DropdownMenuLabel className="flex justify-between items-center bg-popover/95 backdrop-blur-sm z-10 py-3 px-4 border-b border-white/10">
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
                                className={`flex items-start gap-3 p-3 sm:p-4 cursor-pointer mb-1 mx-1 rounded-xl transition-colors group ${!notification.isRead ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-white/5'}`}
                                onClick={() => {
                                    if (!notification.isRead) markAsRead(notification._id)
                                }}
                                asChild
                            >
                                <Link to={notification.actionUrl?.url || '#'} className="w-full relative pr-8">
                                    {/* Sender Avatar */}
                                    <div className="shrink-0 pt-0.5">
                                        <img 
                                            src={notification.sender?.avatar || '/default-avatar.png'} 
                                            alt={notification.sender?.username} 
                                            className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover"
                                        />
                                    </div>
                                    
                                    {/* Content */}
                                    <div className="flex-1 min-w-0 pr-2">
                                        <p className="text-[0.9rem] leading-tight text-foreground line-clamp-3">
                                            {notification.message}
                                        </p>
                                        <span className="text-[0.75rem] text-muted-foreground mt-1.5 block">
                                            {formatTimeAgo(notification.createdAt)}
                                        </span>
                                    </div>

                                    {/* Video Thumbnail (if any) */}
                                    {notification.video?.thumbnail && (
                                        <div className="shrink-0 w-20 aspect-video rounded overflow-hidden">
                                            <img 
                                                src={notification.video.thumbnail} 
                                                alt="Thumbnail" 
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}

                                    {/* Unread indicator */}
                                    {!notification.isRead && (
                                        <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
                                    )}

                                    {/* Delete Button */}
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault()
                                            deleteNotification(e, notification._id)
                                        }}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all p-1.5 rounded-full hover:bg-white/10"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </Link>
                            </DropdownMenuItem>
                        ))}
                    </div>
                )}
                <div className="p-2 border-t border-white/10 sticky bottom-0 bg-popover/95 backdrop-blur-sm text-center">
                    <Link to="/notifications" onClick={() => setIsOpen(false)}>
                        <Button variant="ghost" size="sm" className="w-full text-xs">
                            View All Notifications
                        </Button>
                    </Link>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
