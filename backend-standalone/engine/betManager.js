/**
 * BET MANAGER
 * Handles bet placement, validation, and payout processing
 */

const { BET_TYPES, VALID_BET_VALUES, PAYOUT_MULTIPLIERS } = require('./engineConfig');
const wallet = require('./wallet');

// Bet storage: { userId: { gameType: { periodId: [bets] } } }
const userBets = new Map();

/**
 * Validate bet parameters
 * @param {string} betType - Type of bet
 * @param {*} value - Bet value
 * @param {number} amount - Bet amount
 * @throws {Error} If validation fails
 */
function validateBet(betType, value, amount) {
    // Check bet type
    if (!Object.values(BET_TYPES).includes(betType)) {
        throw new Error(`Invalid bet type: ${betType}`);
    }

    // Check bet value
    const validValues = VALID_BET_VALUES[betType];
    if (!validValues.includes(value)) {
        throw new Error(`Invalid bet value ${value} for type ${betType}`);
    }

    // Check bet amount
    if (typeof amount !== 'number' || amount <= 0) {
        throw new Error('Bet amount must be a positive number');
    }
}

/**
 * Place a bet
 * @param {string} userId - User identifier
 * @param {string} gameType - Game type
 * @param {string} periodId - Period ID
 * @param {string} betType - Bet type (COLOR, NUMBER, BIG_SMALL)
 * @param {*} value - Bet value
 * @param {number} amount - Bet amount
 * @param {number} remainingSeconds - Remaining seconds in period
 * @returns {Object} Placed bet
 * @throws {Error} If validation fails or insufficient balance
 */
function placeBet(userId, gameType, periodId, betType, value, amount, remainingSeconds) {
    // Validate timing - must have more than 5 seconds remaining
    if (remainingSeconds <= 5) {
        throw new Error('Betting is closed. Period ending soon.');
    }

    // Validate bet parameters
    validateBet(betType, value, amount);

    // Check wallet balance
    if (!wallet.hasSufficientBalance(userId, amount)) {
        throw new Error('Insufficient balance');
    }

    // Deduct bet amount from wallet
    wallet.deduct(userId, amount);

    // Create bet object
    const bet = {
        userId,
        gameType,
        periodId,
        betType,
        value,
        amount,
        timestamp: new Date().toISOString(),
        status: 'PENDING', // PENDING, WON, LOST
    };

    // Store bet
    if (!userBets.has(userId)) {
        userBets.set(userId, new Map());
    }

    const userGameBets = userBets.get(userId);
    if (!userGameBets.has(gameType)) {
        userGameBets.set(gameType, new Map());
    }

    const gamePeriodBets = userGameBets.get(gameType);
    if (!gamePeriodBets.has(periodId)) {
        gamePeriodBets.set(periodId, []);
    }

    gamePeriodBets.get(periodId).push(bet);

    console.log(`[${gameType}] Bet placed: User=${userId}, Period=${periodId}, Type=${betType}, Value=${value}, Amount=${amount}`);

    return bet;
}

/**
 * Check if a bet won based on result
 * @param {Object} bet - Bet object
 * @param {Object} result - Result object
 * @returns {boolean} True if bet won
 */
function isBetWinner(bet, result) {
    switch (bet.betType) {
        case BET_TYPES.COLOR:
            return bet.value === result.color;

        case BET_TYPES.NUMBER:
            return bet.value === result.number;

        case BET_TYPES.BIG_SMALL:
            return bet.value === result.bigSmall;

        default:
            return false;
    }
}

/**
 * Calculate payout for a winning bet
 * @param {Object} bet - Bet object
 * @returns {number} Payout amount
 */
function calculatePayout(bet) {
    const multiplier = PAYOUT_MULTIPLIERS[bet.betType];
    return bet.amount * multiplier;
}

/**
 * Process payouts for a completed period
 * @param {string} periodId - Period ID
 * @param {string} gameType - Game type
 * @param {Object} result - Period result
 * @returns {Object} Payout summary
 */
function processPayout(periodId, gameType, result) {
    let totalPaid = 0;
    let winnersCount = 0;
    let losersCount = 0;

    // Iterate through all users and their bets for this period
    for (const [userId, userGameBets] of userBets.entries()) {
        const gamePeriodBets = userGameBets.get(gameType);
        if (!gamePeriodBets) continue;

        const periodBets = gamePeriodBets.get(periodId);
        if (!periodBets) continue;

        // Process each bet
        for (const bet of periodBets) {
            if (isBetWinner(bet, result)) {
                // Winner - calculate and credit payout
                const payout = calculatePayout(bet);
                wallet.credit(userId, payout);
                bet.status = 'WON';
                bet.payout = payout;
                totalPaid += payout;
                winnersCount++;

                console.log(`[${gameType}] Payout: User=${userId}, Bet=${bet.amount}, Payout=${payout}`);
            } else {
                // Loser - amount already deducted when bet was placed
                bet.status = 'LOST';
                losersCount++;
            }
        }
    }

    console.log(`[${gameType}] Period ${periodId} payouts complete: Winners=${winnersCount}, Losers=${losersCount}, Total Paid=${totalPaid}`);

    return {
        periodId,
        gameType,
        winnersCount,
        losersCount,
        totalPaid,
    };
}

/**
 * Get all bets for a user in a specific period
 * @param {string} userId - User identifier
 * @param {string} gameType - Game type
 * @param {string} periodId - Period ID
 * @returns {Array} Array of bets
 */
function getUserBets(userId, gameType, periodId) {
    if (!userBets.has(userId)) return [];

    const userGameBets = userBets.get(userId);
    if (!userGameBets.has(gameType)) return [];

    const gamePeriodBets = userGameBets.get(gameType);
    if (!gamePeriodBets.has(periodId)) return [];

    return gamePeriodBets.get(periodId);
}

/**
 * Get all bets for a user in a game type (all periods)
 * @param {string} userId - User identifier
 * @param {string} gameType - Game type
 * @returns {Array} Array of all bets
 */
function getAllUserBets(userId, gameType) {
    if (!userBets.has(userId)) return [];

    const userGameBets = userBets.get(userId);
    if (!userGameBets.has(gameType)) return [];

    const gamePeriodBets = userGameBets.get(gameType);
    const allBets = [];

    for (const periodBets of gamePeriodBets.values()) {
        allBets.push(...periodBets);
    }

    return allBets;
}

module.exports = {
    placeBet,
    processPayout,
    getUserBets,
    getAllUserBets,
    validateBet,
};
