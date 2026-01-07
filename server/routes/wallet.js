import express from 'express'
import admin from 'firebase-admin'

const router = express.Router()
const db = admin.firestore()

// Add funds to wallet
router.post('/add', async (req, res) => {
  try {
    const { userId, amount } = req.body

    // Validation
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'Invalid userId' })
    }
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount. Must be a positive number' })
    }
    if (amount > 1000000) {
      return res.status(400).json({ error: 'Amount exceeds maximum limit (₹10,00,000)' })
    }

    // Security: Verify user ownership
    if (req.user.uid !== userId) {
      console.warn(`Unauthorized wallet access attempt: ${req.user.uid} tried to access ${userId}`)
      return res.status(403).json({ error: 'Unauthorized: Cannot modify another user\'s wallet' })
    }

    const walletRef = db.collection('wallets').doc(userId)

    // Use Firestore transaction for atomicity
    await db.runTransaction(async (transaction) => {
      const walletDoc = await transaction.get(walletRef)
      const currentBalance = walletDoc.exists ? (walletDoc.data().balance || 0) : 0
      const newBalance = currentBalance + amount

      // Update wallet balance atomically
      transaction.set(
        walletRef,
        {
          balance: newBalance,
          userId, // Store userId for reference
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          createdAt: walletDoc.exists
            ? walletDoc.data().createdAt
            : admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      )

      // Create transaction record
      const transactionRef = db.collection('transactions').doc()
      transaction.set(transactionRef, {
        userId,
        type: 'add',
        amount,
        balanceBefore: currentBalance,
        balanceAfter: newBalance,
        description: `Added ₹${amount} to wallet`,
        status: 'completed',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        ipAddress: req.ip || req.headers['x-forwarded-for'] || 'unknown',
      })
    })

    // Get updated balance for response
    const walletDoc = await walletRef.get()
    const newBalance = walletDoc.exists ? (walletDoc.data().balance || 0) : amount

    res.json({
      success: true,
      balance: newBalance,
      message: `Successfully added ₹${amount}`,
    })
  } catch (error) {
    console.error('Add funds error:', error)
    res.status(500).json({ error: 'Failed to add funds. Please try again.' })
  }
})

// Deduct funds from wallet
router.post('/deduct', async (req, res) => {
  try {
    const { userId, amount, description } = req.body

    // Validation
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'Invalid userId' })
    }
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount. Must be a positive number' })
    }

    // Security: Verify user ownership
    if (req.user.uid !== userId) {
      console.warn(`Unauthorized wallet access attempt: ${req.user.uid} tried to access ${userId}`)
      return res.status(403).json({ error: 'Unauthorized: Cannot modify another user\'s wallet' })
    }

    const walletRef = db.collection('wallets').doc(userId)

    // Use Firestore transaction for atomicity
    let newBalance
    await db.runTransaction(async (transaction) => {
      const walletDoc = await transaction.get(walletRef)

      if (!walletDoc.exists) {
        throw new Error('Wallet not found')
      }

      const currentBalance = walletDoc.data().balance || 0

      if (currentBalance < amount) {
        throw new Error('Insufficient balance')
      }

      newBalance = currentBalance - amount

      // Update wallet balance atomically
      transaction.update(walletRef, {
        balance: newBalance,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      })

      // Create transaction record
      const transactionRef = db.collection('transactions').doc()
      transaction.set(transactionRef, {
        userId,
        type: 'deduct',
        amount,
        balanceBefore: currentBalance,
        balanceAfter: newBalance,
        description: description || `Deducted ₹${amount} from wallet`,
        status: 'completed',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        ipAddress: req.ip || req.headers['x-forwarded-for'] || 'unknown',
      })
    })

    res.json({
      success: true,
      balance: newBalance,
      message: `Successfully deducted ₹${amount}`,
    })
  } catch (error) {
    if (error.message === 'Wallet not found') {
      return res.status(404).json({ error: error.message })
    }
    if (error.message === 'Insufficient balance') {
      return res.status(400).json({ error: error.message })
    }
    console.error('Deduct funds error:', error)
    res.status(500).json({ error: 'Failed to deduct funds. Please try again.' })
  }
})

// Withdraw funds
router.post('/withdraw', async (req, res) => {
  try {
    const { userId, amount, accountDetails } = req.body

    // Validation
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'Invalid userId' })
    }
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount. Must be a positive number' })
    }
    if (amount < 100) {
      return res.status(400).json({ error: 'Minimum withdrawal amount is ₹100' })
    }
    if (!accountDetails || typeof accountDetails !== 'object') {
      return res.status(400).json({ error: 'Invalid account details' })
    }
    if (!accountDetails.accountNumber || !accountDetails.ifsc || !accountDetails.accountHolderName) {
      return res.status(400).json({ error: 'Missing required account details (accountNumber, ifsc, accountHolderName)' })
    }

    // Security: Verify user ownership
    if (req.user.uid !== userId) {
      console.warn(`Unauthorized wallet access attempt: ${req.user.uid} tried to access ${userId}`)
      return res.status(403).json({ error: 'Unauthorized: Cannot modify another user\'s wallet' })
    }

    const walletRef = db.collection('wallets').doc(userId)

    // Use Firestore transaction for atomicity
    let newBalance
    await db.runTransaction(async (transaction) => {
      const walletDoc = await transaction.get(walletRef)

      if (!walletDoc.exists) {
        throw new Error('Wallet not found')
      }

      const currentBalance = walletDoc.data().balance || 0

      if (currentBalance < amount) {
        throw new Error('Insufficient balance')
      }

      newBalance = currentBalance - amount

      // Update wallet balance atomically
      transaction.update(walletRef, {
        balance: newBalance,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      })

      // Create withdrawal transaction
      const transactionRef = db.collection('transactions').doc()
      transaction.set(transactionRef, {
        userId,
        type: 'withdraw',
        amount,
        balanceBefore: currentBalance,
        balanceAfter: newBalance,
        description: `Withdrawal request of ₹${amount}`,
        status: 'pending',
        accountDetails: {
          accountNumber: accountDetails.accountNumber,
          ifsc: accountDetails.ifsc,
          accountHolderName: accountDetails.accountHolderName,
        },
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        ipAddress: req.ip || req.headers['x-forwarded-for'] || 'unknown',
      })
    })

    res.json({
      success: true,
      balance: newBalance,
      message: 'Withdrawal request submitted. It will be processed within 24-48 hours.',
    })
  } catch (error) {
    if (error.message === 'Wallet not found') {
      return res.status(404).json({ error: error.message })
    }
    if (error.message === 'Insufficient balance') {
      return res.status(400).json({ error: error.message })
    }
    console.error('Withdraw funds error:', error)
    res.status(500).json({ error: 'Failed to process withdrawal. Please try again.' })
  }
})

// Get wallet balance
router.get('/balance', async (req, res) => {
  try {
    const userId = req.user.uid

    const walletDoc = await db.collection('wallets').doc(userId).get()

    if (!walletDoc.exists) {
      return res.json({ balance: 0 })
    }

    res.json({ balance: walletDoc.data().balance || 0 })
  } catch (error) {
    console.error('Get balance error:', error)
    res.status(500).json({ error: 'Failed to get balance' })
  }
})

export default router
