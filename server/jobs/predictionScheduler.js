import { checkAndAdvanceRound } from '../services/predictionRoundService.js'
import { initializePeriodCounter } from '../services/predictionPeriodService.js'

/**
 * Prediction Round Scheduler
 * Runs every 5 seconds to check and advance rounds
 */

let schedulerInterval = null

/**
 * Initialize prediction system on server startup
 * Creates initial rounds for all modes if they don't exist
 */
export const initializePredictionSystem = async () => {
    try {
        console.log('🔧 Initializing prediction system...')

        // Initialize period counters for all modes
        await initializePeriodCounter()

        // Create initial rounds for all modes (checkAndAdvanceRound will create if missing)
        const modes = ['WIN_GO_30S', 'WIN_GO_1_MIN', 'WIN_GO_3_MIN', 'WIN_GO_5_MIN']
        for (const mode of modes) {
            await checkAndAdvanceRound(mode)
        }

        console.log('✅ Prediction system initialized - all modes ready')
    } catch (error) {
        console.error('❌ Prediction system initialization error:', error)
    }
}

/**
 * Start the prediction round scheduler
 */
export const startPredictionScheduler = () => {
    if (schedulerInterval) {
        console.log('⚠️  Prediction scheduler already running')
        return
    }

    console.log('🎮 Starting Prediction Round Scheduler...')

    const runLoop = async () => {
        if (!schedulerInterval && schedulerInterval !== undefined) return; // Stopped

        try {
            await runSchedulerCycle()
        } catch (error) {
            console.error('Prediction scheduler cycle error:', error)
        }

        // Schedule next run ONLY after current completes
        // 2-second interval for better responsiveness (especially for 30s mode)
        schedulerInterval = setTimeout(runLoop, 2000)
    }

    // Initialize the loop (using a dummy value for the check, or just a flag)
    // We use schedulerInterval as the "active" flag/timer
    schedulerInterval = setTimeout(runLoop, 100);

    console.log('✅ Prediction Round Scheduler started (Serial execution protection enabled)')
}

/**
 * Run one cycle of scheduled checks
 */
const runSchedulerCycle = async () => {
    // Check all game modes (including 30 second mode)
    const modes = ['WIN_GO_30S', 'WIN_GO_1_MIN', 'WIN_GO_3_MIN', 'WIN_GO_5_MIN']

    for (const mode of modes) {
        try {
            await checkAndAdvanceRound(mode)
        } catch (error) {
            console.error(`Error processing ${mode}:`, error)
            // Continue with other modes even if one fails
        }
    }
}

/**
 * Stop the prediction scheduler
 */
export const stopPredictionScheduler = () => {
    if (schedulerInterval) {
        clearTimeout(schedulerInterval)
        schedulerInterval = null
        console.log('🛑 Prediction Round Scheduler stopped')
    }
}

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down prediction scheduler...')
    stopPredictionScheduler()
})

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down prediction scheduler...')
    stopPredictionScheduler()
})
