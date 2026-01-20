import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ArrowLeft,
    Trophy,
    Wallet,
    Users,
    UserPlus,
    Settings,
    Bell,
    ChevronRight,
    HelpCircle,
    MessageCircle
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate, useParams } from 'react-router-dom'
import { Toaster, toast } from 'react-hot-toast'
import ProfileService from '@/services/ProfileService'
import AvatarWithFrame from '@/components/AvatarWithFrame'
import EditProfileModal from '@/components/EditProfileModal'
import CustomerSupportModal from '@/components/CustomerSupportModal'
import { useWallet } from '@/contexts/WalletContext'

// Sub-Components
import OverviewTab from '@/components/profile/OverviewTab'
import ProfileTab from '@/components/profile/ProfileTab'
import TournamentsTab from '@/components/profile/TournamentsTab'
import WalletTab from '@/components/profile/WalletTab'
import TeamsTab from '@/components/profile/TeamsTab'
import FriendsTab from '@/components/profile/FriendsTab'
import SettingsTab from '@/components/profile/SettingsTab'
import HelpTab from '@/components/profile/HelpTab'
import ChatPanel from '@/components/ChatPanel' // Added ChatPanel import
import FriendRequestPanel from '@/components/FriendRequestPanel' // Added FriendRequestPanel import

// --- Types ---

interface ProfileData {
    user: {
        id: string;
        username: string;
        firebaseUid: string;
        createdAt: string;
    };
    profile: {
        title: string;
        avatarId: string;
        avatarType?: 'initials' | 'geometric' | 'gradient' | 'default';
        frameId: string;
        bio: string;
        socialLinks: Record<string, string>;
        themeColor: string;
        currentStreak?: number;
        country?: string;
        languages?: string[];
        bannerUrl?: string;
        gameAccounts?: Record<string, string>;
    };
    stats: Record<string, {
        game: string;
        currentRank: string;
        rankScore: number;
        matchesPlayed: number;
        matchesWon: number;
        matchesLost: number;
        winRate: number;
        kills: number;
        kdRatio: number;
    }>;
    aggregate: {
        totalMatches: number;
        totalWins: number;
        overallWinRate: number;
    };
    history: Array<{
        tournamentId: string;
        game: string;
        result: string;
        rank: number;
        kills: number;
        prizeWon: number;
        scoreChange: number;
        playedAt: string;
        _id: string;
    }>;
}

