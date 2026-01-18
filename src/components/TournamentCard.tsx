import { motion } from 'framer-motion'
import { Trophy, IndianRupee, Users, Clock, Calendar, Eye, Lock } from 'lucide-react'
import { Tournament } from '@/types/tournament'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

interface TournamentCardProps {
    tournament: Tournament
    index?: number
}

const TournamentCard = ({ tournament, index = 0 }: TournamentCardProps) => {
    const navigate = useNavigate()
    const { user } = useAuth()

    const getGameColor = (gameId: string) => {
        switch (gameId) {
            case 'freefire':
                return 'from-orange-500 to-red-500'
            case 'bgmi':
                return 'from-yellow-500 to-orange-500'
            case 'valorant':
                return 'from-red-500 to-pink-500'
            case 'minecraft':
                return 'from-green-500 to-emerald-500'
            default:
                return 'from-teal-500 to-cyan-500'
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'live':
                return {
                    bg: 'bg-red-500/10',
                    text: 'text-red-500',
                    border: 'border-red-500/20',
                    animate: 'animate-pulse'
                }
            case 'upcoming':
                return {
                    bg: 'bg-teal-500/10',
                    text: 'text-teal-500',
                    border: 'border-teal-500/20',
                    animate: ''
                }
            case 'completed':
                return {
                    bg: 'bg-zinc-800',
                    text: 'text-zinc-500',
                    border: 'border-white/10',
                    animate: ''
                }
            default:
                return {
                    bg: 'bg-teal-500/10',
                    text: 'text-teal-500',
                    border: 'border-teal-500/20',
                    animate: ''
                }
        }
    }

    // Check if user has already joined (mock - replace with real API check)
    const hasUserJoined = false // TODO: Check from backend

    // Check if tournament is full
    const isFull = tournament.currentTeams >= tournament.maxTeams

    // Determine button state and action
    const getButtonConfig = () => {
        // Completed tournaments
        if (tournament.status === 'completed') {
            return {
                text: 'View Results',
                color: 'bg-zinc-700 hover:bg-zinc-600',
                pulse: false,
                disabled: false,
                action: () => navigate(`/tournament/${tournament.id}/results`)
            }
        }

        // User already joined
        if (hasUserJoined) {
            return {
                text: 'View Match',
                color: 'bg-blue-600 hover:bg-blue-500',
                pulse: false,
                disabled: false,
                action: () => navigate(`/tournament/${tournament.id}`)
            }
        }

        // Tournament is full
        if (isFull) {
            return {
                text: 'Full',
                color: 'bg-zinc-800 cursor-not-allowed',
                pulse: false,
                disabled: true,
                action: () => { }
            }
        }

        // Live tournament - can still join
        if (tournament.status === 'live') {
            return {
                text: 'Join Match',
                color: 'bg-red-500 hover:bg-red-400',
                pulse: true,
                disabled: false,
                action: () => {
                    if (!user) {
                        navigate('/auth')
                    } else {
                        navigate(`/tournament/${tournament.id}`)
                    }
                }
            }
        }

        // Upcoming tournament - registration open
        return {
            text: 'Register Now',
            color: 'bg-teal-500 hover:bg-teal-400',
            pulse: false,
            disabled: false,
            action: () => {
                if (!user) {
                    navigate('/auth')
                } else {
                    navigate(`/tournament/${tournament.id}`)
                }
            }
        }
    }

    const buttonConfig = getButtonConfig()
    const statusStyle = getStatusColor(tournament.status)
    const slotPercentage = (tournament.currentTeams / tournament.maxTeams) * 100
    const isCompleted = tournament.status === 'completed'

    const handleCardClick = (e: React.MouseEvent) => {
        // Don't navigate if clicking on host badge or button
        const target = e.target as HTMLElement
        if (target.closest('.host-badge') || target.closest('button')) {
            return
        }

        if (tournament.status === 'completed') {
            navigate(`/tournament/${tournament.id}/results`)
        } else {
            navigate(`/tournament/${tournament.id}`)
        }
    }

    const handleHostClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        navigate(`/host/${tournament.organizerId}`)
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            onClick={handleCardClick}
            className={`relative rounded-2xl bg-gradient-to-br from-zinc-900/60 to-zinc-950/80 backdrop-blur-3xl border border-white/5 p-6 shadow-2xl cursor-pointer transition-all duration-300 hover:border-teal-500/30 group ${isCompleted ? 'opacity-70' : ''
                }`}
        >
            {/* Side Accent Bar */}
            <div
                className={`absolute left-0 top-6 bottom-6 w-1 rounded-r-full shadow-[0_0_10px_rgba(20,184,166,0.4)] opacity-60 group-hover:opacity-100 transition-opacity bg-gradient-to-b ${getGameColor(
                    tournament.gameId
                )}`}
            />

            {/* Header Section */}
            <div className="flex items-start justify-between mb-4 pl-3">
                <div className="flex-1">
                    {/* Game Badge */}
                    <div className="flex items-center gap-2 mb-3">
                        <div
                            className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-gradient-to-r ${getGameColor(
                                tournament.gameId
                            )} text-white shadow-lg`}
                        >
                            {tournament.gameName || tournament.gameId}
                        </div>

                        {/* Difficulty Badge */}
                        {tournament.difficulty && (
                            <div className={`px-2 py-0.5 rounded-sm text-[9px] font-black tracking-widest uppercase border 
                                ${tournament.difficulty === 'pro' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                                    tournament.difficulty === 'intermediate' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                        'bg-green-500/10 text-green-500 border-green-500/20'}`}>
                                {tournament.difficulty}
                            </div>
                        )}

                        {/* Status Badge */}
                        <div
                            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[9px] font-black tracking-widest uppercase border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border} ${statusStyle.animate}`}
                        >
                            <div className={`w-1 h-1 rounded-full ${statusStyle.text.replace('text-', 'bg-')}`} />
                            {tournament.status.toUpperCase()}
                        </div>
                    </div>

                    {/* Tournament Name */}
                    <h3 className="text-lg font-black text-white leading-none tracking-tight italic group-hover:text-teal-400 transition-colors">
                        {tournament.title.toUpperCase()}
                    </h3>
                </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4 mb-5 pl-3">
                {/* Prize Pool */}
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 group-hover:bg-teal-500/5 transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                        <Trophy className="w-3 h-3 text-teal-500" />
                        <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                            Prize Pool
                        </div>
                    </div>
                    <div className="text-2xl font-black text-teal-400 italic">
                        ₹{(tournament.prizePool / 1000).toFixed(0)}K
                    </div>
                </div>

                {/* Entry Fee */}
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 group-hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                        <IndianRupee className="w-3 h-3 text-zinc-400" />
                        <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                            Entry Fee
                        </div>
                    </div>
                    <div className="text-2xl font-black text-white italic">
                        {tournament.entryFee === 0 ? 'FREE' : `₹${tournament.entryFee}`}
                    </div>
                </div>
            </div>

            {/* Match Info */}
            <div className="pl-3 space-y-3 mb-5">
                {/* Mode & Start Time */}
                <div className="flex items-center justify-between text-[10px] font-black tracking-widest">
                    <div className="flex items-center gap-2 text-zinc-500">
                        <Users className="w-3 h-3 text-teal-500/50" />
                        <span>{tournament.format?.toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-500">
                        <Clock className="w-3 h-3 text-teal-500/50" />
                        <span>
                            {tournament.status === 'completed'
                                ? 'COMPLETED'
                                : new Date(tournament.startDate).toLocaleTimeString('en-IN', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true
                                })}
                        </span>
                    </div>
                </div>

                {/* Start Date */}
                <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-zinc-500">
                    <Calendar className="w-3 h-3 text-teal-500/50" />
                    <span>
                        {new Date(tournament.startDate).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        })}
                    </span>
                </div>

                {/* Slots & Progress */}
                <div>
                    <div className="flex items-center justify-between text-[10px] font-black tracking-widest mb-2">
                        <span className="text-zinc-500">SLOTS FILLED</span>
                        <div className="flex items-center gap-1.5">
                            <span className="text-white">{tournament.currentTeams}</span>
                            <span className="text-zinc-600">/</span>
                            <span className="text-zinc-600">{tournament.maxTeams}</span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative h-1.5 w-full bg-zinc-800/50 rounded-full overflow-hidden border border-white/5">
                        <div
                            className={`absolute top-0 left-0 h-full rounded-full shadow-[0_0_10px_rgba(20,184,166,0.6)] transition-all duration-1000 ${isFull ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-teal-500 to-cyan-500'
                                }`}
                            style={{ width: `${slotPercentage}%` }}
                        >
                            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:20px_20px] animate-[slide_1s_linear_infinite]" />
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Button */}
            <div className="pl-3 mb-4">
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        buttonConfig.action()
                    }}
                    disabled={buttonConfig.disabled}
                    className={`w-full py-3 rounded-lg font-black text-sm tracking-widest uppercase transition-all ${buttonConfig.color
                        } ${buttonConfig.pulse ? 'animate-pulse' : ''} ${buttonConfig.disabled ? 'opacity-50' : 'shadow-lg active:scale-95'
                        } flex items-center justify-center gap-2`}
                >
                    {isFull && !hasUserJoined && <Lock className="w-4 h-4" />}
                    {buttonConfig.text}
                </button>
            </div>

            {/* Host Info - Clickable Badge */}
            <div
                onClick={handleHostClick}
                className="host-badge pl-3"
            >
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900/60 border border-white/5 backdrop-blur-sm hover:border-teal-500/30 hover:bg-zinc-900/80 transition-all cursor-pointer group/host">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 border border-teal-500/20 flex items-center justify-center text-[10px] font-black text-teal-400 group-hover/host:scale-110 transition-transform">
                        {tournament.organizerName?.charAt(0).toUpperCase() || 'H'}
                    </div>
                    <div className="flex-1">
                        <span className="text-[9px] font-black text-zinc-400 group-hover/host:text-teal-400 uppercase tracking-wide transition-colors">
                            Host: {tournament.organizerName}
                        </span>
                    </div>
                    <Eye className="w-3 h-3 text-zinc-600 group-hover/host:text-teal-400 transition-colors" />
                </div>
            </div>
        </motion.div>
    )
}

export default TournamentCard
