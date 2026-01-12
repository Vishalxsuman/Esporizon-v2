/**
 * WALLET SYSTEM
 * In-memory wallet management for user balances
 */

// In-memory wallet storage: { userId: balance }
const wallets = new Map();

// Default starting balance for new users
const DEFAULT_BALANCE = 1000;

/**
 * Get user's wallet balance
 * Creates wallet with default balance if user is new
 * @param {string} userId - User identifier
 * @returns {number} Current balance
 */
function getBalance(userId) {
    if (!wallets.has(userId)) {
        wallets.set(userId, DEFAULT_BALANCE);
    }
    return wallets.get(userId);
}

/**
 * Deposit funds into user's wallet
 * @param {string} userId - User identifier
 * @param {number} amount - Amount to deposit
 * @returns {number} New balance
 */
function deposit(userId, amount) {
    if (amount <= 0) {
        throw new Error('Deposit amount must be positive');
    }

    const currentBalance = getBalance(userId);
    const newBalance = currentBalance + amount;
    wallets.set(userId, newBalance);

    return newBalance;
}

/**
 * Withdraw funds from user's wallet
 * @param {string} userId - User identifier
 * @param {number} amount - Amount to withdraw
 * @returns {number} New balance
 * @throws {Error} If insufficient balance
 */
function withdraw(userId, amount) {
    if (amount <= 0) {
        throw new Error('Withdrawal amount must be positive');
    }

    const currentBalance = getBalance(userId);

    if (currentBalance < amount) {
        throw new Error('Insufficient balance');
    }

    const newBalance = currentBalance - amount;
    wallets.set(userId, newBalance);

    return newBalance;
}

/**
 * Deduct amount for bet placement
 * Same as withdraw but with different semantics
 * @param {string} userId - User identifier
 * @param {number} amount - Amount to deduct
 * @returns {number} New balance
 * @throws {Error} If insufficient balance
 */
function deduct(userId, amount) {
    return withdraw(userId, amount);
}

/**
 * Credit amount for payout
 * Same as deposit but with different semantics
 * @param {string} userId - User identifier
 * @param {number} amount - Amount to credit
 * @returns {number} New balance
 */
function credit(userId, amount) {
    return deposit(userId, amount);
}

/**
 * Check if user has sufficient balance
 * @param {string} userId - User identifier
 * @param {number} amount - Amount to check
 * @returns {boolean} True if sufficient balance
 */
function hasSufficientBalance(userId, amount) {
    return getBalance(userId) >= amount;
}

/**
 * Get all wallet balances (for debugging/admin)
 * @returns {Object} All wallets
 */
function getAllBalances() {
    return Object.fromEntries(wallets);
}

module.exports = {
    getBalance,
    deposit,
    withdraw,
    deduct,
    credit,
    hasSufficientBalance,
    getAllBalances,
};
