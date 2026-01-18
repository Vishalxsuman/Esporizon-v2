import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Users, Zap, Crown, X, Gamepad2, Sparkles, TrendingUp, ArrowRight } from 'lucide-react'
import { matchService } from '@/services/MatchService'
import { leaderboardService } from '@/services/LeaderboardService'
import { walletService } from '@/services/WalletService'
import { formatEspoCoins } from '@/utils/espoCoin'
import ParticlesBackground from '@/components/ParticlesBackground'
import type { Wallet } from '@/types'
import toast from 'react-hot-toast'

const PlayHub = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [wallet, setWallet] = useState<Wallet | null>(null)
    const [activeMatches, setActiveMatches] = useState(0)
    const [userRank, setUserRank] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)

    // Guest Logic State
    const [showGuestModal, setShowGuestModal] = useState(false)
    const [guestName, setGuestName] = useState('')
    const [pendingAction, setPendingAction] = useState<{ type: 'create' | 'join' | 'navigate', data: any } | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)

    useEffect(() => {
        const loadData = async () => {
            if (user) {
                try {
                    const w = await walletService.getWallet(user.id)
                    setWallet(w)
                    const matches = await matchService.getUserMatches(user.id)
                    setActiveMatches(matches.length)
                    const rank = await leaderboardService.getUserRank(user.id, 'overall_champions')
                    setUserRank(rank)
                } catch (error) {
                    console.error('Error loading data:', error)
                }
            }
            setLoading(false)
        }
        loadData()
    }, [user])

    const getGuestIdentity = () => {
        const stored = localStorage.getItem('guest_identity')
        if (stored) return JSON.parse(stored)
        return null
    }

    const createGuestIdentity = (name: string) => {
        const identity = {
            id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            name: name,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
        }
        localStorage.setItem('guest_identity', JSON.stringify(identity))
        return identity
    }

    const handleAction = async (action: { type: 'create' | 'join' | 'navigate', data: any }, identity?: any) => {
        setIsProcessing(true)
        try {
            const currentUser = user ? {
                id: user.id || user.uid || 'unknown',
                name: user.displayName || 'Player',
                avatar: user.photoURL
            } : (identity || getGuestIdentity())

            if (!currentUser) {
                setPendingAction(action)
                setShowGuestModal(true)
                setIsProcessing(false)
                return
            }

            if (action.type === 'create') {
                const { gameId, mode } = action.data
                // For PAID games, guests are NOT allowed
                if (mode === 'paid' && !user) {
                    toast.error("Guests can only play Free matches. Please login to play Paid.")
                    setIsProcessing(false)
                    return
                }

                const match = await matchService.createMatch({
                    gameId,
                    mode,
                    maxPlayers: gameId === 'chess' ? 2 : 4,
                    entryFee: mode === 'paid' ? 10 : 0,
                    visibility: 'private',
                    withBots: false
                }, currentUser.id, currentUser.name, currentUser.avatar)

                navigate(`/play/match/${match.id}`)

            } else if (action.type === 'join') {
                const { code } = action.data
                const match = await matchService.joinRoom(code, currentUser)
                navigate(`/play/match/${match.id}`)
            } else if (action.type === 'navigate') {
                navigate(action.data.route)
            }
        } catch (error: any) {
            toast.error(error.message || "Action failed")
        } finally {
            setIsProcessing(false)
            setShowGuestModal(false)
        }
    }

    const confirmGuestName = () => {
        if (!guestName.trim()) return
        const identity = createGuestIdentity(guestName)
        if (pendingAction) {
            handleAction(pendingAction, identity)
        }
    }

    const gameCards = [
        {
            id: 'chess',
            name: 'Online Chess',
            icon: '♟️',
            players: 2,
            desc: 'Classic Strategy',
            gradient: 'from-purple-500/20 to-indigo-500/20',
            accentColor: 'purple-500'
        },
        {
            id: 'card29',
            name: '29 Card Game',
            icon: '🃏',
            players: 4,
            desc: 'Team Multiplayer',
            gradient: 'from-rose-500/20 to-pink-500/20',
            accentColor: 'rose-500'
        }
    ]

    const quickStats = [
        { label: 'Espo Coins', value: wallet ? formatEspoCoins(wallet.espoCoins) : '0 EC', icon: Zap, color: 'text-yellow-400' },
        { label: 'Active Matches', value: activeMatches, icon: Users, color: 'text-blue-400' },
        { label: 'Rank', value: userRank ? `#${userRank}` : 'N/A', icon: Crown, color: 'text-[var(--accent)]' }
    ]

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[var(--accent)]/10 border-t-[var(--accent)] rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-[var(--accent)] font-bold">Loading PlayHub...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] pb-24 relative overflow-hidden transition-colors duration-300">
            <ParticlesBackground />

            {/* Background Atmosphere */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--accent)]/5 blur-[150px] opacity-40" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 blur-[140px] opacity-30" />
            </div>

            {/* Guest Name Modal */}
            <AnimatePresence>
                {showGuestModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            className="bg-[var(--card-bg)] w-full max-w-md p-6 rounded-2xl border border-[var(--card-border)] shadow-2xl backdrop-blur-xl"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-[var(--text-primary)]">Enter Guest Name</h3>
                                <button
                                    onClick={() => setShowGuestModal(false)}
                                    className="p-2 hover:bg-[var(--surface-hover)] rounded-lg transition-colors"
                                >
                                    <X className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]" size={20} />
                                </button>
                            </div>
                            <input
                                type="text"
                                value={guestName}
                                onChange={e => setGuestName(e.target.value)}
                                placeholder="Your Display Name..."
                                className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-secondary)] mb-6 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 outline-none transition-all select-text"
                                autoFocus
                                onKeyPress={(e) => e.key === 'Enter' && confirmGuestName()}
                            />
                            <button
                                onClick={confirmGuestName}
                                disabled={!guestName.trim() || isProcessing}
                                className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-black py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-[var(--accent)]/50"
                            >
                                {isProcessing ? 'Processing...' : 'Continue as Guest'}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hero Section */}
            <div className="relative pt-16 sm:pt-24 pb-8 sm:pb-12 px-4 text-center">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent-muted)] border border-[var(--accent)]/20 rounded-full mb-6"
                >
                    <Sparkles className="text-[var(--accent)]" size={16} />
                    <span className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider">Play & Earn Rewards</span>
                </motion.div>

                <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl sm:text-5xl md:text-6xl font-black mb-4 tracking-tight"
                >
                    <span className="text-[var(--text-primary)]">PLAY</span>
                    <span className="text-[var(--accent)] italic"> HUB</span>
                    <span className="text-[var(--accent)]">.</span>
                </motion.h1>

                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-[var(--text-secondary)] text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed"
                >
                    Challenge players worldwide. <span className="text-[var(--accent)] font-semibold">No login needed</span> for free games.
                </motion.p>

                {/* Quick Stats (Only if logged in) */}
                {user && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex justify-center gap-3 sm:gap-4 flex-wrap mb-8"
                    >
                        {quickStats.map((stat, i) => (
                            <div
                                key={i}
                                className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-3 sm:p-4 flex items-center gap-3 backdrop-blur-xl hover:border-[var(--accent)]/30 transition-all group"
                            >
                                <div className={`p-2 rounded-lg bg-[var(--surface)] ${stat.color} group-hover:scale-110 transition-transform`}>
                                    <stat.icon size={18} />
                                </div>
                                <div className="text-left">
                                    <div className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-bold">{stat.label}</div>
                                    <div className="font-black text-sm text-[var(--text-primary)]">{stat.value}</div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}
            </div>

            {/* Join Room Input */}
            <div className="max-w-xl mx-auto px-4 mb-12 sm:mb-16">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="relative group"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent)]/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-5 sm:p-6 backdrop-blur-xl">
                        <label className="flex items-center gap-2 text-xs font-bold text-[var(--accent)] uppercase tracking-widest mb-4">
                            <Gamepad2 size={14} />
                            Have a Room Code?
                        </label>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault()
                                // @ts-ignore
                                const code = e.target.code.value
                                if (code) handleAction({ type: 'join', data: { code } })
                            }}
                            className="flex gap-2 sm:gap-3"
                        >
                            <input
                                name="code"
                                type="text"
                                placeholder="ENTER-CODE"
                                className="flex-1 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-4 py-3 font-mono text-center tracking-widest uppercase text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 outline-none transition-all select-text"
                                maxLength={10}
                            />
                            <button
                                type="submit"
                                disabled={isProcessing}
                                className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-black font-bold px-6 sm:px-8 py-3 rounded-xl transition-all shadow-lg hover:shadow-[var(--accent)]/50 disabled:opacity-50 flex items-center gap-2 hover:scale-105 active:scale-95"
                            >
                                JOIN
                                <ArrowRight size={16} />
                            </button>
                        </form>
                    </div>
                </motion.div>
            </div>

            {/* Games Grid */}
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] flex items-center gap-3">
                        <span className="w-1.5 h-8 bg-[var(--accent)] rounded-full" />
                        Available Games
                    </h2>
                    <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)]">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        3 LIVE
                    </div>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {gameCards.map((game, idx) => (
                        <motion.div
                            key={game.id}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 + idx * 0.1 }}
                            className="relative group"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${game.gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                            <div className="relative bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 hover:border-[var(--accent)]/40 transition-all backdrop-blur-xl group-hover:transform group-hover:scale-[1.02] duration-300">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="text-5xl flex items-center justify-center h-[56px] w-[56px] bg-[var(--surface)] rounded-xl border border-[var(--border)] group-hover:scale-110 transition-transform">
                                        {game.icon}
                                    </div>
                                    <div className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        LIVE
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold mb-2 text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">{game.name}</h3>
                                <p className="text-sm text-[var(--text-secondary)] mb-6 flex items-center gap-2">
                                    {game.desc}
                                    <span className="text-[var(--accent)]">•</span>
                                    <span className="font-bold text-[var(--accent)]">{game.players}</span> Players
                                </p>

                                <div className="grid grid-cols-2 gap-2">
                                    {game.id === 'prediction' ? (
                                        <button
                                            onClick={() => handleAction({ type: 'navigate', data: { route: '/predict' } })}
                                            className="col-span-2 py-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-black font-bold shadow-lg hover:shadow-[var(--accent)]/50 transition-all flex items-center justify-center gap-2 group/btn"
                                        >
                                            PLAY NOW
                                            <TrendingUp size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => handleAction({ type: 'create', data: { gameId: game.id, mode: 'free' } })}
                                                className="py-3 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] font-bold text-sm text-[var(--text-primary)] transition-all hover:border-[var(--accent)]/40"
                                            >
                                                Free
                                            </button>
                                            <button
                                                onClick={() => handleAction({ type: 'create', data: { gameId: game.id, mode: 'paid' } })}
                                                className="py-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-black font-bold shadow-lg hover:shadow-[var(--accent)]/50 transition-all text-sm"
                                            >
                                                Paid
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Info Footer */}
            <div className="max-w-4xl mx-auto px-4 mt-16 text-center">
                <p className="text-xs text-[var(--text-secondary)] italic">
                    Free games don't require login. Paid games require authentication for secure transactions.
                </p>
            </div>
        </div>
    )
}

export default PlayHub
