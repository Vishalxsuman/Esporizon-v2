import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
// No motion import needed
import { useAuth } from '../contexts/AuthContext'
import { Tournament, TournamentParticipant, RoomDetails } from '../types/tournament'
import { tournamentService } from '../services/TournamentService'
import { useWallet } from '../contexts/WalletContext'
import toast, { Toaster } from 'react-hot-toast'
import {
    Trophy, Users,
    ArrowLeft, Shield, MessageSquare, Info, ListOrdered, ChevronRight, Clock, Map, Banknote
} from 'lucide-react'
import RoomDetailsModal from '../components/RoomDetailsModal'
import JoinTournamentModal from '../components/JoinTournamentModal'
import TournamentChatRoom from '../components/TournamentChatRoom'

const TournamentDetails = () => {
    const { id } = useParams<{ id: string }>()
    const { user } = useAuth()
    const { refreshWallet } = useWallet()
    const navigate = useNavigate()

    const [tournament, setTournament] = useState<Tournament | null>(null)
    const [participants, setParticipants] = useState<TournamentParticipant[]>([])
    const [loading, setLoading] = useState(true)
    const [hasJoined, setHasJoined] = useState(false)
    const [roomDetails, setRoomDetails] = useState<RoomDetails | null>(null)
    const [showRoomModal, setShowRoomModal] = useState(false)
    const [showJoinModal, setShowJoinModal] = useState(false)

    const [error, setError] = useState<string | null>(null)

    // Load tournament data
    useEffect(() => {
        if (!id) {
            navigate('/tournaments')
            return
        }
        fetchTournament()
    }, [id])

    const fetchTournament = async () => {
        try {
            setLoading(true)
            const data = await tournamentService.getTournament(id!)
            if (data) {
                setTournament(data)
                if (user && data.registeredPlayers?.includes(user.id)) {
                    setHasJoined(true)
                }
            } else {
                setError('Tournament Information Unavailable')
            }
        } catch (error) {
            if (import.meta.env.MODE !== 'production') {

                console.error('Fetch error:', error);

            }
            setError('Failed to load tournament data')
        } finally {
            setLoading(false)
        }
    }

    // Secondary join status check and participants load
    useEffect(() => {
        if (!id || !tournament) return

        const loadParticipants = async () => {
            try {
                const data = await tournamentService.getParticipants(id)
                setParticipants(data)
            } catch (e) {
                if (import.meta.env.MODE !== 'production') {

                    console.error('Failed to load participants', e);

                }
            }
        }
        loadParticipants()

        if (user) {
            tournamentService.getJoinStatus(id).then(res => {
                if (res.joined) setHasJoined(true)
            })
        }
    }, [id, user, tournament])

    // Room details polling
    useEffect(() => {
        if (!tournament || !hasJoined) return

        const checkRoom = async () => {
            const start = new Date(tournament.startDate).getTime()
            const now = Date.now()
            if (start - now <= 15 * 60 * 1000) { // 15 mins before
                try {
                    const details = await tournamentService.getRoomDetails(tournament.id)
                    if (details) setRoomDetails(details)
                } catch (e) { }
            }
        }

        checkRoom()
        const intv = setInterval(checkRoom, 30000)
        return () => clearInterval(intv)
    }, [tournament, hasJoined])

    const handleJoin = async (teamName: string, players: any) => {
        if (!user) return navigate('/auth')
        if (!tournament) return

        try {
            const result = await tournamentService.joinTournament(id!, {
                teamName,
                players: players.map((p: any) => ({
                    userId: user.id,
                    userName: p.name,
                    role: p.role
                }))
            })

            if (result?.alreadyJoined) {
                toast.success('Already registered!')
            } else {
                toast.success('Successfully joined!', { icon: '🚀' })
            }
            setHasJoined(true)
            setShowJoinModal(false)
            fetchTournament() // Refresh to get updated slot counts
            refreshWallet() // Refresh to updated balance (deducted by backend)
        } catch (error: any) {
            toast.error(error.message || 'Join failed')
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0e1a] flex flex-col items-center justify-center gap-6">
                <div className="relative">
                    <div className="w-16 h-16 border-2 border-teal-500/10 rounded-full" />
                    <div className="absolute inset-0 w-16 h-16 border-t-2 border-teal-500 rounded-full animate-spin" />
                </div>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Calibrating War Room...</p>
            </div>
        )
    }

    if (error || !tournament) {
        return (
            <div className="min-h-screen bg-[#0a0e1a] flex flex-col items-center justify-center p-8 text-center">
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-white/10 mb-6">
                    <Trophy className="w-10 h-10 text-zinc-600 grayscale" />
                </div>
                <h2 className="text-xl font-black italic text-white uppercase tracking-wider mb-2">{error || 'Tournament Not Found'}</h2>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest max-w-sm mb-8">
                    The requested combat arena could not be located in the archives.
                </p>
                <button
                    onClick={() => navigate('/tournaments')}
                    className="px-8 py-4 bg-teal-500 text-black font-black uppercase text-xs tracking-[0.2em] rounded-xl hover:bg-teal-400 transition-all"
                >
                    Return to Lobby
                </button>
            </div>
        )
    }

    const isFull = (tournament.currentTeams || 0) >= (tournament.maxTeams || 0)
    const canJoin = !hasJoined && !isFull && tournament.status !== 'completed'

    return (
        <div className="min-h-screen bg-[#0a0e1a] text-white pb-32 font-sans overflow-x-hidden selection:bg-teal-500/30">
            <Toaster />

            {/* Sticky Header */}
            <div className="sticky top-0 z-50 bg-[#0a0e1a]/80 backdrop-blur-xl border-b border-white/5 p-4 flex items-center justify-between">
                <button
                    onClick={() => navigate('/tournaments')}
                    className="p-2 hover:bg-white/5 rounded-xl transition-all group"
                >
                    <ChevronRight className="rotate-180 text-zinc-500 group-hover:text-white" size={24} />
                </button>
                <h1 className="text-sm font-black uppercase tracking-[0.3em] italic flex items-center gap-2">
                    <Shield size={18} className="text-teal-400" />
                    Combat Arena
                </h1>
                <div className="w-10 h-10" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-4 pt-10 space-y-12">

                {/* Hero Header Area */}
                <div className="space-y-8">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="px-3 py-1 bg-teal-500/10 border border-teal-500/20 rounded-full text-[9px] font-black text-teal-400 uppercase tracking-widest shadow-lg">
                            {tournament.gameName}
                        </div>
                        <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-lg ${tournament.status === 'live' ? 'bg-red-500/10 text-red-500 border-red-500/20 animate-pulse' :
                            tournament.status === 'completed' ? 'bg-zinc-800 text-zinc-500 border-white/5' :
                                'bg-teal-500/10 text-teal-400 border-teal-500/20'
                            }`}>
                            {tournament.status}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter leading-none text-white drop-shadow-2xl">
                            {tournament.title.toUpperCase()}<span className="text-teal-500 italic">.</span>
                        </h1>
                        <p className="text-zinc-500 font-bold text-base md:text-lg max-w-2xl leading-relaxed italic">
                            {tournament.description}
                        </p>
                    </div>

                    {/* Stats Hero Bar */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-[#0E1424] to-[#0a0e1a] p-8 rounded-[2.5rem] border border-white/5 shadow-3xl">
                        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 md:divide-x divide-white/5">
                            <div className="space-y-2">
                                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 block">Total Bounty</span>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
                                        <Trophy className="w-5 h-5 text-teal-400" />
                                    </div>
                                    <span className="text-4xl font-black italic tracking-tighter text-teal-400">₹{tournament.prizePool.toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="md:pl-8 space-y-2">
                                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 block">Entry Fee</span>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                                        <Banknote className="w-5 h-5 text-zinc-400" />
                                    </div>
                                    <span className="text-4xl font-black italic tracking-tighter text-white">
                                        {tournament.entryFee === 0 ? 'FREE' : `₹${tournament.entryFee}`}
                                    </span>
                                </div>
                            </div>
                            <div className="md:pl-8 space-y-2">
                                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 block">Squad Slots</span>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                                        <Users className="w-5 h-5 text-zinc-400" />
                                    </div>
                                    <span className="text-4xl font-black italic tracking-tighter text-white">{tournament.currentTeams}<span className="text-zinc-700 mx-1">/</span>{tournament.maxTeams}</span>
                                </div>
                            </div>
                        </div>
                        {/* Glowing Background Effect */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 blur-[100px] -mr-32 -mt-32 rounded-full pointer-events-none" />
                    </div>
                </div>

                {/* Primary Actions Area */}
                <div className="flex flex-col gap-4">
                    {canJoin && (
                        <button
                            onClick={() => setShowJoinModal(true)}
                            className="w-full py-6 bg-white text-black font-black text-sm uppercase tracking-[0.2em] rounded-[1.5rem] hover:bg-teal-400 transition-all shadow-[0_10px_40px_rgba(255,255,255,0.1)] active:scale-[0.98] flex items-center justify-center gap-4"
                        >
                            Deploy Unit to Battlefield <ArrowLeft className="w-4 h-4 rotate-180" />
                        </button>
                    )}

                    {hasJoined && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {roomDetails && (
                                <button
                                    onClick={() => setShowRoomModal(true)}
                                    className="w-full py-5 bg-yellow-500 text-black font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-yellow-400 transition-all shadow-xl animate-pulse flex items-center justify-center gap-3 border-4 border-yellow-500/20"
                                >
                                    <Shield className="w-5 h-5" /> View Secret Credentials
                                </button>
                            )}
                            <button
                                onClick={() => document.getElementById('chat-section')?.scrollIntoView({ behavior: 'smooth' })}
                                className="w-full py-5 bg-[#0E1424] border border-white/5 text-teal-400 font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-[#162036] transition-all flex items-center justify-center gap-3"
                            >
                                <MessageSquare className="w-5 h-5" /> Combat Audio / Chat
                            </button>
                        </div>
                    )}

                    {isFull && !hasJoined && (
                        <div className="w-full py-6 bg-zinc-900 border border-red-500/20 text-red-500/50 font-black text-sm uppercase tracking-widest rounded-[1.5rem] text-center italic">
                            Combat Capacity Maxed • Extraction Closed
                        </div>
                    )}
                </div>

                {/* Secondary Tactical Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-8 bg-[#0E1424]/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] space-y-6">
                        <div className="flex items-center gap-3 text-teal-400">
                            <Info className="w-4 h-4" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em]">Intel Briefing</h3>
                        </div>
                        <div className="space-y-4">
                            <DetailRow label="Strategic Objective" value={tournament.format} icon={<Users size={12} />} />
                            <DetailRow label="Area of Operation" value={tournament.mapMode} icon={<Map size={12} />} />
                            <DetailRow label="Deployment Time" value={new Date(tournament.startDate).toLocaleTimeString()} icon={<Clock size={12} />} />
                        </div>
                    </div>

                    <div className="p-8 bg-[#0E1424]/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] space-y-6">
                        <div className="flex items-center gap-3 text-teal-400">
                            <Trophy className="w-4 h-4" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em]">Strategic Support</h3>
                        </div>
                        <ul className="space-y-4">
                            <GuidelineItem text="Fair play protocol strictly enforced" />
                            <GuidelineItem text="Voice comms available post-join" />
                            <GuidelineItem text="Direct access to verified hosts" />
                        </ul>
                    </div>
                </div>

                {/* Communications Sector */}
                <section id="chat-section" className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3 text-zinc-500">
                            <MessageSquare className="w-4 h-4" />
                            <h2 className="text-[10px] font-black uppercase tracking-[0.4em]">Secure Sector Comms</h2>
                        </div>
                        {hasJoined && <span className="text-[9px] font-black text-teal-500 uppercase tracking-widest flex items-center gap-1.5 animation-pulse">
                            <div className="w-1.5 h-1.5 rounded-full bg-teal-500" /> Live Feed
                        </span>}
                    </div>

                    {hasJoined ? (
                        <div className="rounded-[2.5rem] overflow-hidden border border-white/5">
                            <TournamentChatRoom
                                tournamentId={tournament.id}
                                tournamentName={tournament.title}
                                isAdmin={user?.id === tournament.organizerId}
                            />
                        </div>
                    ) : (
                        <div className="p-20 text-center bg-[#0E1424]/40 border border-dashed border-white/10 rounded-[2.5rem] group hover:border-teal-500/20 transition-all">
                            <div className="relative w-16 h-16 mx-auto mb-6">
                                <Shield className="w-full h-full text-zinc-900 group-hover:text-teal-900 transition-colors" />
                                <LockIcon className="absolute inset-0 m-auto w-6 h-6 text-zinc-800" />
                            </div>
                            <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-2">Sector Restricted</h3>
                            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Authenticated deployment required for comms access</p>
                        </div>
                    )}
                </section>

                {/* Participants Manifest */}
                <section className="space-y-8 pb-20">
                    <div className="flex items-center gap-3 text-zinc-500 px-2">
                        <ListOrdered className="w-4 h-4" />
                        <h2 className="text-[10px] font-black uppercase tracking-[0.4em]">Active Combat Units ({participants.length})</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {participants.map((p, idx) => (
                            <div key={idx} className="p-5 bg-[#0E1424]/40 border border-white/5 rounded-3xl flex items-center justify-between group hover:border-teal-500/30 transition-all duration-500">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center font-black text-zinc-600 group-hover:text-teal-400 group-hover:bg-teal-500/10 transition-all font-black text-lg italic">
                                        {String(idx + 1).padStart(2, '0')}
                                    </div>
                                    <div>
                                        <p className="font-black text-base italic tracking-tighter text-white uppercase group-hover:text-teal-400 transition-colors">
                                            {p.teamName || p.players?.[0]?.userName || 'Operator'}
                                        </p>
                                        <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] mt-1">Status: Operational</p>
                                    </div>
                                </div>
                                {user?.id === p.players?.[0]?.userId && (
                                    <div className="px-4 py-1.5 bg-teal-500 text-black font-black text-[9px] rounded-xl uppercase tracking-widest shadow-lg">Your Unit</div>
                                )}
                            </div>
                        ))}
                        {participants.length === 0 && (
                            <div className="col-span-full py-20 bg-white/5 rounded-[2.5rem] border border-dashed border-white/5 text-center">
                                <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.5em]">Scanning for biological signals...</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {/* Modals with premium spacing */}
            {showRoomModal && roomDetails && (
                <RoomDetailsModal
                    isOpen={showRoomModal}
                    onClose={() => setShowRoomModal(false)}
                    roomDetails={roomDetails}
                    tournamentName={tournament.title}
                    startTime={new Date(tournament.startDate)}
                />
            )}
            {showJoinModal && (
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

// Optimized Subcomponents
const DetailRow = ({ label, value, icon }: any) => (
    <div className="flex justify-between items-center py-4 border-b border-white/5 last:border-0 group">
        <div className="flex items-center gap-3">
            <span className="text-zinc-700 group-hover:text-teal-500/50 transition-colors">{icon}</span>
            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{label}</span>
        </div>
        <span className="text-[11px] font-black text-zinc-300 uppercase tracking-tight italic">{value}</span>
    </div>
)

const GuidelineItem = ({ text }: any) => (
    <li className="flex items-center gap-4 group">
        <div className="w-1.5 h-1.5 rounded-full bg-teal-500/30 group-hover:bg-teal-500 transition-colors" />
        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider group-hover:text-zinc-300 transition-colors leading-relaxed italic">{text}</span>
    </li>
)

const LockIcon = (props: any) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
)

export default TournamentDetails
