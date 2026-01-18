import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ArrowLeft,
    Target,
    Flame,
    Clock,
    MoreVertical,
    Swords,
    Edit3,
    LogOut,
    Settings,
    MessageSquare,
    Zap
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useNavigate, useParams } from 'react-router-dom'
import { Toaster, toast } from 'react-hot-toast'
import { Sun, Moon } from 'lucide-react'
import ProfileService from '@/services/ProfileService'
import AvatarWithFrame from '@/components/AvatarWithFrame'
import EditProfileModal from '@/components/EditProfileModal'
import CustomerSupportModal from '@/components/CustomerSupportModal'

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
    const { user, signOut } = useAuth()
    const { theme, toggleTheme } = useTheme()
    const { userId: paramId } = useParams()
    const navigate = useNavigate()

    const targetUserId = paramId || user?.uid

    const [data, setData] = useState<ProfileData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'overview' | 'matches'>('overview')
    const [showSettingsMenu, setShowSettingsMenu] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showSupportModal, setShowSupportModal] = useState(false)

    const fetchProfile = async () => {
        if (!targetUserId) {
            setError('No user ID available');
            setLoading(false);
            return;
        }

        try {
            setLoading(true)
            const profileData = await ProfileService.getProfileByUserId(targetUserId);
            setData(profileData)
            setError(null)
        } catch (err) {
            console.error('Failed to load profile:', err)
            setError('Could not load profile data. Please ensure the backend is running.')
            toast.error('Failed to load profile')
        } finally {
            setLoading(false)
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [targetUserId])

    const isOwnProfile = (user?.uid === data?.user?.firebaseUid) || (!paramId && !!user)

    const handleLogout = async () => {
        try {
            await signOut();
            toast.success('Logged out successfully');
            navigate('/auth');
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Failed to logout');
        }
    };

    // Helper for Rank Colors
    const getRankColor = (rank: string) => {
        switch (rank?.toLowerCase()) {
            case 'elite': return 'from-yellow-400 via-orange-500 to-red-600';
            case 'pro': return 'from-purple-400 to-pink-600';
            case 'diamond': return 'from-blue-400 to-cyan-500';
            case 'platinum': return 'from-teal-400 to-emerald-500';
            case 'gold': return 'from-yellow-300 to-amber-500';
            case 'silver': return 'from-slate-300 to-slate-400';
            default: return 'from-stone-500 to-stone-700';
        }
    };

    const gameIcons: Record<string, string> = {
        freefire: '🔥',
        bgmi: '🎯',
        valorant: '⚡',
        minecraft: '⛏️'
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center p-4">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-[var(--accent)]/10 border-t-[var(--accent)] rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Target className="text-[var(--accent)] animate-pulse" size={20} />
                    </div>
                </div>
                <p className="mt-4 text-[10px] font-black uppercase tracking-[0.4em] text-[var(--accent)]">Loading Intel...</p>
            </div>
        )
    }

    if (error && !data) {
        return (
            <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center p-4">
                <div className="text-red-500 font-bold mb-4">{error || 'Profile not found'}</div>
                <button onClick={() => navigate('/')} className="px-4 py-2 bg-[var(--surface)] rounded-lg text-sm">Go Home</button>
            </div>
        )
    }

    if (!data) return null;

    const { profile, stats, aggregate, history, user: profileUser } = data;

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] pb-32 relative overflow-hidden">
            <Toaster position="top-center" />

            {/* Background Atmosphere */}
            <div className="fixed inset-0 pointer-events-none opacity-20">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[var(--accent)]/10 blur-[150px]" />
            </div>

            {/* Header */}
            <div className="sticky top-0 z-50 bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-[var(--border)]">
                <div className="max-w-md mx-auto px-5 py-4 flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] min-w-[44px] min-h-[44px] -ml-2 flex items-center justify-center">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="text-center">
                        <div className="text-[8px] font-bold uppercase tracking-[0.3em] text-[var(--accent)]">ESPORIZON</div>
                        <div className="text-[10px] font-black italic text-[var(--text-primary)]">OPERATIVE DOSSIER</div>
                    </div>
                    <div className="flex gap-1">
                        <button onClick={toggleTheme} className="p-2.5 hover:bg-[var(--surface-hover)] rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center">
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        {isOwnProfile && (
                            <div className="relative">
                                <button
                                    onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                                    className="p-2.5 hover:bg-[var(--surface-hover)] rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
                                >
                                    <MoreVertical size={18} />
                                </button>
                                <AnimatePresence>
                                    {showSettingsMenu && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                            className="absolute right-0 mt-2 w-48 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden z-10"
                                        >
                                            <button
                                                onClick={() => {
                                                    setShowEditModal(true);
                                                    setShowSettingsMenu(false);
                                                }}
                                                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[var(--surface-hover)] transition-colors text-left"
                                            >
                                                <Edit3 size={16} className="text-[var(--accent)]" />
                                                <span className="text-sm font-bold">Edit Profile</span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowSupportModal(true);
                                                    setShowSettingsMenu(false);
                                                }}
                                                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[var(--surface-hover)] transition-colors text-left border-t border-[var(--border)]"
                                            >
                                                <MessageSquare size={16} className="text-[var(--accent)]" />
                                                <span className="text-sm font-bold">Customer Support</span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowSettingsMenu(false);
                                                    navigate('/settings');
                                                }}
                                                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[var(--surface-hover)] transition-colors text-left border-t border-[var(--border)]"
                                            >
                                                <Settings size={16} className="text-[var(--text-secondary)]" />
                                                <span className="text-sm font-bold">Settings</span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowSettingsMenu(false);
                                                    handleLogout();
                                                }}
                                                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-red-500/10 transition-colors text-left border-t border-[var(--border)]"
                                            >
                                                <LogOut size={16} className="text-red-500" />
                                                <span className="text-sm font-bold text-red-500">Logout</span>
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-md mx-auto px-5 pt-6 space-y-8 relative z-10">

                {/* IDENTITY SECTION */}
                <div className="flex flex-col items-center text-center">
                    <AvatarWithFrame
                        username={profileUser.username}
                        rank={profile.title}
                        avatarType={profile.avatarType || 'initials'}
                        size="large"
                        showBadge={true}
                        className="mb-4"
                    />

                    <h1 className="text-3xl font-black italic tracking-wide uppercase text-white mb-2">
                        {profileUser.username}
                    </h1>

                    <div className="flex items-center gap-2 mb-4">
                        <span className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-gradient-to-r ${getRankColor(profile.title)} text-black shadow-lg shadow-[var(--accent)]/20`}>
                            {profile.title}
                        </span>
                    </div>

                    {profile.bio && (
                        <p className="text-sm text-[var(--text-secondary)] italic max-w-[300px] leading-relaxed">
                            "{profile.bio}"
                        </p>
                    )}

                    {/* Quick Actions (Mobile-optimized) */}
                    {isOwnProfile && (
                        <div className="flex gap-3 mt-6 w-full max-w-sm">
                            <button
                                onClick={() => setShowEditModal(true)}
                                className="flex-1 px-4 py-3 bg-[var(--accent)] text-black rounded-xl font-bold uppercase text-xs tracking-wide hover:opacity-90 transition-opacity flex items-center justify-center gap-2 min-h-[48px]"
                            >
                                <Edit3 size={16} />
                                Edit Profile
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-3 bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] rounded-xl font-bold uppercase text-xs tracking-wide hover:bg-[var(--surface-hover)] transition-colors flex items-center justify-center gap-2 min-h-[48px]"
                            >
                                <LogOut size={16} />
                                Logout
                            </button>
                        </div>
                    )}
                </div>

                {/* PERFORMANCE SNAPSHOT */}
                <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-0 border border-[var(--border)] bg-[var(--surface)]/50 rounded-2xl overflow-hidden divide-x divide-[var(--border)]">
                        <div className="p-4 text-center group hover:bg-[var(--surface-hover)] transition-colors">
                            <div className="text-[var(--text-secondary)] mb-1 text-[10px] font-bold uppercase tracking-wider">Matches</div>
                            <div className="text-2xl font-black italic text-[var(--text-primary)]">{aggregate.totalMatches}</div>
                        </div>
                        <div className="p-4 text-center group hover:bg-[var(--surface-hover)] transition-colors">
                            <div className="text-[var(--text-secondary)] mb-1 text-[10px] font-bold uppercase tracking-wider">Wins</div>
                            <div className="text-2xl font-black italic text-[var(--accent)]">{aggregate.totalWins}</div>
                        </div>
                        <div className="p-4 text-center group hover:bg-[var(--surface-hover)] transition-colors">
                            <div className="text-[var(--text-secondary)] mb-1 text-[10px] font-bold uppercase tracking-wider">Win Rate</div>
                            <div className={`text-2xl font-black italic ${aggregate.overallWinRate > 50 ? 'text-green-500' : 'text-yellow-500'}`}>
                                {aggregate.overallWinRate}%
                            </div>
                        </div>
                    </div>

                    {/* Current Streak */}
                    {profile.currentStreak !== undefined && profile.currentStreak !== 0 && (
                        <div className={`p-4 rounded-xl border flex items-center justify-between ${profile.currentStreak > 0
                            ? 'bg-green-500/5 border-green-500/20'
                            : 'bg-red-500/5 border-red-500/20'
                            }`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${profile.currentStreak > 0 ? 'bg-green-500/20' : 'bg-red-500/20'
                                    }`}>
                                    <Flame size={20} className={profile.currentStreak > 0 ? 'text-green-500' : 'text-red-500'} />
                                </div>
                                <div>
                                    <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                                        {profile.currentStreak > 0 ? 'Win Streak' : 'Loss Streak'}
                                    </div>
                                    <div className="text-xl font-black italic text-[var(--text-primary)]">
                                        {Math.abs(profile.currentStreak)} {Math.abs(profile.currentStreak) === 1 ? 'Match' : 'Matches'}
                                    </div>
                                </div>
                            </div>
                            {profile.currentStreak > 0 && (
                                <Zap size={24} className="text-green-500 animate-pulse" />
                            )}
                        </div>
                    )}
                </div>

                {/* NAVIGATION TABS */}
                <div className="flex p-1 bg-[var(--surface)] rounded-xl border border-[var(--border)]">
                    {[
                        { id: 'overview', label: 'Overview', icon: Target },
                        { id: 'matches', label: 'History', icon: Clock },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all min-h-[48px] ${activeTab === tab.id
                                ? 'bg-[var(--accent)] text-black shadow-lg'
                                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'overview' ? (
                            <div className="space-y-6">
                                {/* GAME RANKS */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Swords size={18} className="text-[var(--accent)]" />
                                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[var(--text-secondary)]">Combat Records</h3>
                                    </div>

                                    {Object.values(stats).map((stat) => (
                                        <motion.div
                                            key={stat.game}
                                            className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5 relative overflow-hidden group hover:border-[var(--accent)]/40 transition-all"
                                            whileHover={{ scale: 1.02 }}
                                            transition={{ type: 'spring', stiffness: 300 }}
                                        >
                                            {/* Rank Progress Background */}
                                            <div className="absolute bottom-0 left-0 h-1.5 bg-[var(--accent)]/20 w-full">
                                                <motion.div
                                                    className="h-full bg-[var(--accent)]"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.min((stat.rankScore / 5000) * 100, 100)}%` }}
                                                    transition={{ duration: 1, ease: 'easeOut' }}
                                                />
                                            </div>

                                            <div className="flex justify-between items-center relative z-10 mb-3">
                                                <div className="flex items-center gap-4">
                                                    {/* Game Icon */}
                                                    <div className="w-12 h-12 rounded-xl bg-[var(--surface)] flex items-center justify-center text-2xl">
                                                        {gameIcons[stat.game] || '🎮'}
                                                    </div>

                                                    <div>
                                                        <div className="text-base font-black uppercase italic tracking-wide text-white capitalize">{stat.game}</div>
                                                        <div className={`text-sm font-bold bg-gradient-to-r ${getRankColor(stat.currentRank)} bg-clip-text text-transparent`}>
                                                            {stat.currentRank} <span className="text-[var(--text-secondary)] text-[0.7rem] font-normal">({stat.rankScore} PTS)</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <div className="text-[0.65rem] uppercase tracking-wider text-[var(--text-secondary)] font-bold">K/D Ratio</div>
                                                    <div className="text-xl font-black italic text-[var(--text-primary)]">{stat.kdRatio}</div>
                                                </div>
                                            </div>

                                            {/* Mini Stats */}
                                            <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-[var(--border)]">
                                                <div>
                                                    <div className="text-[0.65rem] text-[var(--text-secondary)] font-bold uppercase">Played</div>
                                                    <div className="text-sm font-black text-[var(--text-primary)]">{stat.matchesPlayed}</div>
                                                </div>
                                                <div>
                                                    <div className="text-[0.65rem] text-[var(--text-secondary)] font-bold uppercase">Won</div>
                                                    <div className="text-sm font-black text-green-500">{stat.matchesWon}</div>
                                                </div>
                                                <div>
                                                    <div className="text-[0.65rem] text-[var(--text-secondary)] font-bold uppercase">Win %</div>
                                                    <div className="text-sm font-black text-[var(--accent)]">{stat.winRate}%</div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Clock size={18} className="text-[var(--accent)]" />
                                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[var(--text-secondary)]">Recent Operations</h3>
                                </div>

                                {history.length === 0 ? (
                                    <div className="text-center py-12 text-[var(--text-secondary)] text-sm italic">
                                        No combat history found.
                                    </div>
                                ) : (
                                    history.map((match) => (
                                        <div key={match._id} className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-4 flex items-center justify-between hover:bg-[var(--surface-hover)] transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-1.5 h-14 rounded-full ${match.result === 'Victory' ? 'bg-green-500' : (match.result === 'Defeat' ? 'bg-red-500' : 'bg-gray-500')}`} />
                                                <div>
                                                    <div className="text-sm font-bold uppercase text-[var(--text-primary)] capitalize">{match.game}</div>
                                                    <div className="text-xs text-[var(--text-secondary)]">{new Date(match.playedAt).toLocaleDateString()}</div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="text-center">
                                                    <div className="text-[0.65rem] uppercase tracking-wider text-[var(--text-secondary)]">Rank</div>
                                                    <div className="text-base font-black text-white">#{match.rank}</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-[0.65rem] uppercase tracking-wider text-[var(--text-secondary)]">Kills</div>
                                                    <div className="text-base font-black text-white">{match.kills}</div>
                                                </div>
                                                <div className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase ${match.result === 'Victory' ? 'text-green-400 bg-green-400/10' : 'text-[var(--text-secondary)] bg-[var(--surface)]'}`}>
                                                    {match.result}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

            </div>

            {/* Modals */}
            {isOwnProfile && (
                <>
                    <EditProfileModal
                        isOpen={showEditModal}
                        onClose={() => setShowEditModal(false)}
                        profile={data as any}
                        user={user}
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
