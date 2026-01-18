import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { warRoomService } from '@/services/WarRoomService'
import { TournamentCard as TournamentCardType } from '@/types/WarRoomTypes'
import TournamentCard from './TournamentCard'
import { Loader2 } from 'lucide-react'

const TournamentsFeed = () => {
    const [cards, setCards] = useState<TournamentCardType[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setLoading(true)
        const unsubscribe = warRoomService.subscribeToTournamentCards((newCards) => {
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
                    Loading Tournaments...
                </p>
            </div>
        )
    }

    if (cards.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-12 text-center rounded-2xl bg-[#141414]/40 border border-dashed border-[#00ff88]/20 mt-6"
            >
                <h3 className="text-xs font-black uppercase tracking-widest text-[#00ff88]/60">No Tournaments Available</h3>
                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-tighter mt-1">
                    Check back soon for new competitions
                </p>
            </motion.div>
        )
    }

    return (
        <div className="space-y-6 mt-6">
            <AnimatePresence mode="popLayout">
                {cards.map((card, index) => (
                    <motion.div
                        key={card.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <TournamentCard card={card} />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    )
}

export default TournamentsFeed
