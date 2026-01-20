import { api } from '@/services/api';

export interface Friend {
    id: string;
    username: string;
    displayName?: string;
    title?: string;
    avatar?: string;
    avatarType?: 'mascot' | 'image';
    status: 'online' | 'offline' | 'ingame';
}

class FriendService {
    /**
     * Get friends list
     */
    async getMyFriends(userId: string): Promise<Friend[]> {
        try {
            const response = await api.get(`/api/friends/list/${userId}`);
            return response.data;
        } catch (error: any) {
            if (import.meta.env.MODE !== 'production') {

                console.error('Get friends error:', error);

            }
            return [];
        }
    }

    async getRequests(): Promise<any[]> {
        try {
            const response = await api.get('/api/friends/requests');
            return response.data;
        } catch (error: any) {
            if (import.meta.env.MODE !== 'production') {

                console.error('Get requests error:', error);

            }
            return [];
        }
    }

    async sendRequest(targetUsername: string) {
        try {
            const response = await api.post('/api/friends/request', { targetUsername });
            return response.data;
        } catch (error: any) {
            throw error;
        }
    }

    async acceptRequest(requesterUid: string) {
        try {
            const response = await api.post('/api/friends/accept', { requesterUid });
            return response.data;
        } catch (error: any) {
            throw error;
        }
    }

    async rejectRequest(requesterUid: string) {
        try {
            const response = await api.post('/api/friends/reject', { requesterUid });
            return response.data;
        } catch (error: any) {
            throw error;
        }
    }
}

export default new FriendService();
