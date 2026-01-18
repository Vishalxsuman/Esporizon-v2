import { motion } from 'framer-motion'
import { Users, Target, Clock, Coins, ArrowRight } from 'lucide-react'
import { RecruitmentCard as RecruitmentCardType } from '@/types/WarRoomTypes'
import TrustLevelBadge from './TrustLevelBadge'
import { warRoomService } from '@/services/WarRoomService'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'
import { useState } from 'react'

interface RecruitmentCardProps {
    card: RecruitmentCardType
}

const RecruitmentCard = ({ card }: RecruitmentCardProps) => {
    const { user } = useAuth()
    const [isJoining, setIsJoining] = useState(false)

    const roleIcons: Record<string, React.ReactNode> = {
        sniper: <Target className="w-4 h-4" />,
        rusher: <span className="text-base">⚡</span>,
        support: <span className="text-base">🛡</span>,
        igl: <span className="text-base">🧠</span>,
        any: <Users className="w-4 h-4" />
    }

    const isExpired = card.status === 'expired' || new Date(card.expiresAt) < new Date()
    const isFilled = card.status === 'filled'
    const slotsRemaining = card.slotsAvailable - card.currentMembers.length
    const isCreator = user?.uid === card.userId
    const hasJoined = user?.uid && card.currentMembers.includes(user.uid)

    const handleJoinSquad = async () => {
        if (!user?.uid) {
            toast.error('Please log in to join squad')
            return
        }

        if (isCreator) {
            toast.error('You cannot join your own recruitment')
            return
        }

        if (hasJoined) {
            toast.success('You have already joined this squad')
            return
        }

        setIsJoining(true)
        try {
            const squadChatId = await warRoomService.joinSquad(card.id, user.uid)
            if (squadChatId) {
                toast.success('Squad filled! Chat created.')
                // TODO: Navigate to squad chat
            } else {
                toast.success('Joined squad! Waiting for more members.')
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to join squad')
        } finally {
            setIsJoining(false)
        }
    }

    return (
        <motion.div
            className={`relative rounded-2xl overflow-hidden ${isExpired || isFilled ? 'opacity-60' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isExpired || isFilled ? 0.6 : 1, y: 0 }}
            style={{
                background: 'linear-gradient(145deg, #1a1a1a, #0f0f0f)',
                boxShadow: `
                    8px 8px 16px #080808,
                    -8px -8px 16px #1c1c1c,
                    inset 0 0 0 1px rgba(255,255,255,0.03)
                `
            }}
        >
            {/* Header */}
            <div className="p-4 border-b border-white/5">
                <div className="flex items-center justify-between mb-3">
                    {/* Game + Mode */}
                    <div className="flex items-center gap-2">
                        <div className="px-2 py-1 rounded-lg bg-zinc-800/50 border border-white/5">
                            <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400">
                                {card.gameName}
                            </span>
                        </div>
                        <div className="px-2 py-1 rounded-lg bg-[#00ff88]/10 border border-[#00ff88]/20">
                            <span className="text-[9px] font-black uppercase tracking-wider text-[#00ff88]">
                                {card.mode}
                            </span>
                        </div>
                    </div>

                    {/* Status Badge */}
                    {isExpired && (
                        <div className="px-2 py-1 rounded-lg bg-red-500/10 border border-red-500/20">
                            <span className="text-[9px] font-black uppercase tracking-wider text-red-500">EXPIRED</span>
                        </div>
                    )}
                    {isFilled && !isExpired && (
                        <div className="px-2 py-1 rounded-lg bg-[#00ff88]/10 border border-[#00ff88]/20">
                            <span className="text-[9px] font-black uppercase tracking-wider text-[#00ff88]">FILLED</span>
                        </div>
                    )}
                </div>

                {/* Tournament */}
                <div className="text-xs text-zinc-400 uppercase tracking-wide mb-1">Looking for team in</div>
                <div className="text-base font-black text-white">{card.tournamentName}</div>
            </div>

            {/* Body */}
            <div className="p-4">
                {/* Role Needed */}
                <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-zinc-900/30 border border-white/5">
                    <div className="w-10 h-10 rounded-lg bg-[#00ff88]/10 border border-[#00ff88]/20 flex items-center justify-center text-[#00ff88]">
                        {roleIcons[card.roleNeeded]}
                    </div>
                    <div>
                        <div className="text-[9px] text-zinc-500 uppercase tracking-wide">Role Needed</div>
                        <div className="text-sm font-black text-white">{card.roleName}</div>
                    </div>
                    <div className="ml-auto text-right">
                        <div className="text-[9px] text-zinc-500 uppercase tracking-wide">Slots</div>
                        <div className="text-sm font-black text-[#00ff88]">{slotsRemaining} left</div>
                    </div>
                </div>

                {/* Requirements */}
                {(card.minimumKD || card.minimumRank || card.requirements) && (
                    <div className="mb-4 p-3 rounded-xl bg-zinc-900/20 border border-dashed border-white/5">
                        <div className="text-[9px] text-zinc-500 uppercase tracking-wide mb-2">Requirements</div>
                        <div className="space-y-1">
                            {card.minimumKD && (
                                <div className="text-xs text-zinc-400">
                                    • Min K/D: <span className="text-white font-bold">{card.minimumKD}</span>
                                </div>
                            )}
                            {card.minimumRank && (
                                <div className="text-xs text-zinc-400">
                                    • Min Rank: <span className="text-white font-bold">{card.minimumRank}</span>
                                </div>
                            )}
                            {card.requirements && (
                                <div className="text-xs text-zinc-400">
                                    • {card.requirements}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Time & Entry Fee */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-zinc-900/30">
                        <Clock className="w-4 h-4 text-zinc-500" />
                        <div>
                            <div className="text-[8px] text-zinc-600 uppercase">Time</div>
                            <div className="text-xs font-bold text-white">{card.timeSlot}</div>
                        </div>
                    </div>
                    {card.entryFee && (
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-zinc-900/30">
                            <Coins className="w-4 h-4 text-[#00ff88]" />
                            <div>
                                <div className="text-[8px] text-zinc-600 uppercase">Entry</div>
                                <div className="text-xs font-bold text-white">₹{card.entryFee}</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Creator Profile */}
                <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-black/30 border border-white/5">
                    <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-xl">
                        {card.userAvatar ? (
                            <img src={card.userAvatar} alt={card.userName} className="w-full h-full rounded-lg object-cover" />
                        ) : (
                            '👤'
                        )}
                    </div>
                    <div className="flex-1">
                        <div className="text-xs font-bold text-white">{card.userName}</div>
                        <div className="flex items-center gap-2 mt-1">
                            <TrustLevelBadge level={card.trustLevel} size="small" showLabel={false} />
                            {card.badges.length > 0 && (
                                <div className="flex items-center gap-1">
                                    {card.badges.slice(0, 3).map((badge, i) => (
                                        <span key={i} className="text-xs">{badge.icon}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* CTA Button */}
                <button
                    className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all relative overflow-hidden ${isExpired || isFilled || isCreator || hasJoined
                        ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#00ff88] to-[#00dd77] text-black hover:shadow-[0_4px_20px_rgba(0,255,136,0.4)]'
                        }`}
                    onClick={handleJoinSquad}
                    disabled={isExpired || isFilled || isCreator || hasJoined || isJoining}
                >
                    {isJoining ? 'Joining...' :
                        isCreator ? 'Your Recruitment' :
                            hasJoined ? 'Already Joined' :
                                isFilled ? 'Squad Full' :
                                    isExpired ? 'Expired' :
                                        'Join Squad'}
                    {!isExpired && !isFilled && !isCreator && !hasJoined && (
                        <ArrowRight className="w-4 h-4" />
                    )}
                </button>
            </div>
        </motion.div>
    )
}

export default RecruitmentCard
