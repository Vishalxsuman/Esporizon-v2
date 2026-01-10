import express from 'express'
import { admin, getDb } from '../utils/firebase.js'
import { initializePeriodCounter } from '../services/predictionPeriodService.js'
import { getCurrentRound, isBettingAllowed } from '../services/predictionRoundService.js'
import { getPeriodHistory } from '../services/periodService.js'
import { getOrCreateWallet, getBalance } from '../services/walletService.js'
import { authenticateToken } from '../middleware/auth.js'


const router = express.Router()
// Lazy-loaded db (do not initialize at module level)

/**
 * POST /api/predict/init
 * Initialize prediction system (run once)
 */
router.post('/init', async (req, res) => {
  try {
    // Initialize counters for all modes
    await initializePeriodCounter()

    res.json({
      success: true,
      message: 'Prediction system initialized successfully'
    })
  } catch (error) {
    console.error('Initialization error:', error)
    res.status(500).json({
      error: 'Failed to initialize prediction system',
      details: error.message
    })
  }
})

/**
 * GET /api/predict/current-round?mode=WIN_GO_1_MIN
 * Get current round information for a specific mode
 */
router.get('/current-round', async (req, res) => {
  try {
    // Get mode from query param, default to WIN_GO_1_MIN
    const mode = req.query.mode || 'WIN_GO_1_MIN'

    // Validate mode
    const validModes = ['WIN_GO_30S', 'WIN_GO_1_MIN', 'WIN_GO_3_MIN', 'WIN_GO_5_MIN']
    if (!validModes.includes(mode)) {
      return res.status(400).json({ error: `Invalid mode. Must be one of: ${validModes.join(', ')}` })
    }

    const round = await getCurrentRound(mode)

    if (!round) {
      return res.status(404).json({ error: 'No active round found' })
    }

    // Calculate time remaining
    const now = Date.now()
    const endTime = round.roundEndAt.toMillis()
    const timeRemaining = Math.max(0, Math.floor((endTime - now) / 1000))

    res.json({
      ...round,
      timeRemaining
    })
  } catch (error) {
    console.error('Get current round error:', error)
    res.status(500).json({ error: 'Failed to get current round' })
  }
})

/**
 * POST /api/predict/place-bet
 * Place a bet for current round
 */
router.post('/place-bet', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id || req.user.uid;
    if (!userId) {
      return res.status(401).json({ error: "User ID missing in token" });
    }

    const { mode, betType, betValue, betAmount } = req.body

    // Validate mode
    const validModes = ['WIN_GO_30S', 'WIN_GO_1_MIN', 'WIN_GO_3_MIN', 'WIN_GO_5_MIN']
    if (!mode || !validModes.includes(mode)) {
      return res.status(400).json({ error: `Invalid mode. Must be one of: ${validModes.join(', ')}` })
    }

    if (!betType || !['COLOR', 'NUMBER', 'SIZE'].includes(betType)) {
      return res.status(400).json({ error: 'Invalid bet type' })
    }

    if (!betValue) {
      return res.status(400).json({ error: 'Bet value required' })
    }

    // Amount Validation (Min 5, Max 100,000)
    if (!betAmount || betAmount < 5) {
      return res.status(400).json({ error: 'Minimum bet is ₹5' })
    }
    if (betAmount > 100000) {
      return res.status(400).json({ error: 'Maximum bet is ₹100,000' })
    }

    // Check if betting is allowed for this mode
    const bettingAllowed = await isBettingAllowed(mode)
    if (!bettingAllowed) {
      return res.status(400).json({ error: 'Betting is currently closed' })
    }

    // Get current round for this mode
    const round = await getCurrentRound(mode)
    if (!round) {
      return res.status(400).json({ error: 'No active round' })
    }

    // Check if bet is placed in last 5 seconds (should be blocked)
    const now = Date.now()
    const endTime = round.roundEndAt.toMillis()
    const timeRemaining = Math.floor((endTime - now) / 1000)

    if (timeRemaining <= 5) {
      return res.status(400).json({ error: 'Betting closes in the last 5 seconds' })
    }

    // Check wallet balance and auto-create if needed
    const walletRef = getDb().collection('prediction_wallets').doc(userId)
    const mainWalletRef = getDb().collection('wallets').doc(userId)
    const userWalletRef = getDb().collection('users').doc(userId).collection('wallet').doc('data')

    await getDb().runTransaction(async (transaction) => {
      const walletDoc = await transaction.get(walletRef)
      let balance = 0

      if (!walletDoc.exists) {
        // Auto-create wallet with ₹500
        balance = 500
        transaction.set(walletRef, {
          balance: 500,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        })
        // Initialize other wallets with 500 too if they don't exist
        transaction.set(mainWalletRef, { balance: 500, userId, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true })
        transaction.set(userWalletRef, { balance: 500, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true })
      } else {
        balance = walletDoc.data().balance || 0
      }

      if (balance < betAmount) {
        throw new Error('Insufficient balance')
      }

      const newBalance = balance - betAmount

      // Deduct from ALL wallets
      transaction.update(walletRef, {
        balance: newBalance,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      })
      transaction.set(mainWalletRef, { balance: newBalance, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true })
      transaction.set(userWalletRef, { balance: newBalance, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true })

      // Create bet
      const betRef = getDb().collection('prediction_bets').doc()
      transaction.set(betRef, {
        userId,
        mode: round.mode,
        periodId: round.periodId,
        betType,
        betValue: betValue.toString().toUpperCase(), // Normalize to UPPERCASE
        betAmount,
        status: 'pending',
        payout: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      })
    })

    res.json({
      success: true,
      message: 'Bet placed successfully',
      periodId: round.periodId
    })
  } catch (error) {
    if (error.message === 'Insufficient balance') {
      return res.status(400).json({ error: error.message })
    }
    console.error('Place bet error:', error)
    res.status(500).json({ error: 'Failed to place bet' })
  }
})

