import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import { Home, Gamepad2, Target, MessageSquare, Wallet } from 'lucide-react'

const Navigation = () => {
  const { user } = useAuth()
  const location = useLocation()

  const navItems = [
    { path: '/dashboard', label: 'Home', icon: Home },
    { path: '/tournaments', label: 'Play', icon: Gamepad2 },
    { path: '/predict', label: 'Predict', icon: Target },
    { path: '/social', label: 'Social', icon: MessageSquare }, // Changed from /posts to /social
    { path: '/wallet', label: 'Wallet', icon: Wallet },    // Assuming /wallet for wallet
  ]

  // Only show for authenticated users
  if (!user) return null

  // Paths where we might want to hide nav (e.g., Auth, Landing)
  const hideNavPaths = ['/', '/auth']
  if (hideNavPaths.includes(location.pathname)) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#09090b]/80 backdrop-blur-xl border-t border-white/10 lg:hidden pb-safe">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon

          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center justify-center gap-1 w-full h-full transition-all duration-300"
            >
              <div className="relative">
                <Icon
                  size={20}
                  className={`transition-colors duration-300 ${isActive ? 'text-[#00ffc2]' : 'text-gray-500'
                    }`}
                />
                {isActive && (
                  <motion.div
                    layoutId="activeGlow"
                    className="absolute inset-0 bg-[#00ffc2]/20 blur-lg rounded-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  />
                )}
              </div>

              <span
                className={`text-[10px] font-black uppercase tracking-widest transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-600'
                  }`}
              >
                {item.label}
              </span>

              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute -top-[1px] left-1/4 right-1/4 h-0.5 bg-[#00ffc2] shadow-[0_0_10px_#00ffc2]"
                />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default Navigation
