import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { ArrowLeft, Crosshair, Send, Users, Trophy, Video, Megaphone, MessageCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useWarRoomPermissions } from '@/hooks/useWarRoomPermissions'
import TabNavigation from '@/components/warroom/TabNavigation'
import TrustLevelBadge from '@/components/warroom/TrustLevelBadge'
import GlobalFeed from '@/components/warroom/GlobalFeed'
import RecruitmentFeed from '@/components/warroom/RecruitmentFeed'
import TournamentsFeed from '@/components/warroom/TournamentsFeed'
import ClipsTab from '@/components/warroom/ClipsTab'
import HostUpdatesFeed from '@/components/warroom/HostUpdatesFeed'

type WarRoomTab = 'global' | 'recruitment' | 'tournaments' | 'clips' | 'host_updates'

const WarRoomPage = () => {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState<WarRoomTab>('global')
    const [chatMessage, setChatMessage] = useState('')
    const [showChat, setShowChat] = useState(true)
    const { trustLevel, trustLevelInfo, isLoading } = useWarRoomPermissions()

    const handleSendMessage = () => {
        if (!chatMessage.trim()) return
        // TODO: Implement actual chat message sending
        console.log('Sending message:', chatMessage)
        setChatMessage('')
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case 'global':
                return <GlobalFeed />
            case 'recruitment':
                return <RecruitmentFeed />
            case 'tournaments':
                return <TournamentsFeed />
            case 'clips':
                return <ClipsTab />
            case 'host_updates':
                return <HostUpdatesFeed />
            default:
                return <GlobalFeed />
        }
    }

    const tabIcons: Record<WarRoomTab, any> = {
        global: MessageCircle,
        recruitment: Users,
        tournaments: Trophy,
        clips: Video,
        host_updates: Megaphone
    }

    const tabLabels: Record<WarRoomTab, string> = {
        global: 'Global',
        recruitment: 'LFG',
        tournaments: 'Events',
        clips: 'Clips',
        host_updates: 'Updates'
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
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all mb-5 min-h-0 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[11px] font-black uppercase tracking-[0.2em]">Exit War Room</span>
                    </button>

                    <div className="flex items-center justify-between gap-4 mb-5">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-[var(--accent)]/20 blur-xl rounded-full scale-0 group-hover:scale-110 transition-transform duration-500" />
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[var(--surface)] to-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center shadow-2xl relative z-10 overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-[var(--accent)]/10 to-transparent" />
                                    <Crosshair className="w-6 h-6 sm:w-7 sm:h-7 text-[var(--accent)] drop-shadow-[0_0_12px_var(--accent)] group-hover:rotate-90 transition-transform duration-500" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tighter italic leading-none mb-1">
                                    WAR ROOM<span className="text-[var(--accent)] italic text-3xl sm:text-5xl">.</span>
                                </h1>
                                <p className="text-[9px] sm:text-[10px] font-black tracking-[0.2em] sm:tracking-[0.3em] text-[var(--text-secondary)] uppercase">
                                    SQUAD UP • DOMINATE
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
                        {(Object.keys(tabLabels) as WarRoomTab[]).map((tab) => {
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
                        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
                    </div>
                </div>
            </div>

            {/* Main Content Area - Mobile Optimized */}
            <div className="relative z-10 px-4 sm:px-5 pt-4">
                {/* Desktop Layout: Side-by-side */}
                <div className="hidden lg:grid lg:grid-cols-[1fr,380px] lg:gap-6">
                    {/* Feed Content */}
                    <div className="min-h-[calc(100vh-300px)]">
                        {renderTabContent()}
                    </div>

                    {/* Chat Box - Desktop */}
                    <div className="sticky top-[200px] h-[calc(100vh-240px)]">
                        <ChatBox
                            chatMessage={chatMessage}
                            setChatMessage={setChatMessage}
                            handleSendMessage={handleSendMessage}
                        />
                    </div>
                </div>

                {/* Mobile/Tablet Layout: Stacked */}
                <div className="lg:hidden space-y-4">
                    {/* Feed Content */}
                    <div>
                        {renderTabContent()}
                    </div>

                    {/* Chat Box - Mobile (Collapsible) */}
                    <div className="sticky bottom-20 left-0 right-0">
                        <div className="bg-[var(--bg-primary)]/95 backdrop-blur-xl rounded-t-2xl border-t border-x border-[var(--border)] shadow-2xl">
                            {/* Chat Toggle Button */}
                            <button
                                onClick={() => setShowChat(!showChat)}
                                className="w-full flex items-center justify-between px-4 py-3 hover:bg-[var(--surface-hover)] transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <MessageCircle className="text-[var(--accent)]" size={18} />
                                    <span className="font-bold text-sm text-[var(--text-primary)]">Global Chat</span>
                                </div>
                                <motion.div
                                    animate={{ rotate: showChat ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <ArrowLeft className="rotate-90 text-[var(--text-secondary)]" size={16} />
                                </motion.div>
                            </button>

                            {/* Chat Content */}
                            <AnimatePresence>
                                {showChat && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: '300px', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="border-t border-[var(--border)]">
                                            <ChatBox
                                                chatMessage={chatMessage}
                                                setChatMessage={setChatMessage}
                                                handleSendMessage={handleSendMessage}
                                                compact
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Chat Box Component
const ChatBox = ({
    chatMessage,
    setChatMessage,
    handleSendMessage,
    compact = false
}: {
    chatMessage: string
    setChatMessage: (msg: string) => void
    handleSendMessage: () => void
    compact?: boolean
}) => {
    // Mock chat messages
    const mockMessages = [
        { id: 1, user: 'WarriorX', message: 'LFG for Free Fire tournament!', time: '2m ago', color: 'teal' },
        { id: 2, user: 'ProGamer', message: 'Anyone up for squad practice?', time: '5m ago', color: 'blue' },
        { id: 3, user: 'ChampionY', message: 'GG last match!', time: '8m ago', color: 'purple' },
        { id: 4, user: 'EliteZ', message: 'Looking for BGMI squad', time: '12m ago', color: 'green' },
    ]

    return (
        <div className={`flex flex-col ${compact ? 'h-[300px]' : 'h-full'} bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl backdrop-blur-xl overflow-hidden`}>
            {/* Chat Header */}
            <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--surface)]/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
                        <span className="font-black text-xs uppercase tracking-wider text-[var(--text-primary)]">Live Chat</span>
                    </div>
                    <span className="text-[10px] font-bold text-[var(--text-secondary)]">247 online</span>
                </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                {mockMessages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[var(--surface)]/30 rounded-lg p-2.5 hover:bg-[var(--surface)]/50 transition-colors"
                    >
                        <div className="flex items-start gap-2">
                            <div className={`w-8 h-8 rounded-lg bg-${msg.color}-500/10 border border-${msg.color}-500/20 flex items-center justify-center flex-shrink-0`}>
                                <span className="text-xs font-black text-[var(--accent)]">{msg.user.charAt(0)}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-2 mb-0.5">
                                    <span className="font-bold text-xs text-[var(--text-primary)] truncate">{msg.user}</span>
                                    <span className="text-[9px] text-[var(--text-secondary)] whitespace-nowrap">{msg.time}</span>
                                </div>
                                <p className="text-xs text-[var(--text-secondary)] leading-relaxed break-words">{msg.message}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Chat Input */}
            <div className="p-3 border-t border-[var(--border)] bg-[var(--surface)]/30">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all select-text"
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!chatMessage.trim()}
                        className="px-4 py-2 bg-[var(--accent)] text-black rounded-lg font-bold hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default WarRoomPage
