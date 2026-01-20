import { api } from '@/services/api';


export interface ProfileUpdateData {
    username?: string;
    displayName?: string;
    bio?: string;
    location?: string;
    avatarId?: string;
    avatarType?: 'initials' | 'geometric' | 'gradient' | 'default';
    frameId?: string;
    country?: string;
    languages?: string[];
    bannerUrl?: string;
    socialLinks?: {
        discord?: string;
        twitter?: string;
        instagram?: string;
        youtube?: string;
    };
    themeColor?: string;
    gameAccounts?: Record<string, string>;
}

export interface UsernameCheckResponse {
    available: boolean;
    message?: string;
}

class ProfileService {
    /**
     * Get current user's profile
     * @param firebaseUid - Firebase UID of current user
     * @param userId - Optional MongoDB user ID
     */
    async getMyProfile(firebaseUid: string, userId?: string) {
        try {
            const response = await api.post('/api/profile/me', { firebaseUid, userId });
            return response?.data ?? { id: userId, username: 'User', role: 'player' };
        } catch (error: any) {
            if (import.meta.env.MODE !== 'production') {

                console.error('ProfileService.getMyProfile error:', error);

            }
            // Return minimal profile instead of throwing
            return { id: userId, username: 'User', role: 'player' };
        }
    }

    /**
     * Get any user's public profile by ID
     * @param userId - User ID (MongoDB or Firebase UID)
     */
    async getProfileByUserId(userId: string) {
        try {
            const response = await api.get(`/api/profile/${userId}`);
            return response?.data ?? null;
        } catch (error: any) {
            if (import.meta.env.MODE !== 'production') {

                console.error('ProfileService.getProfileByUserId error:', error);

            }
            return null;
        }
    }

    /**
     * Update current user's profile
     * @param firebaseUid - Firebase UID
     * @param userId - MongoDB user ID (optional)
     * @param data - Profile update data
     */
    async updateProfile(
        firebaseUid: string,
        data: ProfileUpdateData,
        userId?: string
    ) {
        try {
            const response = await api.put('/api/profile/me', {
                firebaseUid,
                userId,
                ...data
            });
            return response.data;
        } catch (error: any) {
            if (import.meta.env.MODE !== 'production') {

                console.error('ProfileService.updateProfile error:', error);

            }
            const message = error.response?.data?.message || 'Failed to update profile';
            throw new Error(message);
        }
    }

    /**
     * Check if username is available
     * @param username - Username to check
     * @param currentUsername - Current user's username (to exclude from check)
     */
    async checkUsernameAvailability(
        username: string,
        currentUsername?: string
    ): Promise<UsernameCheckResponse> {
        // If it's the same as current username, it's available
        if (username === currentUsername) {
            return { available: true };
        }

        try {
            // Simple check: try to get profile by username
            const response = await api.post('/api/user/check-username', { username });

            // If we get here, meaningful response was received
            if (response.data) {
                return response.data;
            }

            return { available: true };
        } catch (error: any) {
            if (import.meta.env.MODE !== 'production') {

                console.warn('Username check failed, assuming available:', error);

            }
            return { available: true };
        }
    }

    /**
     * Initialize profile stats for a new user
     * @param userId - MongoDB user ID
     */
    async initializeStats(userId: string) {
        try {
            const response = await api.post('/api/profile/init', { userId });
            return response.data;
        } catch (error: any) {
            if (import.meta.env.MODE !== 'production') {

                console.error('ProfileService.initializeStats error:', error);

            }
            throw new Error('Failed to initialize stats');
        }
    }
}

export default new ProfileService();
