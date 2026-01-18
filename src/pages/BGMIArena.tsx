import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Users, Flame, Crown, CheckCircle, Calendar, Plus } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Tournament } from '@/types/tournament'
import { tournamentService } from '@/services/TournamentService'
import { useAuth } from '@/contexts/AuthContext'
import TournamentCard from '@/components/TournamentCard'

const BGMIArena = () => {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [searchParams] = useSearchParams()
    const initialStatus = searchParams.get('status') || 'upcoming'

    const [tournaments, setTournaments] = useState<Tournament[]>([])
    const [activeTab, setActiveTab] = useState(initialStatus)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const status = searchParams.get('status')
        if (status && ['upcoming', 'ongoing', 'completed'].includes(status)) {
            setActiveTab(status)
        }
    }, [searchParams])

    useEffect(() => {
        fetchTournaments()
    }, [activeTab])

    const fetchTournaments = async () => {
        setLoading(true)
        try {
            const data = await tournamentService.getTournaments('bgmi', activeTab as any)
            setTournaments(data)
        } catch (error) {
            console.error('Error fetching tournaments:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateTournament = async () => {
        if (!user) {
            navigate('/auth')
            return
        }

        try {
            const { subscriptionService } = await import('@/services/SubscriptionService');
            const status = await subscriptionService.getSubscriptionStatus();

            if (status.isHost) {
                navigate('/host/dashboard')
            } else {
                navigate('/host/benefits')
            }
        } catch (error) {
            console.error('Error verifying host status:', error);
            navigate('/host/benefits');
        }
    }

    const tabs = [
        { id: 'upcoming', label: 'Upcoming', icon: Calendar },
        { id: 'ongoing', label: 'Live Now', icon: Flame },
        { id: 'completed', label: 'Completed', icon: CheckCircle },
    ]

    return (
        <div className="min-h-screen bg-black pb-24 animate-fadeIn bg-cyber-grid bg-fixed overflow-x-hidden">
            {/* Hero Background */}
            <div className="relative h-[50vh] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black z-10" />
                <div className="absolute inset-0 bg-black/40 z-10" />

                {/* Create Tournament Button (Floating) */}
                <div className="absolute top-6 right-6 z-30">
                    <button
                        onClick={handleCreateTournament}
                        className="group relative px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden transition-all hover:bg-white/20 hover:scale-105 active:scale-95"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-green-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative flex items-center gap-2">
                            <Plus className="w-5 h-5 text-teal-400 group-hover:text-teal-300" />
                            <span className="font-black text-sm uppercase tracking-wider text-white">Create Tournament</span>
                        </div>
                    </button>
                </div>

                <img
                    src="https://wallpapers.com/images/featured/bgmi-4k-can3125e197h2989.jpg"
                    alt="BGMI"
                    className="w-full h-full object-cover scale-110"
                />

                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6"
                    >
                        <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-green-500 to-emerald-600 italic tracking-tighter drop-shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                            BGMI
                        </h1>
                        <span className="text-white text-xl md:text-3xl font-bold tracking-[0.5em] uppercase mt-2 block">
                            Masters Series
                        </span>
                    </motion.div>
                </div>
            </div>

            <div className="relative z-20 -mt-24 px-5 max-w-7xl mx-auto space-y-12">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard
                        icon={<Trophy className="w-8 h-8 text-yellow-400" />}
                        value="₹2Cr+"
                        label="Prize Pool"
                        gradient="from-yellow-500/20 to-orange-500/5"
                    />
                    <StatCard
                        icon={<Users className="w-8 h-8 text-teal-400" />}
                        value="50K+"
                        label="Active Players"
                        gradient="from-teal-500/20 to-green-500/5"
                    />
                    <StatCard
                        icon={<Crown className="w-8 h-8 text-emerald-400" />}
                        value="100+"
                        label="Daily Scrims"
                        gradient="from-emerald-500/20 to-lime-500/5"
                    />
                </div>

                {/* Main Content */}
                <div>
                    {/* Tab Navigation */}
                    <div className="flex justify-center mb-8">
                        <div className="flex bg-zinc-900/50 backdrop-blur-md p-1.5 rounded-2xl border border-white/5 relative">
                            {tabs.map((tab) => {
                                const Icon = tab.icon
                                const isActive = activeTab === tab.id
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`relative px-6 py-3 rounded-xl flex items-center gap-2 text-sm font-black uppercase tracking-wider transition-all z-10 ${isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                                            }`}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeArenaTab"
                                                className="absolute inset-0 bg-gradient-to-r from-teal-600 to-green-600 rounded-xl shadow-lg"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                        <Icon className={`w-4 h-4 relative z-10`} />
                                        <span className="relative z-10">{tab.label}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Tournament Grid */}
                    {loading ? (
                        <div className="flex justify-center items-center py-20 min-h-[400px]">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
                        </div>
                    ) : (
                        <motion.div
                            layout
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[400px] content-start"
                        >
                            <AnimatePresence mode="popLayout">
                                {tournaments.map((tournament, index) => (
                                    <TournamentCard key={tournament.id} tournament={tournament} index={index} />
                                ))}
                            </AnimatePresence>

                            {tournaments.length === 0 && (
                                <div className="col-span-3 flex flex-col items-center justify-center py-20 text-center opacity-50">
                                    <Trophy className="w-16 h-16 text-zinc-600 mb-4" />
                                    <h3 className="text-xl font-bold text-white mb-2">No {activeTab} tournaments found</h3>
                                    <p className="text-zinc-400">Check back later for new events!</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    )
}

const StatCard = ({ icon, value, label, gradient }: any) => (
    <motion.div
        whileHover={{ y: -5 }}
        className={`relative p-8 rounded-3xl bg-zinc-900/50 backdrop-blur-xl border border-white/5 overflow-hidden group`}
    >
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-20 group-hover:opacity-30 transition-opacity`} />
        <div className="relative z-10">
            <div className="mb-4 p-3 bg-black/20 rounded-2xl w-fit backdrop-blur-md border border-white/5">{icon}</div>
            <h3 className="text-4xl font-black text-white italic tracking-tight mb-1">{value}</h3>
            <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">{label}</p>
        </div>
    </motion.div>
)

export default BGMIArena
