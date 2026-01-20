import { warRoomService } from '@/services/WarRoomService'

/**
 * Automated Badge Awarding Logic
 * Integrates with tournament completion, recruitment success, and monthly checks
 */

export class BadgeAwarder {
    /**
     * Award Tournament Winner badge
     * Call this when a tournament completes and winners are determined
     */
    static async awardTournamentWinner(
        userId: string,
        tournamentId: string,
        tournamentName: string,
        placement: number
    ): Promise<void> {
        if (placement === 1) {
            await warRoomService.awardBadge(userId, 'tournament_winner', {
                tournamentId,
                tournamentName,
                placement: 1
            })
            import.meta.env.MODE !== 'production' && console.log(`🏆 Awarded Tournament Winner badge to ${userId}`)
        }
    }

    /**
     * Award Top Frag badge
     * Call this when tournament stats are calculated
     */
    static async awardTopFrag(
        userId: string,
        tournamentId: string,
        tournamentName: string,
        killCount: number
    ): Promise<void> {
        await warRoomService.awardBadge(userId, 'top_frag', {
            tournamentId,
            tournamentName,
            killCount
        })
        import.meta.env.MODE !== 'production' && console.log(`🎯 Awarded Top Frag badge to ${userId} (${killCount} kills)`)
    }

    /**
     * Award Team Leader badge
     * Call this when a recruitment successfully forms a squad
     */
    static async checkAndAwardTeamLeader(userId: string): Promise<void> {
        // Get user's badges
        const userBadges = await warRoomService.getUserBadges(userId)

        // Check if already has badge
        const hasTeamLeaderBadge = userBadges.some(b => b.type === 'team_leader')
        if (hasTeamLeaderBadge) return

        // TODO: Query recruitment cards to count successful formations
        // For now, simplified logic
        const successfulRecruitments = 3 // Replace with actual query

        if (successfulRecruitments >= 3) {
            await warRoomService.awardBadge(userId, 'team_leader', {
                successfulRecruitments
            })
            import.meta.env.MODE !== 'production' && console.log(`🧠 Awarded Team Leader badge to ${userId}`)
        }
    }

    /**
     * Award Verified Host badge
     * Manual admin award - call this when a host is verified
     */
    static async awardVerifiedHost(userId: string): Promise<void> {
        await warRoomService.awardBadge(userId, 'verified_host')
        import.meta.env.MODE !== 'production' && console.log(`🛡 Awarded Verified Host badge to ${userId}`)
    }

    /**
     * Check and Award Consistent Player badge
     * Run this monthly or when checking user stats
     */
    static async checkAndAwardConsistentPlayer(userId: string): Promise<void> {
        // Get user profile
        const userBadges = await warRoomService.getUserBadges(userId)

        // Check if already has badge for current month
        const hasConsistentBadge = userBadges.some(b => {
            if (b.type !== 'consistent_player') return false

            const earnedDate = new Date(b.earnedAt)
            const now = new Date()
            const isSameMonth = earnedDate.getMonth() === now.getMonth() &&
                earnedDate.getFullYear() === now.getFullYear()
            return isSameMonth
        })

        if (hasConsistentBadge) return

        // TODO: Query user's tournament participation for this month
        const monthlyTournaments = 10 // Replace with actual query

        if (monthlyTournaments >= 10) {
            await warRoomService.awardBadge(userId, 'consistent_player', {
                monthlyTournaments,
                month: new Date().toISOString()
            })
            import.meta.env.MODE !== 'production' && console.log(`🔥 Awarded Consistent Player badge to ${userId}`)
        }
    }

    /**
     * Integration hook for tournament completion
     * Call this from your tournament service when a tournament ends
     */
    static async onTournamentComplete(
        tournamentId: string,
        tournamentName: string,
        results: Array<{ userId: string; placement: number; kills: number }>
    ): Promise<void> {
        // Find winner
        const winner = results.find(r => r.placement === 1)
        if (winner) {
            await this.awardTournamentWinner(winner.userId, tournamentId, tournamentName, 1)
        }

        // Find top fragger
        const topFragger = results.reduce((max, r) => r.kills > max.kills ? r : max, results[0])
        if (topFragger && topFragger.kills > 0) {
            await this.awardTopFrag(topFragger.userId, tournamentId, tournamentName, topFragger.kills)
        }

        // Increment tournament count for all participants
        for (const result of results) {
            await warRoomService.incrementTournamentCount(result.userId)

            // Check for consistent player badge
            await this.checkAndAwardConsistentPlayer(result.userId)
        }
    }

    /**
     * Integration hook for successful squad formation
     * Call this when a recruitment card fills up and squad chat is created
     */
    static async onSquadFormed(creatorUserId: string): Promise<void> {
        await this.checkAndAwardTeamLeader(creatorUserId)
    }
}
