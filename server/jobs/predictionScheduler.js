import { checkAndAdvanceRound } from '../services/predictionRoundService.js'

/**
 * Prediction Round Scheduler
 * Runs every 5 seconds to check and advance rounds
 */

let schedulerInterval = null

/**
 * Start the prediction round scheduler
 */
export const startPredictionScheduler = () => {
    if (schedulerInterval) {
        console.log('⚠️  Prediction scheduler already running')
        return
    }

    console.log('🎮 Starting Prediction Round Scheduler...')

    // Run immediately on start
    runSchedulerCycle().catch(error => {
        console.error('Initial prediction scheduler run failed:', error)
    })

    // Then run every 5 seconds
    schedulerInterval = setInterval(async () => {
        try {
            await runSchedulerCycle()
        } catch (error) {
            console.error('Prediction scheduler error:', error)
        }
    }, 5000) // 5 seconds

    console.log('✅ Prediction Round Scheduler started (runs every 5s)')
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
        clearInterval(schedulerInterval)
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
