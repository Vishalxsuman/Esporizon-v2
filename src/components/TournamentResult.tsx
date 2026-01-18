
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, Crosshair, IndianRupee } from 'lucide-react';

interface Result {
    userId: string;
    userName?: string; // Optional if not stored
    rank: number;
    kills: number;
    killPrize: number;
    rankPrize: number;
    totalWinnings: number;
    teamName?: string;
}

interface TournamentResultProps {
    isOpen: boolean;
    onClose: () => void;
    results: Result[];
    tournamentName: string;
    totalPrizePool: number;
}

const TournamentResult: React.FC<TournamentResultProps> = ({ isOpen, onClose, results, tournamentName, totalPrizePool }) => {
    // Sort results by rank
    const sortedResults = [...results].sort((a, b) => a.rank - b.rank);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="relative w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
                    >
                        {/* Header */}
                        <div className="relative p-6 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 border-b border-white/5">
                            <button
                                onClick={onClose}
                                className="absolute right-4 top-4 p-2 rounded-full hover:bg-white/10 transition-colors"
                            >
                                <X className="w-5 h-5 text-zinc-400" />
                            </button>

                            <div className="flex items-center gap-3 mb-2">
                                <Trophy className="w-6 h-6 text-yellow-500" />
                                <h2 className="text-xl font-black text-white italic tracking-tight uppercase">
                                    WAR RESULTS
                                </h2>
                            </div>
                            <p className="text-sm text-zinc-400 font-medium">
                                {tournamentName}
                            </p>
                        </div>

                        {/* Results Table */}
                        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-6 space-y-3">
                            {sortedResults.length > 0 ? (
                                sortedResults.map((result, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className={`flex items-center justify-between p-4 rounded-xl border ${result.rank === 1 ? 'bg-yellow-500/10 border-yellow-500/20' :
                                            result.rank === 2 ? 'bg-zinc-800/50 border-zinc-700/50' :
                                                result.rank === 3 ? 'bg-amber-700/10 border-amber-700/20' :
                                                    'bg-zinc-900/50 border-white/5'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-8 h-8 flex items-center justify-center rounded-full font-black text-sm border ${result.rank === 1 ? 'bg-yellow-500 text-black border-yellow-400' :
                                                result.rank === 2 ? 'bg-zinc-400 text-black border-zinc-300' :
                                                    result.rank === 3 ? 'bg-amber-700 text-white border-amber-600' :
                                                        'bg-zinc-800 text-zinc-500 border-zinc-700'
                                                }`}>
                                                #{result.rank}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white text-sm">
                                                    {result.teamName || result.userName || `Player ${result.userId.slice(0, 5)}`}
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1">
                                                    <span className="flex items-center gap-1">
                                                        <Crosshair className="w-3 h-3" />
                                                        {result.kills} Kills
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="flex items-center justify-end gap-1 text-teal-400 font-black italic text-lg">
                                                <IndianRupee className="w-4 h-4" />
                                                {result.totalWinnings}
                                            </div>
                                            <div className="text-[10px] text-zinc-600 uppercase tracking-wider">
                                                Total Winnings
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="text-center py-10 text-zinc-500">
                                    No results available yet.
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-zinc-950/50 border-t border-white/5 flex justify-between items-center text-xs text-zinc-500">
                            <div>Total Prize Distributed</div>
                            <div className="font-bold text-teal-500">
                                ₹{sortedResults.reduce((acc, curr) => acc + curr.totalWinnings, 0)}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default TournamentResult;
