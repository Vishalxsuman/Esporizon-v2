import { Post } from '@/types/Post'

const STORAGE_KEY = 'espo_posts'

const STATIC_POSTS: Post[] = [
    {
        id: 'post_1',
        userId: 'system',
        userName: 'ESPO Admin',
        userAvatar: 'https://cdn.jsdelivr.net/gh/Vishalxsuman/Esporizon-v2@main/src/assets/images/admin.png',
        content: 'Welcome to ESPO V2! The ultimate platform for gamers.',
        imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2670&auto=format&fit=crop',
        likes: [],
        shares: [],
        comments: [],
        createdAt: new Date().toISOString() as any
    },
    {
        id: 'post_2',
        userId: 'system',
        userName: 'Pro Gamer',
        userAvatar: '',
        content: 'Just won the Summer Championship! What an intense game.',
        imageUrl: '',
        likes: ['user_1'],
        shares: [],
        comments: [],
        createdAt: new Date(Date.now() - 3600000).toISOString() as any
    }
]

class PostService {
    private getStoredPosts(): Post[] {
        const stored = localStorage.getItem(STORAGE_KEY)
        const localPosts = stored ? JSON.parse(stored) : []
        return [...localPosts, ...STATIC_POSTS]
    }

    async getTodaysPosts(maxPosts: number = 10): Promise<Post[]> {
        return this.getStoredPosts().slice(0, maxPosts)
    }

    subscribeTodaysPosts(
        maxPosts: number = 10,
        callback: (posts: Post[]) => void
    ): () => void {
        const updatePosts = () => {
            callback(this.getStoredPosts().slice(0, maxPosts))
        }

        updatePosts()
        window.addEventListener('postUpdate', updatePosts)
        return () => window.removeEventListener('postUpdate', updatePosts)
    }

    async toggleLike(postId: string): Promise<void> {
        // Simulation: Just toggle a flag in localStorage if we were serious, but for now just a toast
        console.log('Like toggled for', postId)
    }

    async sharePost(postId: string): Promise<void> {
        console.log('Post shared', postId)
    }

    async addComment(postId: string, content: string): Promise<void> {
        console.log('Comment added to', postId, ':', content)
    }

    subscribeToPostsByRange(
        daysAgo: number,
        maxPosts: number = 20,
        callback: (posts: Post[]) => void
    ): () => void {
        callback(this.getStoredPosts().slice(0, maxPosts))
        return () => { }
    }

    async createPost(content: string, imageFile: File | null): Promise<void> {
        // Simulation: In a real static app, we can't upload files easily without a backend
        // We'll just store the text content and a placeholder image if provided
        const newPost: Post = {
            id: `post_${Date.now()}`,
            userId: 'current_user',
            userName: 'You',
            userAvatar: '',
            content,
            imageUrl: imageFile ? URL.createObjectURL(imageFile) : '',
            likes: [],
            shares: [],
            comments: [],
            createdAt: new Date().toISOString() as any
        }

        const stored = localStorage.getItem(STORAGE_KEY)
        const localPosts = stored ? JSON.parse(stored) : []
        localPosts.unshift(newPost)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(localPosts))

        window.dispatchEvent(new CustomEvent('postUpdate'))
    }
}

export const postService = new PostService()