/**
 * GET /api/predict/history
 * Get prediction history
 */
router.get('/history', async (req, res) => {
  try {
    const mode = req.query.mode || 'WIN_GO_1_MIN'
    const limit = parseInt(req.query.limit) || 20

    const snapshot = await getDb().collection('prediction_history')
      .where('mode', '==', mode)
      .orderBy('periodId', 'desc')
      .limit(limit)
      .get()

    const history = snapshot.docs.map(doc => doc.data())

    res.json(history)
  } catch (error) {
    console.error('Get history error:', error)
    res.status(500).json({ error: 'Failed to get history' })
  }
})

/**
 * GET /api/predict/my-bets
 * Get user's bet history
 */
router.get('/my-bets', authenticateToken, async (req, res) => {
  try {
    const userIdFromToken = req.user.user_id || req.user.uid;

    const { userId } = req.query
    const limit = parseInt(req.query.limit) || 50

    if (!userId || userId !== userIdFromToken) {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    const snapshot = await getDb().collection('prediction_bets')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get()

    const bets = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    res.json(bets)
  } catch (error) {
    console.error('Get my bets error:', error)
    res.status(500).json({ error: 'Failed to get bet history' })
  }
})

/**
 * GET /api/predict/chart/:gameMode
 * Get chart data (number frequency) for a game mode
 */
router.get('/chart/:gameMode', async (req, res) => {
  try {
    const { gameMode } = req.params

    if (!isValidGameMode(gameMode)) {
      return res.status(400).json({ error: 'Invalid game mode' })
    }

    // Get last 100 periods
    const history = await getPeriodHistory(gameMode, 100)

    // Calculate frequency
    const frequency = {}
    for (let i = 0; i <= 9; i++) {
      frequency[i] = 0
    }

    history.forEach(period => {
      if (period.result !== null) {
        frequency[period.result]++
      }
    })

    // Calculate color frequency
    const colorFrequency = {
      Red: 0,
      Green: 0,
      Violet: 0
    }

    history.forEach(period => {
      if (period.resultColors) {
        period.resultColors.forEach(color => {
          colorFrequency[color]++
        })
      }
    })

    res.json({
      numberFrequency: frequency,
      colorFrequency,
      totalPeriods: history.length,
      recentResults: history.slice(0, 20).map(p => ({
        periodId: p.periodId,
        result: p.result,
        colors: p.resultColors,
        bigSmall: p.resultBigSmall
      }))
    })
  } catch (error) {
    console.error('Get chart data error:', error)
    res.status(500).json({ error: 'Failed to get chart data' })
  }
})

/**
 * POST /api/predict/guest/create
 * Create a new guest wallet
 */
router.post('/guest/create', async (req, res) => {
  try {
    const { guestId } = req.body

    if (!guestId) {
      return res.status(400).json({ error: 'Guest ID required' })
    }

    // Create guest wallet
    const wallet = await getOrCreateWallet(guestId, true)

    res.json({
      success: true,
      guestId,
      balance: wallet.balance
    })
  } catch (error) {
    console.error('Create guest error:', error)
    res.status(500).json({ error: 'Failed to create guest wallet' })
  }
})

/**
 * GET /api/predict/balance
 * Get user/guest balance
 */
router.get('/balance', async (req, res) => {
  try {
    const isGuest = req.query.isGuest === 'true'
    let userId;

    if (isGuest) {
      userId = req.query.guestId;
    } else {
      // Authenticated user request needs middleware manually applied or logic here
      // For simplicity in this hybrid route, we'll use a local helper or assume auth was handled if this was split.
      // BUT: This route wraps guest logic too. Let's do a quick inline check using the same logic or just error.
      // BETTER: Require Authenticated Token if not guest.
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Missing token" });
      }

      // We need to verify here because this route isn't wrapped in middleware due to optional guest param
      // Re-importing verify logic inline is messy. 
      // Strategy: Use the same library flow or assume the main router structure handles it.
      // However, since we just installed 'jose', we should use it here too if we want full consistency.
      // For now, let's keep it simple: The user asked to replace admin.auth().verifyIdToken.

      // NOTE: This specific block is tricky because we can't easily reuse the middleware *inside* the function 
      // without refactoring. 
      // Let's assume the user calls this from a context where they have a token.

      // Quick fix for this hybrid route:
      const { jwtVerify, createRemoteJWKSet } = await import("jose");
      const CLERK_JWKS = createRemoteJWKSet(new URL("https://funky-asp-9.clerk.accounts.dev/.well-known/jwks.json"));

      const token = authHeader.split(" ")[1];
      const { payload } = await jwtVerify(token, CLERK_JWKS, { issuer: "https://funky-asp-9.clerk.accounts.dev" });
      userId = payload.sub;
    }

    if (!userId) {
      return res.status(401).json({ error: 'User ID required' })
    }

    const balance = await getBalance(userId, isGuest)

    res.json({ balance })
  } catch (error) {
    console.error('Get balance error:', error)
    res.status(500).json({ error: 'Failed to get balance' })
  }
})

