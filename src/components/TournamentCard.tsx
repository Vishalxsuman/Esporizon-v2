import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { Trophy, IndianRupee, Users, Clock, Lock, LogIn, ArrowRight, ShieldCheck } from 'lucide-react'
import { Tournament } from '@/types/tournament'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

interface TournamentCardProps {
    tournament: Tournament
    index?: number
    compact?: boolean
}

const TournamentCard = forwardRef<HTMLDivElement, TournamentCardProps>(({ tournament, index = 0, compact = false }, ref) => {

    const navigate = useNavigate()
    const { user } = useAuth()

    if (!tournament) return null

    const isFull = (tournament.currentTeams || 0) >= (tournament.maxTeams || 0)
    const isJoined = user && tournament.registeredPlayers?.includes(user.id)
    const isCompleted = tournament.status === 'completed'
    const isLive = tournament.status === 'live'

    const getGameBanner = (gameId: string) => {
        switch (gameId) {
            case 'freefire': return 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop'
            case 'bgmi': return 'https://images.unsplash.com/photo-1542751110-97427bbecf20?q=80&w=2084&auto=format&fit=crop'
            case 'valorant': return 'https://images.unsplash.com/photo-1614027164847-1b280143eb68?q=80&w=2070&auto=format&fit=crop'
            case 'minecraft': return 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?q=80&w=2074&auto=format&fit=crop'
            default: return 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop'
        }
    }

    const getGameColor = (gameId: string) => {
        switch (gameId) {
            case 'freefire': return 'from-orange-500 to-red-500'
            case 'bgmi': return 'from-teal-400 to-cyan-500'
            case 'valorant': return 'from-red-500 to-pink-500'
            case 'minecraft': return 'from-green-500 to-emerald-500'
            default: return 'from-indigo-500 to-purple-500'
        }
    }

    const getButtonConfig = () => {
        if (user && tournament.organizerId === user.uid) {
            return {
                text: 'Manage Operation',
                color: 'bg-indigo-600 text-white shadow-[0_5px_15px_rgba(79,70,229,0.4)] hover:bg-indigo-500',
                icon: <ShieldCheck className="w-4 h-4" />,
                action: () => navigate(`/host/manage?tournamentId=${tournament.id}`)
            }
        }

        if (!user) {
            return {
                text: 'Login to Join',
                color: 'bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white hover:border-[#00E0C6]/50',
                icon: <LogIn className="w-4 h-4" />,
                action: () => navigate('/auth')
            }
        }

        if (isCompleted) {
            return {
                text: 'View Results',
                color: 'bg-zinc-900 border border-white/10 text-zinc-500 hover:text-white',
                icon: <Trophy className="w-4 h-4" />,
                action: () => navigate(`/tournament/${tournament.id}/results`)
            }
        }

        if (isJoined) {
            return {
                text: 'ENTER ARENA',
                color: 'bg-[#00E0C6] text-black shadow-[0_5px_20px_rgba(0,224,198,0.3)] hover:bg-[#00E0C6]/90',
                icon: <ArrowRight className="w-4 h-4" />,
                action: () => navigate(`/tournament/${tournament.id}`)
            }
        }

        if (isFull) {
            return {
                text: 'Arena Full',
                color: 'bg-zinc-900 border border-red-500/20 text-red-500/50 cursor-not-allowed',
                icon: <Lock className="w-4 h-4" />,
                disabled: true,
                action: () => { }
            }
        }

        return {
            text: 'DEPLOY NOW',
            color: 'bg-red-500 text-white shadow-[0_5px_20px_rgba(239,68,68,0.4)] hover:bg-red-600',
            icon: null,
            pulse: isLive,
            action: () => navigate(`/tournament/${tournament.id}`)
        }
    }

    const buttonConfig = getButtonConfig()
    const slotPercentage = Math.min(((tournament.currentTeams || 0) / (tournament.maxTeams || 1)) * 100, 100)

    const gameId = tournament.gameId || 'unknown'
    const gameName = tournament.gameName || gameId
    const title = tournament.title || 'Untitled Combat'
    const prizePool = tournament.prizePool || 0
    const entryFee = tournament.entryFee || 0
    const format = tournament.format || 'Squad'

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString)
            if (isNaN(date.getTime())) return 'SOON'
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
        } catch (e) {
            return 'SOON'
        }
    }

    const startDateText = formatDate(tournament.startDate)

    if (compact) {
        return (
            <motion.div
                ref={ref}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                onClick={() => navigate(`/tournament/${tournament.id}`)}
                className="relative flex flex-col rounded-3xl bg-[#0E1424] border border-white/5 shadow-xl overflow-hidden group hover:border-[#00E0C6]/30 transition-all duration-300 cursor-pointer w-full"
            >
                {/* Compact Banner */}
                <div className="relative h-24 sm:h-28 w-full overflow-hidden">
                    <img
                        src={tournament.bannerUrl || getGameBanner(gameId)}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-40"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0E1424] via-transparent to-transparent" />

                    {/* Floating Circular Logo */}
                    <div className="absolute -bottom-5 left-4 z-20">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getGameColor(gameId)} p-1.5 shadow-[0_0_15px_rgba(0,0,0,0.5)] border-2 border-[#0E1424]`}>
                            <img
                                src={gameId === 'freefire' ? '/Images/logo.png' : '/Images/espo.png'}
                                alt=""
                                className="w-full h-full object-contain"
                            />
                        </div>
                    </div>
                </div>

                {/* Compact Content */}
                <div className="px-4 pt-6 pb-4 flex flex-col flex-1 gap-3">
                    <div>
                        <div className="text-[7px] font-black uppercase tracking-[0.2em] text-[#00E0C6] mb-0.5 opacity-80">
                            {gameName}
                        </div>
                        <h3 className="text-[13px] font-black italic tracking-tight text-white leading-tight line-clamp-1 group-hover:text-[#00E0C6] transition-colors">
                            {title.toUpperCase()}
                        </h3>
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center justify-between gap-1">
                        <div className="flex flex-col">
                            <span className="text-[7px] font-bold text-zinc-500 uppercase tracking-wider">Bounty</span>
                            <span className="text-[11px] font-black italic text-[#00E0C6]">₹{prizePool}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[7px] font-bold text-zinc-500 uppercase tracking-wider">Entry</span>
                            <span className="text-[11px] font-black italic text-zinc-200">{entryFee === 0 ? 'FREE' : `₹${entryFee}`}</span>
                        </div>
                    </div>

                    {/* Capacity */}
                    <div className="space-y-1.5 mt-auto">
                        <div className="flex justify-between items-center px-0.5">
                            <span className="text-[8px] font-black text-zinc-600 uppercase">Slots</span>
                            <span className="text-[9px] font-black italic text-zinc-400">
                                {tournament.currentTeams || 0}/{tournament.maxTeams || 100}
                            </span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${slotPercentage}%` }}
                                className={`h-full ${isFull ? 'bg-red-500' : 'bg-[#00E0C6]'}`}
                            />
                        </div>
                    </div>

                    {/* Mini Button */}
                    <button
                        className={`w-full py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${buttonConfig.color}`}
                    >
                        {buttonConfig.text === 'ENTER ARENA' || buttonConfig.text === 'DEPLOY NOW' ? 'ARENA' : buttonConfig.text}
                    </button>
                </div>
            </motion.div>
        )
    }

    return (
        <motion.div
            ref={ref}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
            className={`relative flex flex-col rounded-[2.5rem] bg-[#0E1424] border border-white/5 shadow-2xl overflow-hidden group hover:border-[#00E0C6]/20 transition-all duration-500 min-h-[520px] ${isCompleted ? 'grayscale-[0.5] opacity-80' : ''
                }`}
        >

            {/* Banner Section */}
            <div className="relative h-48 w-full overflow-hidden">
                <img
                    src={tournament.bannerUrl || getGameBanner(gameId)}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0E1424] via-[#0E1424]/40 to-transparent" />

                {/* Game Logo Overlay */}
                <div className="absolute top-6 left-6 flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getGameColor(gameId)} p-2.5 shadow-2xl border border-white/10`}>
                        <img
                            src={gameId === 'freefire' ? '/Images/logo.png' : '/Images/espo.png'}
                            alt=""
                            className="w-full h-full object-contain brightness-110"
                        />
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00E0C6] mb-0.5">
                            {gameName}
                        </div>
                        <h3 className="text-2xl font-black italic tracking-tighter text-white leading-none group-hover:text-[#00E0C6] transition-colors">
                            {title.toUpperCase()}
                        </h3>
                    </div>
                </div>

                {/* Status Badge */}
                <div className="absolute top-6 right-6">
                    <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${isLive ? 'bg-red-500/20 text-red-500 border-red-500/30 animate-pulse' : 'bg-[#00E0C6]/10 text-[#00E0C6] border-[#00E0C6]/20'
                        }`}>
                        {tournament.status}
                    </div>
                </div>
            </div>

            {/* Core Stats Section */}
            <div className="px-8 -mt-8 relative z-10 flex gap-4">
                <div className="flex-1 bg-white/5 backdrop-blur-3xl rounded-[2rem] border border-white/10 p-5 group-hover:bg-white/[0.08] transition-all overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#00E0C6]/5 blur-2xl rounded-full" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 block mb-1">TOTAL BOUNTY</span>
                    <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-[#00E0C6]" />
                        <span className="text-3xl font-black italic tracking-tighter text-[#00E0C6]">₹{prizePool.toLocaleString()}</span>
                    </div>
                </div>
                <div className="flex-1 bg-white/5 backdrop-blur-3xl rounded-[2rem] border border-white/10 p-5 group-hover:bg-white/[0.08] transition-all overflow-hidden relative">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 block mb-1">ENTRY FEE</span>
                    <div className="flex items-center gap-2">
                        <IndianRupee className="w-5 h-5 text-zinc-400" />
                        <span className="text-3xl font-black italic tracking-tighter text-white">
                            {entryFee === 0 ? 'FREE' : `₹${entryFee}`}
                        </span>
                    </div>
                </div>
            </div>

            {/* Secondary Details */}
            <div className="px-8 mt-8 space-y-6">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2 text-zinc-400 group-hover:text-zinc-200 transition-colors">
                        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
                            <Users className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest">{format}</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-400 group-hover:text-zinc-200 transition-colors">
                        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
                            <Clock className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest">{startDateText}</span>
                    </div>
                </div>

                {/* Capacity Bar */}
                <div className="space-y-3">
                    <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">OPERATIONAL CAPACITY</span>
                        <span className="text-sm font-black italic">
                            <span className={slotPercentage >= 90 ? 'text-red-500' : 'text-[#00E0C6]'}>{tournament.currentTeams || 0}</span>
                            <span className="text-zinc-600 mx-1">/</span>
                            {tournament.maxTeams || 100}
                        </span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full p-[2px] border border-white/5">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${slotPercentage}%` }}
                            className={`h-full rounded-full ${isFull ? 'bg-red-500' : 'bg-gradient-to-r from-[#00E0C6] to-[#7B61FF]'
                                }`}
                        />
                    </div>
                </div>
            </div>

            {/* Footer Action */}
            <div className="mt-auto p-8 pt-0 space-y-6">
                <button
                    disabled={buttonConfig.disabled}
                    onClick={(e) => {
                        e.stopPropagation()
                        buttonConfig.action()
                    }}
                    className={`w-full py-5 rounded-[1.5rem] font-black text-[13px] uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-3 active:scale-95 ${buttonConfig.color
                        } ${buttonConfig.pulse ? 'animate-pulse' : ''} ${buttonConfig.disabled ? 'opacity-50 grayscale' : 'hover:scale-[1.02]'
                        }`}
                >
                    {buttonConfig.icon}
                    {buttonConfig.text}
                </button>

                {/* Host Info */}
                <div
                    onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/host/${tournament.organizerId}`)
                    }}
                    className="flex items-center justify-between px-2 pt-4 border-t border-white/5 group/host cursor-pointer"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-[12px] font-black text-[#00E0C6] shadow-inner group-hover/host:border-[#00E0C6]/30 transition-all">
                            {(tournament.organizerName || 'H').charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-zinc-500 group-hover/host:text-zinc-300 transition-colors">
                            {tournament.organizerName || 'ARENA HOST'}
                        </span>
                    </div>
                    <ShieldCheck className="w-4 h-4 text-zinc-700 group-hover/host:text-[#00E0C6]/50 transition-all" />
                </div>
            </div>

            {/* Gloss Flare */}
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#00E0C6]/5 blur-[100px] rounded-full pointer-events-none group-hover:bg-[#00E0C6]/10 transition-all" />
        </motion.div>
    )
})

TournamentCard.displayName = 'TournamentCard'

export default TournamentCard
