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
            console.error('Error updating LFG status:', error)
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

    async calculateSkillMetrics(userId: string): Promise<SkillMetrics> {
        try {
            // TODO: Replace with actual tournament data queries
            // For now, return mock data
            const mockMetrics: SkillMetrics = {
                aggression: Math.floor(Math.random() * 40) + 60, // 60-100
                survival: Math.floor(Math.random() * 40) + 50, // 50-90
                teamImpact: Math.floor(Math.random() * 40) + 55, // 55-95
                consistency: Math.floor(Math.random() * 40) + 65, // 65-100
                clutchFactor: Math.floor(Math.random() * 40) + 60, // 60-100
                lastCalculated: new Date().toISOString()
            }

            // Save to user profile
            await userService.updateProfile(userId, {
                skillMetrics: mockMetrics
            })

            return mockMetrics
        } catch (error) {
            console.error('Error calculating skill metrics:', error)
            throw error
        }
    }

    /*
    // Real calculation logic (to be integrated with actual tournament data)
    private calculateAggressionScore(tournaments: any[]): number {
        return 75
    }

    private calculateSurvivalScore(tournaments: any[]): number {
        return 82
    }

    private calculateTeamImpactScore(tournaments: any[]): number {
        return 68
    }

    private calculateConsistencyScore(tournaments: any[]): number {
        return 91
    }

    private calculateClutchScore(tournaments: any[]): number {
        return 77
    }
    */

    // ========================================
    // TROPHY CABINET
    // ========================================

    async getTrophyCabinet(_userId: string): Promise<TrophyItem[]> {
        try {
            // Query tournaments where user placed 1st, 2nd, or 3rd

            // TODO: Replace with actual Firestore queries
            // Mock data for demonstration
            const mockTrophies: TrophyItem[] = [
                {
                    id: 'trophy_1',
                    tournamentId: 'tournament_123',
                    tournamentName: 'Free Fire Arena Championship',
                    placement: 1,
                    prizeWon: 50000,
                    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                    gameId: 'freefire',
                    participants: 64
                },
                {
                    id: 'trophy_2',
                    tournamentId: 'tournament_456',
                    tournamentName: 'BGMI Pro League',
                    placement: 2,
                    prizeWon: 30000,
                    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
                    gameId: 'bgmi',
                    participants: 32
                }
            ]

            return mockTrophies
        } catch (error) {
            console.error('Error getting trophy cabinet:', error)
            return []
        }
    }

    // ========================================
    // ACTIVITY TIMELINE
    // ========================================

    async getActivityTimeline(_userId: string, limitCount: number = 10): Promise<ActivityTimelineItem[]> {
        try {
            // TODO: Query various activity sources and merge
            // For now, return mock data
            const mockActivities: ActivityTimelineItem[] = [
                {
                    id: 'activity_1',
                    type: 'tournament_won',
                    title: 'Won Free Fire Arena Tournament',
                    description: '1st Place • ₹50,000 Prize',
                    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                    metadata: {
                        tournamentId: 'tournament_123',
                        placement: 1,
                        prize: 50000
                    }
                },
                {
                    id: 'activity_2',
                    type: 'tournament_joined',
                    title: 'Joined BGMI Squad Championship',
                    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                    metadata: {
                        tournamentId: 'tournament_789'
                    }
                },
                {
                    id: 'activity_3',
                    type: 'recruitment_formed',
                    title: 'Formed Squad "Elite Gamers"',
                    description: '4 members joined',
                    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: 'activity_4',
                    type: 'tournament_placed',
                    title: 'Placed 2nd in BGMI Pro League',
                    description: '₹30,000 Prize',
                    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                    metadata: {
                        tournamentId: 'tournament_456',
                        placement: 2,
                        prize: 30000
                    }
                }
            ]

            return mockActivities.slice(0, limitCount)
        } catch (error) {
            console.error('Error getting activity timeline:', error)
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
            console.error('Error updating signature game:', error)
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

            // TODO: Calculate from actual tournament data
            // Mock data for demonstration
            const mockHostMetrics: HostMetrics = {
                hostingRating: 4.8,
                totalPrizeDistributed: 500000,
                tournamentsCompleted: 45,
                activeTournaments: 3,
                upcomingTournaments: 2
            }

            return mockHostMetrics
        } catch (error) {
            console.error('Error getting host metrics:', error)
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
            console.error('Error updating social links:', error)
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
            console.error('Error updating clan:', error)
            throw error
        }
    }
}

export const dossierService = new DossierService()
