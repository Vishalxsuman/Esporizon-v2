import express from 'express'
import admin from 'firebase-admin'
import { initializePeriodCounter } from '../services/predictionPeriodService.js'
import { getCurrentRound, isBettingAllowed } from '../services/predictionRoundService.js'
import { getPeriodHistory } from '../services/periodService.js' // This import seems to be for the old history endpoint, but is kept as per instruction.
import { getOrCreateWallet, getBalance } from '../services/walletService.js' // These imports seem to be for the old wallet endpoints, but are kept as per instruction.

const router = express.Router()
const db = admin.firestore()

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
router.post('/place-bet', async (req, res) => {
  try {
    const { userId, mode, betType, betValue, betAmount } = req.body

    // Validation
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' })
    }

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

    if (!betAmount || betAmount < 10) {
      return res.status(400).json({ error: 'Minimum bet is 10 Espo Coins' })
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

    // Check wallet balance
    const walletRef = db.collection('prediction_wallets').doc(userId)

    await db.runTransaction(async (transaction) => {
      const walletDoc = await transaction.get(walletRef)

      if (!walletDoc.exists) {
        throw new Error('Wallet not found')
      }

      const balance = walletDoc.data().balance || 0

      if (balance < betAmount) {
        throw new Error('Insufficient balance')
      }

      // Deduct from wallet
      transaction.update(walletRef, {
        balance: balance - betAmount,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      })

      // Create bet
      const betRef = db.collection('prediction_bets').doc()
      transaction.set(betRef, {
        userId,
        mode: round.mode,
        periodId: round.periodId,
        betType,
        betValue,
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
    if (error.message === 'Wallet not found') {
      return res.status(404).json({ error: error.message })
    }
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

    const snapshot = await db.collection('prediction_history')
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
router.get('/my-bets', async (req, res) => {
  try {
    const { userId } = req.query
    const limit = parseInt(req.query.limit) || 50

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' })
    }

    const snapshot = await db.collection('prediction_bets')
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
    const userId = isGuest ? req.query.guestId : req.user.uid

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' })
    }

    const balance = await getBalance(userId, isGuest)

    res.json({ balance })
  } catch (error) {
    console.error('Get balance error:', error)
    res.status(500).json({ error: 'Failed to get balance' })
  }
})

/**
 * POST /api/predict/admin/init
 * Initialize prediction system (admin only, run once)
 */
router.post('/admin/init', async (req, res) => {
  try {
    await initializePeriodCounters()

    res.json({
      success: true,
      message: 'Prediction system initialized'
    })
  } catch (error) {
    console.error('Init error:', error)
    res.status(500).json({ error: 'Failed to initialize system' })
  }
})

export default router
