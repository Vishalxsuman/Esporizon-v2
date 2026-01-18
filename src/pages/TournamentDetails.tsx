import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { Tournament, TournamentParticipant, RoomDetails } from '../types/tournament'
import { tournamentService } from '../services/TournamentService'
import toast, { Toaster } from 'react-hot-toast'
import { Calendar, Users, Trophy, DollarSign, Clock, MapPin, ArrowLeft, Shield, Eye } from 'lucide-react'
import RoomDetailsModal from '../components/RoomDetailsModal'
import JoinTournamentModal from '../components/JoinTournamentModal'
import TournamentChatRoom from '../components/TournamentChatRoom'

const TournamentDetails = () => {
    const { id } = useParams<{ id: string }>()
    const { user } = useAuth()
    const [tournament, setTournament] = useState<Tournament | null>(null)
    const [participants, setParticipants] = useState<TournamentParticipant[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)
    const [hasJoined, setHasJoined] = useState(false)
    const [roomDetails, setRoomDetails] = useState<RoomDetails | null>(null)
    const [showRoomModal, setShowRoomModal] = useState(false)
    const [showJoinModal, setShowJoinModal] = useState(false)
    const navigate = useNavigate();

    // Load tournament data
    useEffect(() => {
        if (!id) return

        const fetchTournament = async () => {
            try {
                // In our migrated architecture, tournamentService returns static data
                const allTournaments = await tournamentService.getTournaments()
                const found = allTournaments.find((t: Tournament) => t.id === id)
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

        tournamentService.getParticipants(id).then((data: TournamentParticipant[]) => {
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

    // Check and load room details if tournament starts soon
    useEffect(() => {
        if (!tournament || !hasJoined) return

        const checkRoomAvailability = () => {
            const startTime = new Date(tournament.startDate).getTime()
            const now = new Date().getTime()
            const tenMinutes = 10 * 60 * 1000

            // Room details available 10 minutes before start
            if (startTime - now <= tenMinutes && startTime > now) {
                // Mock room details - replace with API call
                const mockRoom: RoomDetails = {
                    roomId: '123456789',
                    password: 'ESPO2026',
                    server: 'Asia',
                    map: tournament.mapMode || 'Bermuda',
                    specialInstructions: 'Join the room 5 minutes before match start. Follow tournament rules strictly.',
                    availableAt: new Date(startTime - tenMinutes),
                    isAvailable: true
                }
                setRoomDetails(mockRoom)
            }
        }

        checkRoomAvailability()
        const interval = setInterval(checkRoomAvailability, 30000) // Check every 30 seconds

        return () => clearInterval(interval)
    }, [tournament, hasJoined])

    const handleJoin = async (teamName: string, players: any[]) => {
        if (!user) {
            toast.error('Please sign in to join tournaments')
            return
        }

        if (!tournament) return

        setActionLoading(true)
        try {
            console.log('Joining tournament:', id, 'Team:', teamName, 'Players:', players)
            await tournamentService.joinTournament(id!, {
                teamName: teamName,
                players: players.map(p => ({
                    userId: user.id || user.uid || '',
                    userName: p.name,
                    role: p.role
                }))
            })

            toast.success('Successfully joined tournament!', {
                icon: '🎉',
                style: {
                    background: 'rgba(20, 184, 166, 0.1)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(20, 184, 166, 0.3)',
                    color: '#fff',
                },
            })

            setHasJoined(true)
            setShowJoinModal(false)
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
                    background: 'rgba(20, 184, 166, 0.1)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(20, 184, 166, 0.3)',
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
                style: {
                    background: 'rgba(255, 75, 43, 0.1)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 75, 43, 0.3)',
                    color: '#fff',
                },
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
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
            </div>
        )
    }

    const isFull = tournament.currentTeams >= tournament.maxTeams
    const deadline = tournament.registrationDeadline ?
        (typeof tournament.registrationDeadline === 'string' ? new Date(tournament.registrationDeadline) : new Date(tournament.registrationDeadline)) :
        new Date()
    const isDeadlinePassed = new Date() > deadline
    const canJoin = !hasJoined && !isFull && !isDeadlinePassed && tournament.status === 'upcoming'

    return (
        <div className="min-h-screen bg-black pb-24 animate-fadeIn bg-cyber-grid bg-fixed overflow-x-hidden">
            <Toaster position="top-center" />

            {/* Background Atmosphere Layers */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-teal-500/10 blur-[120px] opacity-50" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-cyan-600/5 blur-[100px] opacity-30" />
            </div>

            <div className="relative px-5 pt-8 pb-6 z-10 max-w-5xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <button
                        onClick={() => navigate(`/tournaments`)}
                        className="flex items-center gap-2 text-zinc-500 hover:text-white transition-all mb-7 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[11px] font-black uppercase tracking-[0.2em]">Exit Briefing</span>
                    </button>

                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[9px] font-black tracking-widest uppercase border ${tournament.status === 'live'
                                    ? 'bg-red-500/10 text-red-500 border-red-500/20 animate-pulse'
                                    : tournament.status === 'upcoming'
                                        ? 'bg-teal-500/10 text-teal-500 border-teal-500/20'
                                        : 'bg-zinc-800 text-zinc-500 border-white/10'
                                    }`}>
                                    <div className={`w-1 h-1 rounded-full ${tournament.status === 'live' ? 'bg-red-500' : 'bg-current'}`} />
                                    {tournament.status}
                                </div>
                                <div className="text-[9px] font-black text-teal-500 uppercase tracking-[0.3em]">
                                    {tournament.format} SYSTEM
                                </div>
                            </div>
                            <h1 className="text-4xl font-black text-white tracking-tighter italic leading-none">
                                {tournament.title.toUpperCase()}<span className="text-teal-500 italic text-5xl">.</span>
                            </h1>

                            {/* Host Info */}
                            <Link
                                to={`/host/${tournament.organizerId}`}
                                className="flex items-center gap-2 mt-3 w-fit px-3 py-1.5 rounded-lg bg-zinc-900/60 border border-white/5 hover:border-teal-500/30 transition-all group"
                            >
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 border border-teal-500/20 flex items-center justify-center text-[10px] font-black text-teal-400">
                                    {tournament.organizerName?.charAt(0).toUpperCase() || 'H'}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-zinc-400 group-hover:text-teal-400 uppercase tracking-wide transition-colors">
                                        Hosted by {tournament.organizerName}
                                    </p>
                                </div>
                                <Eye className="w-3 h-3 text-zinc-600 group-hover:text-teal-400 transition-colors" />
                            </Link>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3">
                            {/* Room Details Button (if available) */}
                            {roomDetails && hasJoined && (
                                <button
                                    onClick={() => setShowRoomModal(true)}
                                    className="relative group overflow-hidden bg-yellow-500 hover:bg-yellow-400 rounded-2xl px-8 py-4 shadow-[0_0_30px_rgba(234,179,8,0.3)] transition-all active:scale-[0.98] animate-pulse"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                    <span className="relative text-sm font-black tracking-[0.2em] text-black">VIEW ROOM DETAILS</span>
                                </button>
                            )}

                            {canJoin && (
                                <button
                                    onClick={() => setShowJoinModal(true)}
                                    disabled={actionLoading}
                                    className="relative group overflow-hidden bg-teal-500 hover:bg-teal-400 rounded-2xl px-8 py-4 shadow-[0_0_30px_rgba(20,184,166,0.3)] transition-all active:scale-[0.98]"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                    <span className="relative text-sm font-black tracking-[0.2em] text-black">
                                        {actionLoading ? 'JOINING...' : 'JOIN TOURNAMENT'}
                                    </span>
                                </button>
                            )}

                            {hasJoined && !isDeadlinePassed && (
                                <button
                                    onClick={handleLeave}
                                    disabled={actionLoading}
                                    className="relative group overflow-hidden bg-zinc-900 border border-white/10 rounded-2xl px-8 py-4 shadow-2xl transition-all active:scale-[0.98]"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                    <span className="relative text-sm font-black tracking-[0.2em] text-zinc-400 group-hover:text-red-400">
                                        {actionLoading ? 'ABORTING...' : 'ABORT DEPLOYMENT'}
                                    </span>
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Stats Cards - Glass Shelf Style */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                >
                    <DetailStat label="Bounty Pool" value={`₹${tournament.prizePool.toLocaleString('en-IN')}`} icon={<Trophy className="w-4 h-4" />} isAccent />
                    <DetailStat label="Entry Tax" value={`₹${tournament.entryFee}`} icon={<DollarSign className="w-4 h-4" />} />
                    <DetailStat label="Units" value={`${tournament.currentTeams}/${tournament.maxTeams}`} icon={<Users className="w-4 h-4" />} />
                    <DetailStat label="Engagements" value={tournament.totalMatches} icon={<Calendar className="w-4 h-4" />} />
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* About */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="relative rounded-[2.5rem] bg-zinc-900/40 backdrop-blur-3xl border border-white/5 p-8 shadow-2xl"
                        >
                            <h2 className="text-[10px] font-black text-teal-500 uppercase tracking-[0.4em] mb-6">Mission Briefing</h2>
                            <p className="text-zinc-400 font-bold text-sm leading-relaxed mb-8">{tournament.description}</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <InfoItem icon={<Calendar className="w-5 h-5" />} label="Launch Date" value={formatDate(tournament.startDate)} />
                                <InfoItem icon={<Clock className="w-5 h-5" />} label="Lockdown" value={formatDate(tournament.registrationDeadline)} />
                                <InfoItem icon={<MapPin className="w-5 h-5" />} label="Tactical Map" value={tournament.mapMode} />
                                <InfoItem icon={<Trophy className="w-5 h-5" />} label="Bounty Split" value={`${tournament.prizeDistribution.first}% / ${tournament.prizeDistribution.second}% / ${tournament.prizeDistribution.third}%`} />
                            </div>
                        </motion.div>

                        {/* Participants */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="relative rounded-[2.5rem] bg-zinc-900/40 backdrop-blur-3xl border border-white/5 p-8 shadow-2xl"
                        >
                            <h2 className="text-[10px] font-black text-teal-500 uppercase tracking-[0.4em] mb-6">Registered Units ({participants.length})</h2>

                            {participants.length === 0 ? (
                                <div className="text-center py-12 text-zinc-600">
                                    <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                    <p className="text-xs font-black tracking-widest uppercase">No units deployed yet</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {participants.map((participant, idx) => (
                                        <div
                                            key={participant.id}
                                            className="flex items-center justify-between p-4 bg-zinc-950/40 rounded-2xl border border-white/5 hover:border-teal-500/20 transition-all group/unit"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-950 border border-teal-500/20 flex items-center justify-center font-black text-teal-500 group-hover/unit:scale-110 transition-transform">
                                                    {idx + 1}
                                                </div>
                                                <div>
                                                    <p className="font-black text-white text-xs uppercase tracking-tight">
                                                        {participant.teamName || participant.players[0]?.userName || 'Unknown'}
                                                    </p>
                                                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">
                                                        {participant.players.length} UNIT {participant.players.length === 1 ? 'MEMBER' : 'MEMBERS'}
                                                    </p>
                                                </div>
                                            </div>

                                            {user?.uid === participant.players[0]?.userId && (
                                                <div className="px-2 py-1 rounded bg-teal-500 font-black text-[9px] text-black tracking-widest">
                                                    YOU
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Sidebar / Rules / Trust */}
                    <div className="space-y-6">
                        <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-[2rem] p-6">
                            <h3 className="text-[10px] font-black text-teal-500 uppercase tracking-[0.3em] mb-5">Engagement Rules</h3>
                            <ul className="space-y-4">
                                <RuleItem text="No emulators allowed" />
                                <RuleItem text="Room ID via App & SMS" />
                                <RuleItem text="Fair Play Monitoring active" />
                                <RuleItem text="15m pre-launch assembly" />
                            </ul>
                        </div>

                        <div className="bg-teal-500/5 backdrop-blur-md border border-teal-500/20 rounded-[2rem] p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Shield className="w-5 h-5 text-teal-500" />
                                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Secure Intel</h3>
                            </div>
                            <p className="text-[10px] text-zinc-400 font-bold leading-relaxed uppercase tracking-wide italic">
                                ALL MATCHES RECORDED. ADMINS VERIFY RESULTS BEFORE BOUNTY DISPERSAL.
                            </p>
                        </div>
                    </div>

                    {/* Tournament Chat Room - Only for joined tournaments */}
                    {hasJoined && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <h2 className="text-[10px] font-black text-teal-500 uppercase tracking-[0.4em]">
                                Tournament Chat
                            </h2>
                            <TournamentChatRoom
                                tournamentId={tournament.id}
                                tournamentName={tournament.title}
                                isAdmin={false}
                            />
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Room Details Modal */}
            {roomDetails && tournament && (
                <RoomDetailsModal
                    isOpen={showRoomModal}
                    onClose={() => setShowRoomModal(false)}
                    roomDetails={roomDetails}
                    tournamentName={tournament.title}
                    startTime={new Date(tournament.startDate)}
                />
            )}

            {/* Join Tournament Modal */}
            {tournament && (
                <JoinTournamentModal
                    isOpen={showJoinModal}
                    onClose={() => setShowJoinModal(false)}
                    tournament={tournament}
                    onJoin={handleJoin}
                />
            )}
        </div>
    )
}

// Helper Components
const DetailStat = ({ label, value, icon, isAccent }: { label: string, value: string | number, icon: React.ReactNode, isAccent?: boolean }) => (
    <div className="bg-zinc-950/40 backdrop-blur-md rounded-2xl p-5 border border-white/5 hover:border-teal-500/20 transition-all group/stat">
        <div className="flex items-center gap-2 mb-2 text-zinc-600 group-hover:text-teal-500/60 transition-colors">
            {icon}
            <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
        </div>
        <p className={`text-2xl font-black italic tracking-tighter ${isAccent ? 'text-teal-400 drop-shadow-[0_0_15px_rgba(20,184,166,0.3)]' : 'text-white'}`}>
            {value}
        </p>
    </div>
)

const InfoItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
    <div className="flex items-center gap-4 group/info">
        <div className="w-10 h-10 rounded-xl bg-zinc-950/50 border border-white/5 flex items-center justify-center text-teal-500 group-hover/info:scale-110 transition-transform">
            {icon}
        </div>
        <div>
            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-0.5">{label}</p>
            <p className="text-xs font-black text-zinc-300 uppercase tracking-tight">{value}</p>
        </div>
    </div>
)

const RuleItem = ({ text }: { text: string }) => (
    <li className="flex items-center gap-3">
        <div className="w-1 h-1 rounded-full bg-teal-500" />
        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wide">{text}</span>
    </li>
)

export default TournamentDetails
