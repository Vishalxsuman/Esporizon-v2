import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X } from 'lucide-react'
import { useUser } from '@clerk/clerk-react'
import { notificationService } from '@/services/NotificationService'
import type { Notification } from '@/types/match'
import { useNavigate } from 'react-router-dom'

const NotificationBell = () => {
    const { user } = useUser()
    const navigate = useNavigate()
    const [unreadCount, setUnreadCount] = useState(0)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        if (!user) return

        // Listen to unread count
        const unsubscribeCount = notificationService.listenToUnreadCount(user.id, (count) => {
            setUnreadCount(count)
        })

        // Listen to recent notifications
        const unsubscribeNotifs = notificationService.listenToNotifications(user.id, (notifs) => {
            setNotifications(notifs)
        })

        return () => {
            unsubscribeCount()
            unsubscribeNotifs()
        }
    }, [user])

    const handleNotificationClick = async (notification: Notification) => {
        // Mark as read
        if (!notification.read) {
            await notificationService.markAsRead([notification.id])
        }

        // Navigate if action URL exists
        if (notification.actionUrl) {
            navigate(notification.actionUrl)
        }

        setIsOpen(false)
    }

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'match_invite':
            case 'match_accepted':
                return '🎮'
            case 'match_result':
                return '🏆'
            case 'coin_transaction':
                return '💰'
            case 'tournament_joined':
                return '🎯'
            default:
                return '📢'
        }
    }

    const getTimeAgo = (timestamp: string) => {
        const now = new Date()
        const then = new Date(timestamp)
        const seconds = Math.floor((now.getTime() - then.getTime()) / 1000)

        if (seconds < 60) return 'Just now'
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
        return `${Math.floor(seconds / 86400)}d ago`
    }

    return (
        <div className="relative">
            {/* Bell Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg hover:bg-[var(--glass)] transition-colors"
            >
                <Bell className="w-5 h-5 text-[var(--text-primary)]" />
                {unreadCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                )}
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Panel */}
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute right-0 top-full mt-2 w-80 max-h-96 bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden z-50"
                        >
                            {/* Header */}
                            <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--glass)]">
                                <h3 className="font-bold text-sm">Notifications</h3>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 hover:bg-[var(--glass)] rounded"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Notifications List */}
                            <div className="overflow-y-auto max-h-80 custom-scrollbar">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center text-[var(--text-secondary)]">
                                        <Bell className="w-12 h-12 mx-auto mb-2 opacity-30" />
                                        <p className="text-sm">No notifications yet</p>
                                    </div>
                                ) : (
                                    notifications.map((notification) => (
                                        <button
                                            key={notification.id}
                                            onClick={() => handleNotificationClick(notification)}
                                            className={`w-full p-4 border-b border-[var(--border)] hover:bg-[var(--glass)] transition-colors text-left ${!notification.read ? 'bg-[var(--accent)]/5' : ''
                                                }`}
                                        >
                                            <div className="flex gap-3">
                                                <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-[var(--text-primary)] mb-1">
                                                        {notification.title}
                                                    </p>
                                                    <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-1">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-xs text-[var(--text-secondary)] opacity-60">
                                                        {getTimeAgo(notification.createdAt)}
                                                    </p>
                                                </div>
                                                {!notification.read && (
                                                    <div className="w-2 h-2 bg-[var(--accent)] rounded-full mt-1" />
                                                )}
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>

                            {/* Footer */}
                            {notifications.length > 0 && (
                                <div className="p-3 border-t border-[var(--border)] bg-[var(--glass)]">
                                    <button
                                        onClick={() => {
                                            navigate('/notifications')
                                            setIsOpen(false)
                                        }}
                                        className="text-xs text-[var(--accent)] hover:underline w-full text-center"
                                    >
                                        View All Notifications
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}

export default NotificationBell
