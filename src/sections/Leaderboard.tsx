import { motion } from 'framer-motion'
import GlassCard from '../components/GlassCard'
import { leaderboardData } from '../data/mockDashboardData'
import { scrollReveal } from '../animations/dashboardAnimations'
import { Crown, TrendingUp } from 'lucide-react'

const Leaderboard = () => {
    return (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-bg-secondary/30 to-transparent">
            <div className="max-w-5xl mx-auto">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={scrollReveal}
                    className="text-center mb-12"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Global <span className="text-accent-red">Leaderboard</span>
                    </h2>
                    <p className="text-text-secondary text-lg">
                        Top players competing for glory
                    </p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={scrollReveal}
                >
                    <GlassCard className="p-0 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-text-secondary">Rank</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-text-secondary">Player</th>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-text-secondary">Points</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaderboardData.map((entry, index) => (
                                        <motion.tr
                                            key={entry.rank}
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: index * 0.05, duration: 0.4 }}
                                            className={`
                        border-b border-white/5 transition-colors duration-200
                        ${entry.isCurrentUser
                                                    ? 'bg-accent-red/10 hover:bg-accent-red/15'
                                                    : 'hover:bg-white/5'
                                                }
                      `}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {entry.rank <= 3 && (
                                                        <Crown className={`
                              w-5 h-5
                              ${entry.rank === 1 ? 'text-yellow-400' : ''}
                              ${entry.rank === 2 ? 'text-gray-300' : ''}
                              ${entry.rank === 3 ? 'text-orange-400' : ''}
                            `} />
                                                    )}
                                                    <span className={`
                            text-lg font-bold
                            ${entry.rank <= 3 ? 'text-white' : 'text-text-secondary'}
                            ${entry.isCurrentUser ? 'text-accent-red' : ''}
                          `}>
                                                        #{entry.rank}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`
                            w-10 h-10 rounded-full flex items-center justify-center font-bold
                            ${entry.isCurrentUser
                                                            ? 'bg-accent-red/20 text-accent-red'
                                                            : 'bg-white/10 text-white'
                                                        }
                          `}>
                                                        {entry.username.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className={`
                            font-semibold
                            ${entry.isCurrentUser ? 'text-accent-red' : 'text-white'}
                          `}>
                                                        {entry.username}
                                                        {entry.isCurrentUser && (
                                                            <span className="ml-2 text-xs px-2 py-1 rounded-full bg-accent-red/20 text-accent-red">
                                                                You
                                                            </span>
                                                        )}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <TrendingUp className="w-4 h-4 text-green-400" />
                                                    <span className="text-lg font-bold text-white">
                                                        {entry.points.toLocaleString()}
                                                    </span>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>
        </section>
    )
}

export default Leaderboard
