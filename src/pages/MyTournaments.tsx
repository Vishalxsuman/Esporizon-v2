import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { tournamentService } from '@/services/TournamentService';
import TournamentCard from '@/components/TournamentCard';


const MyTournaments = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [tournaments, setTournaments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        fetchData();
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await tournamentService.getMyTournamentHistory(user!.id);
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
        <div className="min-h-screen bg-[#0a0e1a] text-white pb-32 font-sans overflow-x-hidden">
            {/* Background Atmosphere */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-teal-500/5 blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[400px] bg-cyan-600/5 blur-[120px]" />
            </div>

            {/* Premium Sticky Header */}
            <div className="sticky top-0 z-50 bg-[#0a0e1a]/80 backdrop-blur-xl border-b border-white/5 p-4 flex items-center justify-between">
                <button
                    onClick={() => navigate('/tournaments')}
                    className="p-2 hover:bg-white/5 rounded-xl transition-all group"
                >
                    <ChevronRight className="rotate-180 text-zinc-500 group-hover:text-white" size={24} />
                </button>
                <h1 className="text-sm font-black uppercase tracking-[0.3em] italic flex items-center gap-2">
                    <Trophy size={18} className="text-teal-400" />
                    Combat Deployments
                </h1>
                <div className="w-10 h-10" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 pt-10 space-y-12">
                {/* Hero Header */}
                <div className="text-center space-y-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 block">Tactical Records</span>
                    <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none">
                        PERSONAL ARENA<span className="text-teal-500 italic">.</span>
                    </h1>
                </div>

                {/* Sub-Stat Grid (Wallet Aesthetic) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto px-2">
                    <div className="p-5 bg-[#0E1424]/40 border border-white/5 rounded-[2rem] text-center">
                        <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600 block mb-2">Engagements</span>
                        <span className="text-3xl font-black italic tracking-tighter text-white">{tournaments.length}</span>
                    </div>
                    <div className="p-5 bg-[#0E1424]/40 border border-white/5 rounded-[2rem] flex items-center justify-center gap-6">
                        <div>
                            <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600 block mb-1 text-center">Combat Status</span>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                                <span className="text-sm font-black italic uppercase tracking-widest text-zinc-300">Active Duty</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="hidden">
                    {/* Tabs removed as per request for regular user view */}
                </div>

                {/* Content */}
                <motion.div
                    layout
                    className="min-h-[500px]"
                >
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32 gap-6">
                            <div className="w-12 h-12 border-2 border-teal-500/10 border-t-teal-500 rounded-full animate-spin" />
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Retrieving Battlefield Logs...</p>
                        </div>
                    ) : tournaments.length > 0 ? (
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 pb-20">
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
                        <div className="flex flex-col items-center justify-center py-48 text-center bg-white/5 rounded-[2.5rem] border border-dashed border-white/5">
                            <div className="relative mb-8">
                                <div className="w-24 h-24 rounded-full bg-zinc-900/40 border border-white/5 flex items-center justify-center">
                                    <Trophy className="w-10 h-10 text-zinc-900" />
                                </div>
                                <div className="absolute inset-0 bg-teal-500/5 blur-3xl rounded-full" />
                            </div>
                            <h3 className="text-xl font-black text-white italic mb-3 tracking-tighter uppercase">Records Empty</h3>
                            <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.2em] max-w-xs mx-auto leading-relaxed">
                                Your combat deployments history is currently minimal.
                            </p>
                            <button
                                onClick={() => navigate('/tournaments')}
                                className="mt-10 px-10 py-4 bg-teal-500 text-black font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl hover:bg-teal-400 transition-all shadow-[0_10px_30px_rgba(20,184,166,0.3)] active:scale-95"
                            >
                                Deploy to Arena
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}

export default MyTournaments;
