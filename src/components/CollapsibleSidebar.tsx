import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import UserButton from './UserButton'

interface SidebarItem {
    id: string
    label: string
    icon: string
    route: string
    image?: string
}

const CollapsibleSidebar = () => {
    const [isExpanded, setIsExpanded] = useState(() => {
        const saved = localStorage.getItem('sidebarExpanded')
        return saved !== null ? JSON.parse(saved) : true
    })
    const location = useLocation()
    const { user } = useAuth()

    useEffect(() => {
        localStorage.setItem('sidebarExpanded', JSON.stringify(isExpanded))
    }, [isExpanded])

    const games: SidebarItem[] = [
        { id: 'freefire', label: 'Free Fire', icon: '🔥', route: '/arena/freefire', image: 'freefire.png' },
        { id: 'bgmi', label: 'BGMI', icon: '🔫', route: '/arena/bgmi', image: 'bgmi.png' },
        { id: 'valorant', label: 'Valorant', icon: '💥', route: '/arena/valorant', image: 'valorant.png' },
        { id: 'minecraft', label: 'Minecraft', icon: '⛏️', route: '/arena/minecraft', image: 'minecraft.png' },
    ]

    const navigation: SidebarItem[] = [
        { id: 'home', label: 'Home', icon: '🏠', route: '/dashboard' },
        { id: 'tournaments', label: 'Tournaments', icon: '🏆', route: '/tournaments' },
        { id: 'feed', label: 'Feed', icon: '📰', route: '/feed' },
        { id: 'you', label: 'You', icon: '👤', route: '/profile' },
    ]

    const isActive = (route: string) => {
        return location.pathname === route || location.pathname.startsWith(route + '/')
    }

    const SidebarItemComponent = ({ item }: { item: SidebarItem }) => {
        const active = isActive(item.route)

        return (
            <Link to={item.route} className="block group relative">
                <motion.div
                    whileHover={{ x: 2 }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all relative overflow-hidden
            ${active
                            ? 'bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/30'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass)]'
                        }
          `}
                >
                    {/* Active indicator bar */}
                    {active && (
                        <motion.div
                            layoutId="activeIndicator"
                            className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--accent)] rounded-r-full"
                            initial={false}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                    )}

                    {/* Icon container */}
                    <div className={`flex-shrink-0 flex items-center justify-center transition-all
            ${isExpanded ? 'w-8 h-8' : 'w-10 h-10'}
          `}>
                        {item.image ? (
                            <div className={`rounded-full overflow-hidden border-2 transition-all
                ${active ? 'border-[var(--accent)]' : 'border-transparent group-hover:border-[var(--accent)]/30'}
                ${isExpanded ? 'w-8 h-8' : 'w-10 h-10'}
              `}>
                                <img
                                    src={`/Images/${item.image}`}
                                    alt={item.label}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement
                                        target.style.display = 'none'
                                        target.parentElement!.innerHTML = `<span class="text-xl">${item.icon}</span>`
                                    }}
                                />
                            </div>
                        ) : (
                            <span className={`transition-all ${isExpanded ? 'text-lg' : 'text-2xl'}`}>
                                {item.icon}
                            </span>
                        )}
                    </div>

                    {/* Label - only show when expanded */}
                    <AnimatePresence>
                        {isExpanded && (
                            <motion.span
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                transition={{ duration: 0.2 }}
                                className="text-sm font-medium whitespace-nowrap overflow-hidden"
                            >
                                {item.label}
                            </motion.span>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Tooltip for collapsed state */}
                {!isExpanded && (
                    <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 shadow-xl">
                        {item.label}
                    </div>
                )}
            </Link>
        )
    }

    return (
        <motion.div
            animate={{ width: isExpanded ? 260 : 72 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="hidden lg:flex flex-col h-full border-r border-[var(--border)] bg-[var(--bg-primary)]/95 backdrop-blur-xl relative z-10"
        >
            {/* Header with Logo */}
            <div className={`flex items-center gap-3 px-4 border-b border-[var(--border)] transition-all
        ${isExpanded ? 'py-5' : 'py-4 justify-center'}
      `}>
                <div className={`flex-shrink-0 transition-all ${isExpanded ? 'w-10 h-10' : 'w-12 h-12'}`}>
                    <img
                        src="/Images/logo.png"
                        alt="Esporizon"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = '/Images/espo.png'
                        }}
                    />
                </div>
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <h1 className="text-xl font-bold bg-gradient-to-r from-[var(--accent)] to-[#7c3aed] bg-clip-text text-transparent whitespace-nowrap">
                                ESPORIZON
                            </h1>
                            <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest">
                                Command Center
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Navigation Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar py-4 px-3">
                {/* Games Section */}
                <div className="mb-6">
                    {isExpanded && (
                        <h3 className="px-3 mb-2 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">
                            Games
                        </h3>
                    )}
                    <div className="space-y-1">
                        {games.map((game) => (
                            <SidebarItemComponent key={game.id} item={game} />
                        ))}
                    </div>
                </div>

                {/* Separator */}
                <div className="my-4 border-t border-[var(--border)]" />

                {/* Navigation Section */}
                <div>
                    {isExpanded && (
                        <h3 className="px-3 mb-2 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">
                            Navigation
                        </h3>
                    )}
                    <div className="space-y-1">
                        {navigation.map((item) => (
                            <SidebarItemComponent key={item.id} item={item} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Toggle Button */}
            <div className={`border-t border-[var(--border)] transition-all ${isExpanded ? 'p-3' : 'p-2'}`}>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full py-2.5 rounded-lg bg-[var(--glass)] hover:bg-[var(--glass-intense)] border border-[var(--border)] hover:border-[var(--accent)]/30 text-[var(--text-secondary)] hover:text-[var(--accent)] transition-all flex items-center justify-center gap-2 group"
                >
                    <motion.span
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-lg"
                    >
                        {isExpanded ? '◀' : '▶'}
                    </motion.span>
                    <AnimatePresence>
                        {isExpanded && (
                            <motion.span
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                className="text-xs font-medium overflow-hidden whitespace-nowrap"
                            >
                                Collapse
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>
            </div>

            {/* User Profile Section */}
            <div className={`border-t border-[var(--border)] transition-all ${isExpanded ? 'p-3' : 'p-2'}`}>
                <div className={`flex items-center gap-3 py-2 px-2 rounded-lg bg-[var(--glass)] border border-[var(--border)] transition-all
          ${isExpanded ? '' : 'justify-center'}
        `}>
                    <UserButton />
                    <AnimatePresence>
                        {isExpanded && (
                            <motion.div
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                className="flex-1 overflow-hidden"
                            >
                                <p className="text-sm font-bold truncate">{user?.displayName || 'Gamer'}</p>
                                <p className="text-[10px] text-[var(--text-secondary)] truncate">{user?.email}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    )
}

export default CollapsibleSidebar
