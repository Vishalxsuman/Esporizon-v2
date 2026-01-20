import { motion } from 'framer-motion'
import { Zap, ShieldCheck, Target, Ban } from 'lucide-react'

const trustIndicators = [
    {
        id: 1,
        icon: Zap,
        title: 'Instant Results',
        description: 'Real-time leaderboards',
        color: 'from-yellow-500/20 to-orange-500/20'
    },
    {
        id: 2,
        icon: ShieldCheck,
        title: 'Verified Payouts',
        description: 'Secure & transparent',
        color: 'from-green-500/20 to-emerald-500/20'
    },
    {
        id: 3,
        icon: Target,
        title: 'Skill-Based Matchmaking',
        description: 'Fair competition',
        color: 'from-blue-500/20 to-cyan-500/20'
    },
    {
        id: 4,
        icon: Ban,
        title: 'No Luck, No Hacks',
        description: 'Pure skill wins',
        color: 'from-purple-500/20 to-pink-500/20'
    }
]

const TrustSection = () => {
    return (
        <section className="py-20 px-4 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl lg:text-5xl font-black text-white mb-4">
                        Why <span className="text-[#00E0C6]">Choose</span> Esporizon
                    </h2>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        Professional esports platform built on trust and transparency
                    </p>
                </motion.div>

                {/* Trust Indicators Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                    {trustIndicators.map((indicator, index) => (
                        <motion.div
                            key={indicator.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 hover:border-[#00E0C6]/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,224,198,0.15)] text-center group">
                                {/* Icon */}
                                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${indicator.color} flex items-center justify-center mb-4 border border-white/10 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                                    <indicator.icon className="w-8 h-8 text-[#00E0C6]" />
                                </div>

                                {/* Content */}
                                <h3 className="text-lg font-black text-white mb-2">
                                    {indicator.title}
                                </h3>
                                <p className="text-gray-400 text-sm">
                                    {indicator.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Optional Trust Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mt-12 text-center"
                >
                    <p className="text-gray-400 text-sm">
                        <span className="text-[#00E0C6] font-semibold">1000+</span> active players •{' '}
                        <span className="text-[#00E0C6] font-semibold">₹500K+</span> paid out •{' '}
                        <span className="text-[#00E0C6] font-semibold">24/7</span> support
                    </p>
                </motion.div>
            </div>
        </section>
    )
}

export default TrustSection
