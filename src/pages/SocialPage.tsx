import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, LayoutGrid, Calendar, Zap, Target } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import SocialFeed from '@/components/SocialFeed'
import UserSearch from '@/components/UserSearch'
import ParticlesBackground from '@/components/ParticlesBackground'

const SocialPage = () => {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState<'today' | 'history'>('today')

    const tabs = [
        { id: 'today', label: 'Combat Today', icon: Zap, days: 0 },
        { id: 'history', label: 'Legacy Feed', icon: Calendar, days: 2 }
    ]

    return (
        <div className="min-h-screen bg-[#09090b] text-white pb-32 relative overflow-hidden">
            <ParticlesBackground />

            {/* Header / Search Area */}
            <div className="relative z-10 pt-10 px-4">
                <div className="max-w-xl mx-auto space-y-8">
                    {/* Brand / Intro */}
                    <div className="text-center space-y-2">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="inline-flex items-center gap-2 px-3 py-1 bg-[#00ffc2]/10 border border-[#00ffc2]/20 rounded-full mb-2"
                        >
                            <Target size={12} className="text-[#00ffc2]" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#00ffc2]">Central Transmission Hub</span>
                        </motion.div>
                        <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none">
                            Network <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ffc2] to-[#7c3aed]">Intelligence</span>
                        </h1>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em]">Sector 7 Social Uplink</p>
                    </div>

                    {/* Search Component */}
                    <UserSearch />
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="sticky top-0 z-40 mt-12 px-4 py-4 bg-[#09090b]/40 backdrop-blur-3xl border-b border-white/5">
                <div className="max-w-xl mx-auto flex gap-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                                ? 'bg-[#00ffc2] text-[#09090b] shadow-[0_0_20px_rgba(0,255,194,0.2)]'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/5'
                                }`}
                        >
                            <tab.icon size={14} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Feed */}
            <div className="max-w-xl mx-auto px-4 mt-8 space-y-8 relative z-10">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: activeTab === 'today' ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: activeTab === 'today' ? 20 : -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2 text-gray-500">
                                <LayoutGrid size={16} />
                                <h2 className="text-[10px] font-black uppercase tracking-[0.2em]">
                                    {activeTab === 'today' ? 'Live Transmissions' : 'Historical Data Logs'}
                                </h2>
                            </div>
                            {activeTab === 'today' && (
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-red-500/10 border border-red-500/20 rounded-lg">
                                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                                    <span className="text-[8px] font-black uppercase text-red-500">Real-time</span>
                                </div>
                            )}
                        </div>

                        <SocialFeed daysAgo={activeTab === 'today' ? 0 : 2} />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Float Action Button */}
            <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate('/create-post')}
                className="fixed bottom-28 right-6 w-14 h-14 bg-gradient-to-br from-[#00ffc2] to-[#7c3aed] rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(0,255,194,0.3)] z-50 group"
            >
                <Plus size={28} className="text-[#09090b] group-hover:rotate-90 transition-all duration-500" />
                <div className="absolute -top-12 right-0 bg-[#18181b] border border-white/10 px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    <p className="text-[8px] font-black uppercase tracking-widest text-[#00ffc2]">Initialize Protocol</p>
                </div>
            </motion.button>
        </div>
    )
}

export default SocialPage
