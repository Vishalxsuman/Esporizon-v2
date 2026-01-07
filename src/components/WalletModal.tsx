import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface WalletModalProps {
    isOpen: boolean
    onClose: () => void
    type: 'add' | 'withdraw'
    currentBalance: number
    onSubmit: (amount: number) => Promise<void>
}

const WalletModal = ({ isOpen, onClose, type, currentBalance, onSubmit }: WalletModalProps) => {
    const [amount, setAmount] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const MIN_AMOUNT = 100
    const MAX_ADD_AMOUNT = 50000

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        const numAmount = Number(amount)

        // Validation
        if (!amount || isNaN(numAmount)) {
            setError('Please enter a valid amount')
            return
        }

        if (numAmount < MIN_AMOUNT) {
            setError(`Minimum amount is ₹${MIN_AMOUNT}`)
            return
        }

        if (type === 'add' && numAmount > MAX_ADD_AMOUNT) {
            setError(`Maximum amount is ₹${MAX_ADD_AMOUNT.toLocaleString('en-IN')}`)
            return
        }

        if (type === 'withdraw' && numAmount > currentBalance) {
            setError('Insufficient balance')
            return
        }

        try {
            setIsLoading(true)
            await onSubmit(numAmount)
            setAmount('')
            onClose()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Transaction failed')
        } finally {
            setIsLoading(false)
        }
    }

    const quickAmounts = type === 'add'
        ? [500, 1000, 2000, 5000]
        : [500, 1000, Math.floor(currentBalance / 2), currentBalance]

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/50 backdrop-blur-md"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md"
                    >
                        <div className="glass-card-premium">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold">
                                    {type === 'add' ? '💰 Add Funds' : '💸 Withdraw'}
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Current Balance */}
                            <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
                                <p className="text-sm text-gray-400 mb-1">Current Balance</p>
                                <p className="text-2xl font-bold" style={{ color: '#00ffc2' }}>
                                    ₹{currentBalance.toLocaleString('en-IN')}
                                </p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit}>
                                {/* Amount Input */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-2">
                                        Amount
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                            ₹
                                        </span>
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="0"
                                            className="w-full pl-8 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#00ffc2] transition-colors"
                                            min={MIN_AMOUNT}
                                            max={type === 'add' ? MAX_ADD_AMOUNT : currentBalance}
                                        />
                                    </div>
                                    {error && (
                                        <p className="mt-2 text-sm text-red-400">{error}</p>
                                    )}
                                </div>

                                {/* Quick Amounts */}
                                <div className="mb-6">
                                    <p className="text-sm text-gray-400 mb-2">Quick Select</p>
                                    <div className="grid grid-cols-4 gap-2">
                                        {quickAmounts.map((quickAmount) => (
                                            <button
                                                key={quickAmount}
                                                type="button"
                                                onClick={() => setAmount(quickAmount.toString())}
                                                className="px-3 py-2 bg-white/5 hover:bg-[#00ffc2]/10 border border-white/10 hover:border-[#00ffc2]/30 rounded-lg text-sm font-medium transition-colors"
                                            >
                                                ₹{quickAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-3 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{
                                        background: isLoading ? '#666' : 'linear-gradient(135deg, #00ffc2 0%, #7c3aed 100%)',
                                        color: '#09090b'
                                    }}
                                >
                                    {isLoading ? 'Processing...' : (type === 'add' ? 'Add Funds' : 'Withdraw')}
                                </button>
                            </form>

                            {/* Info */}
                            <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
                                <p className="text-xs text-gray-400">
                                    {type === 'add'
                                        ? `Min: ₹${MIN_AMOUNT} • Max: ₹${MAX_ADD_AMOUNT.toLocaleString('en-IN')}`
                                        : `Max: ₹${currentBalance.toLocaleString('en-IN')}`}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}

export default WalletModal
