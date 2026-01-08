export interface Comment {
    id: string
    userId: string
    userName: string
    userAvatar?: string
    content: string
    createdAt: string
}

export interface Post {
    id: string
    userId: string
    userName: string
    userAvatar?: string
    content: string
    imageUrl?: string
    likes: string[] // Array of user IDs who liked (keep for checking 'isLiked')
    likeCount?: number // Atomic counter
    shares: string[]
    commentCount?: number // Atomic counter
    comments: Comment[] // Keep for immediate display if fetched, but usually fetched on demand
    visibility?: 'public' | 'private'
    createdAt: string
    updatedAt?: string
}

export interface CreatePostDto {
    content: string
    imageUrl?: string
}

export interface CreateCommentDto {
    content: string
}