const ProfilePage = () => {
    const { user } = useAuth()
    const { userId: paramId } = useParams()
    const navigate = useNavigate()
    const { balance } = useWallet()

    const targetUserId = paramId || user?.uid

    const [data, setData] = useState<ProfileData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Modals & Panels State
    const [showChatPanel, setShowChatPanel] = useState(false)
    const [activeChatFriend, setActiveChatFriend] = useState<string | null>(null)
    const [showFriendPanel, setShowFriendPanel] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showSupportModal, setShowSupportModal] = useState(false)

    const handleOpenChat = (friendId?: string) => {
        if (friendId) setActiveChatFriend(friendId)
        setShowChatPanel(true)
    }

    // View Management ('hub' is the main dashboard)
    const [currentView, setCurrentView] = useState('hub')

    const fetchProfile = async () => {
        if (!targetUserId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true)
            let profileData;

            // If viewing own profile, use getMyProfile for better sync/creation
            if (user && ((!paramId) || (paramId === user.uid))) {
                profileData = await ProfileService.getMyProfile(user.uid!, user.id);
            } else {
                profileData = await ProfileService.getProfileByUserId(targetUserId);
            }

            if (!profileData) {
                throw new Error('Profile not found');
            }

            setData(profileData)
            setError(null)
        } catch (err) {
            if (import.meta.env.MODE !== 'production') {

                console.error('Failed to load profile:', err);

            }
            setError('Could not load profile data.')
        } finally {
            setLoading(false)
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [targetUserId])

    const isOwnProfile = (user?.uid === data?.user?.firebaseUid) || (!paramId && !!user)

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0e1a] flex flex-col items-center justify-center p-4">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-teal-500 animate-pulse">Initializing Hub...</p>
                </div>
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-[#0a0e1a] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                    <Trophy className="w-10 h-10 text-red-500 opacity-50" />
                </div>
                <h2 className="text-xl font-black text-white uppercase italic tracking-tighter mb-2">
                    Profile Data Restricted
                </h2>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest max-w-xs mb-8 leading-relaxed">
                    We couldn't retrieve profile details for this operative. Please ensure your connection is secure.
                </p>
                <div className="flex flex-col gap-3 w-full max-w-xs">
                    <button
                        onClick={() => fetchProfile()}
                        className="py-4 bg-teal-500 text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-teal-500/20 active:scale-95"
                    >
                        Retry Protocol
                    </button>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="py-4 bg-white/5 text-zinc-400 rounded-2xl font-black text-xs uppercase tracking-[0.2em] border border-white/5 hover:text-white transition-all"
                    >
                        Return to Base
                    </button>
                </div>
            </div>
        )
    }

    const { profile, user: profileUser, stats, aggregate } = data;

    // --- HUB VIEW COMPONENTS ---

    const TopStrip = () => (
        <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
                <AvatarWithFrame
                    username={profileUser.username}
                    rank={profile.title}
                    avatarType={profile.avatarType || 'initials'}
                    size="medium"
                    showBadge={false}
                    className="ring-2 ring-white/10 rounded-full shadow-lg"
                />
                <div>
                    <h2 className="text-lg font-black uppercase tracking-wide text-white flex items-center gap-2 leading-none">
                        {profileUser.username}
                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" title="Online" />
                    </h2>
                    <button
                        onClick={() => setCurrentView('profile')}
                        className="text-[10px] font-bold text-teal-500 hover:text-teal-400 uppercase tracking-wider flex items-center gap-1 mt-1 transition-colors"
                    >
                        View Profile <ChevronRight size={10} />
                    </button>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <button
                    onClick={() => handleOpenChat()}
                    className="p-2.5 bg-white/5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-all relative"
                >
                    <MessageCircle size={20} />
                    {/* Unread indicator mockup - Real logic via ChatService later */}
                    <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-teal-500 rounded-full border border-[#0a0e1a] animate-pulse"></span>
                </button>
                <button
                    onClick={() => setShowFriendPanel(true)}
                    className="p-2.5 bg-white/5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-all relative"
                >
                    <UserPlus size={20} />
                    {/* Pending requests indicator mockup */}
                </button>
                <button
                    onClick={() => toast('No new notifications')}
                    className="p-2.5 bg-white/5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
                >
                    <Bell size={20} />
                </button>
            </div>
        </div>
    )

    const WalletPanel = () => (
        <div className="bg-gradient-to-br from-[#1a1f2e] to-[#141925] border border-white/5 rounded-2xl p-6 relative overflow-hidden shadow-xl group">
            {/* Wallet Icon Background */}
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                <Wallet size={120} className="transform -rotate-12" />
            </div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Total Balance</span>
                </div>

                <h1 className="text-4xl font-black italic tracking-tighter text-white mb-6 flex items-baseline gap-1">
                    <span className="text-2xl text-zinc-500 font-normal not-italic">€</span>
                    {balance.toFixed(2)}
                </h1>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => setCurrentView('wallet')}
                        className="py-3 bg-teal-500 hover:bg-teal-400 text-black rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-teal-500/20 active:scale-95"
                    >
                        Add Funds
                    </button>
                    <div className="relative group/tooltip">
                        <button
                            disabled
                            className="w-full py-3 bg-white/5 text-zinc-500 rounded-xl font-black text-xs uppercase tracking-wider border border-white/5 cursor-not-allowed"
                        >
                            Withdraw
                        </button>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            Coming Soon
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

    const GridMenu = () => (
        <div className="grid grid-cols-2 gap-3">
            <NavCard
                icon={Trophy}
                label="Tournaments"
                subtitle="Active Engagements"
                onClick={() => setCurrentView('tournaments')}
                delay={0.1}
                color="text-yellow-500"
            />
            <NavCard
                icon={Users}
                label="My Teams"
                subtitle="Manage Rosters"
                onClick={() => setCurrentView('teams')}
                delay={0.2}
                color="text-blue-500"
            />
            <NavCard
                icon={UserPlus}
                label="Friends"
                subtitle="Social Connections"
                onClick={() => setCurrentView('friends')}
                delay={0.3}
                color="text-pink-500"
            />
            <NavCard
                icon={Settings}
                label="Settings"
                subtitle="Preferences"
                onClick={() => setCurrentView('settings')}
                delay={0.4}
            />
            <NavCard
                icon={HelpCircle}
                label="Help Center"
                subtitle="Support & FAQs"
                onClick={() => setCurrentView('help')}
                delay={0.5}
                fullWidth
            />
        </div>
    )

    const NavCard = ({ icon: Icon, label, subtitle, onClick, delay, color = "text-zinc-400", fullWidth }: any) => (
        <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.3 }}
            onClick={onClick}
            className={`
                group relative overflow-hidden
                bg-[#1a1f2e] border border-white/5 rounded-2xl
                hover:bg-[#23293a] hover:border-white/10 transition-all
                text-left p-4
                ${fullWidth
                    ? 'col-span-2 flex items-center gap-4'
                    : 'flex flex-col items-start gap-4'
                }
            `}
        >
            <div className={`
                p-3 rounded-xl bg-white/5 ${color} 
                group-hover:scale-110 group-hover:bg-white/10 transition-all
            `}>
                <Icon size={22} className="stroke-[1.5]" />
            </div>

            <div className="relative z-10">
                <div className="text-sm font-bold text-white group-hover:text-teal-400 transition-colors leading-tight">
                    {label}
                </div>
                {subtitle && (
                    <div className="text-[10px] text-zinc-500 font-medium mt-1 group-hover:text-zinc-400 transition-colors">
                        {subtitle}
                    </div>
                )}
            </div>

            {/* Subtle Gradient Hover Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.button>
    )

    // --- SUB-VIEW WRAPPER ---

    const PageWrapper = ({ children, title, subtitle }: any) => (
        <div className="min-h-screen bg-[#0a0e1a] pb-24 animate-in fade-in slide-in-from-right duration-300">
            <div className="sticky top-0 z-50 bg-[#0a0e1a]/95 backdrop-blur-xl border-b border-white/5 px-4 py-4 flex items-center gap-4">
                <button
                    onClick={() => setCurrentView('hub')}
                    className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-white"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 className="text-lg font-black text-white leading-none">{title}</h2>
                    {subtitle && <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mt-0.5">{subtitle}</p>}
                </div>
            </div>
            <div className="p-5">
                {children}
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-[#0a0e1a] text-white overflow-x-hidden font-sans pb-24">
            <Toaster position="top-center" />

            <AnimatePresence mode="wait">
                {currentView === 'hub' ? (
                    <motion.div
                        key="hub"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="px-5 py-6 space-y-8"
                    >
                        <TopStrip />
                        <WalletPanel />

                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-4 px-1">Menu</h3>
                            <GridMenu />
                        </div>

                        <div className="text-center pt-4">
                            <p className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest">Esporizon Mobile v2.1.0</p>
                        </div>
                    </motion.div>
                ) : (
                    <div key="subview">
                        {currentView === 'profile' && (
                            <PageWrapper key="profile" title="My Profile" subtitle="Edit & Preview">
                                <ProfileTab profile={profile} user={profileUser} onEdit={() => setShowEditModal(true)} isOwnProfile={isOwnProfile} />
                                <div className="mt-8 border-t border-white/5 pt-8">
                                    <OverviewTab
                                        stats={stats}
                                        aggregate={aggregate}
                                        profile={profile}
                                        memberSince={profileUser.createdAt}
                                        onEdit={() => setShowEditModal(true)}
                                        onViewTournaments={() => setCurrentView('tournaments')}
                                        onViewWallet={() => setCurrentView('wallet')}
                                        isOwnProfile={isOwnProfile}
                                    />
                                </div>
                            </PageWrapper>
                        )}
                        {currentView === 'tournaments' && (
                            <PageWrapper key="tournaments" title="My Tournaments" subtitle="Active Engagements">
                                <TournamentsTab userId={targetUserId} />
                            </PageWrapper>
                        )}
                        {currentView === 'wallet' && (
                            <PageWrapper key="wallet" title="Combat Wallet" subtitle="Funds & Transactions">
                                <WalletTab />
                            </PageWrapper>
                        )}
                        {currentView === 'teams' && (
                            <PageWrapper key="teams" title="My Teams" subtitle="Manage Rosters">
                                <TeamsTab />
                            </PageWrapper>
                        )}
                        {currentView === 'friends' && (
                            <PageWrapper key="friends" title="Friends" subtitle="Social Connections">
                                <FriendsTab onChat={handleOpenChat} />
                            </PageWrapper>
                        )}
                        {currentView === 'settings' && (
                            <PageWrapper key="settings" title="Settings" subtitle="App Preferences">
                                <SettingsTab />
                            </PageWrapper>
                        )}
                        {currentView === 'help' && (
                            <PageWrapper key="help" title="Help Center" subtitle="Support & FAQ">
                                <HelpTab />
                            </PageWrapper>
                        )}
                    </div>
                )}
            </AnimatePresence>

            {/* Social Panels */}
            <ChatPanel
                isOpen={showChatPanel}
                onClose={() => {
                    setShowChatPanel(false)
                    setActiveChatFriend(null)
                }}
                initialActiveChat={activeChatFriend}
            />
            <FriendRequestPanel isOpen={showFriendPanel} onClose={() => setShowFriendPanel(false)} />

            {/* Modals */}
            {isOwnProfile && (
                <>
                    <EditProfileModal
                        isOpen={showEditModal}
                        onClose={() => setShowEditModal(false)}
                        profile={{ ...data.profile, username: data.user.username } as any}
                        user={user}
                        onSave={() => {
                            fetchProfile();
                            setShowEditModal(false);
                            toast.success('Profile updated');
                        }}
                    />
                    <CustomerSupportModal
                        isOpen={showSupportModal}
                        onClose={() => setShowSupportModal(false)}
                        firebaseUid={user?.uid || ''}
                        userId={data?.user?.id}
                    />
                </>
            )}
        </div>
    )
}

export default ProfilePage
