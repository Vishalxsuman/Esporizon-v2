import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Tournament } from '@/types/tournament'
import { tournamentService } from '@/services/TournamentService'
import { Calendar, Users, Trophy, Plus, Shield, Zap, Target, Swords } from 'lucide-react'
import ProfessionalLoading from '@/components/ProfessionalLoading'

const TournamentList = () => {
    const { gameId } = useParams<{ gameId: string }>()
    const navigate = useNavigate()
    const [tournaments, setTournaments] = useState<Tournament[]>([])
    const [filter, setFilter] = useState<'upcoming' | 'ongoing' | 'completed'>('upcoming')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const gameConfigs: Record<string, { name: string, color: string, icon: any, accent: string }> = {
        freefire: {
            name: 'Free Fire',
            color: '#00ffc2',
            icon: Target,
            accent: 'from-[#00ffc2]/20 to-transparent'
        },
        bgmi: {
            name: 'BGMI',
            color: '#fbbf24',
            icon: Shield,
            accent: 'from-[#fbbf24]/20 to-transparent'
        },
        valorant: {
            name: 'Valorant',
            color: '#ff4655',
            icon: Zap,
            accent: 'from-[#ff4655]/20 to-transparent'
        },
        minecraft: {
            name: 'Minecraft',
            color: '#4ade80',
            icon: Swords,
            accent: 'from-[#4ade80]/20 to-transparent'
        }
    }

    const config = gameConfigs[gameId || ''] || { name: 'Tournaments', color: '#00ffc2', icon: Trophy, accent: 'from-[#00ffc2]/20 to-transparent' }

    useEffect(() => {
        if (!gameId) return
        setLoading(true)
        setError(null)

        const fetchTournaments = async () => {
            try {
                const data = await tournamentService.getTournaments(gameId, filter)
                setTournaments(data)
            } catch (err) {
                console.error("Error fetching tournaments:", err)
                setError("Failed to load tournaments. Please check your connection.")
            } finally {
                setLoading(false)
            }
        }

        fetchTournaments()
    }, [gameId, filter])

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'TBA'
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
        return new Intl.DateTimeFormat('en-IN', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date)
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#09090b]">
                <ProfessionalLoading message="Syncing Arena..." />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#09090b] text-white selection:bg-[#00ffc2]/30">
            {/* Header / Hero Section */}
            <div className={`relative overflow-hidden bg-gradient-to-b ${config.accent} pt-6 pb-20 px-4 mb-4`}>
                <div className="max-w-7xl mx-auto relative z-10">
                    <Link to="/dashboard" className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors mb-6 group">
                        <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span>
                        Back to Arena
                    </Link>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <config.icon className="w-8 h-8" style={{ color: config.color }} />
                                <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase">
                                    {config.name}
                                </h1>
                            </div>
                            <p className="text-gray-400 max-w-lg">
                                Dominate the leaderboard and win massive prize pools in the most competitive {config.name} arena.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Link
                                to={`/tournaments/${gameId}/create`}
                                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-black uppercase tracking-widest rounded-2xl overflow-hidden transition-all shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
                                style={{ borderBottom: `4px solid ${config.color}` }}
                            >
                                <span className="relative z-10">Host Tournament</span>
                                <Plus className="w-5 h-5 relative z-10 group-hover:rotate-90 transition-transform" />
                                <div
                                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    style={{ background: `linear-gradient(45deg, ${config.color}, #ffffff)` }}
                                />
                            </Link>
                        </motion.div>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#00ffc2]/5 blur-[120px] -mr-48 -mt-48 rounded-full" />
            </div>

            <div className="max-w-7xl mx-auto px-4 -mt-10 relative z-20">
                {/* Filter Tabs */}
                <div className="flex gap-2 mb-8 bg-[#18181b]/80 backdrop-blur-xl p-1.5 rounded-2xl border border-white/5 w-fit">
                    {(['upcoming', 'ongoing', 'completed'] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-6 py-2.5 rounded-xl font-bold transition-all text-sm uppercase tracking-wider ${filter === status
                                ? 'bg-[#18181b] text-white shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-white/10'
                                : 'text-gray-500 hover:text-white'
                                }`}
                            style={filter === status ? { color: config.color, borderColor: `${config.color}22` } : {}}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <AnimatePresence mode="wait">
                    {error ? (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-red-500/10 border border-red-500/20 rounded-3xl p-12 text-center"
                        >
                            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Zap className="w-10 h-10 text-red-500" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Systems Failure</h2>
                            <p className="text-gray-400 mb-8 max-w-sm mx-auto">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-8 py-3 bg-red-500 text-white font-bold rounded-xl transition-transform hover:scale-105"
                            >
                                Reboot Connection
                            </button>
                        </motion.div>
                    ) : tournaments.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[#18181b]/40 border border-white/5 rounded-[2.5rem] p-20 text-center backdrop-blur-sm"
                        >
                            <div className="relative inline-block mb-8">
                                <Trophy className="w-24 h-24 text-gray-800" />
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute inset-0 bg-white/5 blur-3xl rounded-full"
                                />
                            </div>
                            <h2 className="text-3xl font-black italic uppercase mb-4">The Arena is Cold</h2>
                            <p className="text-gray-500 mb-10 max-w-sm mx-auto">
                                No tournaments are currently active in this sector. Why not start the fire yourself?
                            </p>
                            <Link
                                to={`/tournaments/${gameId}/create`}
                                className="inline-flex items-center gap-3 px-10 py-4 border-2 border-white/10 hover:border-white transition-colors rounded-full font-black uppercase tracking-widest text-sm"
                            >
                                Create the First Event
                            </Link>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                            {tournaments.map((tournament, idx) => (
                                <motion.div
                                    key={tournament.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    onClick={() => navigate(`/tournament/${tournament.id}`)}
                                    className="group relative bg-[#18181b] rounded-3xl overflow-hidden cursor-pointer border border-white/5 hover:border-white/20 transition-all p-6"
                                >
                                    {/* Hover Glow */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-6">
                                            <div
                                                className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
                                                style={{ background: `${config.color}22`, color: config.color, border: `1px solid ${config.color}44` }}
                                            >
                                                {tournament.format}
                                            </div>
                                            <div className="flex -space-x-2">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="w-6 h-6 rounded-full border-2 border-[#18181b] bg-gray-800" />
                                                ))}
                                            </div>
                                        </div>

                                        <h3 className="text-2xl font-black italic uppercase leading-none mb-3 group-hover:text-[#00ffc2] transition-colors line-clamp-1">
                                            {tournament.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 line-clamp-2 mb-8 font-medium">
                                            {tournament.description}
                                        </p>

                                        <div className="grid grid-cols-2 gap-4 border-y border-white/5 py-6 mb-6">
                                            <div>
                                                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Prize Pool</div>
                                                <div className="text-2xl font-black tracking-tighter" style={{ color: config.color }}>
                                                    ₹{tournament.prizePool.toLocaleString()}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Entry Fee</div>
                                                <div className="text-xl font-bold">₹{tournament.entryFee}</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-gray-400">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                {formatDate(tournament.startDate)}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4" />
                                                {tournament.currentTeams}/{tournament.maxTeams}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="absolute bottom-0 left-0 h-1 bg-white/5 w-full">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(tournament.currentTeams / tournament.maxTeams) * 100}%` }}
                                            className="h-full bg-[#00ffc2]"
                                            style={{ background: config.color }}
                                        />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </div>

        </div>
    )
}

export default TournamentList
