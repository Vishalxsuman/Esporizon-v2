import admin from 'firebase-admin'
import { generatePeriodId, getNumberColors, getBigSmall } from '../config/gameModes.js'

const db = admin.firestore()

/**
 * Initialize period counters for all game modes
 * Should be run once during setup
 */
export const initializePeriodCounters = async () => {
    const counterRef = db.collection('prediction-system').doc('counters')

    try {
        const counterDoc = await counterRef.get()

        if (!counterDoc.exists) {
            // Initialize counters for all modes
            await counterRef.set({
                '30s': 0,
                '1min': 0,
                '3min': 0,
                '5min': 0,
                lastResetDate: new Date().toISOString().slice(0, 10)
            })
            console.log('✅ Period counters initialized')
        }
    } catch (error) {
        console.error('Error initializing period counters:', error)
        throw error
    }
}

/**
 * Get next period ID with atomic increment
 * @param {string} modeId - Game mode ID
 * @returns {Promise<string>} - New period ID
 */
export const getNextPeriodId = async (modeId) => {
    const counterRef = db.collection('prediction-system').doc('counters')

    try {
        const newPeriodId = await db.runTransaction(async (transaction) => {
            const counterDoc = await transaction.get(counterRef)

            if (!counterDoc.exists) {
                throw new Error('Period counters not initialized')
            }

            const data = counterDoc.data()
            const currentDate = new Date().toISOString().slice(0, 10)
            const lastResetDate = data.lastResetDate

            // Check if we need to reset counters (new day)
            let currentCounter = data[modeId] || 0

            if (currentDate !== lastResetDate) {
                // Reset all counters for new day
                transaction.update(counterRef, {
                    '30s': 0,
                    '1min': 0,
                    '3min': 0,
                    '5min': 0,
                    lastResetDate: currentDate
                })
                currentCounter = 0
            }

            // Increment counter
            const newCounter = currentCounter + 1
            transaction.update(counterRef, {
                [modeId]: newCounter
            })

            // Generate period ID
            return generatePeriodId(modeId, newCounter)
        })

        return newPeriodId
    } catch (error) {
        console.error(`Error getting next period ID for ${modeId}:`, error)
        throw error
    }
}

/**
 * Create a new period document
 * @param {string} modeId - Game mode ID
 * @param {number} result - Result number (0-9)
 * @returns {Promise<object>} - Created period data
 */
export const createPeriod = async (modeId, result = null) => {
    const periodId = await getNextPeriodId(modeId)
    const periodRef = db.collection(`prediction-games-${modeId}`).doc(periodId)

    const periodData = {
        periodId,
        gameMode: modeId,
        result: result,
        resultColors: result !== null ? getNumberColors(result) : null,
        resultBigSmall: result !== null ? getBigSmall(result) : null,
        totalBetsAmount: 0,
        totalPayoutAmount: 0,
        status: result !== null ? 'settled' : 'active',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        settledAt: result !== null ? admin.firestore.FieldValue.serverTimestamp() : null
    }

    await periodRef.set(periodData)

    return {
        ...periodData,
        createdAt: new Date(),
        settledAt: result !== null ? new Date() : null
    }
}

/**
 * Get current active period for a game mode
 * @param {string} modeId - Game mode ID
 * @returns {Promise<object|null>} - Current period data or null
 */
export const getCurrentPeriod = async (modeId) => {
    const snapshot = await db.collection(`prediction-games-${modeId}`)
        .where('status', '==', 'active')
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get()

    if (snapshot.empty) {
        return null
    }

    const doc = snapshot.docs[0]
    return {
        id: doc.id,
        ...doc.data()
    }
}

/**
 * Update period result and mark as settled
 * @param {string} modeId - Game mode ID
 * @param {string} periodId - Period ID
 * @param {number} result - Result number (0-9)
 */
export const settlePeriod = async (modeId, periodId, result) => {
    const periodRef = db.collection(`prediction-games-${modeId}`).doc(periodId)

    await periodRef.update({
        result,
        resultColors: getNumberColors(result),
        resultBigSmall: getBigSmall(result),
        status: 'settled',
        settledAt: admin.firestore.FieldValue.serverTimestamp()
    })
}

/**
 * Get period history
 * @param {string} modeId - Game mode ID
 * @param {number} limit - Number of periods to fetch
 * @returns {Promise<array>} - Array of period data
 */
export const getPeriodHistory = async (modeId, limit = 100) => {
    const snapshot = await db.collection(`prediction-games-${modeId}`)
        .where('status', '==', 'settled')
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get()

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }))
}
