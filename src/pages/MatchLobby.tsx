import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useUser } from '@clerk/clerk-react'
import { Users, Copy, Crown, Clock, ArrowLeft, Share2, Trash2 } from 'lucide-react'
import { matchService } from '@/services/MatchService'
import { formatEspoCoins } from '@/utils/espoCoin'
import type { Match } from '@/types/match'
import toast from 'react-hot-toast'

const MatchLobby = () => {
    const { id } = useParams<{ id: string }>()
    const { user } = useUser()
    const navigate = useNavigate()

    // Resolve User Identity (Auth or Guest)
    const [userId, setUserId] = useState<string | null>(null)
    useEffect(() => {
        if (user) {
            setUserId(user.id)
        } else {
            const stored = localStorage.getItem('guest_identity')
            if (stored) setUserId(JSON.parse(stored).id)
        }
    }, [user])
    const [match, setMatch] = useState<Match | null>(null)
    const [timeRemaining, setTimeRemaining] = useState('')

    useEffect(() => {
        if (!id) return

        // Listen to match updates in real-time
        const unsubscribe = matchService.listenToMatch(id, (updatedMatch) => {
            if (!updatedMatch) {
                toast.error('Match not found')
                navigate('/play')
                return
            }

            setMatch(updatedMatch)

            // Auto-redirect when match starts or becomes full (locked)
            if (updatedMatch.status === 'in_progress' || updatedMatch.status === 'locked') {
                // Small delay to let user see "Match Starting" message
                setTimeout(() => {
                    navigate(`/play/game/${id}`)
                }, 1500)
            }
        })

        return () => unsubscribe()
    }, [id, navigate])

    useEffect(() => {
        if (!match) return

        const interval = setInterval(() => {
            if (!match.expiresAt) return

            // Handle both ISO string and Firestore Timestamp
            const expires = (match.expiresAt as any).toDate
                ? (match.expiresAt as any).toDate()
                : new Date(match.expiresAt)

            const now = new Date()
            const diff = expires.getTime() - now.getTime()

            if (diff <= 0) {
                setTimeRemaining('Expired')
                clearInterval(interval)
            } else {
                const minutes = Math.floor(diff / 60000)
                const seconds = Math.floor((diff % 60000) / 1000)
                setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`)
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [match])

    const copyInviteLink = () => {
        if (!match?.inviteCode) return
        const link = `${window.location.origin}/play/join/${match.inviteCode}`
        navigator.clipboard.writeText(link)
        toast.success('Invite link copied!')
    }

    const handleLeaveMatch = async () => {
        if (!match || !userId) return
        toast.success('Left match')
        navigate('/play')
    }

    const isCreator = match?.creatorId === userId

    if (!match) {
        return (
            <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent)]"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] pb-24 lg:pb-8">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/play')}
                        className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Play
                    </button>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-black mb-2">Match Lobby</h1>
                            <p className="text-[var(--text-secondary)]">
                                {match.gameName} • {match.mode === 'free' ? 'Free Play' : `${formatEspoCoins(match.entryFee)} Entry`}
                            </p>
                        </div>
                        {match.status === 'waiting' && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                                <Clock className="w-4 h-4 text-yellow-400" />
                                <span className="text-sm font-bold text-yellow-400">{timeRemaining}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="p-6 bg-[var(--glass)] rounded-xl border border-[var(--border)]">
                        <Users className="w-8 h-8 text-[var(--accent)] mb-2" />
                        <p className="text-sm text-[var(--text-secondary)] mb-1">Players</p>
                        <p className="text-2xl font-black">{match.players.length}/{match.maxPlayers}</p>
                    </div>

                    {match.mode === 'paid' && (
                        <>
                            <div className="p-6 bg-[var(--glass)] rounded-xl border border-[var(--border)]">
                                <div className="text-2xl mb-2">💰</div>
                                <p className="text-sm text-[var(--text-secondary)] mb-1">Prize Pool</p>
                                <p className="text-2xl font-black text-[var(--accent)]">{formatEspoCoins(match.prizePool)}</p>
                            </div>

                            <div className="p-6 bg-[var(--glass)] rounded-xl border border-[var(--border)]">
                                <div className="text-2xl mb-2">🏆</div>
                                <p className="text-sm text-[var(--text-secondary)] mb-1">Winner Gets</p>
                                <p className="text-2xl font-black text-[var(--accent)]">{formatEspoCoins(match.winnerPrize)}</p>
                            </div>
                        </>
                    )}
                </div>

                <div className="mb-8">
                    <h2 className="text-xl font-black mb-4">Players</h2>
                    <div className="space-y-3">
                        {match.players.map((player, idx) => (
                            <motion.div
                                key={player.userId}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-4 bg-[var(--glass)] rounded-lg border border-[var(--border)] flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <img
                                        src={player.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.userId}`}
                                        className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent)] to-purple-500"
                                        alt=""
                                    />
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold">{player.userName}</p>
                                            {player.role === 'creator' && <Crown className="w-4 h-4 text-yellow-400" />}
                                            {player.isBot ? (
                                                <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-bold uppercase tracking-wide">
                                                    BOT
                                                </span>
                                            ) : (
                                                <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded font-bold uppercase tracking-wide">
                                                    HUMAN
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-[var(--text-secondary)]">
                                            {match.mode === 'paid' ? `${formatEspoCoins(player.coinsLocked)} locked` : 'Ready'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {player.userId === userId && (
                                        <span className="text-xs bg-[var(--accent)]/20 text-[var(--accent)] px-2 py-1 rounded">You</span>
                                    )}
                                    {isCreator && player.isBot && match.status === 'waiting' && (
                                        <button
                                            onClick={async () => {
                                                try {
                                                    await matchService.removeBotFromMatch(match.id, player.userId)
                                                    toast.success('Bot removed')
                                                } catch (error) {
                                                    toast.error('Failed to remove bot')
                                                }
                                            }}
                                            className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors group/remove"
                                            title="Remove Bot"
                                        >
                                            <Trash2 className="w-4 h-4 group-hover/remove:scale-110 transition-transform" />
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}

                        {Array.from({ length: match.maxPlayers - match.players.length }).map((_, idx) => (
                            <div
                                key={`empty-${idx}`}
                                className="p-4 bg-[var(--glass)]/30 rounded-lg border border-dashed border-[var(--border)] flex items-center gap-3 opacity-50"
                            >
                                <div className="w-10 h-10 rounded-full bg-[var(--glass)] flex items-center justify-center">
                                    <Users className="w-5 h-5 text-[var(--text-secondary)]" />
                                </div>
                                <p className="text-sm text-[var(--text-secondary)]">Waiting for player...</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    {/* Room Code Display (Always Valid) */}
                    {match.inviteCode && (
                        <div className="bg-[var(--glass)] p-6 rounded-xl border border-[var(--border)] mb-6 text-center">
                            <p className="text-sm text-[var(--text-secondary)] mb-2 uppercase tracking-widest font-bold">Room Code</p>
                            <div
                                onClick={() => {
                                    navigator.clipboard.writeText(match.inviteCode!)
                                    toast.success('Code copied!')
                                }}
                                className="text-4xl font-black font-mono tracking-[0.2em] text-[var(--accent)] cursor-pointer hover:scale-105 transition-transform select-all"
                            >
                                {match.inviteCode}
                            </div>
                            <p className="text-xs text-[var(--text-secondary)] mt-2">
                                Share this code with friends to let them join
                            </p>
                        </div>
                    )}

                    {match.inviteCode && (
                        <div className="flex gap-3">
                            <button
                                onClick={async () => {
                                    const link = `${window.location.origin}/play/join/${match.inviteCode}`
                                    const text = `Join my 🃏 29 Card Game room on Esporizon! Click to play:`
                                    if (navigator.share) {
                                        try {
                                            await navigator.share({
                                                title: `29 Card Game Room`,
                                                text: text,
                                                url: link
                                            })
                                        } catch (err) {
                                            copyInviteLink()
                                        }
                                    } else {
                                        copyInviteLink()
                                    }
                                }}
                                className="flex-1 py-4 bg-[var(--accent)] text-[var(--bg-primary)] rounded-xl font-black hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(0,255,194,0.3)]"
                            >
                                <Share2 className="w-5 h-5 font-black" />
                                SHARE ROOM
                            </button>
                            <button
                                onClick={copyInviteLink}
                                className="px-5 py-4 bg-[var(--glass)] border border-[var(--border)] rounded-xl font-bold hover:bg-[var(--glass-intense)] transition-all flex items-center justify-center"
                                title="Copy Link"
                            >
                                <Copy className="w-5 h-5" />
                            </button>
                        </div>
                    )}

                    {match.status === 'waiting' && (
                        <button
                            onClick={handleLeaveMatch}
                            className="w-full py-3 bg-red-500/20 border border-red-500/30 rounded-lg font-bold hover:bg-red-500/30 transition-all text-red-400"
                        >
                            Leave Match
                        </button>
                    )}

                    {match.status === 'locked' && (
                        <div className="p-4 bg-[var(--accent)]/10 border border-[var(--accent)]/30 rounded-lg text-center">
                            <p className="font-bold text-[var(--accent)]">Match is full! Starting game...</p>
                        </div>
                    )}

                    {/* Add Bot Button (Free Play & Creator Only) */}
                    {match.mode === 'free' && isCreator && match.status === 'waiting' && (
                        <button
                            onClick={async () => {
                                try {
                                    await matchService.addBotToMatch(match.id)
                                    toast.success('Bot added!')
                                } catch (error) {
                                    toast.error('Failed to add bot')
                                }
                            }}
                            className="w-full py-3 bg-blue-500/20 border border-blue-500/30 rounded-lg font-bold hover:bg-blue-500/30 transition-all text-blue-400 flex items-center justify-center gap-2"
                        >
                            <span className="text-xl">🤖</span>
                            Add Bot Player
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default MatchLobby
