import admin from 'firebase-admin'
import { getNextPeriodId } from './predictionPeriodService.js'
import { generateResult } from './predictionResultService.js'
import { distributePayouts } from './predictionPayoutService.js'

const db = admin.firestore()

/**
 * Game mode configuration
 */
const GAME_MODES = {
    WIN_GO_30S: { duration: 30, lockSeconds: 5, bettingSeconds: 25 },
    WIN_GO_1_MIN: { duration: 60, lockSeconds: 5, bettingSeconds: 55 },
    WIN_GO_3_MIN: { duration: 180, lockSeconds: 5, bettingSeconds: 175 },
    WIN_GO_5_MIN: { duration: 300, lockSeconds: 5, bettingSeconds: 295 }
}

/**
 * Check and advance round state for a game mode
 * This is the main function called by the scheduler
 * @param {string} mode - Game mode (e.g., "WIN_GO_1_MIN")
 */
export const checkAndAdvanceRound = async (mode) => {
    const modeConfig = GAME_MODES[mode]
    if (!modeConfig) {
        console.error(`Unknown game mode: ${mode}`)
        return
    }

    // Use mode-specific document instead of shared 'current'
    const roundRef = db.collection('prediction_rounds').doc(mode)

    try {
        const roundDoc = await roundRef.get()

        // If no current round exists, create one
        if (!roundDoc.exists) {
            console.log(`📝 No current round found. Creating initial round for ${mode}`)
            await createNewRound(mode, modeConfig)
            return
        }

        const round = roundDoc.data()

        const now = admin.firestore.Timestamp.now().toMillis()
        const roundEndTime = round.roundEndAt.toMillis()
        const timeRemaining = Math.floor((roundEndTime - now) / 1000)

        // State machine logic
        if (round.status === 'BETTING') {
            // Check if we should lock (last 5 seconds)
            if (timeRemaining <= modeConfig.lockSeconds) {
                console.log(`🔒 Locking round ${round.periodId}`)
                await roundRef.update({
                    status: 'LOCKED',
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                })
            }
        } else if (round.status === 'LOCKED') {
            // Check if round time is up
            if (timeRemaining <= 0) {
                console.log(`🎲 Generating result for round ${round.periodId}`)
                await generateResultAndPayout(mode, round.periodId, modeConfig)
            }
        } else if (round.status === 'RESULT') {
            // Payout should be done, create new round after 2 second delay
            if (round.payoutDone && timeRemaining <= -2) {
                console.log(`🔄 Creating new round after ${round.periodId}`)
                await createNewRound(mode, modeConfig)
            }
        }
    } catch (error) {
        console.error(`Error in checkAndAdvanceRound for ${mode}:`, error)
    }
}

/**
 * Create a new round
 * @param {string} mode - Game mode
 * @param {object} modeConfig - Mode configuration
 */
const createNewRound = async (mode, modeConfig) => {
    // Use mode-specific document
    const roundRef = db.collection('prediction_rounds').doc(mode)

    try {
        // Check if a round already exists to prevent duplicates
        const existingRound = await roundRef.get()
        if (existingRound.exists && existingRound.data().status === 'BETTING') {
            console.log('⚠️ Active betting round already exists. Skipping creation.')
            return
        }

        // Generate new period ID (mode-specific)
        const periodId = await getNextPeriodId(mode)

        // Calculate round times
        const roundStartAt = admin.firestore.Timestamp.now()
        const roundEndAt = admin.firestore.Timestamp.fromMillis(
            roundStartAt.toMillis() + modeConfig.duration * 1000
        )

        // Create new round
        await roundRef.set({
            mode,
            periodId,
            status: 'BETTING',
            roundStartAt,
            roundEndAt,
            resultNumber: -1,
            resultColor: 'PENDING',
            resultSize: 'PENDING',
            payoutDone: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        })

        console.log(`✅ New round created: ${periodId} (${mode}, ${modeConfig.duration}s)`)
    } catch (error) {
        console.error('Error creating new round:', error)
        throw error
    }
}

/**
 * Generate result and process payout
 * @param {string} mode - Game mode
 * @param {string} periodId - Period ID
 * @param {object} modeConfig - Mode configuration
 */
const generateResultAndPayout = async (mode, periodId, modeConfig) => {
    // Use mode-specific document
    const roundRef = db.collection('prediction_rounds').doc(mode)

    try {
        // Double-check payoutDone flag to prevent duplicate payout
        const currentRound = await roundRef.get()
        if (currentRound.data().payoutDone) {
            console.log('⚠️ Payout already done for this period. Skipping.')
            return
        }

        // Generate result (server-side RNG)
        const result = generateResult()

        // Update round with result using transaction to prevent race conditions
        await db.runTransaction(async (transaction) => {
            const roundDoc = await transaction.get(roundRef)

            if (roundDoc.data().payoutDone) {
                throw new Error('Payout already done')
            }

            transaction.update(roundRef, {
                status: 'RESULT',
                resultNumber: result.resultNumber,
                resultColor: result.resultColor,
                resultSize: result.resultSize,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            })
        })

        // Distribute payouts
        const payoutStats = await distributePayouts(mode, periodId, result)

        // Mark payout as done
        await roundRef.update({
            payoutDone: true,
            payoutStats,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        })

        // Write to history
        await writeToHistory(mode, periodId, result, payoutStats)

        console.log(`✅ Result and payout complete for ${periodId}`)
    } catch (error) {
        if (error.message === 'Payout already done') {
            console.log('⚠️ Payout already processed, skipping')
            return
        }
        console.error('Error in generateResultAndPayout:', error)
        throw error
    }
}

/**
 * Write completed round to history
 * @param {string} mode - Game mode
 * @param {string} periodId - Period ID
 * @param {object} result - Result object
 * @param {object} payoutStats - Payout statistics
 */
const writeToHistory = async (mode, periodId, result, payoutStats) => {
    try {
        await db.collection('prediction_history').doc(periodId).set({
            mode,
            periodId,
            resultNumber: result.resultNumber,
            resultColor: result.resultColor,
            resultSize: result.resultSize,
            totalBets: payoutStats.totalBets,
            winners: payoutStats.winners,
            totalPayout: payoutStats.totalPayout,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        })

        console.log(`📝 Written to history: ${periodId}`)
    } catch (error) {
        console.error('Error writing to history:', error)
        // Don't throw - history write failure shouldn't stop the round
    }
}

/**
 * Get current round for a specific mode (for API endpoints)
 * @param {string} mode - Game mode (e.g., "WIN_GO_1_MIN")
 * @returns {Promise<object>} Current round data
 */
export const getCurrentRound = async (mode) => {
    if (!mode || !GAME_MODES[mode]) {
        throw new Error(`Invalid mode: ${mode}`)
    }

    const roundDoc = await db.collection('prediction_rounds').doc(mode).get()

    if (!roundDoc.exists) {
        return null
    }

    return roundDoc.data()
}

/**
 * Check if betting is allowed for a specific mode
 * @param {string} mode - Game mode (e.g., "WIN_GO_1_MIN")
 * @returns {Promise<boolean>} Whether betting is allowed
 */
export const isBettingAllowed = async (mode) => {
    const round = await getCurrentRound(mode)

    if (!round) {
        return false
    }

    return round.status === 'BETTING'
}
