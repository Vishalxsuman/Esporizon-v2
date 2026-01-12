/**
 * PERIOD ENGINE
 * Manages period lifecycle for each game mode independently
 * Handles period creation, transitions, and result generation
 */

const { GAME_MODES, generatePeriodId, isNewDay } = require('./engineConfig');
const resultGenerator = require('./resultGenerator');
const betManager = require('./betManager');

// Period state for each game type: { gameType: { currentPeriod, startTime, sequence, lastPeriodId } }
const periodStates = new Map();

// Timer references for cleanup
const timers = new Map();

/**
 * Get next period ID for a game type
 * @param {string} gameType - Game type
 * @returns {string} Next period ID
 */
function getNextPeriodId(gameType) {
    const state = periodStates.get(gameType);

    if (!state || !state.lastPeriodId || isNewDay(state.lastPeriodId)) {
        // New day or first period - reset sequence to 1
        return generatePeriodId(1);
    }

    // Increment sequence
    const newSequence = state.sequence + 1;
    return generatePeriodId(newSequence);
}

/**
 * Create a new period for a game type
 * @param {string} gameType - Game type
 * @returns {Object} New period object
 */
function createNewPeriod(gameType) {
    const periodId = getNextPeriodId(gameType);
    const startTime = Date.now();

    // Extract sequence number from period ID
    const sequence = parseInt(periodId.substring(8), 10);

    const period = {
        periodId,
        gameType,
        startTime,
        sequence,
    };

    // Store period state
    periodStates.set(gameType, {
        currentPeriod: period,
        startTime,
        sequence,
        lastPeriodId: periodId,
    });

    console.log(`[${gameType}] New period created: ${periodId} (starting at ${new Date(startTime).toISOString()})`);

    return period;
}

/**
 * Get current period for a game type
 * @param {string} gameType - Game type
 * @returns {Object|null} Current period with remainingSeconds
 */
function getCurrentPeriod(gameType) {
    const state = periodStates.get(gameType);

    if (!state || !state.currentPeriod) {
        return null;
    }

    const { currentPeriod, startTime } = state;
    const duration = GAME_MODES[gameType];
    const elapsed = Date.now() - startTime;
    const remainingMs = Math.max(0, duration - elapsed);
    const remainingSeconds = Math.floor(remainingMs / 1000);

    return {
        periodId: currentPeriod.periodId,
        gameType,
        remainingSeconds,
    };
}

/**
 * End current period and generate result
 * @param {string} gameType - Game type
 * @returns {Object} Result object
 */
function endCurrentPeriod(gameType) {
    const state = periodStates.get(gameType);

    if (!state || !state.currentPeriod) {
        console.error(`[${gameType}] Cannot end period: No active period`);
        return null;
    }

    const { periodId } = state.currentPeriod;

    console.log(`[${gameType}] Period ending: ${periodId}`);

    // Generate result
    const result = resultGenerator.generateResult(periodId, gameType);

    // Process payouts for all bets in this period
    betManager.processPayout(periodId, gameType, result);

    // Create next period
    createNewPeriod(gameType);

    return result;
}

/**
 * Check if period should end and handle transition
 * @param {string} gameType - Game type
 */
function checkPeriodEnd(gameType) {
    const currentPeriod = getCurrentPeriod(gameType);

    if (!currentPeriod) {
        console.error(`[${gameType}] No active period found during check`);
        return;
    }

    // If period time has expired, end it
    if (currentPeriod.remainingSeconds <= 0) {
        endCurrentPeriod(gameType);
    }
}

/**
 * Initialize game engine for a specific game type
 * Starts the timer loop that checks for period end
 * @param {string} gameType - Game type to initialize
 */
function initializeEngine(gameType) {
    if (!GAME_MODES[gameType]) {
        throw new Error(`Invalid game type: ${gameType}`);
    }

    // Create initial period
    createNewPeriod(gameType);

    // Set up timer to check for period end every second
    const timerId = setInterval(() => {
        checkPeriodEnd(gameType);
    }, 1000); // Check every second

    timers.set(gameType, timerId);

    console.log(`[${gameType}] Game engine initialized and running`);
}

/**
 * Stop game engine for a specific game type
 * @param {string} gameType - Game type to stop
 */
function stopEngine(gameType) {
    const timerId = timers.get(gameType);

    if (timerId) {
        clearInterval(timerId);
        timers.delete(gameType);
        console.log(`[${gameType}] Game engine stopped`);
    }
}

/**
 * Initialize all game modes
 */
function initializeAllEngines() {
    const gameTypes = Object.keys(GAME_MODES);

    for (const gameType of gameTypes) {
        initializeEngine(gameType);
    }

    console.log(`All game engines initialized: ${gameTypes.join(', ')}`);
}

/**
 * Stop all game engines
 */
function stopAllEngines() {
    for (const gameType of timers.keys()) {
        stopEngine(gameType);
    }

    console.log('All game engines stopped');
}

/**
 * Get period state (for debugging)
 * @param {string} gameType - Game type
 * @returns {Object} Period state
 */
function getPeriodState(gameType) {
    return periodStates.get(gameType);
}

module.exports = {
    initializeEngine,
    initializeAllEngines,
    stopEngine,
    stopAllEngines,
    getCurrentPeriod,
    endCurrentPeriod,
    getPeriodState,
};
