import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Trophy, Download, Share2, Target, Crosshair, Users } from 'lucide-react'
import { TournamentResults as TournamentResultsType, Tournament } from '@/types/tournament'
import { tournamentService } from '@/services/TournamentService'

const TournamentResultsPage = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [results, setResults] = useState<TournamentResultsType | null>(null)
    const [tournament, setTournament] = useState<Tournament | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchResults()
    }, [id])

    const fetchResults = async () => {
        setLoading(true)
        try {
            // Fetch tournament info
            const tournamentData = await tournamentService.getTournament(id!)
            if (tournamentData) {
                setTournament(tournamentData)
            }

            // Fetch results
            const resultsData = await tournamentService.getTournamentResults(id!)
            if (resultsData) {
                setResults(resultsData)
            } else {
                // No results available yet
                console.log('No results available for this tournament')
            }
        } catch (error) {
            console.error('Error fetching results:', error)
        } finally {
            setLoading(false)
        }
    }

    const getPodiumPosition = (rank: number) => {
        if (rank === 1) return { color: 'from-yellow-500 to-yellow-600', icon: '👑', height: 'h-32' }
        if (rank === 2) return { color: 'from-gray-400 to-gray-500', icon: '🥈', height: 'h-24' }
        if (rank === 3) return { color: 'from-orange-600 to-orange-700', icon: '🥉', height: 'h-20' }
        return { color: 'from-zinc-700 to-zinc-800', icon: '', height: 'h-16' }
    }

    if (loading || !results || !tournament) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500" />
            </div>
        )
    }

    const top3 = results.leaderboard.slice(0, 3)


    return (
        <div className="min-h-screen bg-black pb-24 animate-fadeIn bg-cyber-grid bg-fixed overflow-x-hidden">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-yellow-500/10 blur-[120px] opacity-30" />
            </div>

            <div className="relative z-10 px-5 pt-8 pb-6 max-w-6xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate(`/tournament/${id}`)}
                    className="flex items-center gap-2 text-zinc-500 hover:text-white transition-all mb-7 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">Back to Tournament</span>
                </button>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-4xl font-black text-white italic leading-none mb-2">
                                TOURNAMENT RESULTS<span className="text-yellow-500 italic text-5xl">.</span>
                            </h1>
                            <p className="text-lg font-bold text-zinc-400">{tournament.title}</p>
                        </div>

                        <div className="flex gap-3">
                            <button className="px-4 py-2 bg-zinc-900/60 border border-white/5 rounded-xl hover:border-teal-500/30 transition-all flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-white">
                                <Download className="w-4 h-4" />
                                Download
                            </button>
                            <button className="px-4 py-2 bg-teal-500 hover:bg-teal-400 rounded-xl transition-all flex items-center gap-2 text-sm font-black text-black">
                                <Share2 className="w-4 h-4" />
                                Share
                            </button>
                        </div>
                    </div>

                    {/* Tournament Info Bar */}
                    <div className="flex items-center gap-6 text-sm text-zinc-500">
                        <div className="flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-teal-400" />
                            <span>Prize Pool: ₹{tournament.prizePool.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-teal-400" />
                            <span>{results.leaderboard.length} Participants</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-teal-400" />
                            <span>{results.totalRounds} Rounds</span>
                        </div>
                        <div>Completed: {new Date(results.completedAt).toLocaleDateString('en-IN')}</div>
                    </div>
                </motion.div>

                {/* Winner Podium */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-zinc-900/60 to-zinc-950/80 backdrop-blur-3xl border border-white/5 rounded-3xl p-8 mb-8 shadow-2xl"
                >
                    <h2 className="text-2xl font-black text-white italic mb-6 text-center">
                        🏆 TOP 3 WINNERS 🏆
                    </h2>

                    <div className="flex items-end justify-center gap-6 max-w-3xl mx-auto">
                        {/* 2nd Place */}
                        {top3[1] && (
                            <PodiumCard entry={top3[1]} position={2} />
                        )}

                        {/* 1st Place */}
                        {top3[0] && (
                            <PodiumCard entry={top3[0]} position={1} />
                        )}

                        {/* 3rd Place */}
                        {top3[2] && (
                            <PodiumCard entry={top3[2]} position={3} />
                        )}
                    </div>
                </motion.div>

                {/* Complete Leaderboard */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h2 className="text-2xl font-black text-white italic mb-6">COMPLETE LEADERBOARD</h2>

                    <div className="bg-zinc-900/60 backdrop-blur-3xl border border-white/5 rounded-2xl overflow-hidden">
                        {/* Table Header */}
                        <div className="grid grid-cols-6 gap-4 px-6 py-4 bg-zinc-950/60 border-b border-white/5">
                            <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Rank</div>
                            <div className="col-span-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Team / Player</div>
                            <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center">Kills</div>
                            <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center">Points</div>
                            <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">Prize</div>
                        </div>

                        {/* Table Body */}
                        <div className="divide-y divide-white/5">
                            {results.leaderboard.map((entry, idx) => (
                                <div
                                    key={idx}
                                    className={`grid grid-cols-6 gap-4 px-6 py-4 hover:bg-white/5 transition-colors ${entry.rank <= 3 ? 'bg-teal-500/5' : ''
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        {entry.rank <= 3 ? (
                                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getPodiumPosition(entry.rank).color} flex items-center justify-center font-black text-white text-sm`}>
                                                {entry.rank}
                                            </div>
                                        ) : (
                                            <div className="w-8 h-8 rounded-lg bg-zinc-800/50 flex items-center justify-center font-bold text-zinc-500 text-sm">
                                                {entry.rank}
                                            </div>
                                        )}
                                    </div>
                                    <div className="col-span-2">
                                        <p className="font-bold text-white">{entry.teamName}</p>
                                        <p className="text-xs text-zinc-500">{entry.playerName}</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <Crosshair className="w-3 h-3 text-red-400" />
                                            <span className="font-bold text-white">{entry.kills || 0}</span>
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <span className="font-bold text-teal-400">{entry.points}</span>
                                    </div>
                                    <div className="text-right">
                                        {entry.prize > 0 ? (
                                            <span className="font-black text-yellow-500">₹{entry.prize.toLocaleString('en-IN')}</span>
                                        ) : (
                                            <span className="text-zinc-600">—</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

// Podium Card Component
const PodiumCard = ({ entry, position }: { entry: any; position: number }) => {
    const style = position === 1
        ? { color: 'from-yellow-500 to-yellow-600', icon: '👑', height: 'h-48', ring: 'ring-4 ring-yellow-500/50' }
        : position === 2
            ? { color: 'from-gray-400 to-gray-500', icon: '🥈', height: 'h-40', ring: 'ring-4 ring-gray-400/50' }
            : { color: 'from-orange-600 to-orange-700', icon: '🥉', height: 'h-36', ring: 'ring-4 ring-orange-600/50' }

    return (
        <div className={`flex-1 ${position === 2 ? 'mt-8' : position === 3 ? 'mt-12' : ''}`}>
            <div className={`bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 backdrop-blur-3xl border border-white/10 ${style.ring} rounded-2xl p-6 text-center ${style.height} flex flex-col justify-between`}>
                <div className="text-4xl mb-2">{style.icon}</div>
                <div>
                    <p className="text-3xl font-black text-white mb-1">{entry.teamName}</p>
                    <p className="text-sm text-zinc-400 mb-3">{entry.playerName}</p>
                    <div className="flex items-center justify-center gap-4 text-sm mb-3">
                        <div>
                            <p className="text-xs text-zinc-500">Kills</p>
                            <p className="font-bold text-white">{entry.kills}</p>
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500">Points</p>
                            <p className="font-bold text-teal-400">{entry.points}</p>
                        </div>
                    </div>
                    {entry.prize > 0 && (
                        <div className={`px-4 py-2 bg-gradient-to-r ${style.color} rounded-lg`}>
                            <p className="text-xs font-bold text-black/60">Prize</p>
                            <p className="text-2xl font-black text-black">₹{(entry.prize / 1000).toFixed(0)}K</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default TournamentResultsPage
