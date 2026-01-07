import { Link, useLocation } from 'react-router-dom'
import { Home, PlusSquare, Trophy, Dices, User } from 'lucide-react'
import { motion } from 'framer-motion'

const MobileNav = () => {
    const location = useLocation()
    const path = location.pathname

    const navItems = [
        { icon: Home, label: 'Home', route: '/dashboard' },
        { icon: Trophy, label: 'Tournaments', route: '/tournaments' },
        { icon: PlusSquare, label: 'Post', route: '/create-post', isPrimary: true },
        { icon: Dices, label: 'Games', route: '/predict' },
        { icon: User, label: 'Profile', route: '/settings' },
    ]

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-2 bg-gradient-to-t from-[#09090b] via-[#09090b]/95 to-transparent">
            <nav className="glass-card-premium flex items-center justify-around py-3 px-2 shadow-2xl backdrop-blur-xl bg-[#09090b]/80 border-t border-white/10">
                {navItems.map((item) => {
                    const isActive = path === item.route
                    const Icon = item.icon

                    if (item.isPrimary) {
                        return (
                            <Link
                                key={item.route}
                                to={item.route}
                                className="relative -top-5"
                            >
                                <motion.div
                                    whileTap={{ scale: 0.9 }}
                                    className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-[#00ffc2]/30 bg-gradient-to-br from-[#00ffc2] to-[#7c3aed] border border-white/20"
                                >
                                    <Icon className="w-6 h-6 text-[#09090b]" />
                                </motion.div>
                            </Link>
                        )
                    }

                    return (
                        <Link
                            key={item.route}
                            to={item.route}
                            className={`flex flex-col items-center gap-1 min-w-[60px] ${isActive ? 'text-[#00ffc2]' : 'text-gray-400'}`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? 'drop-shadow-[0_0_8px_rgba(0,255,194,0.5)]' : ''}`} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                            {isActive && (
                                <motion.div
                                    layout
                                    className="w-1 h-1 rounded-full bg-[#00ffc2] mt-0.5"
                                />
                            )}
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}

export default MobileNav
