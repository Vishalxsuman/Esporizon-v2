import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { Tournament, TournamentParticipant } from '@/types/tournament'
import { tournamentService } from '@/services/TournamentService'
import toast, { Toaster } from 'react-hot-toast'
import { Calendar, Users, Trophy, DollarSign, Clock, MapPin } from 'lucide-react'

const TournamentDetails = () => {
    const { id } = useParams<{ id: string }>()
    const { user } = useAuth()
    const [tournament, setTournament] = useState<Tournament | null>(null)
    const [participants, setParticipants] = useState<TournamentParticipant[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)
    const [hasJoined, setHasJoined] = useState(false)

    // Load tournament data
    useEffect(() => {
        if (!id) return

        const fetchTournament = async () => {
            try {
                // In our migrated architecture, tournamentService returns static data
                const allTournaments = await tournamentService.getTournaments()
                const found = allTournaments.find(t => t.id === id)
                if (found) {
                    setTournament(found)
                }
            } catch (error) {
                console.error('Failed to load tournament:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchTournament()
    }, [id])

    // Load participants
    useEffect(() => {
        if (!id) return

        tournamentService.getParticipants(id).then((data) => {
            setParticipants(data)
            // Check if current user has joined
            if (user) {
                const joined = data.some(p =>
                    p.players.some(player => player.userId === user.uid)
                )
                setHasJoined(joined)
            }
        })
    }, [id, user])

    const handleJoin = async () => {
        if (!user) {
            toast.error('Please sign in to join tournaments')
            return
        }

        if (!tournament) return

        // Prompt for Team Name (Optional but good for UX)
        const teamName = window.prompt('Enter your Team Name (Optional):', user.displayName || 'My Team')

        setActionLoading(true)
        try {
            console.log('Joining tournament:', id, 'User:', user.uid)
            await tournamentService.joinTournament(id!, {
                teamName: teamName || (user.displayName ? `${user.displayName}'s Team` : 'Anonymous Team'),
                players: [{ userId: user.uid, userName: user.displayName || 'Unknown', role: 'leader' }]
            })

            toast.success('Successfully joined tournament!', {
                icon: '🎉',
                style: {
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(0, 255, 194, 0.3)',
                    color: '#fff',
                },
            })

            setHasJoined(true)
            // Reload participants
            const data = await tournamentService.getParticipants(id!)
            setParticipants(data)
        } catch (error) {
            console.error('Join failed:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to join tournament', {
                icon: '❌',
                duration: 5000,
                style: {
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 75, 43, 0.3)',
                    color: '#fff',
                },
            })
        } finally {
            setActionLoading(false)
        }
    }

    const handleLeave = async () => {
        if (!user || !tournament) return

        const confirm = window.confirm('Are you sure you want to leave? Your entry fee will be refunded.')
        if (!confirm) return

        setActionLoading(true)
        try {
            await tournamentService.leaveTournament(id!)

            toast.success('Left tournament. Entry fee refunded.', {
                icon: '✅',
                style: {
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(0, 255, 194, 0.3)',
                    color: '#fff',
                },
            })

            setHasJoined(false)
            // Reload participants
            const data = await tournamentService.getParticipants(id!)
            setParticipants(data)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to leave tournament', {
                icon: '❌',
            })
        } finally {
            setActionLoading(false)
        }
    }

    const formatDate = (dateInput: any) => {
        if (!dateInput) return 'TBA'
        const date = typeof dateInput === 'string' ? new Date(dateInput) :
            (dateInput.toDate ? dateInput.toDate() : new Date(dateInput))

        return new Intl.DateTimeFormat('en-IN', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date)
    }

    if (loading || !tournament) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#09090b' }}>
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: '#00ffc2' }}></div>
            </div>
        )
    }

    const isFull = tournament.currentTeams >= tournament.maxTeams
    const deadline = tournament.registrationDeadline ?
        (typeof tournament.registrationDeadline === 'string' ? new Date(tournament.registrationDeadline) : tournament.registrationDeadline.toDate()) :
        new Date()
    const isDeadlinePassed = new Date() > deadline
    const canJoin = !hasJoined && !isFull && !isDeadlinePassed && tournament.status === 'upcoming'

    return (
        <div className="min-h-screen py-6 px-4" style={{ background: '#09090b' }}>
            <Toaster position="top-center" />

            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <Link to={`/tournaments/${tournament.gameId}`} className="text-sm text-gray-400 hover:text-white mb-2 inline-block">
                        ← Back to {tournament.gameName} Tournaments
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">{tournament.title}</h1>
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${tournament.status === 'upcoming' ? 'bg-blue-500/20 text-blue-400' :
                                    tournament.status === 'ongoing' ? 'bg-green-500/20 text-green-400' :
                                        'bg-gray-500/20 text-gray-400'
                                    }`}>
                                    {tournament.status.toUpperCase()}
                                </span>
                                <span className="text-sm font-medium uppercase" style={{ color: '#00ffc2' }}>
                                    {tournament.format}
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            {canJoin && (
                                <button
                                    onClick={handleJoin}
                                    disabled={actionLoading}
                                    className="px-6 py-3 rounded-lg font-bold transition-all disabled:opacity-50"
                                    style={{ background: 'linear-gradient(135deg, #00ffc2 0%, #7c3aed 100%)', color: '#09090b' }}
                                >
                                    {actionLoading ? 'Joining...' : `Join (₹${tournament.entryFee})`}
                                </button>
                            )}

                            {hasJoined && !isDeadlinePassed && (
                                <button
                                    onClick={handleLeave}
                                    disabled={actionLoading}
                                    className="px-6 py-3 glass-card-premium font-bold hover:bg-red-500/20 transition-all"
                                >
                                    {actionLoading ? 'Leaving...' : 'Leave Tournament'}
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Stats Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
                >
                    <div className="glass-card-premium">
                        <div className="flex items-center gap-2 mb-1">
                            <Trophy className="w-4 h-4" style={{ color: '#00ffc2' }} />
                            <p className="text-xs text-gray-400">Prize Pool</p>
                        </div>
                        <p className="text-2xl font-bold" style={{ color: '#00ffc2' }}>₹{tournament.prizePool.toLocaleString('en-IN')}</p>
                    </div>

                    <div className="glass-card-premium">
                        <div className="flex items-center gap-2 mb-1">
                            <DollarSign className="w-4 h-4" style={{ color: '#00ffc2' }} />
                            <p className="text-xs text-gray-400">Entry Fee</p>
                        </div>
                        <p className="text-2xl font-bold">₹{tournament.entryFee}</p>
                    </div>

                    <div className="glass-card-premium">
                        <div className="flex items-center gap-2 mb-1">
                            <Users className="w-4 h-4" style={{ color: '#00ffc2' }} />
                            <p className="text-xs text-gray-400">Teams</p>
                        </div>
                        <p className="text-2xl font-bold">{tournament.currentTeams}/{tournament.maxTeams}</p>
                    </div>

                    <div className="glass-card-premium">
                        <div className="flex items-center gap-2 mb-1">
                            <Calendar className="w-4 h-4" style={{ color: '#00ffc2' }} />
                            <p className="text-xs text-gray-400">Matches</p>
                        </div>
                        <p className="text-2xl font-bold">{tournament.totalMatches}</p>
                    </div>
                </motion.div>

                {/* About */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card-premium mb-6"
                >
                    <h2 className="text-xl font-bold mb-4">About</h2>
                    <p className="text-gray-300 mb-4">{tournament.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5" style={{ color: '#00ffc2' }} />
                            <div>
                                <p className="text-xs text-gray-400">Start Date</p>
                                <p className="font-semibold">{formatDate(tournament.startDate)}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5" style={{ color: '#00ffc2' }} />
                            <div>
                                <p className="text-xs text-gray-400">Registration Deadline</p>
                                <p className="font-semibold">{formatDate(tournament.registrationDeadline)}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5" style={{ color: '#00ffc2' }} />
                            <div>
                                <p className="text-xs text-gray-400">Map/Mode</p>
                                <p className="font-semibold">{tournament.mapMode}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Trophy className="w-5 h-5" style={{ color: '#00ffc2' }} />
                            <div>
                                <p className="text-xs text-gray-400">Prize Distribution</p>
                                <p className="font-semibold">
                                    {tournament.prizeDistribution.first}% / {tournament.prizeDistribution.second}% / {tournament.prizeDistribution.third}%
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Participants */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card-premium"
                >
                    <h2 className="text-xl font-bold mb-4">Participants ({participants.length})</h2>

                    {participants.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>No participants yet. Be the first to join!</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {participants.map((participant, idx) => (
                                <div
                                    key={participant.id}
                                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                                            style={{ background: 'linear-gradient(135deg, #00ffc2 0%, #7c3aed 100%)', color: '#09090b' }}>
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <p className="font-semibold">
                                                {participant.teamName || participant.players[0]?.userName || 'Unknown'}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {participant.players.length} {participant.players.length === 1 ? 'player' : 'players'}
                                            </p>
                                        </div>
                                    </div>

                                    {user?.uid === participant.players[0]?.userId && (
                                        <span className="px-2 py-1 rounded text-xs font-bold" style={{ background: '#00ffc2', color: '#09090b' }}>
                                            YOU
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    )
}

export default TournamentDetails
