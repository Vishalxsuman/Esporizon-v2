import { db } from '@/config/firebaseConfig'
import {
    collection,
    addDoc,
    query,
    orderBy,
    limit,
    onSnapshot,
    doc,
    runTransaction,
    getDocs,
    deleteDoc,
    where
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

    subscribePublicPosts(
        maxPosts: number = 20,
        callback: (posts: Post[]) => void
    ): () => void {
        const postsRef = collection(db, POSTS_COLLECTION)
        // Simplify query to avoid composite index requirement (visibility + createdAt)
        const q = query(
            postsRef,
            orderBy('createdAt', 'desc'),
            limit(maxPosts * 2) // Fetch a few extra to account for private ones
        )

        return onSnapshot(q, (snapshot) => {
            const posts = snapshot.docs
                .map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as Post))
                .filter(post => post.visibility !== 'private') // Client-side filter
                .slice(0, maxPosts)
            callback(posts)
        }, (error) => {
            console.error("Firestore [subscribePublicPosts] error:", error)
        })
    }

    subscribeUserPosts(
        userId: string,
        maxPosts: number = 20,
        callback: (posts: Post[]) => void
    ): () => void {
        const postsRef = collection(db, POSTS_COLLECTION)
        const q = query(
            postsRef,
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(maxPosts)
        )

        return onSnapshot(q, (snapshot) => {
            const posts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Post))
            callback(posts)
        }, (error) => {
            console.error("Firestore [subscribeUserPosts] error:", error)
            // Fallback: search without orderBy if index is missing (common in new projects)
            if (error.code === 'failed-precondition') {
                const simpleQ = query(postsRef, where('userId', '==', userId))
                onSnapshot(simpleQ, (snap) => {
                    const posts = snap.docs
                        .map(d => ({ id: d.id, ...d.data() } as Post))
                        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                        .slice(0, maxPosts)
                    callback(posts)
                })
            }
        })
    }

    subscribeToPostsByRange(
        _daysAgo: number,
        maxPosts: number = 20,
        callback: (posts: Post[]) => void
    ): () => void {
        return this.subscribePublicPosts(maxPosts, callback)
    }

    // Atomic Like Toggle using Transaction
    async toggleLike(postId: string, userId: string): Promise<void> {
        if (!userId) throw new Error("Authentication Required")

        const postRef = doc(db, POSTS_COLLECTION, postId)

        await runTransaction(db, async (transaction) => {
            const postDoc = await transaction.get(postRef)
            if (!postDoc.exists()) throw new Error("Post does not exist")

            const data = postDoc.data() as Post
            const likes = data.likes || []
            const hasLiked = likes.includes(userId)

            const currentCount = typeof data.likeCount === 'number' ? data.likeCount : likes.length

            if (hasLiked) {
                // Unlike
                const newLikes = likes.filter(id => id !== userId)
                transaction.update(postRef, {
                    likes: newLikes,
                    likeCount: Math.max(0, currentCount - 1)
                })
            } else {
                // Like
                const newLikes = [...likes, userId]
                transaction.update(postRef, {
                    likes: newLikes,
                    likeCount: currentCount + 1
                })
            }
        })
    }

    // Deprecated but kept for safety if called elsewhere with old signature
    async toggleLikeStatus(postId: string, userId: string, _isLiked: boolean): Promise<void> {
        return this.toggleLike(postId, userId)
    }

    async sharePost(post: Post): Promise<void> {
        const shareData = {
            title: 'ESPO V2 Post',
            text: post.content,
            url: window.location.origin + `/social?post=${post.id}`
        }

        try {
            if (navigator.share) {
                await navigator.share(shareData)
            } else {
                await navigator.clipboard.writeText(shareData.url)
            }
        } catch (error) {
            console.error('Share failed', error)
        }
    }

    async deletePost(postId: string): Promise<void> {
        const postRef = doc(db, POSTS_COLLECTION, postId)
        // Note: Comments subcollection is not deleted automatically.
        // In a production app, we would use a Cloud Function or recursive loop.
        // For this task, we delete the main doc as requested.
        await deleteDoc(postRef)
    }

    async addComment(postId: string, userId: string, userName: string, content: string, userAvatar?: string): Promise<void> {
        if (!userId || !content.trim()) return

        const postRef = doc(db, POSTS_COLLECTION, postId)
        const commentsRef = collection(postRef, 'comments')

        const newComment = {
            userId,
            userName,
            userAvatar: userAvatar || '',
            content,
            createdAt: new Date().toISOString()
        }

        // We use a transaction to ensure count and doc creation are synced
        // NOTE: In Firestore, we can't reliably use transaction.set with auto-ID 
        // without knowing the ID. We can pre-generate a doc ref.
        const newCommentRef = doc(commentsRef)

        await runTransaction(db, async (transaction) => {
            const postDoc = await transaction.get(postRef)
            if (!postDoc.exists()) throw new Error("Post does not exist")

            const data = postDoc.data() as Post
            const currentCount = typeof data.commentCount === 'number' ? data.commentCount : 0

            transaction.set(newCommentRef, newComment)
            transaction.update(postRef, {
                commentCount: currentCount + 1
            })
        })
    }

    // Real-time comments for a specific post
    subscribeToComments(postId: string, callback: (comments: Comment[]) => void): () => void {
        const commentsRef = collection(db, POSTS_COLLECTION, postId, 'comments')
        const q = query(commentsRef, orderBy('createdAt', 'desc'))

        return onSnapshot(q, (snapshot) => {
            const comments = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Comment))
            callback(comments)
        })
    }

    async getComments(postId: string): Promise<Comment[]> {
        const commentsRef = collection(db, POSTS_COLLECTION, postId, 'comments')
        const q = query(commentsRef, orderBy('createdAt', 'desc'))
        const snapshot = await getDocs(q)
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment))
    }

    async createPost(
        content: string,
        imageUrl: string | null,
        userId: string,
        userName: string,
        userAvatar: string,
        visibility: 'public' | 'private' = 'public'
    ): Promise<void> {
        const postsRef = collection(db, POSTS_COLLECTION)
        const newPost = {
            userId,
            userName,
            userAvatar: userAvatar || '',
            content,
            imageUrl: imageUrl || '',
            likes: [],
            likeCount: 0,
            shares: [],
            commentCount: 0,
            visibility,
            createdAt: new Date().toISOString()
        }
        await addDoc(postsRef, newPost)
    }
}

export const postService = new PostService()
