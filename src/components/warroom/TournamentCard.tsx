import { motion } from 'framer-motion'
import { Trophy, Users, Coins, ArrowRight, Zap, Crown } from 'lucide-react'
import { TournamentCard as TournamentCardType } from '@/types/WarRoomTypes'
import { useNavigate } from 'react-router-dom'

interface TournamentCardProps {
    card: TournamentCardType
}

const TournamentCard = ({ card }: TournamentCardProps) => {
    const navigate = useNavigate()

    const getEventBadge = () => {
        const badges = {
            created: { label: 'NEW TOURNAMENT', color: '#00ff88', icon: <Zap className="w-3 h-3" /> },
            registration_open: { label: 'REGISTRATION OPEN', color: '#00ff88', icon: <Users className="w-3 h-3" /> },
            starting_soon: { label: 'STARTING SOON', color: '#fbbf24', icon: <Zap className="w-3 h-3" /> },
            live: { label: 'LIVE NOW', color: '#ef4444', icon: <Zap className="w-3 h-3" /> },
            completed: { label: 'WINNER DECLARED', color: '#ffd700', icon: <Crown className="w-3 h-3" /> }
        }
        return badges[card.eventType] || badges.registration_open
    }

    const badge = getEventBadge()
    const slotsPercent = (card.slotsFilled / card.slotsTotal) * 100

    return (
        <motion.div
            className="relative rounded-2xl overflow-hidden cursor-pointer group"
            onClick={() => navigate(`/tournaments/${card.tournamentId}`)}
            whileHover={{ y: -4 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={{
                background: 'linear-gradient(145deg, #1a1a1a, #0f0f0f)',
                boxShadow: `
                    8px 8px 16px #080808,
                    -8px -8px 16px #1c1c1c,
                    inset 0 0 0 1px rgba(255,255,255,0.03)
                `
            }}
        >
            {/* Banner Image */}
            {card.bannerUrl && (
                <div className="relative h-40 overflow-hidden">
                    <img
                        src={card.bannerUrl}
                        alt={card.tournamentName}
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity group-hover:scale-105 transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent" />
                </div>
            )}

            {/* Event Badge */}
            <div
                className="absolute top-4 right-4 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-black text-[9px] uppercase tracking-wider shadow-lg animate-pulse"
                style={{
                    background: `${badge.color}20`,
                    border: `1px solid ${badge.color}60`,
                    color: badge.color,
                    boxShadow: `0 0 20px ${badge.color}40`
                }}
            >
                {badge.icon}
                {badge.label}
            </div>

            {/* Content */}
            <div className="p-5 relative">
                {/* Game Name Tag */}
                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-2">
                    {card.gameName}
                </div>

                {/* Tournament Name */}
                <h3 className="text-xl font-black text-white mb-4 leading-tight group-hover:text-[#00ff88] transition-colors">
                    {card.tournamentName}
                </h3>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4 mb-5">
                    {/* Prize Pool */}
                    <div className="text-center">
                        <div className="text-2xl font-black text-[#00ff88] mb-1">
                            ₹{card.prizePool.toLocaleString()}
                        </div>
                        <div className="text-[8px] font-bold uppercase tracking-wider text-zinc-600">
                            Prize Pool
                        </div>
                    </div>

                    {/* Slots */}
                    <div className="text-center">
                        <div className="text-lg font-black text-white mb-1">
                            {card.slotsFilled}/{card.slotsTotal}
                        </div>
                        <div className="text-[8px] font-bold uppercase tracking-wider text-zinc-600">
                            Slots Filled
                        </div>
                        {/* Progress Bar */}
                        <div className="mt-2 h-1 bg-zinc-800 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-[#00ff88]"
                                initial={{ width: 0 }}
                                animate={{ width: `${slotsPercent}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                            />
                        </div>
                    </div>

                    {/* Entry Fee */}
                    <div className="text-center">
                        <div className="text-lg font-black text-white mb-1 flex items-center justify-center gap-1">
                            <Coins className="w-4 h-4 text-[#00ff88]" />
                            {card.entryFee}
                        </div>
                        <div className="text-[8px] font-bold uppercase tracking-wider text-zinc-600">
                            Entry Fee
                        </div>
                    </div>
                </div>

                {/* Organizer */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                            <Trophy className="w-4 h-4 text-[#00ff88]" />
                        </div>
                        <div>
                            <div className="text-[10px] text-zinc-500 uppercase tracking-wide">Organized by</div>
                            <div className="text-xs font-bold text-white flex items-center gap-1">
                                {card.organizerName}
                                {card.isVerifiedHost && <span className="text-[#00ff88]">🛡</span>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA Button */}
                <button
                    className="w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 group/btn transition-all relative overflow-hidden"
                    style={{
                        background: 'linear-gradient(145deg, #00ff88, #00dd77)',
                        color: '#000',
                        boxShadow: '0 4px 15px rgba(0,255,136,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
                    }}
                    onClick={(e) => {
                        e.stopPropagation()
                        if (card.eventType === 'completed') {
                            navigate(`/tournaments/${card.tournamentId}/results`)
                        } else {
                            navigate(`/tournaments/${card.tournamentId}`)
                        }
                    }}
                >
                    <span className="relative z-10">
                        {card.eventType === 'completed' ? 'View Results' :
                            card.slotsFilled >= card.slotsTotal ? 'View Bracket' :
                                'Join Now'}
                    </span>
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform relative z-10" />

                    {/* Hover shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                </button>
            </div>

            {/* Card border glow on hover */}
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" style={{
                boxShadow: '0 0 30px rgba(0,255,136,0.2), inset 0 0 30px rgba(0,255,136,0.05)'
            }} />
        </motion.div>
    )
}

export default TournamentCard
