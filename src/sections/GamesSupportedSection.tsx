import { motion } from 'framer-motion'
import GlassCard from '../components/GlassCard'
import { supportedGames } from '../data/mockDashboardData'
import { scrollReveal, staggerContainer } from '../animations/dashboardAnimations'

const GamesSupportedSection = () => {
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
                        Supported <span className="text-accent-orange">Games</span>
                    </h2>
                    <p className="text-text-secondary text-lg">
                        Compete across multiple popular titles
                    </p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={staggerContainer}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
                >
                    {supportedGames.map((game) => (
                        <motion.div key={game.id} variants={scrollReveal}>
                            <GlassCard className="text-center cursor-pointer group hover:border-accent-orange/50 transition-all duration-300">
                                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                                    {game.icon}
                                </div>
                                <h3 className="text-white font-semibold text-sm group-hover:text-accent-orange transition-colors">
                                    {game.name}
                                </h3>
                            </GlassCard>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}

export default GamesSupportedSection
