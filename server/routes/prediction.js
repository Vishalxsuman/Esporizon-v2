import express from 'express'
import admin from 'firebase-admin'

const router = express.Router()
const db = admin.firestore()

// Generate random color prediction result
const generateResult = () => {
  const random = Math.random()
  if (random < 0.45) {
    return { color: 'red', multiplier: 2 }
  } else if (random < 0.9) {
    return { color: 'green', multiplier: 2 }
  } else {
    return { color: 'violet', multiplier: 4.5 }
  }
}

// Play color prediction game
router.post('/play', async (req, res) => {
  try {
    const { userId, color, amount } = req.body

    // Validation
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'Invalid userId' })
    }
    if (!color || !['red', 'green', 'violet'].includes(color)) {
      return res.status(400).json({ error: 'Invalid color selection. Must be red, green, or violet' })
    }
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount. Must be a positive number' })
    }
    if (amount < 10) {
      return res.status(400).json({ error: 'Minimum bet amount is ₹10' })
    }

    // Security: Verify user ownership
    if (req.user.uid !== userId) {
      console.warn(`Unauthorized prediction attempt: ${req.user.uid} tried to access ${userId}`)
      return res.status(403).json({ error: 'Unauthorized: Cannot play for another user' })
    }

    const walletRef = db.collection('wallets').doc(userId)
    let resultData, newBalance, won, winnings

    // Use Firestore transaction for atomicity
    await db.runTransaction(async (transaction) => {
      const walletDoc = await transaction.get(walletRef)

      if (!walletDoc.exists) {
        throw new Error('Wallet not found')
      }

      const currentBalance = walletDoc.data().balance || 0

      if (currentBalance < amount) {
        throw new Error('Insufficient balance')
      }

      // Generate result (server-side only - cannot be manipulated)
      const result = generateResult()
      won = result.color === color
      winnings = won ? amount * result.multiplier : 0
      newBalance = won ? currentBalance + winnings - amount : currentBalance - amount

      // Update wallet balance atomically
      transaction.update(walletRef, {
        balance: newBalance,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      })

      // Create transaction record
      const transactionRef = db.collection('transactions').doc()
      transaction.set(transactionRef, {
        userId,
        type: won ? 'add' : 'deduct',
        amount: won ? winnings - amount : amount,
        balanceBefore: currentBalance,
        balanceAfter: newBalance,
        description: won
          ? `Won ₹${winnings - amount} from color prediction (${color})`
          : `Lost ₹${amount} from color prediction (${color})`,
        status: 'completed',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        ipAddress: req.ip || req.headers['x-forwarded-for'] || 'unknown',
      })

      // Save prediction result
      const resultRef = db.collection('colorPredictions').doc()
      transaction.set(resultRef, {
        userId,
        selectedColor: color,
        resultColor: result.color,
        amount,
        winnings: won ? winnings - amount : 0,
        won,
        multiplier: result.multiplier,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      })

      resultData = {
        id: resultRef.id,
        color: result.color,
        multiplier: result.multiplier,
        timestamp: new Date(),
      }
    })

    res.json({
      success: true,
      result: resultData,
      won,
      winnings: won ? winnings - amount : 0,
      balance: newBalance,
    })
  } catch (error) {
    if (error.message === 'Wallet not found') {
      return res.status(404).json({ error: error.message })
    }
    if (error.message === 'Insufficient balance') {
      return res.status(400).json({ error: error.message })
    }
    console.error('Prediction play error:', error)
    res.status(500).json({ error: 'Failed to process prediction. Please try again.' })
  }
})

// Get recent results
router.get('/results', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10

    const snapshot = await db
      .collection('colorPredictions')
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get()

    const results = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        color: data.resultColor,
        multiplier: data.multiplier,
        timestamp: data.timestamp?.toDate() || new Date(),
      }
    })

    res.json(results)
  } catch (error) {
    console.error('Get results error:', error)
    res.status(500).json({ error: 'Failed to get results' })
  }
})

export default router
