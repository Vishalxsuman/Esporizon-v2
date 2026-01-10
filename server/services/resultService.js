import admin from 'firebase-admin'

const db = admin.firestore()

/**
 * Weighted random number generator with house edge
 * Prevents predictable patterns and excessive streaks
 */

// Base weights for numbers 0-9 (adjusted for house edge)
const BASE_WEIGHTS = {
    0: 8,  // Violet + Green (rare)
    1: 12, // Green
    2: 12, // Red
    3: 12, // Green
    4: 12, // Red
    5: 8,  // Green + Red (rare)
    6: 12, // Red
    7: 12, // Green
    8: 12, // Red
    9: 12  // Green
}

/**
 * Get recent results for pattern detection
 * @param {string} modeId - Game mode ID
 * @param {number} limit - Number of recent results
 * @returns {Promise<array>} - Array of recent result numbers
 */
const getRecentResults = async (modeId, limit = 10) => {
    const snapshot = await db.collection(`prediction-games-${modeId}`)
        .where('status', '==', 'settled')
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get()

    return snapshot.docs.map(doc => doc.data().result).filter(r => r !== null)
}

/**
 * Detect if there's a dangerous pattern (streak detection)
 * @param {array} recentResults - Recent result numbers
 * @returns {object} - Pattern analysis
 */
const detectPatterns = (recentResults) => {
    if (recentResults.length < 3) {
        return { hasStreak: false }
    }

    // Check for same number streak
    const last3 = recentResults.slice(0, 3)
    const sameNumber = last3.every(r => r === last3[0])

    // Check for same color streak
    const colorMap = recentResults.slice(0, 5).map(num => {
        if ([1, 3, 7, 9].includes(num)) return 'green'
        if ([2, 4, 6, 8].includes(num)) return 'red'
        return 'mixed' // 0 or 5
    })

    const sameColorStreak = colorMap.slice(0, 4).every(c => c === colorMap[0] && c !== 'mixed')

    return {
        hasStreak: sameNumber || sameColorStreak,
        numberStreak: sameNumber,
        colorStreak: sameColorStreak,
        streakValue: sameNumber ? last3[0] : null,
        streakColor: sameColorStreak ? colorMap[0] : null
    }
}

/**
 * Adjust weights based on pattern detection
 * @param {object} baseWeights - Base weight distribution
 * @param {object} patterns - Detected patterns
 * @returns {object} - Adjusted weights
 */
const adjustWeights = (baseWeights, patterns) => {
    const adjusted = { ...baseWeights }

    if (!patterns.hasStreak) {
        return adjusted
    }

    // If number streak detected, reduce weight of that number
    if (patterns.numberStreak && patterns.streakValue !== null) {
        adjusted[patterns.streakValue] = Math.max(1, adjusted[patterns.streakValue] * 0.3)
    }

    // If color streak detected, reduce weights of that color
    if (patterns.colorStreak) {
        const affectedNumbers = patterns.streakColor === 'green'
            ? [1, 3, 7, 9]
            : [2, 4, 6, 8]

        affectedNumbers.forEach(num => {
            adjusted[num] = Math.max(1, adjusted[num] * 0.6)
        })
    }

    return adjusted
}

/**
 * Generate weighted random number
 * @param {object} weights - Weight distribution
 * @returns {number} - Generated number (0-9)
 */
const weightedRandom = (weights) => {
    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0)
    let random = Math.random() * totalWeight

    for (const [num, weight] of Object.entries(weights)) {
        random -= weight
        if (random <= 0) {
            return parseInt(num)
        }
    }

    // Fallback (should never reach here)
    return Math.floor(Math.random() * 10)
}

/**
 * Generate result with pattern protection
 * @param {string} modeId - Game mode ID
 * @returns {Promise<number>} - Generated result (0-9)
 */
export const generateResult = async (modeId) => {
    try {
        // Get recent results for pattern analysis
        const recentResults = await getRecentResults(modeId, 10)

        // Detect patterns
        const patterns = detectPatterns(recentResults)

        // Adjust weights if patterns detected
        const weights = adjustWeights(BASE_WEIGHTS, patterns)

        // Generate result
        const result = weightedRandom(weights)

        console.log(`[Result Gen] Mode: ${modeId}, Result: ${result}, Pattern: ${JSON.stringify(patterns)}`)

        return result
    } catch (error) {
        console.error('Error generating result:', error)
        // Fallback to pure random if error occurs
        return Math.floor(Math.random() * 10)
    }
}

/**
 * Calculate payout for a bet
 * @param {string} betType - Type of bet (color, number, big_small)
 * @param {string} betValue - Bet value (e.g., 'Red', '5', 'Big')
 * @param {number} result - Result number (0-9)
 * @param {number} betAmount - Bet amount in Espo Coin
 * @returns {object} - Payout calculation result
 */
export const calculatePayout = (betType, betValue, result, betAmount) => {
    let multiplier = 0
    let isWin = false

    if (betType === 'number') {
        // Number bet: exact match
        isWin = parseInt(betValue) === result
        multiplier = isWin ? 9 : 0
    } else if (betType === 'big_small') {
        // Big/Small bet
        const resultBigSmall = result >= 5 ? 'Big' : 'Small'
        isWin = betValue === resultBigSmall
        multiplier = isWin ? 1.95 : 0
    } else if (betType === 'color') {
        // Color bet: check if result number matches the color
        const resultColors = getResultColors(result)
        isWin = resultColors.includes(betValue)

        if (isWin) {
            // If it's a dual-color number (0 or 5), reduce multiplier
            if (resultColors.length > 1) {
                multiplier = betValue === 'Violet' ? 4.5 : 1.5
            } else {
                multiplier = betValue === 'Violet' ? 4.5 : 1.95
            }
        }
    }

    const payout = isWin ? betAmount * multiplier : 0
    const netProfit = isWin ? payout - betAmount : -betAmount

    return {
        isWin,
        multiplier,
        payout,
        netProfit
    }
}

/**
 * Get colors for a number (helper function)
 * @param {number} num - Number (0-9)
 * @returns {array} - Array of color strings
 */
const getResultColors = (num) => {
    if (num === 0) return ['Green', 'Violet']
    if (num === 5) return ['Green', 'Red']
    if ([1, 3, 7, 9].includes(num)) return ['Green']
    return ['Red']
}
