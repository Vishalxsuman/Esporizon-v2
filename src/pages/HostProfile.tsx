import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Shield, Star, Trophy, TrendingUp, CheckCircle, Clock, Award, MessageSquare, Calendar } from 'lucide-react'
import TournamentCard from '@/components/TournamentCard'
import HostRatingModal from '@/components/HostRatingModal'
import { HostProfile as HostProfileType, Tournament } from '@/types/tournament'
import { tournamentService } from '@/services/TournamentService'
import { userService } from '@/services/UserService'
import { dossierService } from '@/services/DossierService'

// Sample host rating interface
interface HostRating {
    id: string
    userId: string
    userName: string
    rating: number
    feedback?: string
    createdAt: string
}

const HostProfile = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [host, setHost] = useState<HostProfileType | null>(null)
    const [tournaments, setTournaments] = useState<Tournament[]>([])
    const [ratings, setRatings] = useState<HostRating[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'upcoming' | 'live' | 'completed'>('upcoming')
    const [showRatingModal, setShowRatingModal] = useState(false)

    useEffect(() => {
        fetchHostData()
    }, [id])

    const fetchHostData = async () => {
        if (!id) return;
        setLoading(true)
        try {
            // Fetch basic profile
            const userProfile = await userService.getProfile(id);
            // Fetch host metrics
            const hostMetrics = await dossierService.getHostMetrics(id);

            // Fetch tournaments
            const allTournaments = await tournamentService.getTournaments()
            // Filter tournaments by this host
            const hostTournaments = allTournaments.filter(t => t.organizerId === id)
            setTournaments(hostTournaments)

            if (hostMetrics) {
                const hostData: HostProfileType = {
                    id: id,
                    name: 'Host', // API might need to return name, or we fetch simplistic
                    avatar: '',
                    rating: hostMetrics.hostingRating || 0,
                    reviewCount: 0,
                    tournamentsHosted: hostMetrics.tournamentsCompleted + hostMetrics.activeTournaments,
                    verified: userProfile.isVerifiedHost || false,
                    memberSince: new Date().toISOString(), // User profile missing create date in types currently
                    stats: {
                        totalTournaments: hostMetrics.tournamentsCompleted + hostMetrics.activeTournaments + hostMetrics.upcomingTournaments,
                        activeTournaments: hostMetrics.activeTournaments,
                        completedTournaments: hostMetrics.tournamentsCompleted,
                        totalParticipants: 0, // Metric missing
                        averageRating: hostMetrics.hostingRating || 0,
                        successRate: 0, // Metric missing
                        responseTime: 'N/A',
                        cancellationRate: 0
                    }
                }
                setHost(hostData)
            } else {
                // Fallback if not a host or no metrics
                const fallbackHost: HostProfileType = {
                    id: id,
                    name: 'User',
                    avatar: '',
                    rating: 0,
                    reviewCount: 0,
                    tournamentsHosted: 0,
                    verified: false,
                    memberSince: new Date().toISOString(),
                    stats: {
                        totalTournaments: 0,
                        activeTournaments: 0,
                        completedTournaments: 0,
                        totalParticipants: 0,
                        averageRating: 0,
                        successRate: 0,
                        responseTime: 'N/A',
                        cancellationRate: 0
                    }
                }
                setHost(fallbackHost)
            }

            // Ratings - currently no API, so empty
            setRatings([])

        } catch (error) {
            if (import.meta.env.MODE !== 'production') {

                console.error('Error fetching host data:', error);

            }
        } finally {
            setLoading(false)
        }
    }

    const handleSubmitRating = async (rating: number, feedback: string) => {
        // TODO: Submit to backend
        if (import.meta.env.MODE !== 'production') {

            console.log('Submitting rating:', { hostId: id, rating, feedback });

        }

        // Optimistic update would go here if we had API
    }

    // Calculate rating distribution
    const getRatingDistribution = () => {
        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        ratings.forEach(r => {
            distribution[r.rating as keyof typeof distribution]++
        })
        return distribution
    }

    const ratingDist = getRatingDistribution()
    const totalRatings = ratings.length

    if (loading || !host) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500" />
            </div>
        )
    }

    // Filter logic remains same
    const filteredTournaments = tournaments.filter((t) => {
        if (activeTab === 'upcoming') return t.status === 'upcoming'
        if (activeTab === 'live') return t.status === 'live'
        if (activeTab === 'completed') return t.status === 'completed'
        return true
    })

    return (
        <div className="min-h-screen bg-black pb-24 animate-fadeIn bg-cyber-grid bg-fixed overflow-x-hidden">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-teal-500/10 blur-[120px] opacity-50" />
            </div>

            <div className="relative z-10 px-5 pt-8 pb-6 max-w-6xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-zinc-500 hover:text-white transition-all mb-7 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">Back</span>
                </button>

                {/* Host Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-zinc-900/60 to-zinc-950/80 backdrop-blur-3xl border border-white/5 rounded-3xl p-8 mb-8 shadow-2xl"
                >
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6">
                        {/* Avatar */}
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30 flex items-center justify-center shadow-xl">
                            <span className="text-4xl font-black text-teal-400">
                                {host.name.charAt(0).toUpperCase()}
                            </span>
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                <h1 className="text-3xl font-black text-white italic">{host.name.toUpperCase()}</h1>
                                {host.verified && (
                                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-teal-500/20 border border-teal-500/30">
                                        <Shield className="w-4 h-4 text-teal-400" />
                                        <span className="text-[9px] font-black text-teal-400 uppercase tracking-wider">
                                            Verified Host
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Rating */}
                            <div className="flex items-center gap-4 mb-4 flex-wrap">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`w-5 h-5 ${star <= Math.round(host.rating)
                                                    ? 'fill-yellow-500 text-yellow-500'
                                                    : 'text-zinc-700'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-2xl font-black text-white">{host.rating.toFixed(1)}</span>
                                    <span className="text-sm text-zinc-500">({host.reviewCount} reviews)</span>
                                </div>
                                <div className="text-sm text-zinc-500 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Member since {new Date(host.memberSince).toLocaleDateString('en-IN', {
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="flex items-center gap-6 flex-wrap">
                                <div>
                                    <p className="text-2xl font-black text-teal-400 italic">{host.tournamentsHosted}</p>
                                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Tournaments</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-teal-400 italic">{host.stats.totalParticipants.toLocaleString()}</p>
                                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Players</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-teal-400 italic">{host.stats.successRate}%</p>
                                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Success Rate</p>
                                </div>
                            </div>
                        </div>

                        {/* Rate Button */}
                        <button
                            onClick={() => setShowRatingModal(true)}
                            className="px-6 py-3 bg-teal-500 hover:bg-teal-400 rounded-xl font-black text-sm uppercase tracking-widest text-black transition-all shadow-lg flex items-center gap-2"
                        >
                            <Star className="w-4 h-4" />
                            Rate Host
                        </button>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
                >
                    <StatCard icon={<Trophy className="w-5 h-5" />} label="Completed" value={host.stats.completedTournaments} color="teal" />
                    <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Active" value={host.stats.activeTournaments} color="teal" />
                    <StatCard icon={<Clock className="w-5 h-5" />} label="Response Time" value={host.stats.responseTime} color="teal" />
                    <StatCard icon={<CheckCircle className="w-5 h-5" />} label="Reliability" value={`${host.stats.successRate}%`} color="teal" />
                </motion.div>

                {/* Trust Indicators */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-teal-500/5 border border-teal-500/20 rounded-2xl p-6 mb-8"
                >
                    <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-teal-400" />
                        Trust Indicators
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <TrustBadge icon={<CheckCircle className="w-4 h-4" />} text="Platform Verified" />
                        <TrustBadge icon={<Award className="w-4 h-4" />} text="Top-Rated Host" />
                        <TrustBadge icon={<Shield className="w-4 h-4" />} text="Payment Reliable" />
                    </div>
                </motion.div>

                {/* Rating Distribution */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-zinc-900/60 backdrop-blur-3xl border border-white/5 rounded-2xl p-6 mb-8"
                >
                    <h3 className="text-lg font-black text-white italic mb-6">RATING BREAKDOWN</h3>
                    <div className="space-y-3">
                        {[5, 4, 3, 2, 1].map((stars) => {
                            const count = ratingDist[stars as keyof typeof ratingDist]
                            const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0
                            return (
                                <div key={stars} className="flex items-center gap-4">
                                    <div className="flex items-center gap-1 w-20">
                                        <span className="text-sm font-bold text-zinc-400">{stars}</span>
                                        <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                    </div>
                                    <div className="flex-1 h-2 bg-zinc-800/50 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full transition-all duration-1000"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-bold text-zinc-500 w-16 text-right">{count}</span>
                                </div>
                            )
                        })}
                    </div>
                </motion.div>

                {/* Reviews Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-zinc-900/60 backdrop-blur-3xl border border-white/5 rounded-2xl p-6 mb-8"
                >
                    <h3 className="text-lg font-black text-white italic mb-6 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-teal-400" />
                        PLAYER REVIEWS ({ratings.length})
                    </h3>
                    <div className="space-y-4">
                        {ratings.slice(0, 5).map((rating) => (
                            <div key={rating.id} className="bg-zinc-950/40 rounded-xl p-4 border border-white/5">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <p className="font-bold text-white text-sm">{rating.userName}</p>
                                        <div className="flex items-center gap-1 mt-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    className={`w-3 h-3 ${star <= rating.rating
                                                        ? 'fill-yellow-500 text-yellow-500'
                                                        : 'text-zinc-700'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <span className="text-xs text-zinc-600">
                                        {new Date(rating.createdAt).toLocaleDateString('en-IN')}
                                    </span>
                                </div>
                                {rating.feedback && (
                                    <p className="text-sm text-zinc-400 leading-relaxed">{rating.feedback}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Hosted Tournaments Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <h2 className="text-2xl font-black text-white italic mb-6">HOSTED TOURNAMENTS</h2>

                    {/* Tabs */}
                    <div className="flex gap-8 border-b border-zinc-800/50 mb-6">
                        {['upcoming', 'live', 'completed'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`relative pb-3 font-black text-[11px] uppercase tracking-[0.2em] transition-all ${activeTab === tab ? 'text-teal-400' : 'text-zinc-500 hover:text-zinc-300'
                                    }`}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <motion.div
                                        layoutId="hostTab"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500 rounded-full"
                                    />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Tournament List */}
                    {filteredTournaments.length > 0 ? (
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                            {filteredTournaments.map((tournament, idx) => (
                                <TournamentCard key={tournament.id} tournament={tournament} index={idx} compact />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-zinc-900/40 rounded-2xl border border-white/5">
                            <Trophy className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                            <p className="text-zinc-500 font-bold">No {activeTab} tournaments</p>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Rating Modal */}
            <HostRatingModal
                isOpen={showRatingModal}
                onClose={() => setShowRatingModal(false)}
                hostName={host.name}
                hostId={host.id}
                onSubmit={handleSubmitRating}
            />
        </div>
    )
}

// Helper Components
const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) => (
    <div className="bg-zinc-900/60 backdrop-blur-3xl border border-white/5 rounded-2xl p-5 group hover:border-teal-500/30 transition-all">
        <div className={`flex items-center gap-2 mb-3 text-${color}-400`}>{icon}</div>
        <p className="text-2xl font-black text-white italic mb-1">{value}</p>
        <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{label}</p>
    </div>
)

const TrustBadge = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
    <div className="flex items-center gap-2 px-3 py-2 bg-teal-500/10 rounded-lg border border-teal-500/20">
        <div className="text-teal-400">{icon}</div>
        <span className="text-xs font-bold text-teal-300">{text}</span>
    </div>
)

export default HostProfile
