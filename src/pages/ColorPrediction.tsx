import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { walletService } from '@/services/WalletService'
import { ColorPredictionResult } from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

const ColorPrediction = () => {
  const { user } = useAuth()
  const [selectedColor, setSelectedColor] = useState<'red' | 'green' | 'violet' | null>(null)
  const [betAmount, setBetAmount] = useState(100)
  const [isSpinning, setIsSpinning] = useState(false)
  const [result, setResult] = useState<ColorPredictionResult | null>(null)
  const [recentResults, setRecentResults] = useState<ColorPredictionResult[]>([])
  const [balance, setBalance] = useState(0)
  const [loadingBalance, setLoadingBalance] = useState(true)

  useEffect(() => {
    loadRecentResults()
    if (user) {
      loadBalance()
    }
  }, [user])

  const loadBalance = async () => {
    if (!user) return
    try {
      setLoadingBalance(true)
      const wallet = await walletService.getWallet(user.uid)
      setBalance(wallet.balance)
    } catch (error) {
      console.error('Failed to load balance:', error)
      // Fallback to 0 if wallet doesn't exist yet
      setBalance(0)
    } finally {
      setLoadingBalance(false)
    }
  }

  const loadRecentResults = async () => {
    try {
      const token = user ? await user.getIdToken() : null
      const headers: HeadersInit = { 'Content-Type': 'application/json' }
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }
      
      const response = await fetch(`${API_BASE_URL}/predict/results?limit=10`, {
        headers,
      })
      if (response.ok) {
        const data = await response.json()
        setRecentResults(data)
      }
    } catch (error) {
      console.error('Failed to load results:', error)
    }
  }

  const handlePredict = async () => {
    if (!selectedColor || !user) {
      alert('Please select a color and ensure you are logged in')
      return
    }

    if (betAmount > balance) {
      alert('Insufficient balance')
      return
    }

    setIsSpinning(true)

    try {
      const token = await user.getIdToken()
      const response = await fetch(`${API_BASE_URL}/predict/play`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.uid,
          color: selectedColor,
          amount: betAmount,
        }),
      })

      if (!response.ok) {
        throw new Error('Prediction failed')
      }

      const data = await response.json()
      setResult(data.result)
      setRecentResults((prev) => [data.result, ...prev].slice(0, 10))
      
      // Update balance from server response (server is source of truth)
      if (data.balance !== undefined) {
        setBalance(data.balance)
      } else {
        // Fallback: reload balance from server
        await loadBalance()
      }

      // Reset selection after 3 seconds
      setTimeout(() => {
        setSelectedColor(null)
        setResult(null)
      }, 3000)
    } catch (error) {
      console.error('Prediction error:', error)
      alert('Failed to process prediction')
    } finally {
      setIsSpinning(false)
    }
  }

  const colors = [
    { name: 'red', value: 'red', gradient: 'from-red-500 to-red-700', multiplier: 2 },
    { name: 'green', value: 'green', gradient: 'from-green-500 to-green-700', multiplier: 2 },
    { name: 'violet', value: 'violet', gradient: 'from-violet-500 to-violet-700', multiplier: 4.5 },
  ] as const

  return (
    <div className="min-h-screen bg-gradient-dark py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-2">Color Prediction</h1>
          <p className="text-gray-400">Predict the winning color and multiply your bet</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Game Area */}
          <div className="lg:col-span-2">
            <div className="glass-card mb-6">
              <div className="text-center mb-6">
                <p className="text-sm text-gray-400 mb-2">Your Balance</p>
                {loadingBalance ? (
                  <div className="animate-pulse h-10 bg-white/5 rounded w-32 mx-auto"></div>
                ) : (
                  <p className="text-3xl font-bold gradient-text">₹{balance.toLocaleString('en-IN')}</p>
                )}
              </div>

              {/* Bet Amount */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Bet Amount</label>
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  min={10}
                  max={balance}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric-purple text-white text-center text-2xl font-bold"
                />
                <div className="flex gap-2 mt-2">
                  {[100, 500, 1000, 5000].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setBetAmount(amount)}
                      className="flex-1 py-2 glass-effect rounded-lg text-sm hover:bg-white/10 transition-all"
                    >
                      ₹{amount}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {colors.map((color) => (
                  <motion.button
                    key={color.value}
                    onClick={() => !isSpinning && setSelectedColor(color.value as any)}
                    disabled={isSpinning}
                    whileHover={{ scale: selectedColor === color.value ? 1 : 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative p-6 rounded-xl font-bold text-white transition-all ${
                      selectedColor === color.value
                        ? 'ring-4 ring-electric-purple scale-110'
                        : 'opacity-70 hover:opacity-100'
                    } bg-gradient-to-br ${color.gradient} ${
                      isSpinning ? 'cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  >
                    <div className="text-2xl mb-2">
                      {color.value === 'red' ? '🔴' : color.value === 'green' ? '🟢' : '🟣'}
                    </div>
                    <div className="text-lg">{color.name.toUpperCase()}</div>
                    <div className="text-sm mt-1">x{color.multiplier}</div>
                    {selectedColor === color.value && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-electric-purple rounded-full flex items-center justify-center"
                      >
                        ✓
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Predict Button */}
              <button
                onClick={handlePredict}
                disabled={!selectedColor || isSpinning || betAmount > balance}
                className="w-full py-4 bg-gradient-cyber rounded-xl font-bold text-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed neon-glow"
              >
                {isSpinning ? 'Spinning...' : 'Predict & Play'}
              </button>

              {/* Result Display */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className={`mt-6 p-6 rounded-xl text-center ${
                      result.color === selectedColor
                        ? 'bg-neon-green/20 border-2 border-neon-green'
                        : 'bg-red-500/20 border-2 border-red-500'
                    }`}
                  >
                    <p className="text-2xl font-bold mb-2">
                      {result.color === selectedColor ? '🎉 You Won!' : '❌ You Lost'}
                    </p>
                    <p className="text-lg">
                      Result: <span className="font-bold">{result.color.toUpperCase()}</span>
                    </p>
                    {result.color === selectedColor && (
                      <p className="text-neon-green font-bold mt-2">
                        +₹{(betAmount * result.multiplier - betAmount).toLocaleString('en-IN')}
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Recent Results */}
          <div className="lg:col-span-1">
            <div className="glass-card">
              <h2 className="text-xl font-bold mb-4">Recent Results</h2>
              <div className="space-y-2">
                {recentResults.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No results yet</p>
                ) : (
                  recentResults.map((res, index) => (
                    <motion.div
                      key={res.id || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-3 rounded-lg flex items-center justify-between ${
                        res.color === 'red'
                          ? 'bg-red-500/20'
                          : res.color === 'green'
                          ? 'bg-green-500/20'
                          : 'bg-violet-500/20'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">
                          {res.color === 'red' ? '🔴' : res.color === 'green' ? '🟢' : '🟣'}
                        </span>
                        <span className="font-semibold">{res.color.toUpperCase()}</span>
                      </div>
                      <span className="text-sm text-gray-400">x{res.multiplier}</span>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ColorPrediction
