import { motion } from 'framer-motion'
import GlassCard from '../components/GlassCard'
import { recentActivity } from '../data/mockDashboardData'
import { scrollReveal, staggerContainer } from '../animations/dashboardAnimations'
import { Trophy, UserPlus, Gift } from 'lucide-react'

const RecentActivity = () => {
    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'win':
                return <Trophy className="w-5 h-5 text-accent-red" />
            case 'join':
                return <UserPlus className="w-5 h-5 text-blue-400" />
            case 'reward':
                return <Gift className="w-5 h-5 text-accent-orange" />
            default:
                return null
        }
    }

    const getActivityColor = (type: string) => {
        switch (type) {
            case 'win':
                return 'from-accent-red/30 to-accent-red/10'
            case 'join':
                return 'from-blue-500/30 to-blue-500/10'
            case 'reward':
                return 'from-accent-orange/30 to-accent-orange/10'
            default:
                return 'from-white/10 to-white/5'
        }
    }

    const formatTimeAgo = (timestamp: Date) => {
        const now = new Date()
        const diffMs = now.getTime() - timestamp.getTime()
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

        if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
        if (diffHrs > 0) return `${diffHrs} hour${diffHrs > 1 ? 's' : ''} ago`
        return 'Just now'
    }

    return (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-bg-secondary/30">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={scrollReveal}
                    className="text-center mb-12"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Recent <span className="text-accent-red">Activity</span>
                    </h2>
                    <p className="text-text-secondary text-lg">
                        Your latest achievements and actions
                    </p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={staggerContainer}
                >
                    <GlassCard>
                        <div className="space-y-4">
                            {recentActivity.map((activity) => (
                                <motion.div
                                    key={activity.id}
                                    variants={scrollReveal}
                                    className="flex items-start gap-4 p-4 rounded-lg hover:bg-white/5 transition-colors duration-200"
                                >
                                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getActivityColor(activity.type)} flex items-center justify-center flex-shrink-0`}>
                                        {getActivityIcon(activity.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-semibold mb-1">{activity.description}</p>
                                        <p className="text-text-secondary text-sm">{formatTimeAgo(activity.timestamp)}</p>
                                    </div>
                                    {activity.amount && (
                                        <div className="text-right flex-shrink-0">
                                            <div className="text-green-400 font-bold text-lg">+₹{activity.amount}</div>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </GlassCard>
                </motion.div>
            </div>
        </section>
    )
}

export default RecentActivity
