import { motion } from 'framer-motion'
import { Trophy, Clock } from 'lucide-react'

interface Winner {
    id: string
    tournamentName: string
    game: string
    username: string
    amount: number
    timeAgo: string
    isTopWinner?: boolean
}

// Mock data - will be replaced with real API data
const recentWinners: Winner[] = [
    {
        id: '1',
        tournamentName: 'BGMI Pro League Finals',
        game: 'BGMI',
        username: 'ProGamer_X',
        amount: 5000,
        timeAgo: '2 hours ago',
        isTopWinner: true
    },
    {
        id: '2',
        tournamentName: 'Free Fire Championship',
        game: 'Free Fire',
        username: 'SkillMaster99',
        amount: 3500,
        timeAgo: '5 hours ago'
    },
    {
        id: '3',
        tournamentName: 'Valorant Ranked Cup',
        game: 'Valorant',
        username: 'TacticalGenius',
        amount: 2500,
        timeAgo: '8 hours ago'
    },
    {
        id: '4',
        tournamentName: 'Minecraft Build Battle',
        game: 'Minecraft',
        username: 'CreativePro',
        amount: 1500,
        timeAgo: '12 hours ago'
    },
    {
        id: '5',
        tournamentName: 'BGMI Squad Showdown',
        game: 'BGMI',
        username: 'TeamElite',
        amount: 4000,
        timeAgo: '1 day ago'
    }
]

const RecentWinners = () => {
    return (
        <div className="w-full">
            {/* Section Header */}
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black flex items-center gap-4 uppercase italic tracking-tight">
                    <span className="w-2 h-8 bg-gradient-to-b from-[#2ED573] to-transparent rounded-full shadow-[0_0_15px_#2ED573]"></span>
                    Recent Results
                </h3>
            </div>

            {/* Winners List */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
                <div className="divide-y divide-white/5">
                    {recentWinners.map((winner, index) => (
                        <motion.div
                            key={winner.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`p-4 hover:bg-white/5 transition-all duration-300 ${winner.isTopWinner ? 'bg-[#2ED573]/10 border-l-4 border-[#2ED573]' : ''
                                }`}
                        >
                            <div className="flex items-center justify-between gap-4">
                                {/* Left: Tournament Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        {winner.isTopWinner && (
                                            <Trophy className="w-5 h-5 text-[#2ED573] flex-shrink-0" />
                                        )}
                                        <h4 className="text-white font-bold truncate">{winner.tournamentName}</h4>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <span className="text-gray-400">{winner.game}</span>
                                        <span className="text-gray-600">•</span>
                                        <span className="text-[#00E0C6] font-semibold">@{winner.username}</span>
                                    </div>
                                </div>

                                {/* Right: Prize & Time */}
                                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                    <div className={`text-lg font-black ${winner.isTopWinner ? 'text-[#2ED573]' : 'text-[#F5A623]'
                                        }`}>
                                        ₹{winner.amount.toLocaleString()}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <Clock className="w-3 h-3" />
                                        <span>{winner.timeAgo}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Trust Badge */}
                <div className="p-4 bg-white/5 border-t border-white/10">
                    <p className="text-center text-sm text-gray-400">
                        All payouts are <span className="text-[#00E0C6] font-semibold">verified</span> and processed within 24 hours
                    </p>
                </div>
            </div>
        </div>
    )
}

export default RecentWinners
