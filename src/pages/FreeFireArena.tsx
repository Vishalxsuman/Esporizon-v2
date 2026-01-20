import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Users, Flame, CheckCircle, Plus, ChevronRight, Shield, Target } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Tournament } from '@/types/tournament'
import { tournamentService } from '@/services/TournamentService'
import { useAuth } from '@/contexts/AuthContext'
import TournamentCard from '@/components/TournamentCard'

const FreeFireArena = () => {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [searchParams] = useSearchParams()
    const initialStatus = searchParams.get('status') || 'live'

    const [tournaments, setTournaments] = useState<Tournament[]>([])
    const [activeTab, setActiveTab] = useState(initialStatus)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const status = searchParams.get('status')
        if (status && ['live', 'completed'].includes(status)) {
            setActiveTab(status)
        }
    }, [searchParams])

    useEffect(() => {
        fetchTournaments()
    }, [activeTab])

    const fetchTournaments = async () => {
        setLoading(true)
        try {
            const data = await tournamentService.getTournaments('freefire', activeTab as any)
            setTournaments(data)
        } catch (error) {
            if (import.meta.env.MODE !== 'production') {

                console.error('Error fetching tournaments:', error);

            }
        } finally {
            setLoading(false)
        }
    }

    const handleCreateTournament = async () => {
        if (!user) {
            navigate('/auth')
            return
        }
        if (user.isHost) {
            navigate('/host/create/freefire')
        } else {
            navigate('/host/benefits')
        }
    }

    const tabs = [
        { id: 'live', label: 'Combat Live', icon: Flame },
        { id: 'completed', label: 'Archive', icon: CheckCircle },
    ]

    return (
        <div className="min-h-screen bg-[#0a0e1a] text-white pb-32 font-sans overflow-x-hidden">
            {/* Background Atmosphere */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-orange-500/5 blur-[120px]" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-red-600/5 blur-[100px]" />
            </div>

            {/* Premium Sticky Header */}
            <div className="sticky top-0 z-50 bg-[#0a0e1a]/80 backdrop-blur-xl border-b border-white/5 p-4 flex items-center justify-between">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="p-2 hover:bg-white/5 rounded-xl transition-all group"
                >
                    <ChevronRight className="rotate-180 text-zinc-500 group-hover:text-white" size={24} />
                </button>
                <h1 className="text-sm font-black uppercase tracking-[0.3em] italic flex items-center gap-2">
                    <Target size={18} className="text-orange-500" />
                    Free Fire Sector
                </h1>
                <button
                    onClick={handleCreateTournament}
                    className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center hover:bg-orange-500 transition-all border border-orange-500/20 group"
                >
                    <Plus size={18} className="text-orange-500 group-hover:text-black" />
                </button>
            </div>

            {/* Hero Image Section */}
            <div className="relative h-[45vh] md:h-[55vh] overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a] via-transparent to-transparent z-10" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-700 z-10" />
                <img
                    src="https://wallpapers.com/images/featured/free-fire-4k-can3125e197h2989.jpg"
                    alt="Free Fire"
                    className="w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-1000"
                />
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center space-y-2"
                    >
                        <h2 className="text-6xl md:text-9xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-600 to-red-600 drop-shadow-2xl">
                            BOOYAH<span className="text-white">.</span>
                        </h2>
                        <span className="text-[10px] md:text-xs font-black text-white/50 uppercase tracking-[0.8em] block">Restricted Engagement Sector</span>
                    </motion.div>
                </div>
            </div>

            <div className="relative z-20 -mt-20 px-4 max-w-7xl mx-auto space-y-12">
                {/* Stats Summary antisocial antisocial */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <ArenaStat
                        label="Deployment Budget"
                        value="₹50L+"
                        icon={<Trophy className="text-orange-500" />}
                        gradient="from-orange-500/10 to-transparent"
                    />
                    <ArenaStat
                        label="Elite Personnel"
                        value="10K+"
                        icon={<Users className="text-orange-400" />}
                        gradient="from-orange-500/10 to-transparent"
                        className="hidden md:flex"
                    />
                    <ArenaStat
                        label="Daily Sorties"
                        value="500+"
                        icon={<Shield className="text-orange-400" />}
                        gradient="from-orange-500/10 to-transparent"
                    />
                </div>

                {/* Tactical Tabs */}
                <div className="flex justify-center">
                    <div className="flex p-1.5 bg-[#0E1424]/60 backdrop-blur-md border border-white/5 rounded-2xl gap-2 shadow-2xl">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all relative ${activeTab === tab.id
                                    ? 'text-black'
                                    : 'text-zinc-500 hover:text-white'
                                    }`}
                            >
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activeArenaTab"
                                        className="absolute inset-0 bg-orange-500 rounded-xl shadow-[0_5px_15px_rgba(249,115,22,0.3)]"
                                        transition={{ type: 'spring', bounce: 0.1, duration: 0.5 }}
                                    />
                                )}
                                <span className="relative z-10">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Engagement Grid */}
                <motion.div layout className="min-h-[500px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-40 gap-6">
                            <div className="w-16 h-16 border-2 border-orange-500/10 border-t-orange-500 rounded-full animate-spin" />
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.5em]">Synchronizing Battle Feeds...</p>
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
                        <div className="flex flex-col items-center justify-center py-40 text-center bg-white/5 rounded-[2.5rem] border border-dashed border-white/5">
                            <h3 className="text-2xl font-black text-white italic mb-3 tracking-tighter uppercase">No Operations Active</h3>
                            <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.2em]">Check the archive or wait for new deployments.</p>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    )
}

// Subcomponent antisocial antisocial antisocial
const ArenaStat = ({ label, value, icon, gradient, className }: any) => (
    <div className={`p-8 rounded-[2.5rem] bg-[#0E1424]/40 backdrop-blur-xl border border-white/5 relative overflow-hidden group flex flex-col justify-end min-h-[160px] ${className}`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-50`} />
        <div className="relative z-10 space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-black/20 flex items-center justify-center border border-white/5 mb-2 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <p className="text-sm font-black text-zinc-600 uppercase tracking-widest leading-none">{label}</p>
            <h3 className="text-4xl font-black text-white italic tracking-tighter">{value}</h3>
        </div>
    </div>
)

export default FreeFireArena
