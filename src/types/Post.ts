export interface Comment {
    id: string
    userId: string
    userName: string
    userAvatar?: string
    content: string
    createdAt: any
}

export interface Post {
    id: string
    userId: string
    userName: string
    userAvatar?: string
    content: string
    imageUrl?: string
    likes: string[] // Array of user IDs who liked
    shares: string[] // Array of user IDs who shared
    comments: Comment[]
    createdAt: any
    updatedAt?: any
}

export interface CreatePostDto {
    content: string
    imageUrl?: string
}

export interface CreateCommentDto {
    content: string
}