/**
 * POST /api/wallet/deposit
 * Add 500 to wallet (Temp logic)
 */
router.post('/wallet/deposit', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id || req.user.uid;

    if (!userId) {
      return res.status(401).json({ error: "User ID missing in token" });
    }

    const { amount } = req.body;
    const depositAmount = amount || 500; // Use provided amount or default to 500

    const walletRef = getDb().collection('prediction_wallets').doc(userId)
    const mainWalletRef = getDb().collection('wallets').doc(userId)
    const userWalletRef = getDb().collection('users').doc(userId).collection('wallet').doc('data')

    let newBalance = 0;
    await getDb().runTransaction(async (transaction) => {
      const walletDoc = await transaction.get(walletRef)
      if (!walletDoc.exists) {
        newBalance = 500 + depositAmount; // Auto-create with 500 (initial) + deposit
      } else {
        newBalance = (walletDoc.data().balance || 0) + depositAmount
      }

      // Update ALL wallets to keep system in sync
      const updateData = {
        balance: newBalance,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      transaction.set(walletRef, updateData, { merge: true });
      transaction.set(mainWalletRef, { ...updateData, userId }, { merge: true });
      transaction.set(userWalletRef, updateData, { merge: true });
    })

    console.log(`✅ Deposit successful for ${userId}: +₹${depositAmount}. New Balance: ₹${newBalance}`);

    res.json({
      success: true,
      balance: newBalance
    })
  } catch (error) {
    console.error('Deposit error:', error)
    res.status(500).json({ error: 'Internal server error during deposit' })
  }
})

export default router
