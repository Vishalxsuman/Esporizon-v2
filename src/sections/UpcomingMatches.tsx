import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import GlassCard from '../components/GlassCard'
import { upcomingMatches } from '../data/mockDashboardData'
import { scrollReveal, staggerContainer } from '../animations/dashboardAnimations'
import { Calendar, Clock } from 'lucide-react'

const UpcomingMatches = () => {
    return (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-bg-secondary/30">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={scrollReveal}
                    className="text-center mb-12"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        <span className="text-accent-orange">Upcoming</span> Matches
                    </h2>
                    <p className="text-text-secondary text-lg">
                        Don't miss these exciting matchups
                    </p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={staggerContainer}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {upcomingMatches.map((match) => (
                        <motion.div key={match.id} variants={scrollReveal}>
                            <MatchCard match={match} />
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}

const MatchCard = ({ match }: { match: typeof upcomingMatches[0] }) => {
    const [timeLeft, setTimeLeft] = useState<string>('')

    useEffect(() => {
        const updateCountdown = () => {
            const now = new Date().getTime()
            const distance = match.startTime.getTime() - now

            if (distance < 0) {
                setTimeLeft('Live Now!')
                return
            }

            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((distance % (1000 * 60)) / 1000)

            setTimeLeft(`${hours}h ${minutes}m ${seconds}s`)
        }

        updateCountdown()
        const interval = setInterval(updateCountdown, 1000)

        return () => clearInterval(interval)
    }, [match.startTime])

    return (
        <GlassCard className="hover:border-accent-orange/30 transition-colors duration-300">
            <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-orange/10 border border-accent-orange/20 mb-4">
                    <Calendar className="w-4 h-4 text-accent-orange" />
                    <span className="text-sm font-semibold text-accent-orange">{match.game}</span>
                </div>
                <p className="text-xs text-text-secondary">{match.format}</p>
            </div>

            <div className="flex items-center justify-between mb-6">
                <div className="flex-1 text-center">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-accent-red/30 to-accent-orange/20 flex items-center justify-center">
                        <span className="text-2xl">🎮</span>
                    </div>
                    <h3 className="text-white font-bold text-sm mb-1">{match.team1}</h3>
                </div>

                <div className="px-6">
                    <div className="text-3xl font-bold text-text-secondary">VS</div>
                </div>

                <div className="flex-1 text-center">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-accent-red/30 to-accent-orange/20 flex items-center justify-center">
                        <span className="text-2xl">🎯</span>
                    </div>
                    <h3 className="text-white font-bold text-sm mb-1">{match.team2}</h3>
                </div>
            </div>

            <div className="text-center p-4 rounded-lg bg-black/30 border border-white/5">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-accent-orange" />
                    <span className="text-xs text-text-secondary">Starts in</span>
                </div>
                <div className="text-2xl font-bold text-accent-orange font-mono">
                    {timeLeft}
                </div>
            </div>
        </GlassCard>
    )
}

export default UpcomingMatches
