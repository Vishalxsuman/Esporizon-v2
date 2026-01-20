import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Users, DollarSign, Info, Check, Shield, AlertTriangle, Lock, AlertCircle, X } from 'lucide-react'
import { Tournament } from '@/types/tournament'
import { useAuth } from '@/contexts/AuthContext'
import { useWallet } from '../contexts/WalletContext';
import { useNavigate } from 'react-router-dom'
import ProfileService from '@/services/ProfileService'
import toast from 'react-hot-toast'

interface JoinTournamentModalProps {
    isOpen: boolean
    onClose: () => void
    tournament: Tournament
    onJoin: (teamName: string, players: any[]) => Promise<void>
}

const JoinTournamentModal = ({ isOpen, onClose, tournament, onJoin }: JoinTournamentModalProps) => {
    const { user } = useAuth()
    const { balance } = useWallet()
    const navigate = useNavigate()
    const [step, setStep] = useState(1) // 1: Details, 2: Players, 3: Payment
    const [loading, setLoading] = useState(false)
    const [teamName, setTeamName] = useState('')
    const [players, setPlayers] = useState<{ name: string; role: string }[]>([])
    const [agreedToRules, setAgreedToRules] = useState(false)

    // Derived State
    const teamSize = tournament.teamSize || 1
    const isTeamTournament = teamSize > 1
    const isFree = tournament.entryFee === 0

    // Initialize players based on team size
    useEffect(() => {
        const initData = async () => {
            if (!isOpen || !user) return

            // Get profile data for the most accurate current details
            let currentProfile = null
            try {
                currentProfile = await ProfileService.getMyProfile(user.uid || user.id, user.id)
            } catch (err) {
                if (import.meta.env.MODE !== 'production') {

                    console.warn('Failed to fetch profile for pre-fill', err);

                }
            }

            // Determine initial name for player 1
            const gameType = tournament.gameId?.toLowerCase() || ''
            const gameIdFromProfile = currentProfile?.profile?.gameAccounts?.[gameType] || ''
            const fallbackName = currentProfile?.profile?.displayName || user?.displayName || ''
            const initialName = gameIdFromProfile || fallbackName

            const initialPlayers = Array(teamSize).fill(null).map((_, i) => ({
                name: i === 0 ? initialName : '',
                role: i === 0 ? 'Leader' : `Member ${i + 1}`
            }))
            setPlayers(initialPlayers)

            // Auto-fill team name if solo, or keep empty
            if (!isTeamTournament) {
                setTeamName(initialName || 'Solo Player')
            } else {
                setTeamName('')
            }
            setStep(1)
        }

        initData()
    }, [isOpen, teamSize, isTeamTournament, user, tournament])

    const handlePlayerChange = (index: number, name: string) => {
        const updated = [...players]
        updated[index].name = name
        setPlayers(updated)
    }

    const canProceedToPlayers = isTeamTournament ? teamName.trim().length > 0 : true
    const canProceedToPayment = players.every(p => p.name.trim().length > 0) && agreedToRules

    const handlePayment = async () => {
        if (!tournament) return

        if (tournament.entryFee > 0 && balance < tournament.entryFee) {
            toast.error("Insufficient balance! Please add money to your wallet.")
            return
        }

        setLoading(true)
        try {
            await onJoin(teamName, players)
            toast.success("Successfully joined tournament!")
            onClose()
        } catch (error: any) {
            if (import.meta.env.MODE !== 'production') {

                console.error('Join failed:', error);

            }
            toast.error(error.message || 'Join failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const formatLabel = isTeamTournament ? (teamSize === 2 ? 'DUO' : 'SQUAD') : 'SOLO'

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-auto">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="relative bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border-b border-white/5 p-6 shrink-0">
                            <button
                                onClick={onClose}
                                className="absolute top-6 right-6 w-8 h-8 rounded-lg bg-zinc-800/50 border border-white/5 flex items-center justify-center hover:bg-zinc-800 transition-colors"
                            >
                                <X className="w-4 h-4 text-zinc-400" />
                            </button>

                            <h2 className="text-2xl font-black text-white italic pr-10 mb-1">
                                JOIN TOURNAMENT
                            </h2>
                            <p className="text-sm font-bold text-zinc-400 flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider bg-white/10 text-white`}>
                                    {formatLabel}
                                </span>
                                {tournament.title}
                            </p>

                            {/* Steps Indicator */}
                            <div className="flex items-center gap-2 mt-6">
                                {[1, 2, 3].map((s) => (
                                    <div key={s} className="flex items-center gap-2 flex-1">
                                        <div
                                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-colors ${step >= s ? 'bg-teal-500 text-black' : 'bg-zinc-800 text-zinc-500'
                                                }`}
                                        >
                                            {s}
                                        </div>
                                        <div className={`h-1 flex-1 rounded-full ${step >= s ? 'bg-teal-500' : 'bg-zinc-800'}`} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Content Area - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">

                            {/* Step 1: Info & Team Name */}
                            {step === 1 && (
                                <div className="space-y-6">
                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-zinc-800/30 rounded-xl p-4 border border-white/5">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Trophy className="w-4 h-4 text-teal-400" />
                                                <span className="text-xs font-black text-zinc-500 uppercase tracking-wider">Prize</span>
                                            </div>
                                            <p className="text-2xl font-black text-white">₹{(tournament.prizePool / 1000).toFixed(0)}K</p>
                                        </div>
                                        <div className="bg-zinc-800/30 rounded-xl p-4 border border-white/5">
                                            <div className="flex items-center gap-2 mb-1">
                                                <DollarSign className="w-4 h-4 text-teal-400" />
                                                <span className="text-xs font-black text-zinc-500 uppercase tracking-wider">Entry</span>
                                            </div>
                                            <p className="text-2xl font-black text-white">{isFree ? 'FREE' : `₹${tournament.entryFee}`}</p>
                                        </div>
                                    </div>

                                    {/* Team Name Input (Only if team tournament) */}
                                    {isTeamTournament ? (
                                        <div>
                                            <label className="text-sm font-black text-white uppercase tracking-wider mb-2 block">
                                                Team Name
                                            </label>
                                            <input
                                                type="text"
                                                value={teamName}
                                                onChange={(e) => setTeamName(e.target.value)}
                                                placeholder="Enter your team name (e.g. Delta Force)"
                                                className="w-full px-4 py-3 bg-zinc-800/50 border border-white/5 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-teal-500/30 transition-colors"
                                            />
                                            <p className="text-xs text-zinc-500 mt-2">This name will be displayed on the leaderboard.</p>
                                        </div>
                                    ) : (
                                        <div className="bg-teal-500/10 border border-teal-500/20 p-4 rounded-xl flex items-start gap-3">
                                            <Info className="w-5 h-5 text-teal-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-bold text-teal-100">Solo Tournament</p>
                                                <p className="text-xs text-teal-500/80 mt-1">You are registering as an individual player using your profile name.</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Rules */}
                                    <div className="bg-yellow-500/5 border border-yellow-500/20 p-4 rounded-xl">
                                        <h3 className="text-xs font-black text-yellow-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                            <AlertCircle className="w-3 h-3" />
                                            Important Info
                                        </h3>
                                        <ul className="text-xs text-zinc-400 space-y-1 list-disc list-inside">
                                            <li>Ensure all players verify their IGNs correctly.</li>
                                            <li>Room ID & Password will be shared 10 mins before start.</li>
                                            <li>Check-in is required 30 mins before match.</li>
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Player Details */}
                            {step === 2 && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-black text-white italic">PLAYER DETAILS</h3>
                                        <span className="text-xs font-bold text-zinc-500 bg-zinc-800 px-2 py-1 rounded">
                                            {players.length} / {teamSize} Filled
                                        </span>
                                    </div>

                                    <div className="space-y-4">
                                        {players.map((player, index) => (
                                            <div key={index} className="space-y-1">
                                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider ml-1">
                                                    {index === 0 ? 'Team Leader (You)' : `Player ${index + 1}`}
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        value={player.name}
                                                        onChange={(e) => handlePlayerChange(index, e.target.value)}
                                                        placeholder={index === 0 ? "Your In-Game Name" : "Teammate's In-Game Name"}
                                                        className="w-full px-4 py-3 bg-zinc-800/50 border border-white/10 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-teal-500/30 transition-colors pl-10"
                                                    />
                                                    <Users className="absolute left-3 top-3.5 w-4 h-4 text-zinc-600" />
                                                    {player.name.length > 0 && (
                                                        <Check className="absolute right-3 top-3.5 w-4 h-4 text-teal-500" />
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Agreement Checkbox */}
                                    <label className="flex items-start gap-3 p-4 rounded-xl bg-zinc-800/30 border border-white/5 cursor-pointer hover:bg-zinc-800/50 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={agreedToRules}
                                            onChange={(e) => setAgreedToRules(e.target.checked)}
                                            className="mt-1 w-4 h-4 rounded border-zinc-600 bg-zinc-700 checked:bg-teal-500 focus:ring-0"
                                        />
                                        <div className="text-xs text-zinc-400">
                                            I confirm that all provided In-Game Names (IGNs) are correct. Incorrect IGNs may lead to kick/disqualification from the room.
                                        </div>
                                    </label>
                                </div>
                            )}

                            {/* Step 3: Payment & Confirmation */}
                            {step === 3 && (
                                <div className="space-y-6">
                                    <div className="bg-zinc-800/30 border border-white/5 rounded-2xl p-6 space-y-4">
                                        <div className="flex justify-between items-center pb-4 border-b border-white/5">
                                            <span className="text-sm text-zinc-400">Entry Fee</span>
                                            <span className="text-xl font-bold text-white">{isFree ? 'FREE' : `₹${tournament.entryFee}`}</span>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-zinc-500">Wallet Balance</span>
                                                <span className="text-zinc-300">₹{balance}</span>
                                            </div>
                                            {!isFree && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-zinc-500">Deduction</span>
                                                    <span className="text-red-400">- ₹{tournament.entryFee}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                                            <span className="font-black text-white uppercase tracking-wider text-sm">New Balance</span>
                                            <span className={`text-xl font-black ${balance - tournament.entryFee < 0 ? 'text-red-500' : 'text-teal-400'}`}>
                                                ₹{Math.max(0, balance - tournament.entryFee)}
                                            </span>
                                        </div>
                                    </div>

                                    {tournament.entryFee > balance ? (
                                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
                                            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                                            <div>
                                                <h4 className="font-bold text-red-500 text-sm">Insufficient Funds</h4>
                                                <p className="text-xs text-red-400/80 mt-1">
                                                    You need ₹{tournament.entryFee - balance} more to join. Please add funds to your wallet.
                                                </p>
                                                <button
                                                    onClick={() => { onClose(); navigate('/wallet'); }}
                                                    className="mt-3 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-colors"
                                                >
                                                    Add Funds
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-teal-500/10 border border-teal-500/20 rounded-xl p-4 flex items-center gap-3">
                                            <Shield className="w-5 h-5 text-teal-400" />
                                            <p className="text-xs text-teal-200">
                                                Funds are secure and will be refunded if the tournament is cancelled.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer - Fixed Button Area */}
                        <div className="p-6 border-t border-white/5 bg-zinc-900 shrink-0 flex gap-3">
                            {step > 1 && (
                                <button
                                    onClick={() => setStep(step - 1)}
                                    className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-black text-xs uppercase tracking-widest text-white transition-colors"
                                >
                                    Back
                                </button>
                            )}

                            {step < 3 ? (
                                <button
                                    onClick={() => setStep(step + 1)}
                                    disabled={step === 1 ? !canProceedToPlayers : !canProceedToPayment}
                                    className="flex-1 py-3 bg-teal-500 hover:bg-teal-400 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed rounded-xl font-black text-xs uppercase tracking-widest text-black transition-all"
                                >
                                    Next Step
                                </button>
                            ) : (
                                <button
                                    onClick={handlePayment}
                                    disabled={loading || (tournament.entryFee > 0 && balance < tournament.entryFee)}
                                    className="flex-1 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed rounded-xl font-black text-xs uppercase tracking-widest text-black transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <span className="animate-pulse">Processing...</span>
                                    ) : (
                                        <>
                                            <Lock className="w-3 h-3" />
                                            {isFree ? 'Confirm & Join' : `Pay ₹${tournament.entryFee} & Join`}
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}

export default JoinTournamentModal
