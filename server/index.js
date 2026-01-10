import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import admin from 'firebase-admin'
import walletRoutes from './routes/wallet.js'
import predictionRoutes from './routes/prediction.js'
import tournamentRoutes from './routes/tournaments.js'
import postRoutes from './routes/posts.js'
import { startScheduler } from './jobs/scheduler.js'
import { startPredictionScheduler } from './jobs/predictionScheduler.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Initialize Firebase Admin
try {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}')

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    })
  }
} catch (error) {
  console.error('Firebase Admin initialization error:', error.message)
  console.warn('Please set FIREBASE_SERVICE_ACCOUNT environment variable')
}

// Middleware
app.use(cors())
app.use(express.json())

// Authentication Middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const decodedToken = await admin.auth().verifyIdToken(token)
    req.user = decodedToken
    next()
  } catch (error) {
    console.error('Authentication error:', error)
    return res.status(403).json({ error: 'Invalid or expired token' })
  }
}

// Routes
app.use('/api/wallet', authenticateToken, walletRoutes)
app.use('/api/predict', authenticateToken, predictionRoutes)
app.use('/api/tournaments', tournamentRoutes)  // Some routes need auth, some don't
app.use('/api/posts', postRoutes)  // Some routes need auth, some don't

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`🚀 Esporizon Server running on port ${PORT}`)

  // Start Color Prediction round scheduler
  console.log('🔄 Initializing Prediction Scheduler...')
  startPredictionScheduler()
})
