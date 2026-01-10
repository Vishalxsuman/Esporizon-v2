import { admin, getDb } from '../utils/firebase.js'
import { getModeConfig, GAME_MODES } from '../config/gameModes.js'
import { createPeriod, settlePeriod as settlePeriodDoc } from '../services/periodService.js'
import { generateResult } from '../services/resultService.js'
import { settlePeriod as processPeriodSettlement } from '../services/settlementService.js'

// Lazy-loaded db

/**
 * Get or create game state document
 * @param {string} modeId - Game mode ID
 * @returns {Promise<object>} - Game state data
 */
const getOrCreateGameState = async (modeId) => {
    const stateRef = getDb().collection('prediction-system').doc(`game-state-${modeId}`)
    const stateDoc = await stateRef.get()

    if (!stateDoc.exists) {
        const modeConfig = getModeConfig(modeId)
        const initialState = {
            gameMode: modeId,
            state: 'WAITING',
            currentPeriodId: null,
            nextRoundStartTime: null,
            roundStartTime: null,
            roundEndTime: null,
            result: null,
            duration: modeConfig.duration,
            lockTime: modeConfig.lockTime,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }

        await stateRef.set(initialState)
        return { ...initialState, updatedAt: new Date() }
    }

    return stateDoc.data()
}

/**
 * Update game state
 * @param {string} modeId - Game mode ID
 * @param {object} updates - Updates to apply
 */
const updateGameState = async (modeId, updates) => {
    const stateRef = getDb().collection('prediction-system').doc(`game-state-${modeId}`)
    await stateRef.update({
        ...updates,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    })
}

/**
 * Process round lifecycle for a single game mode
 * @param {string} modeId - Game mode ID
 */
const processGameMode = async (modeId) => {
    try {
        const state = await getOrCreateGameState(modeId)
        const now = Date.now()
        const modeConfig = getModeConfig(modeId)

        console.log(`[RoundManager] ${modeId}: State = ${state.state}`)

        switch (state.state) {
            case 'WAITING':
                // Start new round
                await startNewRound(modeId, modeConfig)
                break

            case 'BETTING':
                // Check if we should lock (last 5 seconds)
                const endTime = new Date(state.roundEndTime).getTime()
                const timeRemaining = Math.floor((endTime - now) / 1000)

                if (timeRemaining <= modeConfig.lockTime) {
                    await lockRound(modeId)
                }
                break

            case 'LOCKED':
                // Check if round time is up
                const lockEndTime = new Date(state.roundEndTime).getTime()

                if (now >= lockEndTime) {
                    await generateResultAndSettle(modeId, state.currentPeriodId)
                }
                break

            case 'SETTLED':
                // Wait a moment then start new round
                setTimeout(() => {
                    updateGameState(modeId, { state: 'WAITING' })
                }, 2000)
                break
        }
    } catch (error) {
        console.error(`[RoundManager] Error processing ${modeId}:`, error)
    }
}

/**
 * Start a new round
 * @param {string} modeId - Game mode ID
 * @param {object} modeConfig - Mode configuration
 */
const startNewRound = async (modeId, modeConfig) => {
    console.log(`[RoundManager] ${modeId}: Starting new round`)

    // Create new period
    const period = await createPeriod(modeId)

    // Calculate round times
    const startTime = new Date()
    const endTime = new Date(startTime.getTime() + modeConfig.duration * 1000)

    // Update game state
    await updateGameState(modeId, {
        state: 'BETTING',
        currentPeriodId: period.periodId,
        roundStartTime: startTime,
        roundEndTime: endTime,
        result: null
    })

    console.log(`[RoundManager] ${modeId}: New round started, period ${period.periodId}`)
}

/**
 * Lock the round (no more bets)
 * @param {string} modeId - Game mode ID
 */
const lockRound = async (modeId) => {
    console.log(`[RoundManager] ${modeId}: Locking round`)

    await updateGameState(modeId, {
        state: 'LOCKED'
    })
}

/**
 * Generate result and settle the round
 * @param {string} modeId - Game mode ID
 * @param {string} periodId - Period ID
 */
const generateResultAndSettle = async (modeId, periodId) => {
    console.log(`[RoundManager] ${modeId}: Generating result for period ${periodId}`)

    // Generate result
    const result = await generateResult(modeId)

    // Update period with result
    await settlePeriodDoc(modeId, periodId, result)

    console.log(`[RoundManager] ${modeId}: Result = ${result}, settling bets...`)

    // Process settlements
    const stats = await processPeriodSettlement(modeId, periodId, result)

    console.log(`[RoundManager] ${modeId}: Settlement complete:`, stats)

    // Update game state
    await updateGameState(modeId, {
        state: 'SETTLED',
        result
    })
}

/**
 * Main round manager function (to be called by scheduler)
 * Processes all game modes
 */
export const runRoundManager = async () => {
    console.log('[RoundManager] Running round manager...')

    const gameModes = Object.keys(GAME_MODES)

    // Process all game modes in parallel
    await Promise.all(gameModes.map(modeId => processGameMode(modeId)))

    console.log('[RoundManager] Round manager cycle complete')
}

/**
 * Get current game state for a mode (for client queries)
 * @param {string} modeId - Game mode ID
 * @returns {Promise<object>} - Current game state
 */
export const getCurrentGameState = async (modeId) => {
    return await getOrCreateGameState(modeId)
}

/**
 * Get time remaining for current round
 * @param {string} modeId - Game mode ID
 * @returns {Promise<number>} - Seconds remaining
 */
export const getTimeRemaining = async (modeId) => {
    const state = await getOrCreateGameState(modeId)

    if (!state.roundEndTime) {
        return 0
    }

    const now = Date.now()
    const endTime = new Date(state.roundEndTime).getTime()
    const remaining = Math.max(0, Math.floor((endTime - now) / 1000))

    return remaining
}
