import { UserProfile } from '@/types'
import { api } from '@/services/api'
import { waitForAuth } from '@/utils/authGuard'

const DEFAULT_PROFILE: UserProfile = {
    tournamentsPlayed: 0,
    tournamentsWon: 0,
    totalEarnings: 0,
    referralCode: '',
    referralEarnings: 0,
    gameAccounts: {},
    settings: {
        tournamentReminders: true,
        matchResults: true,
        newTournaments: true,
        teamInvites: true
    }
}

class UserService {
    async getProfile(userId?: string): Promise<UserProfile> {
        try {
            await waitForAuth();

            let response;
            if (userId) {
                // Fetch public profile for specific user
                response = await api.get(`/api/player/${userId}/profile`);
            } else {
                // Fetch private profile for authenticated user (inferred from token)
                response = await api.get('/api/user/profile');
            }

            if (!response || !response.data) {
                return DEFAULT_PROFILE;
            }
            return response.data;
        } catch (error: any) {
            if (import.meta.env.MODE !== 'production') {

                console.error('Error fetching profile:', error);

            }
            return DEFAULT_PROFILE;
        }
    }

    async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
        try {
            await api.patch(`/api/users/${userId}/profile`, updates);
        } catch (error) {
            if (import.meta.env.MODE !== 'production') {

                console.error('Error updating profile:', error);

            }
            throw error;
        }
    }

    async searchUsers(query: string): Promise<(UserProfile & { uid: string })[]> {
        try {
            const response = await api.get(`/api/user/search?q=${encodeURIComponent(query)}`);
            // Handle null response
            if (!response || !response.data) {
                return [];
            }
            return response.data;
        } catch (error) {
            if (import.meta.env.MODE !== 'production') {

                console.error('Error searching users:', error);

            }
            return [];
        }
    }
}

export const userService = new UserService()
