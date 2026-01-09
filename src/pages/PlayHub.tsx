import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { Users, Zap, Crown, X } from 'lucide-react'
import { matchService } from '@/services/MatchService'
import { leaderboardService } from '@/services/LeaderboardService'
import { walletService } from '@/services/WalletService'
import { formatEspoCoins } from '@/utils/espoCoin'
import ParticlesBackground from '@/components/ParticlesBackground'
import type { Wallet } from '@/types'
import toast from 'react-hot-toast'

const PlayHub = () => {
    const { user } = useUser()
    const navigate = useNavigate()
    const [wallet, setWallet] = useState<Wallet | null>(null)
    const [activeMatches, setActiveMatches] = useState(0)
    const [userRank, setUserRank] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)

    // Guest Logic State
    const [showGuestModal, setShowGuestModal] = useState(false)
    const [guestName, setGuestName] = useState('')
    const [pendingAction, setPendingAction] = useState<{ type: 'create' | 'join', data: any } | null>(null)
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

    const handleAction = async (action: { type: 'create' | 'join', data: any }, identity?: any) => {
        setIsProcessing(true)
        try {
            const currentUser = user ? {
                id: user.id,
                name: user.fullName || user.username || 'Player',
                avatar: user.imageUrl
            } : (identity || getGuestIdentity())

            if (!currentUser) {
                setPendingAction(action)
                setShowGuestModal(true)
                setIsProcessing(false)
                return
            }

            if (action.type === 'create') {
                const { gameId, mode } = action.data
                // For PAID games, guests are NOT allowed (simple rule for now)
                if (mode === 'paid' && !user) {
                    toast.error("Guests can only play Free matches. Please login to play Paid.")
                    setIsProcessing(false)
                    return
                }

                const match = await matchService.createMatch({
                    gameId,
                    mode,
                    maxPlayers: gameId === 'chess' ? 2 : 4,
                    entryFee: mode === 'paid' ? 10 : 0, // Mock entry fee for now
                    visibility: 'private',
                    withBots: false
                }, currentUser.id, currentUser.name, currentUser.avatar)

                navigate(`/play/match/${match.id}`)

            } else if (action.type === 'join') {
                const { code } = action.data
                const match = await matchService.joinRoom(code, currentUser)
                navigate(`/play/match/${match.id}`)
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
        { id: 'chess', name: 'Online Chess', icon: '♟️', players: 2, desc: 'Strategy' },
        { id: 'card29', name: '29 Card Game', icon: '🃏', players: 4, desc: 'Multiplayer' }
    ]

    const quickStats = [
        { label: 'Espo Coins', value: wallet ? formatEspoCoins(wallet.espoCoins) : '0 EC', icon: Zap, color: 'text-yellow-400' },
        { label: 'Active Matches', value: activeMatches, icon: Users, color: 'text-blue-400' },
        { label: 'Rank', value: userRank ? `#${userRank}` : 'N/A', icon: Crown, color: 'text-[var(--accent)]' }
    ]

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] text-cyan-400">Loading...</div>

    return (
        <div className="min-h-screen bg-[#0a0f1e] text-white pb-24 relative overflow-hidden">
            <ParticlesBackground />

            {/* Guest Name Modal */}
            <AnimatePresence>
                {showGuestModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                            className="bg-[#1a2332] w-full max-w-md p-6 rounded-2xl border border-white/10 shadow-xl"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Enter Guest Name</h3>
                                <button onClick={() => setShowGuestModal(false)}><X className="text-white/50 hover:text-white" /></button>
                            </div>
                            <input
                                type="text"
                                value={guestName}
                                onChange={e => setGuestName(e.target.value)}
                                placeholder="Your Display Name..."
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white mb-6 focus:border-cyan-400 outline-none"
                                autoFocus
                            />
                            <button
                                onClick={confirmGuestName}
                                disabled={!guestName.trim() || isProcessing}
                                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 py-3 rounded-xl font-bold text-white hover:opacity-90 disabled:opacity-50"
                            >
                                {isProcessing ? 'Processing...' : 'Continue as Guest'}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hero */}
            <div className="relative pt-24 pb-12 px-4 text-center">
                <motion.h1
                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                    className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
                >
                    PLAY & EARN
                </motion.h1>
                <p className="text-white/60 text-lg max-w-2xl mx-auto mb-8">
                    Challenge players worldwide. No login needed for free games.
                </p>

                {/* Quick Stats (Only if logged in) */}
                {user && (
                    <div className="flex justify-center gap-4 flex-wrap mb-8">
                        {quickStats.map((stat, i) => (
                            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3 backdrop-blur-md">
                                <div className={`p-2 rounded-lg bg-white/5 ${stat.color}`}><stat.icon size={20} /></div>
                                <div className="text-left">
                                    <div className="text-xs text-white/40">{stat.label}</div>
                                    <div className="font-bold">{stat.value}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Join Room Input */}
            <div className="max-w-xl mx-auto px-4 mb-16">
                <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-1 border border-white/10 shadow-2xl">
                    <div className="bg-[#0a0f1e]/90 rounded-xl p-6 backdrop-blur-xl">
                        <label className="block text-xs font-bold text-cyan-400 uppercase tracking-widest mb-3">
                            Have a Room Code?
                        </label>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault()
                                // @ts-ignore
                                const code = e.target.code.value
                                if (code) handleAction({ type: 'join', data: { code } })
                            }}
                            className="flex gap-2"
                        >
                            <input
                                name="code"
                                type="text"
                                placeholder="ENTER CODE"
                                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 font-mono text-center tracking-widest uppercase focus:border-cyan-400 outline-none"
                                maxLength={8}
                            />
                            <button
                                type="submit"
                                disabled={isProcessing}
                                className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-6 py-3 rounded-xl transition-all"
                            >
                                JOIN
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Games Grid */}
            <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-6">
                {gameCards.map(game => (
                    <div key={game.id} className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative bg-[#131b2a] border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all">
                            <div className="flex justify-between items-start mb-8">
                                <div className="text-5xl">{game.icon}</div>
                                <div className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    LIVE
                                </div>
                            </div>

                            <h3 className="text-2xl font-bold mb-2">{game.name}</h3>
                            <p className="text-white/40 mb-8">{game.desc} • {game.players} Players</p>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => handleAction({ type: 'create', data: { gameId: game.id, mode: 'free' } })}
                                    className="py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-bold transition-all"
                                >
                                    Create Free
                                </button>
                                <button
                                    onClick={() => handleAction({ type: 'create', data: { gameId: game.id, mode: 'paid' } })}
                                    className="py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 font-bold shadow-lg shadow-cyan-500/20 transition-all"
                                >
                                    Create Paid
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default PlayHub
