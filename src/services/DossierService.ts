import {
    LFGStatus,
    LFGStatusMode,
    SkillMetrics,
    TrophyItem,
    ActivityTimelineItem,
    SignatureGame,
    HostMetrics
} from '@/types/DossierTypes'
import { userService } from './UserService'

class DossierService {
    // ========================================
    // LFG STATUS MANAGEMENT
    // ========================================

    async updateLFGStatus(userId: string, mode: LFGStatusMode, hours?: number): Promise<void> {
        try {
            const lfgStatus: LFGStatus = {
                mode,
                setAt: new Date().toISOString(),
                autoExpireHours: hours,
                expiresAt: hours ? new Date(Date.now() + hours * 60 * 60 * 1000).toISOString() : undefined
            }

            await userService.updateProfile(userId, {
                lfgStatus
            })
        } catch (error) {
            if (import.meta.env.MODE !== 'production') {

                console.error('Error updating LFG status:', error);

            }
            throw error
        }
    }

    async clearLFGStatus(userId: string): Promise<void> {
        await this.updateLFGStatus(userId, 'not_available')
    }

    async checkLFGExpiry(userId: string): Promise<boolean> {
        const profile = await userService.getProfile(userId)
        const lfgStatus = profile.lfgStatus

        if (!lfgStatus || !lfgStatus.expiresAt) {
            return false
        }

        const now = new Date()
        const expiresAt = new Date(lfgStatus.expiresAt)

        if (now > expiresAt) {
            await this.clearLFGStatus(userId)
            return true
        }

        return false
    }

    // ========================================
    // SKILL METRICS CALCULATION
    // ========================================

    async calculateSkillMetrics(_userId: string): Promise<SkillMetrics> {
        try {
            // Return default metrics until backend endpoint is available
            const emptyMetrics: SkillMetrics = {
                aggression: 0,
                survival: 0,
                teamImpact: 0,
                consistency: 0,
                clutchFactor: 0,
                lastCalculated: new Date().toISOString()
            }
            return emptyMetrics
        } catch (error) {
            if (import.meta.env.MODE !== 'production') {

                console.error('Error calculating skill metrics:', error);

            }
            throw error
        }
    }

    /*
    // Future implementation for real calculation
    private calculateAggressionScore(tournaments: any[]): number {
        return 0
    }
    */

    // ========================================
    // TROPHY CABINET
    // ========================================

    async getTrophyCabinet(_userId: string): Promise<TrophyItem[]> {
        try {
            // Return empty array until backend endpoint is available
            return []
        } catch (error) {
            if (import.meta.env.MODE !== 'production') {

                console.error('Error getting trophy cabinet:', error);

            }
            return []
        }
    }

    // ========================================
    // ACTIVITY TIMELINE
    // ========================================

    async getActivityTimeline(_userId: string, _limitCount: number = 10): Promise<ActivityTimelineItem[]> {
        try {
            // Return empty array until backend endpoint is available
            return []
        } catch (error) {
            if (import.meta.env.MODE !== 'production') {

                console.error('Error getting activity timeline:', error);

            }
            return []
        }
    }

    // ========================================
    // SIGNATURE GAME
    // ========================================

    async updateSignatureGame(userId: string, gameData: SignatureGame): Promise<void> {
        try {
            await userService.updateProfile(userId, {
                signatureGame: {
                    ...gameData,
                    lastUpdated: new Date().toISOString()
                }
            })
        } catch (error) {
            if (import.meta.env.MODE !== 'production') {

                console.error('Error updating signature game:', error);

            }
            throw error
        }
    }

    // ========================================
    // HOST METRICS
    // ========================================

    async getHostMetrics(userId: string): Promise<HostMetrics | null> {
        try {
            const profile = await userService.getProfile(userId)

            if (!profile.isVerifiedHost) {
                return null
            }

            // Return default metrics until backend endpoint is available
            const defaultHostMetrics: HostMetrics = {
                hostingRating: 0,
                totalPrizeDistributed: 0,
                tournamentsCompleted: 0,
                activeTournaments: 0,
                upcomingTournaments: 0
            }

            return defaultHostMetrics
        } catch (error) {
            if (import.meta.env.MODE !== 'production') {

                console.error('Error getting host metrics:', error);

            }
            return null
        }
    }

    // ========================================
    // SOCIAL LINKS
    // ========================================

    async updateSocialLinks(userId: string, links: { youtube?: string; twitch?: string }): Promise<void> {
        try {
            await userService.updateProfile(userId, {
                socialLinks: links
            })
        } catch (error) {
            if (import.meta.env.MODE !== 'production') {

                console.error('Error updating social links:', error);

            }
            throw error
        }
    }

    // ========================================
    // CLAN MANAGEMENT
    // ========================================

    async updateClan(userId: string, clanTag?: string, clanLogo?: string): Promise<void> {
        try {
            await userService.updateProfile(userId, {
                clanTag,
                clanLogo
            })
        } catch (error) {
            if (import.meta.env.MODE !== 'production') {

                console.error('Error updating clan:', error);

            }
            throw error
        }
    }
}

export const dossierService = new DossierService()
