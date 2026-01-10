import { admin, getDb } from '../utils/firebase.js'

// Lazy-loaded db (do not initialize at module level)

/**
 * Mode code mapping for period ID generation
 */
const MODE_CODES = {
    WIN_GO_30S: 'WG30',
    WIN_GO_1_MIN: 'WG1',
    WIN_GO_3_MIN: 'WG3',
    WIN_GO_5_MIN: 'WG5'
}

/**
 * Get current date in IST (YYYY-MM-DD)
 * @returns {string} Date string
 */
const getISTDate = () => {
    return new Date().toLocaleString('en-CA', { timeZone: 'Asia/Kolkata' }).slice(0, 10)
}

/**
 * Get current date string for period ID (YYYYMMDD) in IST
 * @returns {string} Date string
 */
const getISTDateStr = () => {
    return getISTDate().replace(/-/g, '')
}

/**
 * Initialize period counter for a specific mode (run once per mode)
 * @param {string} mode - Game mode (e.g., "WIN_GO_1_MIN")
 */
export const initializePeriodCounter = async (mode = null) => {
    try {
        if (mode) {
            // Initialize specific mode
            const counterRef = getDb().collection('prediction_system').doc(`period_counter_${mode}`)
            const doc = await counterRef.get()
            if (!doc.exists) {
                await counterRef.set({
                    mode,
                    lastDate: getISTDate(),
                    counter: 0,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                })
                console.log(`✅ Period counter initialized for ${mode}`)
            }
        } else {
            // Initialize all modes
            const modes = Object.keys(MODE_CODES)
            for (const m of modes) {
                await initializePeriodCounter(m)
            }
            console.log('✅ All prediction period counters initialized')
        }
    } catch (error) {
        console.error('Error initializing period counter:', error)
        throw error
    }
}

/**
 * Get next period ID with atomic increment for a specific mode
 * Format: <MODE_CODE>-<YYYYMMDD>-<INCREMENT>
 * Examples: WG1-20260110-001, WG3-20260110-002
 * @param {string} mode - Game mode (e.g., "WIN_GO_1_MIN")
 * @returns {Promise<string>} Next period ID
 */
export const getNextPeriodId = async (mode) => {
    if (!mode || !MODE_CODES[mode]) {
        throw new Error(`Invalid mode: ${mode}. Must be one of: ${Object.keys(MODE_CODES).join(', ')}`)
    }

    const counterRef = getDb().collection('prediction_system').doc(`period_counter_${mode}`)

    try {
        const newPeriodId = await getDb().runTransaction(async (transaction) => {
            const doc = await transaction.get(counterRef)
            let data;
            if (!doc.exists) {
                console.log(`⚠️ Period counter for ${mode} not found. Initializing...`)
                data = {
                    lastDate: getISTDate(),
                    counter: 0
                }
                transaction.set(counterRef, {
                    ...data,
                    mode,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                })
            } else {
                data = doc.data()
            }

            const currentDate = getISTDate() // YYYY-MM-DD in IST
            const lastDate = data.lastDate

            let counter = data.counter || 0

            // Reset counter if new day
            if (currentDate !== lastDate) {
                console.log(`📅 New day detected for ${mode}. Resetting counter. Last: ${lastDate}, Current: ${currentDate}`)
                counter = 0
                transaction.update(counterRef, {
                    lastDate: currentDate,
                    counter: 0,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                })
            }

            // Increment counter
            counter++
            transaction.update(counterRef, {
                counter: counter,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            })

            // Generate period ID: <MODE_CODE>-<YYYYMMDD>-<INCREMENT>
            const modeCode = MODE_CODES[mode]
            const dateStr = currentDate.replace(/-/g, '') // YYYYMMDD
            const counterStr = counter.toString().padStart(3, '0') // 001, 002, etc.
            return `${modeCode}-${dateStr}-${counterStr}`
        })

        console.log(`🔢 Generated period ID for ${mode}: ${newPeriodId}`)
        return newPeriodId
    } catch (error) {
        console.error(`Error getting next period ID for ${mode}:`, error)
        throw error
    }
}

/**
 * Get current period counter value for a mode (for debugging)
 * @param {string} mode - Game mode
 * @returns {Promise<object>} Counter data
 */
export const getCurrentCounter = async (mode) => {
    const counterRef = getDb().collection('prediction_system').doc(`period_counter_${mode}`)
    const doc = await counterRef.get()

    if (!doc.exists) {
        return null
    }

    return doc.data()
}
