/**
 * RESULT GENERATOR
 * Generates and stores period results for each game mode
 */

const { COLOR_MAP, BIG_SMALL_MAP } = require('./engineConfig');

// Result history storage: { gameType: [results] }
const resultHistory = new Map();

// Latest result for each game type: { gameType: result }
const latestResults = new Map();

// Maximum history to keep per game type
const MAX_HISTORY = 100;

/**
 * Generate a random number between 0-9
 * @returns {number} Random number 0-9
 */
function generateRandomNumber() {
    return Math.floor(Math.random() * 10);
}

/**
 * Get color for a given number
 * @param {number} number - Number 0-9
 * @returns {string} Color: GREEN, RED, or VIOLET
 */
function getColor(number) {
    return COLOR_MAP[number];
}

/**
 * Get big/small classification for a given number
 * @param {number} number - Number 0-9
 * @returns {string} BIG or SMALL
 */
function getBigSmall(number) {
    return BIG_SMALL_MAP[number];
}

/**
 * Generate result for a period
 * @param {string} periodId - Period identifier
 * @param {string} gameType - Game type (30s, 1m, 3m, 5m)
 * @returns {Object} Result object
 */
function generateResult(periodId, gameType) {
    // Generate random number
    const number = generateRandomNumber();

    // Determine color and big/small based on number
    const color = getColor(number);
    const bigSmall = getBigSmall(number);

    // Create result object
    const result = {
        periodId,
        gameType,
        number,
        color,
        bigSmall,
        time: new Date().toISOString(),
    };

    // Store as latest result
    latestResults.set(gameType, result);

    // Add to history
    if (!resultHistory.has(gameType)) {
        resultHistory.set(gameType, []);
    }

    const history = resultHistory.get(gameType);
    history.unshift(result); // Add to beginning

    // Trim history if too long
    if (history.length > MAX_HISTORY) {
        history.pop();
    }

    console.log(`[${gameType}] Generated result for period ${periodId}: Number=${number}, Color=${color}, Big/Small=${bigSmall}`);

    return result;
}

/**
 * Get the latest result for a game type
 * @param {string} gameType - Game type
 * @returns {Object|null} Latest result or null
 */
function getLatestResult(gameType) {
    return latestResults.get(gameType) || null;
}

/**
 * Get result history for a game type
 * @param {string} gameType - Game type
 * @param {number} limit - Maximum number of results to return
 * @returns {Array} Array of results
 */
function getHistory(gameType, limit = 20) {
    const history = resultHistory.get(gameType) || [];
    return history.slice(0, limit);
}

/**
 * Get result for a specific period ID
 * @param {string} gameType - Game type
 * @param {string} periodId - Period ID to find
 * @returns {Object|null} Result or null if not found
 */
function getResultByPeriodId(gameType, periodId) {
    const history = resultHistory.get(gameType) || [];
    return history.find(r => r.periodId === periodId) || null;
}

/**
 * Clear all results (for testing/debugging)
 */
function clearAllResults() {
    resultHistory.clear();
    latestResults.clear();
}

module.exports = {
    generateResult,
    getLatestResult,
    getHistory,
    getResultByPeriodId,
    clearAllResults,
};
