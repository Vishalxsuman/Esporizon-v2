import { runRoundManager } from '../services/roundManager.js'

/**
 * Scheduler for prediction game round manager
 * Runs every 10 seconds to check and advance game states
 */

let schedulerInterval = null

/**
 * Start the scheduler
 */
export const startScheduler = () => {
    if (schedulerInterval) {
        console.log('⚠️  Scheduler already running')
        return
    }

    console.log('🎮 Starting Prediction Round Manager Scheduler...')

    // Run immediately on start
    runRoundManager().catch(error => {
        console.error('Initial round manager run failed:', error)
    })

    // Then run every 10 seconds
    schedulerInterval = setInterval(async () => {
        try {
            await runRoundManager()
        } catch (error) {
            console.error('Scheduled round manager error:', error)
        }
    }, 10000) // 10 seconds

    console.log('✅ Prediction Round Manager Scheduler started (runs every 10s)')
}

/**
 * Stop the scheduler
 */
export const stopScheduler = () => {
    if (schedulerInterval) {
        clearInterval(schedulerInterval)
        schedulerInterval = null
        console.log('🛑 Prediction Round Manager Scheduler stopped')
    }
}

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down scheduler...')
    stopScheduler()
    process.exit(0)
})

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down scheduler...')
    stopScheduler()
    process.exit(0)
})
