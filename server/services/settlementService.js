import admin from 'firebase-admin'
import { calculatePayout } from './resultService.js'
import { creditWinnings } from './walletService.js'
import { getPeriodBets, updateBetStatus } from './betService.js'

const db = admin.firestore()

/**
 * Settle all bets for a completed period
 * @param {string} gameMode - Game mode ID
 * @param {string} periodId - Period ID
 * @param {number} result - Result number (0-9)
 * @returns {Promise<object>} - Settlement statistics
 */
export const settlePeriod = async (gameMode, periodId, result) => {
    console.log(`[Settlement] Starting settlement for ${gameMode} period ${periodId}, result: ${result}`)

    try {
        // Get all pending bets for this period
        const bets = await getPeriodBets(gameMode, periodId, 'pending')

        if (bets.length === 0) {
            console.log(`[Settlement] No bets to settle for period ${periodId}`)
            return {
                totalBets: 0,
                totalWinners: 0,
                totalPayout: 0
            }
        }

        let totalPayout = 0
        let totalWinners = 0

        // Process each bet
        for (const bet of bets) {
            try {
                // Calculate payout
                const payoutResult = calculatePayout(
                    bet.betType,
                    bet.betValue,
                    result,
                    bet.amountEspo
                )

                const { isWin, payout } = payoutResult
                const status = isWin ? 'win' : 'lose'

                // Update bet status
                await updateBetStatus(gameMode, periodId, bet.id, status, payout)

                // Credit winnings if won
                if (isWin && payout > 0) {
                    await creditWinnings(
                        bet.userId,
                        bet.isGuest,
                        payout,
                        periodId,
                        bet.id
                    )

                    totalPayout += payout
                    totalWinners++
                }

                console.log(`[Settlement] Bet ${bet.id}: ${status}, payout: ${payout}`)
            } catch (error) {
                console.error(`[Settlement] Error processing bet ${bet.id}:`, error)
                // Continue with other bets even if one fails
            }
        }

        // Update period with total payout
        const periodRef = db.collection(`prediction-games-${gameMode}`).doc(periodId)
        await periodRef.update({
            totalPayoutAmount: totalPayout
        })

        const stats = {
            totalBets: bets.length,
            totalWinners,
            totalPayout
        }

        console.log(`[Settlement] Completed for period ${periodId}:`, stats)

        return stats
    } catch (error) {
        console.error(`[Settlement] Error settling period ${periodId}:`, error)
        throw error
    }
}

/**
 * Get settlement statistics for a period
 * @param {string} gameMode - Game mode ID
 * @param {string} periodId - Period ID
 * @returns {Promise<object>} - Settlement statistics
 */
export const getSettlementStats = async (gameMode, periodId) => {
    const periodRef = db.collection(`prediction-games-${gameMode}`).doc(periodId)
    const periodDoc = await periodRef.get()

    if (!periodDoc.exists) {
        throw new Error('Period not found')
    }

    const periodData = periodDoc.data()

    // Get bet counts
    const allBets = await getPeriodBets(gameMode, periodId)
    const winningBets = allBets.filter(b => b.status === 'win')
    const losingBets = allBets.filter(b => b.status === 'lose')

    return {
        totalBetsAmount: periodData.totalBetsAmount || 0,
        totalPayoutAmount: periodData.totalPayoutAmount || 0,
        totalBets: allBets.length,
        winningBets: winningBets.length,
        losingBets: losingBets.length,
        houseProfit: (periodData.totalBetsAmount || 0) - (periodData.totalPayoutAmount || 0)
    }
}
