import { motion } from 'framer-motion'
import { Video } from 'lucide-react'

const ClipsTab = () => {
    return (
        <div className="mt-6">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-12 text-center rounded-2xl bg-[#141414]/40 border border-dashed border-[#00ff88]/20"
            >
                <Video className="w-12 h-12 text-[#00ff88]/40 mx-auto mb-4" />
                <h3 className="text-xs font-black uppercase tracking-widest text-[#00ff88]/60">Clips Coming Soon</h3>
                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-tighter mt-1">
                    Showcase your competitive highlights
                </p>
            </motion.div>
        </div>
    )
}

export default ClipsTab
