import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { ArrowLeft, Users, Lock, Globe } from 'lucide-react'
import { matchService } from '@/services/MatchService'
import { walletService } from '@/services/WalletService'
import { formatEspoCoins, inrToEspo } from '@/utils/espoCoin'
import type { Wallet } from '@/types'
import toast from 'react-hot-toast'

const CreateMatch = () => {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [searchParams] = useSearchParams()

    const gameId = searchParams.get('game') as 'chess' | 'card29' || 'chess'
    const mode = searchParams.get('mode') as 'free' | 'paid' || 'free'

    const [wallet, setWallet] = useState<Wallet | null>(null)
    const [visibility, setVisibility] = useState<'public' | 'private'>('public')
    const [withBots, setWithBots] = useState(false)
    const [entryFee, setEntryFee] = useState(0)
    const [timeControl, setTimeControl] = useState(600) // Default 10 mins
    const [loading, setLoading] = useState(false)

    const gameName = gameId === 'chess' ? 'Chess' : '29 Card Game'
    const maxPlayers = gameId === 'chess' ? 2 : 4

    // Preset entry amounts in INR
    const presets = [10, 50, 100, 500]

    useEffect(() => {
        if (!user) return
        const loadWallet = async () => {
            const w = await walletService.getWallet(user.id)
            setWallet(w)
        }
        loadWallet()
    }, [user])

    const handleCreate = async () => {
        if (!user) return

        setLoading(true)
        try {
            // Convert INR to Espo Coins if paid mode
            const entryFeeEC = mode === 'paid' ? inrToEspo(entryFee) : 0

            // Check balance
            if (mode === 'paid' && wallet && wallet.espoCoins < entryFeeEC) {
                toast.error('Insufficient Espo Coins!')
                setLoading(false)
                return
            }

            // Deduct coins if paid
            if (mode === 'paid' && entryFeeEC > 0) {
                await walletService.deductEspoCoins(
                    entryFeeEC,
                    user.id,
                    `Entry fee for ${gameName} match`,
                    { matchType: mode }
                )
            }

            // Create match
            const match = await matchService.createMatch(
                {
                    gameId,
                    mode,
                    visibility,
                    entryFee: entryFeeEC,
                    maxPlayers,
                    withBots,
                    timeControl
                },
                user.id,
                user.displayName || 'Player',
                user.photoURL || ''
            )

            toast.success('Match created!')
            navigate(`/play/match/${match.id}`)
        } catch (error) {
            if (import.meta.env.MODE !== 'production') {

                console.error('Error creating match:', error);

            }
            toast.error(error instanceof Error ? error.message : 'Failed to create match')
        } finally {
            setLoading(false)
        }
    }

    const calculatePrize = () => {
        const entryFeeEC = inrToEspo(entryFee)
        const totalPool = entryFeeEC * maxPlayers
        const platformFee = totalPool * 0.1
        return totalPool - platformFee
    }

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] pb-24 lg:pb-8">
            <div className="max-w-2xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/play')}
                        className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Play
                    </button>
                    <h1 className="text-3xl font-black mb-2">Create Match</h1>
                    <p className="text-[var(--text-secondary)]">
                        {gameName} • {mode === 'free' ? 'Free Play' : 'Paid Play'}
                    </p>
                </div>

                {/* Form */}
                <div className="space-y-6">
                    {/* Visibility */}
                    <div>
                        <label className="block text-sm font-bold mb-3">Match Visibility</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setVisibility('public')}
                                className={`p-4 rounded-xl border-2 transition-all ${visibility === 'public'
                                    ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                                    : 'border-[var(--border)] hover:border-[var(--accent)]/30'
                                    }`}
                            >
                                <Globe className="w-6 h-6 mb-2 mx-auto" />
                                <p className="font-bold text-sm">Public Lobby</p>
                                <p className="text-xs text-[var(--text-secondary)] mt-1">
                                    Anyone can join
                                </p>
                            </button>
                            <button
                                onClick={() => setVisibility('private')}
                                className={`p-4 rounded-xl border-2 transition-all ${visibility === 'private'
                                    ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                                    : 'border-[var(--border)] hover:border-[var(--accent)]/30'
                                    }`}
                            >
                                <Lock className="w-6 h-6 mb-2 mx-auto" />
                                <p className="font-bold text-sm">Private Invite</p>
                                <p className="text-xs text-[var(--text-secondary)] mt-1">
                                    Share link to invite
                                </p>
                            </button>
                        </div>
                    </div>

                    {/* Time Control */}
                    <div>
                        <label className="block text-sm font-bold mb-3">Time Control</label>
                        <div className="grid grid-cols-4 gap-2">
                            {[300, 600, 1800, 3600].map((seconds) => (
                                <button
                                    key={seconds}
                                    onClick={() => setTimeControl(seconds)}
                                    className={`p-3 rounded-xl border transition-all text-sm font-bold ${timeControl === seconds
                                        ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                                        : 'border-[var(--border)] hover:border-[var(--accent)]/30'
                                        }`}
                                >
                                    {seconds / 60}m
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bot Option (Free Play Only) */}
                {mode === 'free' && (
                    <div className="p-4 bg-[var(--glass)] rounded-lg border border-[var(--border)]">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-bold flex items-center gap-2">
                                    <span className="text-xl">🤖</span>
                                    {gameId === 'chess' ? 'Play vs Computer' : 'Allow Bots'}
                                </p>
                                <p className="text-sm text-[var(--text-secondary)] mt-1">
                                    {gameId === 'chess'
                                        ? 'Challenge our chess engine'
                                        : 'Fill empty slots with bots'}
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={withBots}
                                    onChange={(e) => setWithBots(e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)]"></div>
                            </label>
                        </div>
                    </div>
                )}

                {/* Paid Play Bot Warning */}
                {mode === 'paid' && (
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start gap-3 mb-6">
                        <span className="text-xl">⚠️</span>
                        <div>
                            <p className="font-bold text-yellow-400">Real Players Only</p>
                            <p className="text-xs text-[var(--text-secondary)] mt-1">
                                Bots are strictly forbidden in paid matches.
                            </p>
                        </div>
                    </div>
                )}

                {/* Entry Fee (Paid only) */}
                {mode === 'paid' && (
                    <div>
                        <label className="block text-sm font-bold mb-3">Entry Amount</label>
                        <div className="grid grid-cols-4 gap-2 mb-3">
                            {presets.map((amount) => (
                                <button
                                    key={amount}
                                    onClick={() => setEntryFee(amount)}
                                    className={`py-3 rounded-lg font-bold transition-all ${entryFee === amount
                                        ? 'bg-[var(--accent)] text-[var(--bg-primary)]'
                                        : 'bg-[var(--glass)] border border-[var(--border)] hover:border-[var(--accent)]'
                                        }`}
                                >
                                    ₹{amount}
                                </button>
                            ))}
                        </div>
                        <div className="p-4 bg-[var(--glass)] rounded-lg border border-[var(--border)]">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-[var(--text-secondary)]">Entry Fee (You)</span>
                                <span className="font-bold">{formatEspoCoins(inrToEspo(entryFee))}</span>
                            </div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-[var(--text-secondary)]">Prize Pool</span>
                                <span className="font-bold">{formatEspoCoins(inrToEspo(entryFee) * maxPlayers)}</span>
                            </div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-[var(--text-secondary)]">Platform Fee (10%)</span>
                                <span className="font-bold text-red-400">
                                    -{formatEspoCoins(inrToEspo(entryFee) * maxPlayers * 0.1)}
                                </span>
                            </div>
                            <div className="border-t border-[var(--border)] mt-2 pt-2">
                                <div className="flex justify-between text-base">
                                    <span className="font-bold">Winner Gets</span>
                                    <span className="font-black text-[var(--accent)]">
                                        {formatEspoCoins(calculatePrize())}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Balance Check */}
                        {wallet && (
                            <div className="mt-3 p-3 bg-[var(--glass)] rounded-lg border border-[var(--border)] flex justify-between items-center">
                                <span className="text-sm text-[var(--text-secondary)]">Your Balance</span>
                                <span className={`font-bold ${wallet.espoCoins >= inrToEspo(entryFee) ? 'text-[var(--accent)]' : 'text-red-400'}`}>
                                    {formatEspoCoins(wallet.espoCoins)}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* Match Info */}
                <div className="p-4 bg-[var(--glass)] rounded-lg border border-[var(--border)]">
                    <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-[var(--text-secondary)]" />
                        <span className="text-sm text-[var(--text-secondary)]">Players</span>
                    </div>
                    <p className="font-bold">{maxPlayers} Players</p>
                </div>

                {/* Create Button */}
                <button
                    onClick={handleCreate}
                    disabled={loading || (mode === 'paid' && (entryFee === 0 || !wallet || wallet.espoCoins < inrToEspo(entryFee)))}
                    className="w-full py-4 bg-[var(--accent)] text-[var(--bg-primary)] font-black rounded-xl hover:bg-[var(--accent)]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(0,255,194,0.3)]"
                >
                    {loading ? 'Creating...' : mode === 'paid' ? `Lock ${formatEspoCoins(inrToEspo(entryFee))} & Create Match` : 'Create Free Match'}
                </button>
            </div>
        </div >
    )
}

export default CreateMatch
