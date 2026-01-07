import { Timestamp } from 'firebase/firestore'

export interface Comment {
    id: string
    userId: string
    userName: string
    userAvatar?: string
    content: string
    createdAt: Timestamp
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
    createdAt: Timestamp
    updatedAt?: Timestamp
}

export interface CreatePostDto {
    content: string
    imageUrl?: string
}

export interface CreateCommentDto {
    content: string
}
