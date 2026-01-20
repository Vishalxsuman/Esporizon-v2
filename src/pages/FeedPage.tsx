import { useState } from 'react'
import { Users, Trophy, LayoutGrid, Zap, Megaphone } from 'lucide-react'
import { useWarRoomPermissions } from '@/hooks/useWarRoomPermissions'
import TabNavigation from '@/components/warroom/TabNavigation'
import TrustLevelBadge from '@/components/warroom/TrustLevelBadge'
import GlobalFeed from '@/components/warroom/GlobalFeed'
import RecruitmentFeed from '@/components/warroom/RecruitmentFeed'
import TournamentsFeed from '@/components/warroom/TournamentsFeed'

type FeedTab = 'all' | 'global' | 'lfg' | 'events'

const FeedPage = () => {
    const [activeTab, setActiveTab] = useState<FeedTab>('all')
    const { trustLevel, isLoading } = useWarRoomPermissions()

    const renderTabContent = () => {
        switch (activeTab) {
            case 'all':
                return <GlobalFeed type="all" />
            case 'global':
                return <GlobalFeed type="global" />
            case 'lfg':
                return <RecruitmentFeed />
            case 'events':
                return <TournamentsFeed />
            default:
                return <GlobalFeed type="all" />
        }
    }

    const tabIcons: Record<FeedTab, any> = {
        all: LayoutGrid,
        global: Megaphone, // Changed to Megaphone for "Global" announcements feel
        lfg: Users,
        events: Trophy
    }

    const tabLabels: Record<FeedTab, string> = {
        all: 'All',
        global: 'Global',
        lfg: 'LFG',
        events: 'Events'
    }

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] pb-24 overflow-x-hidden relative transition-colors duration-300">
            {/* Tactical Background Pattern - Theme Aware */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03]">
                <div className="absolute inset-0" style={{
                    backgroundImage: `linear-gradient(45deg, transparent 45%, var(--accent) 45%, var(--accent) 55%, transparent 55%),
                                    linear-gradient(-45deg, transparent 45%, var(--accent) 45%, var(--accent) 55%, transparent 55%)`,
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 10px 10px'
                }} />
            </div>

            {/* Background Atmosphere Layers */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[var(--accent)]/5 blur-[120px] opacity-40" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[var(--accent)]/3 blur-[100px] opacity-20" />
            </div>

            {/* Header - Fixed on Mobile */}
            <div className="sticky top-0 z-30 bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-[var(--border)]">
                <div className="relative px-4 sm:px-5 pt-6 pb-4">
                    <div className="flex items-center justify-between gap-4 mb-5">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-[var(--accent)]/20 blur-xl rounded-full scale-0 group-hover:scale-110 transition-transform duration-500" />
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[var(--surface)] to-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center shadow-2xl relative z-10 overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-[var(--accent)]/10 to-transparent" />
                                    <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-[var(--accent)] drop-shadow-[0_0_12px_var(--accent)] group-hover:rotate-12 transition-transform duration-500" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tighter italic leading-none mb-1">
                                    FEED<span className="text-[var(--accent)] italic text-3xl sm:text-5xl">.</span>
                                </h1>
                                <p className="text-[9px] sm:text-[10px] font-black tracking-[0.2em] sm:tracking-[0.3em] text-[var(--text-secondary)] uppercase">
                                    WAR ROOM • ACTIVITY
                                </p>
                            </div>
                        </div>

                        {/* Trust Level Indicator */}
                        {!isLoading && (
                            <div className="hidden sm:block">
                                <TrustLevelBadge level={trustLevel} size="large" />
                            </div>
                        )}
                    </div>

                    {/* Mobile Tabs - Horizontal Scroll */}
                    <div className="flex sm:hidden gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
                        {(Object.keys(tabLabels) as FeedTab[]).map((tab) => {
                            const Icon = tabIcons[tab]
                            const isActive = activeTab === tab
                            return (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider whitespace-nowrap transition-all ${isActive
                                        ? 'bg-[var(--accent)] text-black shadow-lg'
                                        : 'bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                        }`}
                                >
                                    <Icon size={14} />
                                    {tabLabels[tab]}
                                </button>
                            )
                        })}
                    </div>

                    {/* Desktop Tab Navigation */}
                    <div className="hidden sm:block">
                        <TabNavigation activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as FeedTab)} />
                    </div>
                </div>
            </div>

            {/* Main Content Area - Mobile Optimized */}
            <div className="relative z-10 px-4 sm:px-5 pt-4 max-w-3xl mx-auto">
                {/* Feed Content - No Create Widget */}
                <div className="min-h-[500px]">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    )
}

export default FeedPage
