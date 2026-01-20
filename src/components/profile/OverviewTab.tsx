import { motion } from 'framer-motion'
import { Trophy, TrendingUp, Edit3, Wallet, Swords, Calendar, Star } from 'lucide-react'

// Helper for Rank Colors (Moved here for reuse)
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

interface OverviewTabProps {
    stats: any;
    aggregate: any;
    profile: any;
    memberSince?: string;
    onEdit?: () => void;
    onViewTournaments?: () => void;
    onViewWallet?: () => void;
    isOwnProfile?: boolean;
}

const OverviewTab = ({ stats, aggregate, profile, memberSince, onEdit, onViewTournaments, onViewWallet, isOwnProfile }: OverviewTabProps) => {
    return (
        <div className="space-y-6">

            {/* Quick Actions & Join Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Joined Date Card */}
                <div className="bg-[#0E1424]/40 border border-white/5 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center">
                        <Calendar className="text-teal-500" size={24} />
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Operative Since</div>
                        <div className="text-sm font-bold text-white">{memberSince ? new Date(memberSince).toLocaleDateString() : 'Unknown'}</div>
                    </div>
                </div>

                {/* Quick Buttons Group */}
                {isOwnProfile && (
                    <div className="grid grid-cols-3 gap-2">
                        <button onClick={onEdit} className="flex flex-col items-center justify-center bg-white/5 border border-white/5 hover:bg-white/10 hover:border-teal-500/30 rounded-xl p-2 transition-all group">
                            <Edit3 size={20} className="text-zinc-400 group-hover:text-teal-400 mb-1" />
                            <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Edit Profile</span>
                        </button>
                        <button onClick={onViewTournaments} className="flex flex-col items-center justify-center bg-white/5 border border-white/5 hover:bg-white/10 hover:border-teal-500/30 rounded-xl p-2 transition-all group">
                            <Swords size={20} className="text-zinc-400 group-hover:text-teal-400 mb-1" />
                            <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">My Tournys</span>
                        </button>
                        <button onClick={onViewWallet} className="flex flex-col items-center justify-center bg-white/5 border border-white/5 hover:bg-white/10 hover:border-teal-500/30 rounded-xl p-2 transition-all group">
                            <Wallet size={20} className="text-zinc-400 group-hover:text-teal-400 mb-1" />
                            <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Wallet</span>
                        </button>
                    </div>
                )}
            </div>

            {/* PERFORMANCE SNAPSHOT */}
            <div className="grid grid-cols-3 gap-0 border border-white/5 bg-white/5 rounded-2xl overflow-hidden divide-x divide-white/5">
                <div className="p-4 text-center group hover:bg-white/10 transition-colors">
                    <div className="text-zinc-500 mb-1 text-[10px] font-bold uppercase tracking-wider">Matches</div>
                    <div className="text-2xl font-black italic text-white">{aggregate?.totalMatches || 0}</div>
                </div>
                <div className="p-4 text-center group hover:bg-white/10 transition-colors">
                    <div className="text-zinc-500 mb-1 text-[10px] font-bold uppercase tracking-wider">Win Rate</div>
                    <div className={`text-2xl font-black italic ${aggregate?.overallWinRate > 50 ? 'text-green-500' : 'text-yellow-500'}`}>
                        {aggregate?.overallWinRate || 0}%
                    </div>
                </div>
                {/* Reputation (Mocked if not available, replacing Wins as per request) */}
                <div className="p-4 text-center group hover:bg-white/10 transition-colors">
                    <div className="text-zinc-500 mb-1 text-[10px] font-bold uppercase tracking-wider">Reputation</div>
                    <div className="text-2xl font-black italic text-teal-400 flex items-center justify-center gap-1">
                        100 <Star size={12} fill="currentColor" />
                    </div>
                </div>
            </div>

            {/* Current Streak */}
            {profile?.currentStreak !== undefined && profile?.currentStreak !== 0 && (
                <div className={`p-4 rounded-xl border flex items-center justify-between ${profile.currentStreak > 0
                    ? 'bg-green-500/5 border-green-500/20'
                    : 'bg-red-500/5 border-red-500/20'
                    }`}>
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${profile.currentStreak > 0 ? 'bg-green-500/20' : 'bg-red-500/20'
                            }`}>
                            <TrendingUp size={20} className={profile.currentStreak > 0 ? 'text-green-500' : 'text-red-500'} />
                        </div>
                        <div>
                            <div className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                                {profile.currentStreak > 0 ? 'Win Streak' : 'Loss Streak'}
                            </div>
                            <div className="text-xl font-black italic text-white">
                                {Math.abs(profile.currentStreak)} {Math.abs(profile.currentStreak) === 1 ? 'Match' : 'Matches'}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* GAME RANKS */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                    <Trophy size={18} className="text-teal-400" />
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-500">Combat Records</h3>
                </div>

                {stats && Object.values(stats).map((stat: any) => (
                    <motion.div
                        key={stat.game}
                        className="bg-[#0E1424]/40 border border-white/5 rounded-xl p-5 relative overflow-hidden group hover:border-teal-400/40 transition-all"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        {/* Rank Progress Background */}
                        <div className="absolute bottom-0 left-0 h-1.5 bg-teal-500/20 w-full">
                            <motion.div
                                className="h-full bg-teal-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(((stat.rankScore || 0) / 5000) * 100, 100)}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                            />
                        </div>

                        <div className="flex justify-between items-center relative z-10 mb-3">
                            <div className="flex items-center gap-4">
                                {/* Game Icon */}
                                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl border border-white/5">
                                    {gameIcons[stat.game] || '🎮'}
                                </div>

                                <div>
                                    <div className="text-base font-black uppercase italic tracking-wide text-white capitalize">{stat.game}</div>
                                    <div className={`text-sm font-bold bg-gradient-to-r ${getRankColor(stat.currentRank)} bg-clip-text text-transparent`}>
                                        {stat.currentRank || 'Unranked'} <span className="text-zinc-500 text-[0.7rem] font-normal">({stat.rankScore || 0} PTS)</span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="text-[0.65rem] uppercase tracking-wider text-zinc-500 font-bold">K/D Ratio</div>
                                <div className="text-xl font-black italic text-white">{stat.kdRatio || 0}</div>
                            </div>
                        </div>

                        {/* Mini Stats */}
                        <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-white/5">
                            <div>
                                <div className="text-[0.65rem] text-zinc-500 font-bold uppercase">Played</div>
                                <div className="text-sm font-black text-white">{stat.matchesPlayed || 0}</div>
                            </div>
                            <div>
                                <div className="text-[0.65rem] text-zinc-500 font-bold uppercase">Won</div>
                                <div className="text-sm font-black text-green-500">{stat.matchesWon || 0}</div>
                            </div>
                            <div>
                                <div className="text-[0.65rem] text-zinc-500 font-bold uppercase">Win %</div>
                                <div className="text-sm font-black text-teal-400">{stat.winRate || 0}%</div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

export default OverviewTab
