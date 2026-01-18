import { useState } from 'react';
import { X, Trophy, Users, Calendar, Clock, Shield, Star, IndianRupee, Loader2 } from 'lucide-react';
import { Tournament } from '../data/mockTournaments';

interface TournamentModalProps {
    tournament: Tournament;
    isOpen: boolean;
    onClose: () => void;
    onJoin: (tournamentId: string, teamName: string) => Promise<void>;
    isJoining: boolean;
}

const TournamentModal: React.FC<TournamentModalProps> = ({ tournament, isOpen, onClose, onJoin, isJoining }) => {
    const [teamName, setTeamName] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    // Format date and time
    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        const dateStr = date.toLocaleDateString('en-IN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        const timeStr = date.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        return `${dateStr} at ${timeStr}`;
    };

    // Status badge colors
    const getStatusColor = (status: Tournament['status']) => {
        switch (status) {
            case 'Open':
                return 'bg-teal-500/20 text-teal-400 border-teal-500/40';
            case 'Live':
                return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 animate-pulse';
            case 'Locked':
                return 'bg-violet-500/20 text-violet-400 border-violet-500/40';
            case 'Completed':
                return 'bg-gray-500/20 text-gray-400 border-gray-500/40';
            default:
                return 'bg-gray-500/20 text-gray-400 border-gray-500/40';
        }
    };

    const handleJoinClick = async () => {
        setError('');
        if (tournament.mode !== 'Solo' && !teamName.trim()) {
            setError('Team Name is required for Duo/Squad');
            return;
        }
        await onJoin(tournament.id, teamName);
    };

    const isJoinable = tournament.status === 'Open';

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 animate-fadeIn"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-x-0 bottom-0 z-50 animate-slideUp">
                <div className="bg-[var(--bg-primary)] border-t border-white/10 rounded-t-3xl max-h-[85vh] overflow-y-auto custom-scrollbar">
                    {/* Header */}
                    <div className="sticky top-0 bg-[var(--bg-primary)]/95 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-white mb-1">{tournament.name}</h2>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(tournament.status)}`}>
                                {tournament.status.toUpperCase()}
                            </span>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                            aria-label="Close modal"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="px-6 pb-24 space-y-6"> {/* Added padding bottom for sticky footer if needed */}
                        {/* Tournament Overview */}
                        <div className="grid grid-cols-2 gap-4 pt-6">
                            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                                    <Trophy className="w-4 h-4" />
                                    <span>Prize Pool</span>
                                </div>
                                <div className="flex items-center gap-1 text-teal-400 font-bold text-2xl">
                                    <IndianRupee className="w-5 h-5" />
                                    <span>{tournament.prizePool.toLocaleString('en-IN')}</span>
                                </div>
                            </div>

                            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                                    <IndianRupee className="w-4 h-4" />
                                    <span>Entry Fee</span>
                                </div>
                                <div className="text-white font-bold text-2xl">
                                    ₹{tournament.entryFee}
                                </div>
                            </div>

                            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                                    <Users className="w-4 h-4" />
                                    <span>Slots</span>
                                </div>
                                <div className="text-white font-bold text-xl">
                                    {tournament.slots.filled} / {tournament.slots.total}
                                </div>
                            </div>

                            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                                    <Shield className="w-4 h-4" />
                                    <span>Mode</span>
                                </div>
                                <div className="text-white font-bold text-xl">
                                    {tournament.mode}
                                </div>
                            </div>
                        </div>

                        {/* Join Section */}
                        {isJoinable && (
                            <div className="bg-gradient-to-br from-teal-500/10 to-emerald-500/5 rounded-xl p-6 border border-teal-500/20">
                                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                    <Users className="w-5 h-5 text-teal-400" />
                                    Join Tournament
                                </h3>

                                {tournament.mode !== 'Solo' && (
                                    <div className="mb-4">
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Team Name</label>
                                        <input
                                            type="text"
                                            value={teamName}
                                            onChange={(e) => setTeamName(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-teal-500/50 placeholder:text-zinc-600"
                                            placeholder="Enter your team name"
                                        />
                                    </div>
                                )}

                                {error && (
                                    <div className="text-red-400 text-xs mb-3 font-semibold">
                                        {error}
                                    </div>
                                )}

                                <button
                                    onClick={handleJoinClick}
                                    disabled={isJoining}
                                    className="w-full py-4 bg-teal-500 hover:bg-teal-400 text-black font-black uppercase tracking-widest rounded-xl shadow-lg shadow-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    {isJoining ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Joining...
                                        </>
                                    ) : (
                                        <>
                                            Pay ₹{tournament.entryFee} & Join
                                        </>
                                    )}
                                </button>
                                <p className="text-center text-[10px] text-zinc-500 mt-3 font-medium">
                                    Entry fee will be deducted from your wallet instantly.
                                </p>
                            </div>
                        )}

                        {/* Schedule */}
                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                                <Calendar className="w-4 h-4" />
                                <span>Schedule</span>
                            </div>
                            <div className="flex items-center gap-2 text-white font-medium">
                                <Clock className="w-4 h-4 text-teal-400" />
                                <span>{formatDateTime(tournament.startDate)}</span>
                            </div>
                        </div>

                        {/* Host Info */}
                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                            <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
                                <Users className="w-4 h-4" />
                                <span>Hosted By</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-white font-semibold">{tournament.host?.name || tournament.organizerName || 'Unknown Host'}</span>
                                <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/30 px-3 py-1.5 rounded-full">
                                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                    <span className="text-yellow-400 font-bold text-sm">{tournament.host?.rating?.toFixed(1) || '5.0'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Tournament Rules */}
                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-teal-400" />
                                Tournament Rules
                            </h3>
                            <ul className="space-y-2">
                                {tournament.rules?.map((rule, index) => (
                                    <li key={index} className="flex items-start gap-3 text-gray-300 text-sm">
                                        <span className="text-teal-400 font-bold mt-0.5">•</span>
                                        <span>{rule}</span>
                                    </li>
                                )) || (
                                        <li className="text-gray-500 text-sm italic">No specific rules listed. Play fair!</li>
                                    )}
                            </ul>
                        </div>

                        {/* Prize Distribution */}
                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-teal-400" />
                                Prize Distribution
                            </h3>
                            <div className="space-y-2">
                                {Array.isArray(tournament.prizeDistribution) ? tournament.prizeDistribution.map((prize, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5"
                                    >
                                        <span className="text-gray-300 font-medium">{prize.position ? `${prize.position} Place` : `#${index + 1}`}</span>
                                        <div className="flex items-center gap-1 text-teal-400 font-bold">
                                            <IndianRupee className="w-4 h-4" />
                                            <span>{Number(prize.amount || prize).toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-gray-500 text-sm">Check description for prize details.</div>
                                )}
                            </div>
                        </div>

                        {/* Fair Play Disclaimer */}
                        <div className="bg-teal-500/10 border border-teal-500/30 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <Shield className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-teal-400 font-semibold mb-1">Fair Play Guarantee</h4>
                                    <p className="text-gray-300 text-sm leading-relaxed">
                                        All tournaments on Esporizon are skill-based and monitored for fair play.
                                        We use anti-cheat systems and manual review to ensure competitive integrity.
                                        Prizes are distributed automatically based on verified results.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TournamentModal;
