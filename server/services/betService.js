import admin from 'firebase-admin'
import { deductForBet, hasSufficientBalance } from './walletService.js'
import { PAYOUT_MULTIPLIERS } from '../config/gameModes.js'

const db = admin.firestore()

/**
 * Place a bet for a user/guest
 * @param {object} betData - Bet data
 * @returns {Promise<object>} - Created bet data
 */
export const placeBet = async (betData) => {
    const {
        userId,
        isGuest = false,
        gameMode,
        periodId,
        betType, // 'color', 'number', 'big_small'
        betValue, // e.g., 'Red', '5', 'Big'
        amountEspo
    } = betData

    // Validate bet amount
    if (!amountEspo || amountEspo < 10) {
        throw new Error('Minimum bet amount is 10 Espo Coin')
    }

    if (amountEspo > 10000) {
        throw new Error('Maximum bet amount is 10,000 Espo Coin')
    }

    // Validate bet type and value
    if (!validateBet(betType, betValue)) {
        throw new Error('Invalid bet type or value')
    }

    // Check if period is still accepting bets
    const periodRef = db.collection(`prediction-games-${gameMode}`).doc(periodId)
    const periodDoc = await periodRef.get()

    if (!periodDoc.exists) {
        throw new Error('Period not found')
    }

    if (periodDoc.data().status !== 'active') {
        throw new Error('Betting is closed for this period')
    }

    // Check balance
    const hasFunds = await hasSufficientBalance(userId, isGuest, amountEspo)
    if (!hasFunds) {
        throw new Error('Insufficient balance')
    }

    // Get payout multiplier
    const payoutMultiplier = getPayoutMultiplier(betType, betValue)

    // Create bet document
    const betRef = db.collection(`prediction-games-${gameMode}`)
        .doc(periodId)
        .collection('bets')
        .doc()

    const bet = {
        userId,
        isGuest,
        gameMode,
        periodId,
        betType,
        betValue,
        amountEspo,
        payoutMultiplier,
        status: 'pending',
        payout: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    }

    // Deduct from wallet and create bet in atomic operation
    try {
        await db.runTransaction(async (transaction) => {
            // Create bet
            transaction.set(betRef, bet)

            // Update period total bets amount
            transaction.update(periodRef, {
                totalBetsAmount: admin.firestore.FieldValue.increment(amountEspo)
            })
        })

        // Deduct from wallet (separate transaction)
        await deductForBet(userId, isGuest, amountEspo, periodId, betRef.id)

        return {
            betId: betRef.id,
            ...bet,
            createdAt: new Date()
        }
    } catch (error) {
        console.error('Error placing bet:', error)
        throw error
    }
}

/**
 * Validate bet type and value
 * @param {string} betType - Bet type
 * @param {string} betValue - Bet value
 * @returns {boolean} - Whether bet is valid
 */
const validateBet = (betType, betValue) => {
    if (betType === 'color') {
        return ['Red', 'Green', 'Violet'].includes(betValue)
    } else if (betType === 'number') {
        const num = parseInt(betValue)
        return num >= 0 && num <= 9
    } else if (betType === 'big_small') {
        return ['Big', 'Small'].includes(betValue)
    }
    return false
}

/**
 * Get payout multiplier for bet
 * @param {string} betType - Bet type
 * @param {string} betValue - Bet value
 * @returns {number} - Payout multiplier
 */
const getPayoutMultiplier = (betType, betValue) => {
    if (betType === 'color') {
        return PAYOUT_MULTIPLIERS.color[betValue]
    } else if (betType === 'number') {
        return PAYOUT_MULTIPLIERS.number
    } else if (betType === 'big_small') {
        return PAYOUT_MULTIPLIERS.bigSmall
    }
    return 0
}

/**
 * Get all bets for a period
 * @param {string} gameMode - Game mode ID
 * @param {string} periodId - Period ID
 * @param {string} status - Bet status filter (optional)
 * @returns {Promise<array>} - Array of bets
 */
export const getPeriodBets = async (gameMode, periodId, status = null) => {
    let query = db.collection(`prediction-games-${gameMode}`)
        .doc(periodId)
        .collection('bets')

    if (status) {
        query = query.where('status', '==', status)
    }

    const snapshot = await query.get()

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }))
}

/**
 * Get user's bet history
 * @param {string} userId - User ID
 * @param {boolean} isGuest - Whether user is guest
 * @param {number} limit - Number of bets to fetch
 * @returns {Promise<array>} - Array of bets
 */
export const getUserBets = async (userId, isGuest = false, limit = 50) => {
    // Query across all game modes
    const gameModes = ['30s', '1min', '3min', '5min']
    const allBets = []

    for (const mode of gameModes) {
        const snapshot = await db.collectionGroup('bets')
            .where('userId', '==', userId)
            .where('isGuest', '==', isGuest)
            .where('gameMode', '==', mode)
            .orderBy('createdAt', 'desc')
            .limit(limit)
            .get()

        snapshot.docs.forEach(doc => {
            allBets.push({
                id: doc.id,
                ...doc.data()
            })
        })
    }

    // Sort by date and limit
    return allBets
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, limit)
}

/**
 * Update bet status after settlement
 * @param {string} gameMode - Game mode ID
 * @param {string} periodId - Period ID
 * @param {string} betId - Bet ID
 * @param {string} status - New status ('win' or 'lose')
 * @param {number} payout - Payout amount
 */
export const updateBetStatus = async (gameMode, periodId, betId, status, payout) => {
    const betRef = db.collection(`prediction-games-${gameMode}`)
        .doc(periodId)
        .collection('bets')
        .doc(betId)

    await betRef.update({
        status,
        payout,
        settledAt: admin.firestore.FieldValue.serverTimestamp()
    })
}
