import { motion } from 'framer-motion'
import { ShieldCheck, Plus } from 'lucide-react'
import SocialSection from '@/components/SocialSection'
import UserSearch from '@/components/UserSearch'
import ParticlesBackground from '@/components/ParticlesBackground'

const SocialPage = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] pb-24 transition-colors duration-300 relative overflow-hidden"
        >
            <ParticlesBackground />

            {/* Simple Header */}
            <div className="sticky top-0 z-50 bg-[var(--bg-primary)]/80 backdrop-blur-2xl border-b border-[var(--border)] px-4 py-4 flex items-center justify-between">
                <div className="w-10" /> {/* Spacer */}

                <div className="text-sm font-black uppercase tracking-[0.3em] italic flex items-center gap-3">
                    <ShieldCheck size={18} className="text-[var(--accent)]" />
                    Social Nexus
                </div>

                <div className="w-10 h-10 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center border border-[var(--accent)]/20 shadow-lg shadow-[var(--accent)]/5">
                    <Plus size={20} className="text-[var(--accent)]" />
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-xl mx-auto px-4 pt-10 pb-8 space-y-12 relative z-10">
                {/* Modern Intro */}
                <div className="text-center space-y-2">
                    <h1 className="text-5xl lg:text-6xl font-black italic uppercase tracking-tighter leading-none mb-2">
                        Global <span className="text-transparent bg-clip-text bg-gradient-to-b from-[var(--accent)] to-[#7c3aed]">Feed</span>
                    </h1>
                    <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-[0.4em]">Connect • Share • Explore</p>
                </div>

                {/* Search */}
                <div className="relative group">
                    <UserSearch />
                </div>
            </div>

            {/* Main Social Section */}
            <div className="relative z-10">
                <SocialSection />
            </div>
        </motion.div>
    )
}

export default SocialPage
