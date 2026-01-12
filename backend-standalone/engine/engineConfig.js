/**
 * ENGINE CONFIGURATION
 * Defines all game mode settings and constants for the Color Prediction game
 */

// Game mode durations in milliseconds
const GAME_MODES = {
    '30s': 30 * 1000,      // 30 seconds
    '1m': 60 * 1000,       // 1 minute
    '3m': 3 * 60 * 1000,   // 3 minutes
    '5m': 5 * 60 * 1000,   // 5 minutes
};

// Betting cutoff (in seconds before period ends)
const BETTING_CUTOFF_SECONDS = 5;

// Payout multipliers
const PAYOUT_MULTIPLIERS = {
    COLOR: 2,       // Green/Red/Violet wins pay 2x
    NUMBER: 9,      // Specific number wins pay 9x
    BIG_SMALL: 2,   // Big/Small wins pay 2x
    SIZE: 2,        // Alias for BIG_SMALL
};

// Color mapping based on number
const COLOR_MAP = {
    0: 'VIOLET',
    1: 'GREEN',
    2: 'RED',
    3: 'GREEN',
    4: 'RED',
    5: 'VIOLET',
    6: 'RED',
    7: 'GREEN',
    8: 'RED',
    9: 'GREEN',
};

// Big/Small mapping based on number
const BIG_SMALL_MAP = {
    0: 'SMALL',
    1: 'SMALL',
    2: 'SMALL',
    3: 'SMALL',
    4: 'SMALL',
    5: 'BIG',
    6: 'BIG',
    7: 'BIG',
    8: 'BIG',
    9: 'BIG',
};

// Valid bet types
const BET_TYPES = {
    COLOR: 'COLOR',
    NUMBER: 'NUMBER',
    BIG_SMALL: 'BIG_SMALL',
    SIZE: 'SIZE', // Alias for BIG_SMALL (frontend compatibility)
};

// Valid bet values for each type
const VALID_BET_VALUES = {
    COLOR: ['GREEN', 'RED', 'VIOLET'],
    NUMBER: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    BIG_SMALL: ['BIG', 'SMALL'],
    SIZE: ['BIG', 'SMALL'], // Alias for BIG_SMALL
};

/**
 * Generate period ID in format: YYYYMMDDNNNN
 * @param {number} sequence - Sequential number for the day (0001, 0002, etc.)
 * @returns {string} Period ID
 */
function generatePeriodId(sequence) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const seq = String(sequence).padStart(4, '0');

    return `${year}${month}${day}${seq}`;
}

/**
 * Check if we've crossed into a new day (sequence should reset)
 * @param {string} lastPeriodId - Last period ID generated
 * @returns {boolean} True if new day
 */
function isNewDay(lastPeriodId) {
    if (!lastPeriodId) return true;

    const now = new Date();
    const currentDate = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const lastDate = lastPeriodId.substring(0, 8);

    return currentDate !== lastDate;
}

module.exports = {
    GAME_MODES,
    BETTING_CUTOFF_SECONDS,
    PAYOUT_MULTIPLIERS,
    COLOR_MAP,
    BIG_SMALL_MAP,
    BET_TYPES,
    VALID_BET_VALUES,
    generatePeriodId,
    isNewDay,
};
