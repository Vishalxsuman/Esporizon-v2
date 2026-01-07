import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Plus,
    ArrowUpRight,
    History,
    Copy,
    Check,
    ChevronRight,
    ShieldCheck,
    Gift
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { userService } from '@/services/UserService'
import { Wallet as WalletType, Transaction, UserProfile } from '@/types'
import WalletModal from '@/components/WalletModal'
import { walletService } from '@/services/WalletService'
import toast, { Toaster } from 'react-hot-toast'

const WalletPage = () => {
    const { user } = useAuth()
    const [wallet, setWallet] = useState<WalletType | null>(null)
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [modalType, setModalType] = useState<'add' | 'withdraw' | null>(null)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        if (!user) return

        const fetchInitialData = async () => {
            const userId = user?.id || user?.uid
            if (!userId) return

            try {
                const w = await walletService.getWallet(userId)
                setWallet(w)
                setTransactions(w.transactions)

                const p = await userService.getProfile(userId)
                setProfile(p)
            } catch (err) {
                console.error('Initial fetch error:', err)
            }
        }

        fetchInitialData()

        const handleWalletUpdate = (e: Event) => {
            const updatedWallet = (e as CustomEvent<WalletType>).detail
            if (updatedWallet) {
                setWallet(updatedWallet)
                setTransactions(updatedWallet.transactions)
            }
        }

        window.addEventListener('walletUpdate', handleWalletUpdate)

        const userId = user?.id || user?.uid
        const unsubscribeProfile = userId ? userService.subscribeToProfile(userId, (data) => {
            setProfile(data)
        }) : () => { }

        return () => {
            window.removeEventListener('walletUpdate', handleWalletUpdate)
            unsubscribeProfile()
        }
    }, [user])

    const handleWalletAction = async (amount: number) => {
        const userId = user?.id || user?.uid
        if (!userId || !modalType) return

        try {
            if (modalType === 'add') {
                await walletService.addFunds(amount, userId)
                toast.success(`₹${amount} Added to Deployment Fund`)
            } else {
                await walletService.withdrawFunds(amount, userId, { method: 'default' })
                toast.success(`Withdrawal Request of ₹${amount} Submitted`)
            }
            setModalType(null)
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Action failed')
        }
    }

    const copyReferral = () => {
        if (!profile?.referralCode) return
        navigator.clipboard.writeText(profile.referralCode)
        setCopied(true)
        toast.success('Referral Code Copied!')
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] pb-24 transition-colors duration-300">
            <Toaster position="top-right" />

            {/* Premium Header */}
            <div className="sticky top-0 z-30 bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-[var(--border)] p-4 flex items-center justify-between">
                <button
                    onClick={() => window.history.back()}
                    className="p-2 hover:bg-[var(--glass)] rounded-xl transition-all"
                >
                    <ChevronRight className="rotate-180" size={24} />
                </button>
                <h1 className="text-sm font-black uppercase tracking-widest italic flex items-center gap-2">
                    <ShieldCheck size={18} className="text-[var(--accent)]" />
                    Combat Wallet
                </h1>
                <div className="w-10 h-10" />
            </div>

            <div className="max-w-xl mx-auto px-4 py-8 space-y-8">

                {/* Total Balance Hero */}
                <div className="relative overflow-hidden bg-gradient-to-br from-[var(--surface)] to-[var(--bg-secondary)] p-8 rounded-[2.5rem] border border-[var(--border)] shadow-2xl">
                    <div className="relative z-10">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] mb-4 block">Total Available Balance</span>
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-[#fbbf24]/20 p-2 border border-[#fbbf24]/20">
                                <img src="/Images/espo.png" alt="ESPO" className="w-full h-full object-contain" />
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-black tracking-tighter italic">₹{wallet?.balance?.toLocaleString() || '0'}</span>
                            </div>
                        </div>

                        {/* Sub Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 mt-10">
                            <div className="p-4 bg-[var(--glass)] rounded-3xl border border-[var(--border)]">
                                <div className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-1">Pending Withdrawals</div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-[#fbbf24]/20 p-0.5">
                                        <img src="/Images/espo.png" alt="E" className="w-full h-full grayscale" />
                                    </div>
                                    <span className="text-lg font-black italic">₹0.00</span>
                                </div>
                            </div>
                            <div className="p-4 bg-[var(--glass)] rounded-3xl border border-[var(--border)]">
                                <div className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-1">Total Career Earnings</div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-[var(--accent)]/20 p-0.5">
                                        <img src="/Images/espo.png" alt="E" className="w-full h-full" />
                                    </div>
                                    <span className="text-lg font-black italic text-[var(--accent)]">₹{profile?.totalEarnings?.toLocaleString() || '0'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Decorative Glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#00ffc2]/5 blur-[100px] -mr-32 -mt-32 rounded-full" />
                </div>

                {/* Action Cards */}
                <div className="grid grid-cols-1 gap-4">
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setModalType('add')}
                        className="group flex items-center justify-between p-6 bg-[var(--glass)] border border-[var(--border)] rounded-3xl hover:border-[var(--accent)]/30 transition-all cursor-pointer"
                    >
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-[var(--accent)]/10 rounded-2xl flex items-center justify-center p-3">
                                <img src="/Images/addcoin.png" alt="Buy" className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(0,255,194,0.5)]" />
                            </div>
                            <div>
                                <div className="text-sm font-black uppercase tracking-widest text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">Buy ESPO Coins</div>
                                <div className="text-[10px] text-[var(--text-secondary)] font-bold uppercase mt-1">Purchase combat currency instantly</div>
                            </div>
                        </div>
                        <div className="p-2 rounded-full bg-[var(--glass)] text-[var(--text-secondary)]/20 group-hover:text-[var(--text-primary)] transition-colors">
                            <Plus size={20} />
                        </div>
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setModalType('withdraw')}
                        className="group flex items-center justify-between p-6 bg-[var(--glass)] border border-[var(--border)] rounded-3xl hover:border-[#fbbf24]/30 transition-all cursor-pointer"
                    >
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-[#fbbf24]/10 rounded-2xl flex items-center justify-center p-3">
                                <img src="/Images/withdraw.png" alt="Withdraw" className="w-full h-full object-contain" />
                            </div>
                            <div>
                                <div className="text-sm font-black uppercase tracking-widest text-[var(--text-primary)] group-hover:text-[#fbbf24] transition-colors">Withdraw Credits</div>
                                <div className="text-[10px] text-[var(--text-secondary)] font-bold uppercase mt-1">Min. 50 ESPO coins required</div>
                            </div>
                        </div>
                        <div className="p-2 rounded-full bg-[var(--glass)] text-[var(--text-secondary)]/20 group-hover:text-[var(--text-primary)] transition-colors">
                            <ArrowUpRight size={20} />
                        </div>
                    </motion.div>
                </div>

                {/* Transaction History Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                            <History className="text-[var(--text-secondary)]" size={16} />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)]">Operation Records</h3>
                        </div>
                        <button className="text-[10px] font-black uppercase tracking-widest text-[var(--accent)]">View All</button>
                    </div>

                    <div className="space-y-3">
                        {transactions.length === 0 ? (
                            <div className="p-12 text-center bg-[var(--glass)] border border-dashed border-[var(--border)] rounded-[2rem]">
                                <p className="text-[var(--text-secondary)] text-sm font-medium">No logistical operations detected.</p>
                            </div>
                        ) : (
                            transactions.slice(0, 3).map((tx) => (
                                <div key={tx.id} className="p-5 bg-[var(--glass)] border border-[var(--border)] rounded-3xl flex items-center justify-between group hover:border-[var(--border)]/30 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tx.type === 'add' ? 'bg-[var(--accent)]/10' : 'bg-red-500/10'}`}>
                                            <div className="w-6 h-6 p-1 border rounded-lg border-[var(--border)] flex items-center justify-center bg-black/50">
                                                <img src="/Images/logo.png" className="w-full h-full opacity-40" />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs font-black uppercase tracking-wide group-hover:text-[var(--accent)] transition-colors">{tx.description}</div>
                                            <div className="text-[10px] text-[var(--text-secondary)] font-bold uppercase mt-1">{new Date(tx.timestamp).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                    <div className={`text-lg font-black italic tracking-tighter ${tx.type === 'add' ? 'text-[var(--accent)]' : 'text-red-500'}`}>
                                        <span className="text-xs mr-2 relative top-[-4px]">
                                            <img src="/Images/espo.png" className={`w-4 h-4 inline-block ${tx.type !== 'add' && 'grayscale opacity-50'}`} />
                                        </span>
                                        {tx.type === 'add' ? '+' : '-'}{tx.amount.toFixed(2)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Referral Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 px-2">
                        <Gift className="text-[var(--accent)]" size={16} />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent)]">Strategic Recruitment</h3>
                    </div>

                    <div className="bg-[var(--accent)]/5 border border-[var(--accent)]/10 p-8 rounded-[2.5rem] space-y-6">
                        <div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] block mb-2">Total Referral Earnings</span>
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-[#fbbf24]/20 p-1 rounded-full border border-[#fbbf24]/20">
                                    <img src="/Images/espo.png" alt="E" className="w-full h-full object-contain" />
                                </div>
                                <span className="text-2xl font-black italic tracking-tighter text-[var(--text-primary)]">₹{profile?.referralEarnings?.toFixed(2) || '0.00'}</span>
                            </div>
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-0 bg-[var(--accent)]/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative flex items-center justify-between p-4 bg-black/60 border border-[var(--border)] rounded-2xl">
                                <span className="text-sm font-black italic tracking-widest text-[var(--accent)] selection:bg-[var(--accent)]/20">
                                    {profile?.referralCode || 'LOADING...'}
                                </span>
                                <button
                                    onClick={copyReferral}
                                    className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-[var(--bg-primary)] text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_5px_15px_rgba(0,255,194,0.2)]"
                                >
                                    {copied ? <Check size={14} /> : <Copy size={14} />}
                                    {copied ? 'Copied' : 'Copy Code'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <WalletModal
                isOpen={modalType !== null}
                onClose={() => setModalType(null)}
                type={modalType || 'add'}
                currentBalance={wallet?.balance || 0}
                onSubmit={handleWalletAction}
            />
        </div>
    )
}

export default WalletPage
