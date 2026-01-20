import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { Search, Users, ArrowLeft, Zap } from 'lucide-react'
import { matchService } from '@/services/MatchService'
import { walletService } from '@/services/WalletService'
import { formatEspoCoins } from '@/utils/espoCoin'
import type { Match } from '@/types/match'
import toast from 'react-hot-toast'

const PublicLobbies = () => {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [lobbies, setLobbies] = useState<Match[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'chess' | 'card29'>('all')

    useEffect(() => {
        loadLobbies()
        const interval = setInterval(loadLobbies, 5000) // Refresh every 5s
        return () => clearInterval(interval)
    }, [filter])

    const loadLobbies = async () => {
        try {
            const gameId = filter === 'all' ? undefined : filter
            const publicMatches = await matchService.getPublicLobbies(gameId)
            setLobbies(publicMatches)
        } catch (error) {
            if (import.meta.env.MODE !== 'production') {

                console.error('Error loading lobbies:', error);

            }
        } finally {
            setLoading(false)
        }
    }

    const handleJoinMatch = async (matchId: string, entryFee: number) => {
        if (!user) return

        try {
            // Check balance if paid
            if (entryFee > 0) {
                const wallet = await walletService.getWallet(user.id)
                if (wallet.espoCoins < entryFee) {
                    toast.error('Insufficient Espo Coins!')
                    return
                }

                // Deduct entry fee
                await walletService.deductEspoCoins(
                    entryFee,
                    user.id,
                    `Entry fee for match`,
                    { matchId }
                )
            }

            // Join match
            await matchService.joinMatch({
                matchId,
                userId: user.id,
                userName: user.displayName || 'Player',
                userAvatar: user.photoURL || ''
            })

            toast.success('Joined match!')
            navigate(`/play/match/${matchId}`)
        } catch (error) {
            if (import.meta.env.MODE !== 'production') {

                console.error('Error joining match:', error);

            }
            toast.error(error instanceof Error ? error.message : 'Failed to join match')
        }
    }

    const getTimeRemaining = (expiresAt: string) => {
        const expires = new Date(expiresAt)
        const now = new Date()
        const diff = expires.getTime() - now.getTime()

        if (diff <= 0) return 'Expired'

        const minutes = Math.floor(diff / 60000)
        return `${minutes}m left`
    }

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] pb-24 lg:pb-8">
            <div className="max-w-5xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/play')}
                        className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Play
                    </button>
                    <h1 className="text-3xl font-black mb-2">Public Lobbies</h1>
                    <p className="text-[var(--text-secondary)]">Join an open match or create your own</p>
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg font-bold transition-all ${filter === 'all'
                            ? 'bg-[var(--accent)] text-[var(--bg-primary)]'
                            : 'bg-[var(--glass)] border border-[var(--border)]'
                            }`}
                    >
                        All Games
                    </button>
                    <button
                        onClick={() => setFilter('chess')}
                        className={`px-4 py-2 rounded-lg font-bold transition-all ${filter === 'chess'
                            ? 'bg-[var(--accent)] text-[var(--bg-primary)]'
                            : 'bg-[var(--glass)] border border-[var(--border)]'
                            }`}
                    >
                        Chess
                    </button>
                    <button
                        onClick={() => setFilter('card29')}
                        className={`px-4 py-2 rounded-lg font-bold transition-all ${filter === 'card29'
                            ? 'bg-[var(--accent)] text-[var(--bg-primary)]'
                            : 'bg-[var(--glass)] border border-[var(--border)]'
                            }`}
                    >
                        29 Card Game
                    </button>
                </div>

                {/* Lobbies List */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent)]"></div>
                    </div>
                ) : lobbies.length === 0 ? (
                    <div className="text-center py-16">
                        <Search className="w-16 h-16 mx-auto mb-4 text-[var(--text-secondary)] opacity-30" />
                        <h3 className="text-xl font-bold mb-2">No public lobbies</h3>
                        <p className="text-[var(--text-secondary)] mb-6">Be the first to create one!</p>
                        <button
                            onClick={() => navigate('/play')}
                            className="px-6 py-3 bg-[var(--accent)] text-[var(--bg-primary)] font-bold rounded-lg hover:bg-[var(--accent)]/90 transition-all"
                        >
                            Create Match
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {lobbies.map((lobby, idx) => (
                            <motion.div
                                key={lobby.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="p-6 bg-[var(--glass)] rounded-xl border border-[var(--border)] hover:border-[var(--accent)]/30 transition-all"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--accent)] to-purple-500 flex items-center justify-center text-2xl">
                                                {lobby.gameId === 'chess' ? '♟️' : '🃏'}
                                            </div>
                                            <div>
                                                <h3 className="font-black text-lg">{lobby.gameName}</h3>
                                                <p className="text-sm text-[var(--text-secondary)]">
                                                    by {lobby.creatorName}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-4 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4 text-[var(--text-secondary)]" />
                                                <span>{lobby.players.length}/{lobby.maxPlayers} players</span>
                                            </div>

                                            {lobby.mode === 'paid' ? (
                                                <div className="flex items-center gap-2">
                                                    <Zap className="w-4 h-4 text-[var(--accent)]" />
                                                    <span className="font-bold text-[var(--accent)]">
                                                        {formatEspoCoins(lobby.entryFee)} Entry
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-bold">
                                                        FREE
                                                    </span>
                                                </div>
                                            )}

                                            <div className="text-[var(--text-secondary)]">
                                                {lobby.expiresAt ? getTimeRemaining(lobby.expiresAt) : 'No limit'}
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleJoinMatch(lobby.id, lobby.entryFee)}
                                        className="px-6 py-3 bg-[var(--accent)] text-[var(--bg-primary)] font-bold rounded-lg hover:bg-[var(--accent)]/90 transition-all whitespace-nowrap"
                                    >
                                        Join Match
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default PublicLobbies
