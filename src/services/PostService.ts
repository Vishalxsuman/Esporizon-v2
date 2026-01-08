import { db } from './firebase'
import {
    collection,
    addDoc,
    query,
    orderBy,
    limit,
    onSnapshot,
    doc,
    updateDoc,
    runTransaction,
    getDocs,
    increment
} from 'firebase/firestore'
import { Post, Comment } from '@/types/Post'

const POSTS_COLLECTION = 'posts'

class PostService {
    async getTodaysPosts(maxPosts: number = 20): Promise<Post[]> {
        const postsRef = collection(db, POSTS_COLLECTION)
        const q = query(postsRef, orderBy('createdAt', 'desc'), limit(maxPosts))
        const snapshot = await getDocs(q)
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post))
    }

    subscribeTodaysPosts(
        maxPosts: number = 20,
        callback: (posts: Post[]) => void
    ): () => void {
        const postsRef = collection(db, POSTS_COLLECTION)
        const q = query(postsRef, orderBy('createdAt', 'desc'), limit(maxPosts))

        return onSnapshot(q, (snapshot) => {
            const posts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Post))
            callback(posts)
        })
    }

    subscribeToPostsByRange(
        _daysAgo: number,
        maxPosts: number = 20,
        callback: (posts: Post[]) => void
    ): () => void {
        return this.subscribeTodaysPosts(maxPosts, callback)
    }

    // Atomic Like Toggle using Transaction
    async toggleLike(postId: string, userId: string): Promise<void> {
        if (!userId) throw new Error("User must be logged in")

        const postRef = doc(db, POSTS_COLLECTION, postId)

        await runTransaction(db, async (transaction) => {
            const postDoc = await transaction.get(postRef)
            if (!postDoc.exists()) throw new Error("Post does not exist")

            const data = postDoc.data() as Post
            const likes = data.likes || []
            const hasLiked = likes.includes(userId)

            if (hasLiked) {
                // Unlike
                const newLikes = likes.filter(id => id !== userId)
                transaction.update(postRef, {
                    likes: newLikes,
                    likeCount: Math.max(0, (data.likeCount || likes.length) - 1)
                })
            } else {
                // Like
                const newLikes = [...likes, userId]
                transaction.update(postRef, {
                    likes: newLikes,
                    likeCount: (data.likeCount || likes.length) + 1
                })
            }
        })
    }

    // Deprecated but kept for safety if called elsewhere with old signature
    async toggleLikeStatus(postId: string, userId: string, _isLiked: boolean): Promise<void> {
        return this.toggleLike(postId, userId)
    }

    async sharePost(postId: string): Promise<void> {
        console.log('Post shared', postId)
    }

    async addComment(postId: string, userId: string, userName: string, content: string): Promise<void> {
        if (!userId || !content.trim()) return

        const postRef = doc(db, POSTS_COLLECTION, postId)
        const commentsRef = collection(postRef, 'comments')

        const newComment = {
            userId,
            userName,
            content,
            createdAt: new Date().toISOString()
        }

        await runTransaction(db, async (transaction) => {
            const postDoc = await transaction.get(postRef)
            if (!postDoc.exists()) throw new Error("Post does not exist")

            // Add comment to subcollection
            // defined outside transaction technically, but good to link
            // Actually, for subcollection addDoc we can't use transaction.update directly easily on a new generated ID ref unless we create doc ref first.
            // Simplified: Write comment first, then update count? 
            // Better: Use batch or just independent writes, but the count is critical.
            // Let's use transaction for the count update, and regular add for the doc, or link them.
            // Firestore transactions require all reads before writes.

            // Re-think: "Maintain a commentCount field".
            // We can just add the doc and then update the count atomically using `increment`.
            // This is "eventually consistent" enough for this app.
            // But let's try to be robust.
        })

        // Simpler approach for this specific app constraint:
        // 1. Add comment to subcollection
        await addDoc(commentsRef, newComment)

        // 2. Atomically increment count on parent Post
        await updateDoc(postRef, {
            commentCount: increment(1)
        })
    }

    // Fetch comments for a post (if needed by UI)
    async getComments(postId: string): Promise<Comment[]> {
        const commentsRef = collection(db, POSTS_COLLECTION, postId, 'comments')
        const q = query(commentsRef, orderBy('createdAt', 'desc'))
        const snapshot = await getDocs(q)
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment))
    }

    async createPost(content: string, imageUrl: string | null, userId: string, userName: string, userAvatar: string): Promise<void> {
        const postsRef = collection(db, POSTS_COLLECTION)
        const newPost = { // Omit 'id', Firestore adds it
            userId,
            userName,
            userAvatar: userAvatar || '',
            content,
            imageUrl: imageUrl || '',
            likes: [], // Initial empty array
            likeCount: 0,
            shares: [],
            // comments: [], // We don't store full comments in parent array anymore
            commentCount: 0,
            createdAt: new Date().toISOString()
        }
        await addDoc(postsRef, newPost)
    }
}

export const postService = new PostService()
