import { admin, getDb } from '../utils/firebase.js'
import { getNextPeriodId } from './predictionPeriodService.js'
import { generateResult } from './predictionResultService.js'
import { distributePayouts } from './predictionPayoutService.js'

// Lazy-loaded db (do not initialize at module level)

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
    const roundRef = getDb().collection('prediction_rounds').doc(mode)

    try {
        const roundDoc = await roundRef.get()

        // If no current round exists, create one
        if (!roundDoc.exists) {
            console.log(`📝 [${mode}] No current round found. Creating initial round...`)
            await createNewRound(mode, modeConfig)
            return
        }

        const round = roundDoc.data()

        // IF STATUS OR PERIOD ID IS MISSING, REPAIR IT (Manual creation error safety)
        if (!round.status || !round.periodId) {
            console.log(`[${mode}] ⚠️ Missing status or periodId! Repairing by creating new round...`)
            await createNewRound(mode, modeConfig)
            return
        }

        const now = admin.firestore.Timestamp.now().toMillis()
        const roundEndTime = round.roundEndAt.toMillis()
        const timeRemaining = Math.floor((roundEndTime - now) / 1000)

        console.log(`[${mode}] Status: ${round.status}, Time Remaining: ${timeRemaining}s, Period: ${round.periodId}, PayoutDone: ${round.payoutDone}`)

        // 🚨 UNIVERSAL STUCK DETECTION
        // If we're more than 30 seconds past the round end time, something is critically wrong
        // Auto-recovery: force the round to complete and move forward
        if (timeRemaining <= -30) {
            console.log(`[${mode}] 🚨 CRITICAL: Round stuck ${Math.abs(timeRemaining)}s past deadline!`)
            console.log(`[${mode}] 🔧 Auto-recovery: Forcing round to complete...`)

            if (round.status === 'BETTING' || round.status === 'LOCKED') {
                // Force result generation
                console.log(`[${mode}] 🎲 Force-generating result for stuck round ${round.periodId}`)
                await generateResultAndPayout(mode, round.periodId, modeConfig)
                return
            } else if (round.status === 'RESULT') {
                // Force new round creation
                if (!round.payoutDone) {
                    console.log(`[${mode}] ⚠️ Payout stuck. Marking as done and creating new round...`)
                    await roundRef.update({ payoutDone: true })
                }
                console.log(`[${mode}] 🔄 Force-creating new round after stuck RESULT`)
                await createNewRound(mode, modeConfig)
                return
            }
        }

        // BETTING → LOCKED (when time <= 5 seconds)
        if (round.status === 'BETTING') {
            if (timeRemaining <= modeConfig.lockSeconds) {
                console.log(`[${mode}] 🔒 TRANSITION: BETTING → LOCKED (period ${round.periodId})`)
                await roundRef.update({
                    status: 'LOCKED',
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                })
            }
        }
        // LOCKED → RESULT (when time <= 0)
        else if (round.status === 'LOCKED') {
            if (timeRemaining <= 0) {
                console.log(`[${mode}] 🎲 TRANSITION: LOCKED → RESULT (period ${round.periodId})`)
                await generateResultAndPayout(mode, round.periodId, modeConfig)
            }
            // SAFETY: If stuck in LOCKED for too long (> 10s past deadline), force result
            else if (timeRemaining <= -10) {
                console.log(`[${mode}] ⚠️ STUCK in LOCKED. Forcing result generation...`)
                await generateResultAndPayout(mode, round.periodId, modeConfig)
            }
        }
        // RESULT → NEW ROUND (immediately when payout done)
        else if (round.status === 'RESULT') {
            if (round.payoutDone) {
                console.log(`[${mode}] 🔄 TRANSITION: RESULT → NEW ROUND (after ${round.periodId})`)
                await createNewRound(mode, modeConfig)
            } else {
                console.log(`[${mode}] ⏳ Waiting for payout to complete... (Period: ${round.periodId})`)
            }
        }
    } catch (error) {
        console.error(`[${mode}] ❌ ERROR in checkAndAdvanceRound:`, error)
    }
}

/**
 * Create a new round
 * @param {string} mode - Game mode
 * @param {object} modeConfig - Mode configuration
 */
const createNewRound = async (mode, modeConfig) => {
    // Use mode-specific document
    const roundRef = getDb().collection('prediction_rounds').doc(mode)

    try {
        // Check if a round already exists to prevent duplicates
        const existingRound = await roundRef.get()
        if (existingRound.exists) {
            const existingData = existingRound.data()

            // Check if existing round is still valid (not expired)
            if (existingData.status === 'BETTING') {
                const now = admin.firestore.Timestamp.now().toMillis()
                const endTime = existingData.roundEndAt.toMillis()
                const timeRemaining = (endTime - now) / 1000

                // If betting round still has time left, don't create duplicate
                if (timeRemaining > 0) {
                    console.log(`⚠️ Active betting round already exists with ${Math.floor(timeRemaining)}s remaining. Skipping creation.`)
                    return
                } else {
                    console.log(`🔧 Existing BETTING round is expired (${Math.floor(Math.abs(timeRemaining))}s past deadline). Replacing with new round...`)
                    // Continue to create new round (will overwrite)
                }
            } else if (existingData.status === 'RESULT' && existingData.payoutDone) {
                console.log(`🔧 Existing RESULT round is complete. Creating new round...`)
                // Continue to create new round
            } else {
                console.log(`⚠️ Round exists in ${existingData.status} state (payoutDone: ${existingData.payoutDone}). Skipping creation (scheduler will advance it).`)
                return
            }
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
            // Robust IST Date for queries
            date: new Date().toLocaleString('en-CA', { timeZone: 'Asia/Kolkata' }).slice(0, 10),
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
    const roundRef = getDb().collection('prediction_rounds').doc(mode)

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
        await getDb().runTransaction(async (transaction) => {
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

        await getDb().collection('prediction_history').doc(`${mode}_${periodId}`).set({
            mode,
            periodId,
            resultNumber: result.resultNumber,
            resultColor: result.resultColor,
            resultSize: result.resultSize,
            totalBets: payoutStats?.totalBets || 0,
            winners: payoutStats?.winners || 0,
            totalPayout: payoutStats?.totalPayout || 0,
            date: new Date().toLocaleString('en-CA', { timeZone: 'Asia/Kolkata' }).slice(0, 10),
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

    const roundDoc = await getDb().collection('prediction_rounds').doc(mode).get()

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
