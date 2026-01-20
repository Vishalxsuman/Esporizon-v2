import { api } from '@/services/api';

export interface Comment {
    user: string;
    username: string;
    avatar?: string;
    text: string;
    createdAt: string;
    _id: string; // Mongoose subdoc ID
}

export type FeedPostType = 'live_pulse' | 'join_alert' | 'result' | 'user_post' | 'friend_activity';

export interface Post {
    _id: string;
    type: FeedPostType;
    createdAt: string;

    // Author info (for user_post, friend_activity)
    author?: string;
    authorName?: string;
    authorUsername?: string;
    authorAvatar?: string;

    // Content (for user_post)
    content?: string;
    image?: string;

    // Tournament Data (for live_pulse, join_alert, result)
    tournamentId?: string;
    tournamentName?: string;
    game?: string;

    // Specific Data
    slotsLeft?: number; // for join_alert
    winnerName?: string; // for result
    prizeWon?: number; // for result
    matchDuration?: string; // for result

    // Friend Activity
    activityText?: string; // e.g. "Vishal joined Squad Clash"

    // Meta
    isPinned?: boolean;
    likes?: string[];
    comments?: Comment[];
}

class FeedService {
    async getPosts(type: string = 'all'): Promise<Post[]> {
        try {
            const response = await api.get(`/api/feed?type=${type}`);
            return response.data;
        } catch (error) {
            if (import.meta.env.MODE !== 'production') {

                console.error('Fetch posts error:', error);

            }
            return [];
        }
    }

    async createPost(content: string, type: string = 'user_post'): Promise<Post | null> {
        if (content.length > 120) {
            alert("Post exceeds 120 characters");
            return null;
        }
        try {
            const response = await api.post('/api/feed/post', { content, type });
            return response.data;
        } catch (error) {
            if (import.meta.env.MODE !== 'production') {

                console.error('Create post error:', error);

            }
            return null;
        }
    }

    async toggleLike(postId: string): Promise<string[]> {
        try {
            const response = await api.post(`/api/posts/${postId}/like`);
            return response.data; // Returns array of userIDs
        } catch (error) {
            if (import.meta.env.MODE !== 'production') {

                console.error('Like error:', error);

            }
            throw error;
        }
    }

    async addComment(postId: string, text: string): Promise<Comment[]> {
        try {
            const response = await api.post(`/api/posts/${postId}/comment`, { text });
            return response.data;
        } catch (error) {
            if (import.meta.env.MODE !== 'production') {

                console.error('Comment error:', error);

            }
            throw error;
        }
    }

    async deletePost(postId: string): Promise<boolean> {
        try {
            await api.delete(`/api/posts/${postId}`);
            return true;
        } catch (error) {
            if (import.meta.env.MODE !== 'production') {

                console.error('Delete error:', error);

            }
            return false;
        }
    }
}

export const feedService = new FeedService();
export default feedService;
