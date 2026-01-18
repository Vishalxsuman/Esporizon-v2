import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trophy, Calendar, Target, Award } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Tournament } from '@/types/tournament'
import TournamentCard from '@/components/TournamentCard'
import { tournamentService } from '@/services/TournamentService'

const MyTournaments = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [tournaments, setTournaments] = useState<Tournament[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'upcoming' | 'ongoing' | 'completed'>('upcoming')

    useEffect(() => {
        if (!user) {
            navigate('/auth')
            return
        }
        fetchMyTournaments()
    }, [user])

    const fetchMyTournaments = async () => {
        setLoading(true)
        try {
            // In production, this would fetch user's joined tournaments
            // For now, using sample data
            const allTournaments = await tournamentService.getTournaments()
            // Simulate user has joined first 3 tournaments
            const myTournaments = allTournaments.slice(0, 6)
            setTournaments(myTournaments)
        } catch (error) {
            console.error('Error fetching my tournaments:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredTournaments = tournaments.filter((t) => {
        if (activeTab === 'upcoming') return t.status === 'upcoming'
        if (activeTab === 'ongoing') return t.status === 'ongoing'
        if (activeTab === 'completed') return t.status === 'completed'
        return true
    })

    const stats = {
        upcoming: tournaments.filter(t => t.status === 'upcoming').length,
        ongoing: tournaments.filter(t => t.status === 'ongoing').length,
        completed: tournaments.filter(t => t.status === 'completed').length,
        total: tournaments.length
    }

    return (
        <div className="min-h-screen bg-black pb-24 animate-fadeIn bg-cyber-grid bg-fixed overflow-x-hidden">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-teal-500/10 blur-[120px] opacity-50" />
            </div>

            <div className="relative z-10 px-5 pt-8 pb-6 max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-950 border border-white/5 flex items-center justify-center shadow-2xl">
                            <Trophy className="w-6 h-6 text-teal-400 drop-shadow-[0_0_12px_rgba(20,184,166,0.6)]" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-white tracking-tighter italic leading-none">
                                MY TOURNAMENTS<span className="text-teal-500 italic text-5xl">.</span>
                            </h1>
                            <p className="text-[10px] font-black tracking-[0.3em] text-zinc-500 uppercase">
                                Your tournament history and active matches
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                >
                    <StatsCard icon={<Trophy className="w-5 h-5" />} label="Total" value={stats.total} color="teal" />
                    <StatsCard icon={<Calendar className="w-5 h-5" />} label="Upcoming" value={stats.upcoming} color="teal" />
                    <StatsCard icon={<Target className="w-5 h-5" />} label="Ongoing" value={stats.ongoing} color="red" />
                    <StatsCard icon={<Award className="w-5 h-5" />} label="Completed" value={stats.completed} color="zinc" />
                </motion.div>

                {/* Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-8"
                >
                    <div className="flex justify-center gap-8 border-b border-zinc-800/50 max-w-md mx-auto">
                        {['upcoming', 'ongoing', 'completed'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`relative pb-3 font-black text-[11px] uppercase tracking-[0.2em] transition-all ${activeTab === tab
                                    ? 'text-teal-400 drop-shadow-[0_0_8px_rgba(20,184,166,0.4)]'
                                    : 'text-zinc-500 hover:text-zinc-300'
                                    }`}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <motion.div
                                        layoutId="myTournamentsTab"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500 rounded-full shadow-[0_0_10px_rgba(20,184,166,0.8)]"
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Tournament List */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mb-4" />
                            <p className="text-zinc-500 font-bold text-sm">Loading your tournaments...</p>
                        </div>
                    ) : filteredTournaments.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredTournaments.map((tournament, idx) => (
                                <div key={tournament.id} className="relative">
                                    <TournamentCard tournament={tournament} index={idx} />

                                    {/* Result Button Overlay for Completed */}
                                    {tournament.status === 'completed' && (
                                        <div className="absolute bottom-4 left-4 right-4">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    navigate(`/tournament/${tournament.id}/results`)
                                                }}
                                                className="w-full py-2 bg-yellow-500 hover:bg-yellow-400 rounded-lg font-black text-xs uppercase tracking-widest text-black transition-all shadow-lg"
                                            >
                                                View Results
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4">
                                <Trophy className="w-10 h-10 text-zinc-700" />
                            </div>
                            <h3 className="text-zinc-400 font-bold mb-2">No {activeTab} tournaments</h3>
                            <p className="text-zinc-600 text-sm mb-6">
                                {activeTab === 'upcoming' && "You haven't joined any upcoming tournaments yet"}
                                {activeTab === 'ongoing' && "You don't have any active tournaments right now"}
                                {activeTab === 'completed' && "You haven't completed any tournaments yet"}
                            </p>
                            <button
                                onClick={() => navigate('/tournaments')}
                                className="px-6 py-3 bg-teal-500 hover:bg-teal-400 rounded-xl font-black text-sm uppercase tracking-widest text-black transition-all"
                            >
                                Browse Tournaments
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    )
}

const StatsCard = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) => (
    <div className="bg-zinc-900/60 backdrop-blur-3xl border border-white/5 rounded-2xl p-4 group hover:border-teal-500/30 transition-all">
        <div className={`flex items-center gap-2 mb-2 text-${color}-400`}>{icon}</div>
        <p className="text-3xl font-black text-white italic mb-1">{value}</p>
        <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{label}</p>
    </div>
)

export default MyTournaments
