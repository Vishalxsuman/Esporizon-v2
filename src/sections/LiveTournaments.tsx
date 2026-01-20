import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import GlassCard from '../components/GlassCard'
import ProgressBar from '../components/ProgressBar'
import { liveTournaments } from '../data/mockDashboardData'
import { scrollReveal, staggerContainer } from '../animations/dashboardAnimations'
import { Clock, Users, Trophy, Gamepad2 } from 'lucide-react'

const LiveTournaments = () => {
    return (
        <section className="py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={scrollReveal}
                    className="text-center mb-12"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        <span className="text-accent-red">Live</span> Tournaments
                    </h2>
                    <p className="text-text-secondary text-lg">
                        Join ongoing tournaments and compete for amazing prizes
                    </p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={staggerContainer}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {liveTournaments.map((tournament) => (
                        <motion.div key={tournament.id} variants={scrollReveal}>
                            <GlassCard className="h-full hover:border-accent-red/30 transition-colors duration-300">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent-red/30 to-accent-orange/20 flex items-center justify-center">
                                            <Gamepad2 className="w-6 h-6 text-accent-red" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">{tournament.game}</h3>
                                            <span className="text-sm text-text-secondary">{tournament.format}</span>
                                        </div>
                                    </div>
                                    <span className={`
                    px-3 py-1 rounded-full text-xs font-semibold
                    ${tournament.difficulty === 'Pro' ? 'bg-accent-red/20 text-accent-red' : ''}
                    ${tournament.difficulty === 'Intermediate' ? 'bg-accent-orange/20 text-accent-orange' : ''}
                    ${tournament.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400' : ''}
                  `}>
                                        {tournament.difficulty}
                                    </span>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-text-secondary">
                                            <Trophy className="w-4 h-4" />
                                            <span className="text-sm">Prize Pool</span>
                                        </div>
                                        <span className="text-white font-bold text-lg">₹{tournament.prizePool.toLocaleString()}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-text-secondary">
                                            <Users className="w-4 h-4" />
                                            <span className="text-sm">Slots</span>
                                        </div>
                                        <span className="text-white font-semibold">{tournament.filledSlots}/{tournament.totalSlots}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-text-secondary">
                                            <Clock className="w-4 h-4" />
                                            <span className="text-sm">Starts In</span>
                                        </div>
                                        <span className="text-accent-orange font-semibold">{tournament.startTime}</span>
                                    </div>

                                    <ProgressBar
                                        progress={(tournament.filledSlots / tournament.totalSlots) * 100}
                                        showLabel={false}
                                    />
                                </div>

                                <Link
                                    to={`/arena/${tournament.gameId}`}
                                    className="block w-full text-center py-3 rounded-lg bg-gradient-to-r from-accent-red to-accent-orange font-semibold text-white hover:shadow-lg hover:shadow-accent-red/30 transition-all duration-300"
                                >
                                    Join Now · ₹{tournament.entryFee}
                                </Link>
                            </GlassCard>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}

export default LiveTournaments
