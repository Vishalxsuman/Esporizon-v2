import { motion } from 'framer-motion'
import { Globe, Users, Trophy, Megaphone } from 'lucide-react'

type WarRoomTab = 'all' | 'global' | 'lfg' | 'events'

interface TabNavigationProps {
    activeTab: WarRoomTab
    onTabChange: (tab: WarRoomTab) => void
}

const TabNavigation = ({ activeTab, onTabChange }: TabNavigationProps) => {
    const tabs: Array<{ id: WarRoomTab; label: string; icon: React.ReactNode }> = [
        { id: 'all', label: 'All', icon: <Globe className="w-4 h-4" /> },
        { id: 'global', label: 'Global', icon: <Megaphone className="w-4 h-4" /> },
        { id: 'lfg', label: 'LFG', icon: <Users className="w-4 h-4" /> },
        { id: 'events', label: 'Events', icon: <Trophy className="w-4 h-4" /> }
    ]

    return (
        <div className="mt-6 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 min-w-max">
                {tabs.map((tab) => (
                    <motion.button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`
                            relative px-5 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-wider
                            transition-all duration-300 flex items-center gap-2 whitespace-nowrap
                            ${activeTab === tab.id
                                ? 'text-black bg-[#00ff88] shadow-[0_0_20px_rgba(0,255,136,0.3)]'
                                : 'text-zinc-500 bg-[#141414] border border-white/5 hover:border-[#00ff88]/30 hover:text-zinc-300'
                            }
                        `}
                        whileTap={{ scale: 0.95 }}
                    >
                        {tab.icon}
                        {tab.label}

                        {activeTab === tab.id && (
                            <motion.div
                                className="absolute inset-0 rounded-xl bg-[#00ff88]/20 blur-md -z-10"
                                layoutId="activeTabGlow"
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            />
                        )}
                    </motion.button>
                ))}
            </div>
        </div>
    )
}

export default TabNavigation
