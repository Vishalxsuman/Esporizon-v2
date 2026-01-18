import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { warRoomService } from '@/services/WarRoomService'
import { RecruitmentCard as RecruitmentCardType } from '@/types/WarRoomTypes'
import RecruitmentCard from './RecruitmentCard'
import { Loader2, Users } from 'lucide-react'
import { useWarRoomPermissions } from '@/hooks/useWarRoomPermissions'

const RecruitmentFeed = () => {
    const [cards, setCards] = useState<RecruitmentCardType[]>([])
    const [loading, setLoading] = useState(true)
    const { canRecruit, trustLevel: _trustLevel } = useWarRoomPermissions()

    useEffect(() => {
        setLoading(true)
        const unsubscribe = warRoomService.subscribeToRecruitments({}, (newCards) => {
            setCards(newCards)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="w-8 h-8 text-[#00ff88] animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00ff88] animate-pulse">
                    Loading Recruitments...
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-6 mt-6">
            {/* Create Recruitment CTA */}
            {canRecruit && (
                <motion.button
                    className="w-full py-4 rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                    style={{
                        background: 'linear-gradient(145deg, #00ff88, #00dd77)',
                        color: '#000',
                        boxShadow: '0 4px 15px rgba(0,255,136,0.3)'
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Users className="w-5 h-5" />
                    Create Recruitment
                </motion.button>
            )}

            {/* Locked State */}
            {!canRecruit && (
                <div className="p-6 rounded-xl bg-zinc-900/30 border border-dashed border-white/10 text-center">
                    <div className="text-3xl mb-3">🔒</div>
                    <div className="text-sm font-black text-zinc-500 uppercase tracking-wide">Locked</div>
                    <div className="text-xs text-zinc-600 mt-2">
                        Complete 5 tournaments to unlock recruitment
                    </div>
                </div>
            )}

            {/* Cards */}
            {cards.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-12 text-center rounded-2xl bg-[#141414]/40 border border-dashed border-[#00ff88]/20"
                >
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#00ff88]/60">No Active Recruitments</h3>
                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-tighter mt-1">
                        Be the first to form a squad
                    </p>
                </motion.div>
            ) : (
                <div className="grid gap-6">
                    <AnimatePresence mode="popLayout">
                        {cards.map((card, index) => (
                            <motion.div
                                key={card.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <RecruitmentCard card={card} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    )
}

export default RecruitmentFeed
