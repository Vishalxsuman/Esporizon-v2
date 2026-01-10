import { admin, getDb } from '../utils/firebase.js'
import { checkWin } from './predictionResultService.js'

// Lazy-loaded db (do not initialize at module level)

/**
 * Payout multipliers (on ₹1 equivalent)
 */
const PAYOUT_MULTIPLIERS = {
    RED: 1.9,
    GREEN: 1.9,
    VIOLET: 1.5,
    BIG: 1.9,
    SMALL: 1.9,
    NUMBER: 8
}

/**
 * Conversion rate: 2.5 Espo Coin = ₹1
 */
const ESPO_TO_RUPEE = 2.5

/**
 * Calculate payout for a winning bet
 * @param {string} betType - "COLOR", "NUMBER", or "SIZE"
 * @param {string} betValue - The bet value
 * @param {number} betAmount - Amount bet in Espo Coins
 * @returns {number} Payout amount in Espo Coins
 */
export const calculatePayout = (betType, betValue, betAmount) => {
    let multiplier = 0

    if (betType === 'NUMBER') {
        multiplier = PAYOUT_MULTIPLIERS.NUMBER
    } else if (betType === 'SIZE') {
        multiplier = PAYOUT_MULTIPLIERS[betValue] // BIG or SMALL
    } else if (betType === 'COLOR') {
        multiplier = PAYOUT_MULTIPLIERS[betValue] // RED, GREEN, or VIOLET
    }

    // Calculate based on ₹ equivalent then convert to Espo Coin
    const rupeeEquivalent = betAmount / ESPO_TO_RUPEE
    const payoutInRupee = rupeeEquivalent * multiplier
    const payoutInEspo = payoutInRupee * ESPO_TO_RUPEE

    return Math.round(payoutInEspo) // Round to nearest integer
}

/**
 * Distribute payouts for a period
 * @param {string} mode - Game mode (e.g., "WIN_GO_1_MIN")
 * @param {string} periodId - Period ID
 * @param {object} result - Result object {resultNumber, resultColor, resultSize}
 * @returns {Promise<object>} Payout statistics
 */
export const distributePayouts = async (mode, periodId, result) => {
    console.log(`💰 Starting payout distribution for period ${periodId}`)

    try {
        // Get all bets for this period
        const betsSnapshot = await getDb().collection('prediction_bets')
            .where('mode', '==', mode)
            .where('periodId', '==', periodId)
            .where('status', '==', 'pending')
            .get()

        if (betsSnapshot.empty) {
            console.log('⚠️ No pending bets found for payout')
            return {
                totalBets: 0,
                winners: 0,
                totalPayout: 0
            }
        }

        let winners = 0
        let totalPayout = 0
        const batch = getDb().batch()

        // Process each bet
        for (const betDoc of betsSnapshot.docs) {
            const bet = betDoc.data()
            const isWin = checkWin(bet.betType, bet.betValue, result)

            if (isWin) {
                // Calculate payout
                const payout = calculatePayout(bet.betType, bet.betValue, bet.betAmount)

                // Update bet status
                batch.update(betDoc.ref, {
                    status: 'won',
                    payout: payout,
                    resultNumber: result.resultNumber,
                    resultColor: result.resultColor,
                    resultSize: result.resultSize,
                    settledAt: admin.firestore.FieldValue.serverTimestamp()
                })

                // Credit wallet
                const walletRef = getDb().collection('prediction_wallets').doc(bet.userId)
                batch.update(walletRef, {
                    balance: admin.firestore.FieldValue.increment(payout),
                    totalWon: admin.firestore.FieldValue.increment(payout),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                })

                winners++
                totalPayout += payout

                console.log(`✅ User ${bet.userId} won ${payout} Espo Coins`)
            } else {
                // Update bet status to lost
                batch.update(betDoc.ref, {
                    status: 'lost',
                    payout: 0,
                    resultNumber: result.resultNumber,
                    resultColor: result.resultColor,
                    resultSize: result.resultSize,
                    settledAt: admin.firestore.FieldValue.serverTimestamp()
                })
            }
        }

        // Commit all updates atomically
        await batch.commit()

        const stats = {
            totalBets: betsSnapshot.size,
            winners,
            totalPayout
        }

        console.log(`💰 Payout complete:`, stats)

        return stats
    } catch (error) {
        console.error('Error distributing payouts:', error)
        throw error
    }
}
