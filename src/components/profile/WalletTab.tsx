import { useState } from 'react'
import { Wallet, ShieldCheck, Zap } from 'lucide-react'
import { useWallet } from '@/contexts/WalletContext'
import { toast } from 'react-hot-toast'

const WalletTab = () => {
    const { balance, addBalance } = useWallet() // Assuming useWallet exposes balance and addFunds
    const [amount, setAmount] = useState('')
    const [loading, setLoading] = useState(false)

    const handleAddFunds = async () => {
        const val = parseInt(amount)
        if (!val || val < 1) {
            toast.error('Minimum amount is ₹1')
            return
        }

        try {
            setLoading(true)
            await addBalance(val)
            toast.success(`Success! Added ₹${val} to wallet.`)
            setAmount('')
        } catch (error) {
            toast.error('Transaction failed')
        } finally {
            setLoading(false)
        }
    }

    const quickAmounts = [100, 500, 1000, 2000]

    return (
        <div className="space-y-8">
            {/* Balance Card */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-teal-900/40 to-black border border-teal-500/20 p-8 shadow-2xl">
                <div className="absolute top-0 right-0 p-8 opacity-20">
                    <Wallet size={120} className="text-teal-500 transform rotate-12" />
                </div>

                <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-400 mb-2">Total Balance</p>
                    <h2 className="text-5xl font-black italic tracking-tighter text-white mb-6">
                        ₹{balance.toLocaleString()}
                    </h2>

                    <div className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-wider">
                        <ShieldCheck size={14} className="text-green-500" />
                        <span>Secure Combat Wallet • Instant Credits</span>
                    </div>
                </div>
            </div>

            {/* Add Funds */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                        <Zap size={16} className="text-yellow-400" />
                        Quick Top-up
                    </h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {quickAmounts.map(amt => (
                        <button
                            key={amt}
                            onClick={() => setAmount(amt.toString())}
                            className="py-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-teal-500/30 transition-all text-sm font-bold text-zinc-300"
                        >
                            ₹{amt}
                        </button>
                    ))}
                </div>

                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">₹</span>
                    <input
                        type="number"
                        placeholder="Enter custom amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full pl-8 pr-4 py-4 bg-[#0E1424]/40 border border-white/5 rounded-2xl text-white placeholder-zinc-700 focus:outline-none focus:border-teal-500/30 font-bold transition-all"
                    />
                    <button
                        onClick={handleAddFunds}
                        disabled={loading || !amount}
                        className="absolute right-2 top-2 bottom-2 px-6 rounded-xl bg-teal-500 text-black font-black uppercase text-xs tracking-wider hover:bg-teal-400 disabled:opacity-50 disabled:grayscale transition-all"
                    >
                        {loading ? 'Processing...' : 'Add'}
                    </button>
                </div>
                <p className="text-[10px] text-zinc-600 text-center italic">
                    *Secure Payment Gateway (Mock Mode Active)
                </p>
            </div>
        </div>
    )
}

export default WalletTab
