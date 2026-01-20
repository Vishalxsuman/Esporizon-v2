import { api } from '@/services/api'
import {
    TrustLevel,
    TRUST_LEVELS,
    Badge,
    BadgeType,
    RecruitmentCard,
    CreateRecruitmentDto,
    TournamentCard,
    ClipPost
} from '@/types/WarRoomTypes'

class WarRoomService {
    // ========================================
    // TRUST LEVEL MANAGEMENT
    // ========================================

    async getUserTrustLevel(_userId: string): Promise<TrustLevel> {
        // MOCK: Backend endpoint does not exist
        // Always return trust level 0 ("new" user)
        return 0;
    }

    async updateTrustLevel(userId: string, newLevel: TrustLevel): Promise<void> {
        // MOCK: Backend endpoint does not exist
        // No-op (do nothing)
        if (import.meta.env.MODE !== 'production') {

            console.log(`[MOCK] Trust level for user ${userId} would be updated to ${newLevel}`);

        }
    }

    async checkPermission(userId: string, action: 'view' | 'comment' | 'recruit' | 'post' | 'uploadClips'): Promise<boolean> {
        const trustLevel = await this.getUserTrustLevel(userId);
        const permissions = TRUST_LEVELS[trustLevel].permissions;

        switch (action) {
            case 'view': return permissions.canView;
            case 'comment': return permissions.canComment;
            case 'recruit': return permissions.canRecruit;
            case 'post': return permissions.canPost;
            case 'uploadClips': return permissions.canUploadClips;
            default: return false;
        }
    }

    async incrementTournamentCount(userId: string): Promise<void> {
        try {
            await api.post(`/api/warroom/user/${userId}/increment-tournament`);
        } catch (error) {
            if (import.meta.env.MODE !== 'production') {

                console.error('Error incrementing tournament count:', error);

            }
        }
    }

    // ========================================
    // BADGE SYSTEM
    // ========================================

    async awardBadge(userId: string, badgeType: BadgeType, metadata?: any): Promise<void> {
        try {
            await api.post(`/api/warroom/user/${userId}/badges`, { badgeType, metadata });
        } catch (error) {
            if (import.meta.env.MODE !== 'production') {

                console.error('Error awarding badge:', error);

            }
        }
    }

    async getUserBadges(userId: string): Promise<Badge[]> {
        try {
            const response = await api.get(`/api/warroom/user/${userId}/badges`);
            return response.data || [];
        } catch (error) {
            if (import.meta.env.MODE !== 'production') {

                console.error('Error getting user badges:', error);

            }
            return [];
        }
    }

    // ========================================
    // RECRUITMENT CARDS
    // ========================================

    async createRecruitmentCard(userId: string, userName: string, userAvatar: string, data: CreateRecruitmentDto): Promise<string> {
        try {
            const response = await api.post('/api/warroom/recruitments', {
                userId,
                userName,
                userAvatar,
                ...data
            });
            return response.data?.id || '';
        } catch (error: any) {
            if (import.meta.env.MODE !== 'production') {

                console.error("Error creating recruitment card:", error);

            }
            throw new Error(error.response?.data?.message || 'Failed to create recruitment');
        }
    }

    async joinSquad(cardId: string, userId: string): Promise<string> {
        try {
            const response = await api.post(`/api/warroom/recruitments/${cardId}/join`, { userId });
            return response.data?.chatId || '';
        } catch (error: any) {
            if (import.meta.env.MODE !== 'production') {

                console.error("Error joining squad:", error);

            }
            throw new Error(error.response?.data?.message || 'Failed to join squad');
        }
    }

    async getUserRecentRecruitments(userId: string, minutesBack: number): Promise<RecruitmentCard[]> {
        try {
            const response = await api.get('/api/warroom/recruitments', {
                params: { userId, minutesBack }
            });
            return response.data || [];
        } catch (error) {
            if (import.meta.env.MODE !== 'production') {

                console.error('Error fetching recent recruitments:', error);

            }
            return [];
        }
    }

    // Real-time subscriptions aren't supported by standard REST API calls easily.
    // Converted to polling or single fetch for now.
    subscribeToRecruitments(
        filters: { gameId?: string; mode?: string },
        callback: (cards: RecruitmentCard[]) => void
    ): () => void {
        const fetchCards = async () => {
            try {
                const response = await api.get('/api/warroom/recruitments', { params: filters });
                callback(response.data || []);
            } catch (error) {
                if (import.meta.env.MODE !== 'production') {

                    console.error('Error fetching recruitments:', error);

                }
            }
        };

        fetchCards();
        const interval = setInterval(fetchCards, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }

    // ========================================
    // TOURNAMENT CARDS (AUTO-GENERATED)
    // ========================================

    /*
    async generateTournamentCard(tournamentId: string, eventType: TournamentEventType, tournamentData: any): Promise<void> {
        // This likely should happen on backend when tournament is created.
        // Keeping method stub but doing nothing on frontend or calling generic endpoint.
    }
    */

    subscribeToTournamentCards(
        callback: (cards: TournamentCard[]) => void
    ): () => void {
        // MOCK: Backend endpoint does not exist
        // Always return empty array immediately
        callback([]);

        // Return no-op unsubscribe function
        return () => { };
    }

    // ========================================
    // CLIPS
    // ========================================

    async uploadClip(userId: string, userName: string, userAvatar: string, videoUrl: string, thumbnailUrl: string, data: Partial<ClipPost>): Promise<string> {
        try {
            const response = await api.post('/api/warroom/clips', {
                userId,
                userName,
                userAvatar,
                videoUrl,
                thumbnailUrl,
                ...data
            });
            return response.data?.id || '';
        } catch (error: any) {
            if (import.meta.env.MODE !== 'production') {

                console.error("Error uploading clip:", error);

            }
            throw new Error(error.response?.data?.message || 'Failed to upload clip');
        }
    }

    subscribeToClips(
        filters: { gameId?: string; userId?: string },
        callback: (clips: ClipPost[]) => void
    ): () => void {
        const fetchClips = async () => {
            try {
                const response = await api.get('/api/warroom/clips', { params: filters });
                callback(response.data || []);
            } catch (error) {
                if (import.meta.env.MODE !== 'production') {

                    console.error('Error fetching clips:', error);

                }
            }
        };

        fetchClips();
        const interval = setInterval(fetchClips, 30000);
        return () => clearInterval(interval);
    }

    // ========================================
    // HELPER METHODS
    // ========================================



    async cleanupExpiredCards(): Promise<void> {
        // Backend should handle this cron job
    }
}

export const warRoomService = new WarRoomService()

