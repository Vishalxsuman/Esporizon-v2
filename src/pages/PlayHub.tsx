import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { Trophy, Users, Zap, Crown, ArrowRight } from 'lucide-react'
import { matchService } from '@/services/MatchService'
import { leaderboardService } from '@/services/LeaderboardService'
import { walletService } from '@/services/WalletService'
import { formatEspoCoins } from '@/utils/espoCoin'
import ParticlesBackground from '@/components/ParticlesBackground'
import type { Wallet } from '@/types'

const PlayHub = () => {
    const { user } = useUser()
    const [wallet, setWallet] = useState<Wallet | null>(null)
    const [activeMatches, setActiveMatches] = useState(0)
    const [userRank, setUserRank] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) return

        const loadData = async () => {
            try {
                // Load wallet
                const w = await walletService.getWallet(user.id)
                setWallet(w)

                // Load active matches count
                const matches = await matchService.getUserMatches(user.id)
                setActiveMatches(matches.length)

                // Load user rank
                const rank = await leaderboardService.getUserRank(user.id, 'overall_champions')
                setUserRank(rank)
            } catch (error) {
                console.error('Error loading play hub data:', error)
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [user])

    const games = [
        {
            id: 'chess',
            name: 'Online Chess',
            description: '1v1 strategic battle',
            players: 2,
            bgGradient: 'from-purple-600/20 to-pink-600/20',
            icon: '♟️',
            liveCount: '1.2K'
        },
        {
            id: 'card29',
            name: '29 Card Game',
            description: 'Multiplayer card strategy',
            players: 4,
            bgGradient: 'from-orange-600/20 to-red-600/20',
            icon: '🃏',
            liveCount: '850'
        }
    ]

    const quickStats = [
        {
            label: 'Your Espo Coins',
            value: wallet ? formatEspoCoins(wallet.espoCoins) : '0 EC',
            icon: Zap,
            color: 'text-[var(--accent)]'
        },
        {
            label: 'Active Matches',
            value: activeMatches.toString(),
            icon: Users,
            color: 'text-blue-400'
        },
        {
            label: 'Your Rank',
            value: userRank ? `#${userRank}` : 'N/A',
            icon: Crown,
            color: 'text-yellow-400'
        }
    ]

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent)]"></div>
            </div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] pb-24 lg:pb-8"
        >
            <ParticlesBackground />

            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[var(--accent)]/10 to-purple-600/10 border-b border-[var(--border)]">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2671')] bg-cover bg-center opacity-5"></div>
                <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 lg:py-24">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-center"
                    >
                        <h1 className="text-4xl lg:text-6xl font-black mb-4 bg-gradient-to-r from-[var(--accent)] to-purple-500 bg-clip-text text-transparent">
                            PLAY & EARN
                        </h1>
                        <p className="text-lg lg:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-8">
                            Challenge players worldwide. Win real Espo Coins. Dominate the leaderboards.
                        </p>

                        <div className="flex flex-wrap justify-center gap-4">
                            <Link
                                to="/play/lobbies"
                                className="px-6 py-3 bg-[var(--accent)] text-[var(--bg-primary)] font-bold rounded-lg hover:bg-[var(--accent)]/90 transition-all hover:scale-105 shadow-[0_0_30px_rgba(0,255,194,0.3)]"
                            >
                                Browse Lobbies
                            </Link>
                            <Link
                                to="/leaderboards"
                                className="px-6 py-3 bg-[var(--glass)] text-[var(--text-primary)] font-bold rounded-lg border border-[var(--border)] hover:bg-[var(--glass-intense)] transition-all"
                            >
                                <Trophy className="inline w-5 h-5 mr-2" />
                                Leaderboards
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {quickStats.map((stat, idx) => (
                        <motion.div
                            key={stat.label}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 + idx * 0.1 }}
                            className="p-6 rounded-xl bg-[var(--glass)] border border-[var(--border)] hover:border-[var(--accent)]/30 transition-all"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-[var(--text-secondary)] mb-1">{stat.label}</p>
                                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                                </div>
                                <stat.icon className={`w-8 h-8 ${stat.color}`} />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Join Room Section */}
            <div className="max-w-7xl mx-auto px-4 mb-4">
                <div className="bg-[var(--glass)] rounded-2xl p-6 border border-[var(--border)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <h3 className="text-2xl font-black mb-2 flex items-center gap-2">
                                <span className="text-3xl">🎫</span>
                                Have a Room Code?
                            </h3>
                            <p className="text-[var(--text-secondary)]">
                                Enter the invite code shared by your friend to join their lobby.
                            </p>
                        </div>

                        <form
                            onSubmit={async (e) => {
                                e.preventDefault()
                                // @ts-ignore
                                const code = e.target.code.value
                                if (!code) return

                                const match = await matchService.getMatchByInviteCode(code)
                                if (match) {
                                    // @ts-ignore
                                    window.location.href = `/play/match/${match.id}`
                                } else {
                                    alert('Invalid Room Code')
                                }
                            }}
                            className="flex w-full md:w-auto gap-2"
                        >
                            <input
                                type="text"
                                name="code"
                                placeholder="Enter Code (e.g. X7K9L)"
                                className="flex-1 md:w-64 px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--accent)] font-mono uppercase tracking-widest text-center font-bold"
                                maxLength={8}
                            />
                            <button
                                type="submit"
                                className="px-6 py-3 bg-[var(--accent)] text-black font-bold rounded-xl hover:bg-[var(--accent)-hover] transition-all flex items-center gap-2"
                            >
                                Join
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Games Grid */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                    <span className="w-1.5 h-8 bg-[var(--accent)] rounded-full shadow-[0_0_15px_var(--accent)]"></span>
                    SELECT YOUR GAME
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {games.map((game, idx) => (
                        <motion.div
                            key={game.id}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 + idx * 0.1 }}
                            className="group relative"
                        >
                            <div className={`relative p-8 rounded-2xl border-2 border-[var(--border)] bg-gradient-to-br ${game.bgGradient} overflow-hidden transition-all duration-300 hover:border-[var(--accent)] hover:shadow-[0_0_30px_rgba(0,255,194,0.2)]`}>
                                {/* Background Pattern */}
                                <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bTAtMTZjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')]"></div>

                                {/* Live Badge */}
                                <div className="absolute top-4 right-4 flex items-center gap-2 bg-green-500/20 px-3 py-1.5 rounded-full backdrop-blur-sm border border-green-500/30">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                    <span className="text-xs font-bold text-green-400">{game.liveCount} LIVE</span>
                                </div>

                                <div className="relative z-10">
                                    <div className="text-6xl mb-4">{game.icon}</div>
                                    <h3 className="text-2xl font-black mb-2">{game.name}</h3>
                                    <p className="text-[var(--text-secondary)] mb-1">{game.description}</p>
                                    <p className="text-sm text-[var(--text-secondary)] mb-6">{game.players} Players</p>

                                    <div className="flex gap-3">
                                        <Link
                                            to={`/play/create?game=${game.id}&mode=free`}
                                            className="flex-1 py-3 bg-[var(--glass)] hover:bg-[var(--glass-intense)] border border-[var(--border)] rounded-lg font-bold text-center transition-all"
                                        >
                                            Create Room (Free)
                                        </Link>
                                        <Link
                                            to={`/play/create?game=${game.id}&mode=paid`}
                                            className="flex-1 py-3 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-[var(--bg-primary)] rounded-lg font-bold text-center transition-all shadow-lg shadow-[var(--accent)]/20"
                                        >
                                            Create Room (Paid)
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* CTA Section */}
            <div className="max-w-7xl mx-auto px-4 py-16">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="relative p-8 lg:p-12 rounded-2xl bg-gradient-to-r from-purple-600/20 to-[var(--accent)]/20 border border-[var(--border)] overflow-hidden"
                >
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1614294148960-9aa740632a87?q=80&w=2574')] bg-cover bg-center opacity-5"></div>
                    <div className="relative z-10 text-center">
                        <h2 className="text-3xl font-black mb-4">Ready to Compete?</h2>
                        <p className="text-[var(--text-secondary)] mb-6 max-w-2xl mx-auto">
                            Join thousands of players earning Espo Coins daily. Skill beats luck. Fair play guaranteed.
                        </p>
                        <Link
                            to="/play/lobbies"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--accent)] text-[var(--bg-primary)] font-bold rounded-lg hover:bg-[var(--accent)]/90 transition-all hover:scale-105 shadow-[0_0_40px_rgba(0,255,194,0.4)]"
                        >
                            <Users className="w-5 h-5" />
                            Find a Match
                        </Link>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    )
}

export default PlayHub
