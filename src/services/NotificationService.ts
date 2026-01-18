import { db } from '@/config/firebaseConfig'
import {
    collection,
    doc,
    getDocs,
    updateDoc,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    startAfter,
    DocumentSnapshot
} from 'firebase/firestore'
import type { Notification } from '@/types/match'

class NotificationService {
    private notificationsCollection = collection(db, 'notifications')

    // Get user notifications (paginated)
    async getNotifications(userId: string, pageSize = 20, lastDoc?: DocumentSnapshot): Promise<{
        notifications: Notification[]
        lastDoc: DocumentSnapshot | null
        hasMore: boolean
    }> {
        try {
            let q = query(
                this.notificationsCollection,
                where('userId', '==', userId),
                orderBy('createdAt', 'desc'),
                limit(pageSize)
            )

            if (lastDoc) {
                q = query(
                    this.notificationsCollection,
                    where('userId', '==', userId),
                    orderBy('createdAt', 'desc'),
                    startAfter(lastDoc),
                    limit(pageSize)
                )
            }

            const snapshot = await getDocs(q)
            const notifications = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Notification))

            const lastVisible = snapshot.docs[snapshot.docs.length - 1] || null
            const hasMore = snapshot.docs.length === pageSize

            return { notifications, lastDoc: lastVisible, hasMore }
        } catch (error) {
            console.error('Error getting notifications:', error)
            return { notifications: [], lastDoc: null, hasMore: false }
        }
    }

    // Get unread count
    async getUnreadCount(userId: string): Promise<number> {
        try {
            const q = query(
                this.notificationsCollection,
                where('userId', '==', userId),
                where('read', '==', false)
            )
            const snapshot = await getDocs(q)
            return snapshot.size
        } catch (error) {
            console.error('Error getting unread count:', error)
            return 0
        }
    }

    // Mark notifications as read
    async markAsRead(notificationIds: string[]): Promise<void> {
        try {
            const updates = notificationIds.map(id =>
                updateDoc(doc(this.notificationsCollection, id), { read: true })
            )
            await Promise.all(updates)
        } catch (error) {
            console.error('Error marking notifications as read:', error)
            throw new Error('Failed to mark notifications as read')
        }
    }

    // Mark all as read
    async markAllAsRead(userId: string): Promise<void> {
        try {
            const q = query(
                this.notificationsCollection,
                where('userId', '==', userId),
                where('read', '==', false)
            )
            const snapshot = await getDocs(q)
            const updates = snapshot.docs.map(doc =>
                updateDoc(doc.ref, { read: true })
            )
            await Promise.all(updates)
        } catch (error) {
            console.error('Error marking all as read:', error)
            throw new Error('Failed to mark all notifications as read')
        }
    }

    // Listen to real-time notification updates
    listenToNotifications(userId: string, callback: (notifications: Notification[]) => void): () => void {
        const q = query(
            this.notificationsCollection,
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(10)
        )

        return onSnapshot(q, (snapshot) => {
            const notifications = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Notification))
            callback(notifications)
        }, (error) => {
            console.error('Error listening to notifications:', error)
            callback([])
        })
    }

    // Listen to unread count in real-time
    listenToUnreadCount(userId: string, callback: (count: number) => void): () => void {
        const q = query(
            this.notificationsCollection,
            where('userId', '==', userId),
            where('read', '==', false)
        )

        return onSnapshot(q, (snapshot) => {
            callback(snapshot.size)
        }, (error) => {
            console.error('Error listening to unread count:', error)
            callback(0)
        })
    }
}

export const notificationService = new NotificationService()
