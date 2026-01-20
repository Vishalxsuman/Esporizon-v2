import { motion } from 'framer-motion'
import GlassCard from '../components/GlassCard'
import AnimatedCounter from '../components/AnimatedCounter'
import { userStats } from '../data/mockDashboardData'
import { scrollReveal, staggerContainer } from '../animations/dashboardAnimations'
import { TrendingUp, Target, Wallet, Award } from 'lucide-react'

const PerformanceStats = () => {
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
                        Your <span className="text-accent-red">Performance</span>
                    </h2>
                    <p className="text-text-secondary text-lg">
                        Track your progress and earnings
                    </p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={staggerContainer}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    <motion.div variants={scrollReveal}>
                        <GlassCard className="text-center hover:border-accent-red/30 transition-colors duration-300">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500/30 to-blue-600/20 flex items-center justify-center">
                                <Target className="w-8 h-8 text-blue-400" />
                            </div>
                            <div className="text-5xl font-bold text-white mb-2">
                                <AnimatedCounter value={userStats.matchesPlayed} />
                            </div>
                            <p className="text-text-secondary text-sm font-medium">Matches Played</p>
                        </GlassCard>
                    </motion.div>

                    <motion.div variants={scrollReveal}>
                        <GlassCard className="text-center hover:border-accent-orange/30 transition-colors duration-300">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-accent-orange/30 to-accent-red/20 flex items-center justify-center">
                                <TrendingUp className="w-8 h-8 text-accent-orange" />
                            </div>
                            <div className="text-5xl font-bold text-white mb-2">
                                <AnimatedCounter value={userStats.winRate} decimals={1} suffix="%" />
                            </div>
                            <p className="text-text-secondary text-sm font-medium">Win Rate</p>
                        </GlassCard>
                    </motion.div>

                    <motion.div variants={scrollReveal}>
                        <GlassCard className="text-center hover:border-green-500/30 transition-colors duration-300">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500/30 to-green-600/20 flex items-center justify-center">
                                <Wallet className="w-8 h-8 text-green-400" />
                            </div>
                            <div className="text-5xl font-bold text-white mb-2">
                                <AnimatedCounter value={userStats.totalEarnings} prefix="₹" />
                            </div>
                            <p className="text-text-secondary text-sm font-medium">Total Earnings</p>
                        </GlassCard>
                    </motion.div>

                    <motion.div variants={scrollReveal}>
                        <GlassCard className="text-center hover:border-purple-500/30 transition-colors duration-300">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500/30 to-purple-600/20 flex items-center justify-center">
                                <Award className="w-8 h-8 text-purple-400" />
                            </div>
                            <div className="text-5xl font-bold text-white mb-2">
                                #<AnimatedCounter value={userStats.currentRank} />
                            </div>
                            <p className="text-text-secondary text-sm font-medium">Current Rank</p>
                        </GlassCard>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}

export default PerformanceStats
