import { motion } from 'framer-motion'

interface PointCounterProps {
    team1Points: number
    team2Points: number
    team1Label?: string
    team2Label?: string
    target?: number
    compact?: boolean
}

export const PointCounter = ({
    team1Points,
    team2Points,
    team1Label = 'YOU',
    team2Label = 'OPP',
    target = 6,
    compact = false
}: PointCounterProps) => {
    const team1Abs = Math.abs(team1Points)
    const team2Abs = Math.abs(team2Points)
    const team1IsPositive = team1Points >= 0
    const team2IsPositive = team2Points >= 0

    return (
        <div className={`flex items-center gap-4 md:gap-8 ${compact ? 'flex-col md:flex-row' : ''}`}>
            {/* Team 1 (YOU) */}
            <div className="flex items-center gap-3">
                <span className="text-[11px] md:text-sm text-cyan-400 font-black tracking-widest italic">
                    {team1Label}
                </span>
                <div className="flex gap-1.5 md:gap-2">
                    {Array.from({ length: target }).map((_, i) => {
                        const isActive = i < team1Abs
                        return (
                            <motion.div
                                key={i}
                                initial={{ scale: 0.8 }}
                                animate={{ scale: isActive ? 1.1 : 1 }}
                                className={`w-3 h-3 md:w-4 md:h-4 rounded-full border-2 transition-all duration-500 ${isActive
                                    ? team1IsPositive
                                        ? 'bg-cyan-400 border-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.8)]'
                                        : 'bg-red-500 border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.8)]'
                                    : 'bg-transparent border-white/10'
                                    }`}
                            />
                        )
                    })}
                </div>
            </div>

            {/* Premium Divider */}
            <div className="hidden md:block h-10 w-[2px] bg-gradient-to-b from-transparent via-white/20 to-transparent" />

            {/* Team 2 (OPP) */}
            <div className="flex items-center gap-3">
                <span className="text-[11px] md:text-sm text-pink-500 font-black tracking-widest italic">
                    {team2Label}
                </span>
                <div className="flex gap-1.5 md:gap-2">
                    {Array.from({ length: target }).map((_, i) => {
                        const isActive = i < team2Abs
                        return (
                            <motion.div
                                key={i}
                                initial={{ scale: 0.8 }}
                                animate={{ scale: isActive ? 1.1 : 1 }}
                                className={`w-3 h-3 md:w-4 md:h-4 rounded-full border-2 transition-all duration-500 ${isActive
                                    ? team2IsPositive
                                        ? 'bg-pink-500 border-pink-400 shadow-[0_0_12px_rgba(236,72,153,0.8)]'
                                        : 'bg-red-500 border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.8)]'
                                    : 'bg-transparent border-white/10'
                                    }`}
                            />
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
