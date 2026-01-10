import { admin, getDb } from '../utils/firebase.js'

// Lazy-loaded db

/**
 * Get wallet collection reference based on user type
 * @param {string} userId - User ID
 * @param {boolean} isGuest - Whether user is guest
 * @returns {object} - Firestore reference
 */
const getWalletRef = (userId, isGuest = false) => {
    const collection = isGuest ? 'guests' : 'users'
    return getDb().collection(collection).doc(userId).collection('wallet').doc('data')
}

/**
 * Get or create wallet for user/guest
 * @param {string} userId - User ID
 * @param {boolean} isGuest - Whether user is guest
 * @returns {Promise<object>} - Wallet data
 */
export const getOrCreateWallet = async (userId, isGuest = false) => {
    const walletRef = getWalletRef(userId, isGuest)

    try {
        const walletDoc = await walletRef.get()

        if (!walletDoc.exists) {
            // Create new wallet with starting balance
            const initialBalance = isGuest ? 1000 : 0 // Guests get 1000 Espo Coin to start
            const walletData = {
                balance: initialBalance,
                totalDeposited: initialBalance,
                totalWithdrawn: 0,
                totalWagered: 0,
                totalWon: 0,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            }

            await walletRef.set(walletData)

            // Log initial transaction
            if (isGuest) {
                await logTransaction(userId, isGuest, {
                    type: 'deposit',
                    amount: initialBalance,
                    balanceBefore: 0,
                    balanceAfter: initialBalance,
                    description: 'Welcome bonus for new guest',
                    status: 'completed'
                })
            }

            return { ...walletData, createdAt: new Date(), updatedAt: new Date() }
        }

        return walletDoc.data()
    } catch (error) {
        console.error('Error getting/creating wallet:', error)
        throw error
    }
}

/**
 * Deduct funds for bet placement (atomic operation)
 * @param {string} userId - User ID
 * @param {boolean} isGuest - Whether user is guest
 * @param {number} amount - Amount to deduct
 * @param {string} periodId - Related period ID
 * @param {string} betId - Related bet ID
 * @returns {Promise<number>} - New balance
 */
export const deductForBet = async (userId, isGuest, amount, periodId, betId) => {
    const walletRef = getWalletRef(userId, isGuest)

    try {
        const newBalance = await getDb().runTransaction(async (transaction) => {
            const walletDoc = await transaction.get(walletRef)

            if (!walletDoc.exists) {
                throw new Error('Wallet not found')
            }

            const currentBalance = walletDoc.data().balance || 0
            const currentWagered = walletDoc.data().totalWagered || 0

            if (currentBalance < amount) {
                throw new Error('Insufficient balance')
            }

            const newBal = currentBalance - amount

            transaction.update(walletRef, {
                balance: newBal,
                totalWagered: currentWagered + amount,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            })

            return newBal
        })

        // Log transaction
        await logTransaction(userId, isGuest, {
            type: 'bet',
            amount: -amount,
            balanceBefore: newBalance + amount,
            balanceAfter: newBalance,
            description: `Bet placed for period ${periodId}`,
            relatedPeriodId: periodId,
            relatedBetId: betId,
            status: 'completed'
        })

        return newBalance
    } catch (error) {
        console.error('Error deducting for bet:', error)
        throw error
    }
}

/**
 * Credit funds for winnings (atomic operation)
 * @param {string} userId - User ID
 * @param {boolean} isGuest - Whether user is guest
 * @param {number} amount - Amount to credit
 * @param {string} periodId - Related period ID
 * @param {string} betId - Related bet ID
 * @returns {Promise<number>} - New balance
 */
export const creditWinnings = async (userId, isGuest, amount, periodId, betId) => {
    const walletRef = getWalletRef(userId, isGuest)

    try {
        const newBalance = await getDb().runTransaction(async (transaction) => {
            const walletDoc = await transaction.get(walletRef)

            if (!walletDoc.exists) {
                throw new Error('Wallet not found')
            }

            const currentBalance = walletDoc.data().balance || 0
            const currentWon = walletDoc.data().totalWon || 0

            const newBal = currentBalance + amount

            transaction.update(walletRef, {
                balance: newBal,
                totalWon: currentWon + amount,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            })

            return newBal
        })

        // Log transaction
        await logTransaction(userId, isGuest, {
            type: 'win',
            amount: amount,
            balanceBefore: newBalance - amount,
            balanceAfter: newBalance,
            description: `Winnings from period ${periodId}`,
            relatedPeriodId: periodId,
            relatedBetId: betId,
            status: 'completed'
        })

        return newBalance
    } catch (error) {
        console.error('Error crediting winnings:', error)
        throw error
    }
}

/**
 * Log transaction to history
 * @param {string} userId - User ID
 * @param {boolean} isGuest - Whether user is guest
 * @param {object} txData - Transaction data
 */
const logTransaction = async (userId, isGuest, txData) => {
    const collection = isGuest ? 'guests' : 'users'
    const txRef = getDb().collection(collection).doc(userId).collection('wallet').collection('transactions').doc()

    await txRef.set({
        ...txData,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
    })
}

/**
 * Get wallet balance
 * @param {string} userId - User ID
 * @param {boolean} isGuest - Whether user is guest
 * @returns {Promise<number>} - Current balance
 */
export const getBalance = async (userId, isGuest = false) => {
    const wallet = await getOrCreateWallet(userId, isGuest)
    return wallet.balance || 0
}

/**
 * Get transaction history
 * @param {string} userId - User ID
 * @param {boolean} isGuest - Whether user is guest
 * @param {number} limit - Number of transactions to fetch
 * @returns {Promise<array>} - Array of transactions
 */
export const getTransactionHistory = async (userId, isGuest = false, limit = 50) => {
    const collection = isGuest ? 'guests' : 'users'
    const snapshot = await getDb().collection(collection)
        .doc(userId)
        .collection('wallet')
        .collection('transactions')
        .orderBy('timestamp', 'desc')
        .limit(limit)
        .get()

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }))
}

/**
 * Check if user has sufficient balance
 * @param {string} userId - User ID
 * @param {boolean} isGuest - Whether user is guest
 * @param {number} amount - Amount to check
 * @returns {Promise<boolean>} - Whether user has sufficient balance
 */
export const hasSufficientBalance = async (userId, isGuest, amount) => {
    const balance = await getBalance(userId, isGuest)
    return balance >= amount
}
