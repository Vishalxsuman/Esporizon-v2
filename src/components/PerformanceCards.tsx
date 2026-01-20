import { motion } from 'framer-motion'
import { TrendingUp, Target, Trophy, Award } from 'lucide-react'
import { useState, useEffect } from 'react'

interface StatCard {
    id: string
    label: string
    value: number
    suffix?: string
    icon: React.ReactNode
    color: string
}

interface PerformanceCardsProps {
    stats?: {
        matchesPlayed: number
        winRate: number
        totalEarnings: number
        currentRank: number
    }
}

const AnimatedCounter = ({ value, suffix = '' }: { value: number; suffix?: string }) => {
    const [count, setCount] = useState(0)

    useEffect(() => {
        const duration = 1500 // 1.5 seconds
        const steps = 60
        const increment = value / steps
        const stepDuration = duration / steps

        let currentStep = 0
        const timer = setInterval(() => {
            currentStep++
            if (currentStep >= steps) {
                setCount(value)
                clearInterval(timer)
            } else {
                setCount(Math.floor(increment * currentStep))
            }
        }, stepDuration)

        return () => clearInterval(timer)
    }, [value])

    return (
        <span>
            {count.toLocaleString()}
            {suffix}
        </span>
    )
}

const PerformanceCards = ({ stats }: PerformanceCardsProps) => {
    const defaultStats = {
        matchesPlayed: 0,
        winRate: 0,
        totalEarnings: 0,
        currentRank: 0
    }

    const userStats = stats || defaultStats

    const cards: StatCard[] = [
        {
            id: 'matches',
            label: 'Matches Played',
            value: userStats.matchesPlayed,
            icon: <Target className="w-6 h-6" />,
            color: 'from-blue-500/20 to-cyan-500/20'
        },
        {
            id: 'winrate',
            label: 'Win Rate',
            value: userStats.winRate,
            suffix: '%',
            icon: <TrendingUp className="w-6 h-6" />,
            color: 'from-green-500/20 to-emerald-500/20'
        },
        {
            id: 'earnings',
            label: 'Total Earnings',
            value: userStats.totalEarnings,
            icon: <Trophy className="w-6 h-6" />,
            color: 'from-yellow-500/20 to-orange-500/20'
        },
        {
            id: 'rank',
            label: 'Current Rank',
            value: userStats.currentRank,
            icon: <Award className="w-6 h-6" />,
            color: 'from-purple-500/20 to-pink-500/20'
        }
    ]

    return (
        <div className="w-full">
            {/* Section Header */}
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black flex items-center gap-4 uppercase italic tracking-tight">
                    <span className="w-2 h-8 bg-gradient-to-b from-[#7B61FF] to-transparent rounded-full shadow-[0_0_15px_#7B61FF]"></span>
                    My Performance
                </h3>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((card, index) => (
                    <motion.div
                        key={card.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative group"
                    >
                        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 hover:border-[#00E0C6]/50 transition-all duration-300 hover:bg-white/10 overflow-hidden">
                            {/* Background Gradient */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-30 transition-opacity duration-300`}></div>

                            {/* Content */}
                            <div className="relative z-10">
                                {/* Icon */}
                                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-[#00E0C6] group-hover:scale-110 transition-transform duration-300">
                                    {card.icon}
                                </div>

                                {/* Value */}
                                <div className="mb-2">
                                    <div className="text-3xl font-black text-white tracking-tight">
                                        {card.id === 'earnings' && '₹'}
                                        <AnimatedCounter value={card.value} suffix={card.suffix} />
                                    </div>
                                </div>

                                {/* Label */}
                                <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                                    {card.label}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

export default PerformanceCards
