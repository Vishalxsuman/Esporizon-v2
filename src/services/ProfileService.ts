import { endpoints } from '@/config/api';

export interface ProfileUpdateData {
    username?: string;
    bio?: string;
    avatarId?: string;
    avatarType?: 'initials' | 'geometric' | 'gradient' | 'default';
    frameId?: string;
    socialLinks?: {
        discord?: string;
        twitter?: string;
        instagram?: string;
        youtube?: string;
    };
    themeColor?: string;
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
            const response = await fetch(`${endpoints.baseURL}/api/profile/me`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firebaseUid, userId })
            });

            if (!response.ok) {
                throw new Error('Failed to fetch profile');
            }

            return await response.json();
        } catch (error) {
            console.error('ProfileService.getMyProfile error:', error);
            throw error;
        }
    }

    /**
     * Get any user's public profile by ID
     * @param userId - User ID (MongoDB or Firebase UID)
     */
    async getProfileByUserId(userId: string) {
        try {
            const response = await fetch(endpoints.profile(userId));

            if (!response.ok) {
                throw new Error('Failed to fetch profile');
            }

            return await response.json();
        } catch (error) {
            console.error('ProfileService.getProfileByUserId error:', error);
            throw error;
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
            const response = await fetch(`${endpoints.baseURL}/api/profile/me`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firebaseUid,
                    userId,
                    ...data
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update profile');
            }

            return await response.json();
        } catch (error) {
            console.error('ProfileService.updateProfile error:', error);
            throw error;
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
            // This is a workaround since we don't have a dedicated endpoint
            // In production, you'd want a specific /api/profile/check-username endpoint
            const response = await fetch(`${endpoints.baseURL}/api/user/check-username`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });

            if (response.ok) {
                const data = await response.json();
                return data;
            }

            // Fallback: assume available if endpoint doesn't exist
            return { available: true };
        } catch (error) {
            console.warn('Username check failed, assuming available:', error);
            return { available: true };
        }
    }

    /**
     * Initialize profile stats for a new user
     * @param userId - MongoDB user ID
     */
    async initializeStats(userId: string) {
        try {
            const response = await fetch(`${endpoints.baseURL}/api/profile/init`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });

            if (!response.ok) {
                throw new Error('Failed to initialize stats');
            }

            return await response.json();
        } catch (error) {
            console.error('ProfileService.initializeStats error:', error);
            throw error;
        }
    }
}

export default new ProfileService();
