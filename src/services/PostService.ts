import { api } from '@/services/api'
import { Post, Comment } from '@/types/Post'

class PostService {
    // Get latest posts (public)
    async getTodaysPosts(limit: number = 20): Promise<Post[]> {
        try {
            const response = await api.get(`/api/posts?type=all&limit=${limit}`)
            return response.data
        } catch (error) {
            if (import.meta.env.MODE !== 'production') {

                console.error("Error fetching posts:", error);

            }
            return []
        }
    }

    // Get posts by user
    subscribeUserPosts(
        userId: string,
        maxPosts: number = 20,
        callback: (posts: Post[]) => void
    ): () => void {
        const interval = setInterval(async () => {
            try {
                // We'll need a way to filter by user on backend.
                // Currently backend doesn't support ?userId=... but we can add it or filter client side if needed.
                // For now, let's just fetch all and filter or assume backend will be updated.
                // Ideally: api.get(`/api/posts?userId=${userId}`)
                // Given the current backend routes, we might need to rely on what we have.
                // Let's use 'all' for now and filter here if needed, or better, add user filter to backend.
                // Wait, let's check backend route... it uses `Post.find(query)`.
                // So adding ?userId=... to backend would be easy.
                // For now, I'll stick to 'all' type and client side filter if needed, or just fetch once.
                // Actually, let's just do a single fetch for now to replace the subscription pattern.
                // Re-implementing subscription with polling for now.

                const response = await api.get(`/api/posts?type=all&limit=${maxPosts}`)
                const userPosts = response.data.filter((p: Post) => p.userId === userId)
                callback(userPosts)
            } catch (error) {
                if (import.meta.env.MODE !== 'production') {

                    console.error(error);

                }
            }
        }, 5000)

        // Initial fetch
        this.getTodaysPosts(maxPosts).then(posts => {
            callback(posts.filter(p => p.userId === userId))
        })

        return () => clearInterval(interval)
    }

    // Public feed subscription (Polling)
    subscribePublicPosts(
        maxPosts: number = 20,
        callback: (posts: Post[]) => void
    ): () => void {
        const fetchPosts = async () => {
            try {
                const posts = await this.getTodaysPosts(maxPosts)
                callback(posts)
            } catch (error) {
                if (import.meta.env.MODE !== 'production') {

                    console.error(error);

                }
            }
        }

        fetchPosts() // Initial
        const interval = setInterval(fetchPosts, 10000) // Poll every 10s
        return () => clearInterval(interval)
    }

    subscribeToPostsByRange(
        _daysAgo: number,
        maxPosts: number = 20,
        callback: (posts: Post[]) => void
    ): () => void {
        return this.subscribePublicPosts(maxPosts, callback)
    }

    // Get Single Post
    async getPostById(postId: string): Promise<Post | null> {
        try {
            const response = await api.get(`/api/posts/${postId}`)
            return response.data
        } catch (error) {
            if (import.meta.env.MODE !== 'production') {

                console.error("Error fetching post:", error);

            }
            return null
        }
    }

    // Create Post
    async createPost(
        content: string,
        imageUrl: string | null,
        _userId: string,
        _userName: string,
        _userAvatar: string,
        _visibility: 'public' | 'private' = 'public'
    ): Promise<Post> {
        const response = await api.post('/api/posts', {
            content,
            image: imageUrl,
            type: 'global', // Default type
            // extra fields handled by backend or ignored
        })
        return response.data
    }

    // Toggle Like
    async toggleLike(postId: string, _userId: string): Promise<void> {
        await api.post(`/api/posts/${postId}/like`)
    }

    // Add Comment
    async addComment(
        postId: string,
        _userId: string,
        _userName: string,
        content: string,
        _userAvatar?: string
    ): Promise<void> {
        await api.post(`/api/posts/${postId}/comment`, { text: content })
    }

    // Get Comments (via single post fetch)
    async getComments(postId: string): Promise<Comment[]> {
        const post = await this.getPostById(postId)
        return post?.comments || []
    }

    // Subscribe to Comments (Polling)
    subscribeToComments(postId: string, callback: (comments: Comment[]) => void): () => void {
        const fetchComments = async () => {
            const comments = await this.getComments(postId)
            callback(comments)
        }

        fetchComments()
        const interval = setInterval(fetchComments, 3000) // Fast polling for chat
        return () => clearInterval(interval)
    }

    // Delete Post
    async deletePost(postId: string): Promise<void> {
        await api.delete(`/api/posts/${postId}`)
    }

    // Share Post
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
            if (import.meta.env.MODE !== 'production') {

                console.error('Share failed', error);

            }
        }
    }

    // Deprecated compat
    async toggleLikeStatus(postId: string, userId: string, _isLiked: boolean): Promise<void> {
        return this.toggleLike(postId, userId)
    }
}

export const postService = new PostService()
