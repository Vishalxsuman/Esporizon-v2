import {
    collection,
    query,
    where,
    orderBy,
    getDocs,
    onSnapshot,
    Timestamp,
    limit,
    addDoc,
    serverTimestamp,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '@/config/firebase'
import { Post } from '@/types/Post'
import { authService } from './AuthService'
import { userRepository } from '@/repositories/UserRepository'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

const getAuthHeaders = async () => {
    const user = authService.getCurrentUser()
    if (!user) {
        throw new Error('User not authenticated')
    }
    const token = await user.getIdToken()
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    }
}

class PostService {
    /**
     * Get today's posts from Firestore
     */
    async getTodaysPosts(maxPosts: number = 10): Promise<Post[]> {
        try {
            const yesterday = new Date()
            yesterday.setDate(yesterday.getDate() - 1)

            const q = query(
                collection(db, 'posts'),
                where('createdAt', '>=', Timestamp.fromDate(yesterday)),
                orderBy('createdAt', 'desc'),
                limit(maxPosts)
            )

            const snapshot = await getDocs(q)
            return snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Post[]
        } catch (error) {
            console.error('Error fetching posts:', error)
            return []
        }
    }

    /**
     * Subscribe to real-time updates for recent posts
     */
    subscribeTodaysPosts(
        maxPosts: number = 10,
        callback: (posts: Post[]) => void
    ): () => void {
        const since = new Date()
        since.setDate(since.getDate() - 1)

        const q = query(
            collection(db, 'posts'),
            where('createdAt', '>=', Timestamp.fromDate(since)),
            orderBy('createdAt', 'desc'),
            limit(maxPosts)
        )

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const posts = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Post[]
                callback(posts)
            },
            (error) => {
                console.error('Error in posts subscription:', error)
            }
        )

        return unsubscribe
    }

    /**
     * Toggle like on a post
     */
    async toggleLike(postId: string): Promise<void> {
        const headers = await getAuthHeaders()
        const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
            method: 'POST',
            headers,
        })

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Failed to toggle like' }))
            throw new Error(error.error || 'Failed to toggle like')
        }
    }

    /**
     * Share a post
     */
    async sharePost(postId: string): Promise<void> {
        const headers = await getAuthHeaders()
        const response = await fetch(`${API_BASE_URL}/posts/${postId}/share`, {
            method: 'POST',
            headers,
        })

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Failed to share post' }))
            throw new Error(error.error || 'Failed to share post')
        }
    }

    /**
     * Add a comment to a post
     */
    async addComment(postId: string, content: string): Promise<void> {
        const headers = await getAuthHeaders()
        const response = await fetch(`${API_BASE_URL}/posts/${postId}/comment`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ content }),
        })

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Failed to add comment' }))
            throw new Error(error.error || 'Failed to add comment')
        }
    }

    /**
     * Subscribe to posts by date range
     */
    subscribeToPostsByRange(
        daysAgo: number,
        maxPosts: number = 20,
        callback: (posts: Post[]) => void
    ): () => void {
        const start = new Date()
        start.setDate(start.getDate() - daysAgo)
        start.setHours(0, 0, 0, 0)

        const end = new Date()
        end.setDate(end.getDate() - daysAgo)
        end.setHours(23, 59, 59, 999)

        const q = query(
            collection(db, 'posts'),
            where('createdAt', '>=', Timestamp.fromDate(start)),
            where('createdAt', '<=', Timestamp.fromDate(end)),
            orderBy('createdAt', 'desc'),
            limit(maxPosts)
        )

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const posts = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Post[]
                callback(posts)
            },
            (error) => {
                console.error('Error in posts subscription:', error)
            }
        )

        return unsubscribe
    }

    /**
     * Create a new post
     */
    async createPost(content: string, imageFile: File | null): Promise<void> {
        const user = authService.getCurrentUser()
        if (!user) throw new Error('Not authenticated')

        // Fetch username from profile
        const profile = await userRepository.getProfile(user.uid)
        const userName = profile?.username || user.displayName || 'Elite Gamer'

        let imageUrl = ''

        if (imageFile) {
            // Check file size (500kb limit)
            if (imageFile.size > 500 * 1024) {
                throw new Error('Image size exceeds 500 KB limit')
            }

            const storageRef = ref(storage, `posts/${user.uid}/${Date.now()}_${imageFile.name}`)
            await uploadBytes(storageRef, imageFile)
            imageUrl = await getDownloadURL(storageRef)
        }

        await addDoc(collection(db, 'posts'), {
            userId: user.uid,
            userName,
            userAvatar: user.photoURL || '',
            content,
            imageUrl,
            likes: [],
            shares: [],
            comments: [],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        })
    }
}

export const postService = new PostService()
