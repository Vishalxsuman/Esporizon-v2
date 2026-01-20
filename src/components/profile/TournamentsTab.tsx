import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { tournamentService } from '@/services/TournamentService';
import TournamentCard from '@/components/TournamentCard';

interface TournamentsTabProps {
    userId?: string;
}

const TournamentsTab = ({ userId }: TournamentsTabProps) => {
    const navigate = useNavigate();
    const [tournaments, setTournaments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;
        fetchData();
    }, [userId]);

    const fetchData = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const response = await tournamentService.getMyTournamentHistory(userId);
            // Only show active joined tournaments (not completed, not hosted)
            setTournaments(response.joined.filter((t: any) => t.status !== 'completed'));
        } catch (error) {
            if (import.meta.env.MODE !== 'production') {
                console.error('Error fetching tournament history:', error);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="hidden">
                {/* Tabs removed as per request for regular user view */}
            </div>

            {/* Content */}
            <motion.div layout className="min-h-[300px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-8 h-8 border-2 border-teal-500/10 border-t-teal-500 rounded-full animate-spin" />
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Loading...</p>
                    </div>
                ) : tournaments.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4 md:gap-8">
                        <AnimatePresence mode="popLayout">
                            {tournaments.map((tournament, idx) => (
                                <TournamentCard
                                    key={tournament.id}
                                    tournament={tournament}
                                    index={idx}
                                    compact
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center bg-white/5 rounded-[2.5rem] border border-dashed border-white/5">
                        <div className="relative mb-6">
                            <div className="w-16 h-16 rounded-full bg-zinc-900/40 border border-white/5 flex items-center justify-center">
                                <Trophy className="w-8 h-8 text-zinc-900" />
                            </div>
                        </div>
                        <h3 className="text-sm font-black text-white italic mb-2 tracking-tighter uppercase">No Deployments</h3>
                        <p className="text-zinc-600 text-[10px] uppercase tracking-[0.2em] max-w-xs mx-auto mb-6">
                            Nothing to report in this sector.
                        </p>
                        <button
                            onClick={() => navigate('/tournaments')}
                            className="px-6 py-3 bg-teal-500/10 border border-teal-500/20 text-teal-400 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-teal-500 hover:text-black transition-all"
                        >
                            Find Tournaments
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default TournamentsTab;
