/**
 * Prediction Result Generation Service
 * Generates results server-side (secure)
 */

/**
 * Generate random result number (0-9)
 * @returns {number} Random number between 0-9
 */
export const generateResultNumber = () => {
    return Math.floor(Math.random() * 10)
}

/**
 * Get color from number based on game rules
 * @param {number} num - Number (0-9)
 * @returns {string} Color: "RED", "GREEN", "RED+VIOLET", or "GREEN+VIOLET"
 */
export const getColorFromNumber = (num) => {
    if (num === 0) return 'RED+VIOLET'
    if (num === 5) return 'GREEN+VIOLET'
    if ([1, 3, 7, 9].includes(num)) return 'GREEN'
    return 'RED' // 2, 4, 6, 8
}

/**
 * Get size from number based on game rules
 * @param {number} num - Number (0-9)
 * @returns {string} Size: "SMALL" or "BIG"
 */
export const getSizeFromNumber = (num) => {
    return num >= 5 ? 'BIG' : 'SMALL'
}

/**
 * Generate complete result
 * @returns {object} Result object with number, color, and size
 */
export const generateResult = () => {
    const resultNumber = generateResultNumber()
    const resultColor = getColorFromNumber(resultNumber)
    const resultSize = getSizeFromNumber(resultNumber)

    console.log(`🎲 Result generated: Number=${resultNumber}, Color=${resultColor}, Size=${resultSize}`)

    return {
        resultNumber,
        resultColor,
        resultSize
    }
}

/**
 * Check if a bet wins based on result
 * @param {string} betType - "COLOR", "NUMBER", or "SIZE"
 * @param {string} betValue - The bet value (e.g., "RED", "5", "BIG")
 * @param {object} result - The result object
 * @returns {boolean} Whether the bet wins
 */
export const checkWin = (betType, betValue, result) => {
    if (betType === 'NUMBER') {
        return parseInt(betValue) === result.resultNumber
    }

    if (betType === 'SIZE') {
        return betValue === result.resultSize
    }

    if (betType === 'COLOR') {
        // Handle dual colors (0 and 5)
        const colors = result.resultColor.split('+')
        return colors.includes(betValue)
    }

    return false
}
