import { motion } from 'framer-motion'
import { Trophy, UserPlus, Bell, TrendingUp } from 'lucide-react'

interface Activity {
    id: string
    type: 'join' | 'win' | 'update' | 'achievement'
    description: string
    timestamp: Date
    amount?: number
}

const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
        case 'join':
            return <UserPlus className="w-4 h-4" />
        case 'win':
            return <Trophy className="w-4 h-4" />
        case 'update':
            return <Bell className="w-4 h-4" />
        case 'achievement':
            return <TrendingUp className="w-4 h-4" />
    }
}

const getActivityColor = (type: Activity['type']) => {
    switch (type) {
        case 'join':
            return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
        case 'win':
            return 'bg-green-500/20 text-green-400 border-green-500/30'
        case 'update':
            return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
        case 'achievement':
            return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    }
}

const formatTimeAgo = (date: Date): string => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
}

// Mock data - will be replaced with real API data
const mockActivities: Activity[] = [
    {
        id: '1',
        type: 'win',
        description: 'Won ₹2,500 in BGMI Squad Championship',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        amount: 2500
    },
    {
        id: '2',
        type: 'join',
        description: 'Joined Free Fire Pro League',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
    },
    {
        id: '3',
        type: 'update',
        description: 'Tournament results updated for Valorant Cup',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000) // 8 hours ago
    },
    {
        id: '4',
        type: 'achievement',
        description: 'Reached Top 10 in Leaderboard!',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
    },
    {
        id: '5',
        type: 'join',
        description: 'Joined Minecraft Build Battle',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
    }
]

const ActivityTimeline = () => {
    return (
        <div className="w-full">
            {/* Section Header */}
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black flex items-center gap-4 uppercase italic tracking-tight">
                    <span className="w-2 h-8 bg-gradient-to-b from-[#00E0C6] to-transparent rounded-full shadow-[0_0_15px_#00E0C6]"></span>
                    Recent Activity
                </h3>
            </div>

            {/* Activity List */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-4">
                <div className="space-y-3">
                    {mockActivities.map((activity, index) => (
                        <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-all duration-300 group"
                        >
                            {/* Icon */}
                            <div className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 ${getActivityColor(activity.type)}`}>
                                {getActivityIcon(activity.type)}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-medium text-sm leading-relaxed">
                                    {activity.description}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {formatTimeAgo(activity.timestamp)}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* View All Link */}
                <div className="mt-4 pt-4 border-t border-white/10">
                    <button className="w-full text-center text-sm font-semibold text-[#00E0C6] hover:text-[#00E0C6]/80 transition-colors">
                        View All Activity →
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ActivityTimeline
