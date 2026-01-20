import { motion } from 'framer-motion'
import { UserPlus, Trophy, Target, Wallet } from 'lucide-react'

const steps = [
    {
        id: 1,
        icon: UserPlus,
        title: 'Create Account',
        description: 'Login using email or phone',
        color: 'from-blue-500/20 to-cyan-500/20'
    },
    {
        id: 2,
        icon: Target,
        title: 'Browse Tournaments',
        description: 'View live & upcoming matches',
        color: 'from-purple-500/20 to-pink-500/20'
    },
    {
        id: 3,
        icon: Trophy,
        title: 'Join & Compete',
        description: 'Skill-based matchmaking',
        color: 'from-orange-500/20 to-red-500/20'
    },
    {
        id: 4,
        icon: Wallet,
        title: 'Win & Withdraw',
        description: 'Transparent payouts',
        color: 'from-green-500/20 to-emerald-500/20'
    }
]

const HowItWorksSection = () => {
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
                        How <span className="text-[#00E0C6]">Esporizon</span> Works
                    </h2>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        Four simple steps to start competing and earning
                    </p>
                </motion.div>

                {/* Steps Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                    {steps.map((step, index) => (
                        <motion.div
                            key={step.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="group relative"
                        >
                            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 hover:border-[#00E0C6]/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,224,198,0.15)] hover:translate-y-[-4px] h-full">
                                {/* Step Number */}
                                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#00E0C6]/20 flex items-center justify-center">
                                    <span className="text-[#00E0C6] font-black text-sm">{step.id}</span>
                                </div>

                                {/* Icon */}
                                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 border border-white/10 group-hover:scale-110 transition-transform duration-300`}>
                                    <step.icon className="w-8 h-8 text-[#00E0C6]" />
                                </div>

                                {/* Content */}
                                <h3 className="text-xl font-black text-white mb-2">
                                    {step.title}
                                </h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    {step.description}
                                </p>
                            </div>

                            {/* Connector Line (desktop only) */}
                            {index < steps.length - 1 && (
                                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-[#00E0C6]/50 to-transparent"></div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default HowItWorksSection
