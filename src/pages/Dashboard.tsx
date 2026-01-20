import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useWallet } from '@/contexts/WalletContext' // Use global wallet context
import { walletService } from '@/services/WalletService'
import WalletModal from '@/components/WalletModal'
import ParticlesBackground from '@/components/ParticlesBackground'
import NotificationBell from '@/components/NotificationBell'
import UserButton from '@/components/UserButton'
import LiveTournamentsGrid from '@/components/LiveTournamentsGrid'
import GamesCarousel from '@/components/GamesCarousel'
import RecentWinners from '@/components/RecentWinners'
import PerformanceCards from '@/components/PerformanceCards'
import ActivityTimeline from '@/components/ActivityTimeline'
import Skeleton from '@/components/Skeleton' // Import Skeleton
import toast, { Toaster } from 'react-hot-toast'

const DashboardSkeleton = () => (
  <div className="min-h-screen bg-[#0B0F1A] p-8 space-y-8">
    <div className="flex justify-between items-center h-20">
      <Skeleton width={150} height={40} />
      <div className="flex gap-4">
        <Skeleton width={100} height={40} />
        <Skeleton width={40} height={40} className="rounded-full" />
        <Skeleton width={40} height={40} className="rounded-full" />
      </div>
    </div>
    <Skeleton height={300} className="rounded-3xl" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Skeleton height={200} className="rounded-2xl" />
      <Skeleton height={200} className="rounded-2xl" />
      <Skeleton height={200} className="rounded-2xl" />
    </div>
  </div>
)

const Dashboard = () => {
  const { user, authReady } = useAuth()
  const { balance, addBalance, deductBalance } = useWallet() // Use context

  const [modalType, setModalType] = useState<'add' | 'withdraw' | null>(null)
  const location = useLocation()

  // Mock user stats - can be moved to context/api later
  const userStats = {
    matchesPlayed: 42,
    winRate: 65.5,
    totalEarnings: 12500,
    currentRank: 127
  }

  // STRICT RENDER GUARDS
  if (!authReady) {
    return <DashboardSkeleton />
  }

  if (!user) {
    return null
  }

  // NOTE: We do NOT block on wallet loading anymore. 
  // DashboardSkeleton is only for auth init. 
  // Wallet loading state is passed down or handled via safe defaults (0 balance).

  const handleWalletAction = async (amount: number) => {
    if (!user) return

    try {
      if (modalType === 'add') {
        const success = await addBalance(amount)
        if (!success) throw new Error('Failed to add funds')
      } else if (modalType === 'withdraw') {
        const accountDetails = { method: 'bank', accountNumber: 'XXXX' }
        const success = await deductBalance(amount, 'Withdrawal')
        if (success) {
          await walletService.withdrawFunds(amount, user.id, accountDetails)
          toast.success(`₹${amount.toLocaleString('en-IN')} withdrawn successfully!`, {
            icon: '✅',
            style: {
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(0, 224, 198, 0.3)',
              color: '#fff',
            },
          })
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Transaction failed', {
        icon: '❌',
        style: {
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 75, 43, 0.3)',
          color: '#fff',
        },
      })
    }
  }

  const navLinks = [
    { label: 'Dashboard', route: '/dashboard' },
    { label: 'Tournaments', route: '/tournaments' },
    { label: 'Games', route: '/play' },
    { label: 'Leaderboard', route: '/social' },
  ]


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-[#0B0F1A] text-white font-sans selection:bg-[#00E0C6]/30 selection:text-[#00E0C6]"
    >
      <Toaster position="top-right" />
      <ParticlesBackground />

      {/* Desktop Top Navigation - Hidden on mobile */}
      <header className="hidden lg:block sticky top-0 z-50 bg-[#0E1424]/90 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-[1920px] mx-auto px-8 h-20">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center h-full">
            {/* Left: Logo & Brand */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-3">
                <img
                  src="/Images/logo.png"
                  alt="Esporizon"
                  className="w-10 h-10 object-contain hover:rotate-12 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/Images/espo.png'
                  }}
                />
                <div>
                  <h1 className="text-2xl font-black bg-gradient-to-r from-[#00E0C6] to-[#7B61FF] bg-clip-text text-transparent tracking-tight">
                    ESPORIZON
                  </h1>
                  <p className="text-[10px] text-gray-400 font-bold tracking-[0.2em] uppercase leading-none">
                    Command Center
                  </p>
                </div>
              </Link>
            </div>

            {/* Center: Navigation - True center alignment */}
            <nav className="flex items-center gap-2 bg-white/5 p-1.5 rounded-full border border-white/10">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.route
                return (
                  <Link
                    key={link.route}
                    to={link.route}
                    className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 ${isActive
                      ? 'bg-[#00E0C6] text-[#000] shadow-[0_0_15px_rgba(0,224,198,0.4)]'
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                      }`}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </nav>

            {/* Right: Wallet + Notifications + Profile */}
            <div className="flex items-center justify-end gap-5">
              <div className="flex flex-col items-end mr-2">
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Balance</span>
                <span className="text-lg font-black text-[#00E0C6] font-mono">
                  ₹{balance.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="h-8 w-[1px] bg-white/10"></div>
              <NotificationBell />
              <UserButton />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Header - Minimal */}
      <header className="lg:hidden sticky top-0 z-50 bg-[#0E1424]/90 backdrop-blur-xl border-b border-white/10 px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/Images/logo.png"
              alt="Esporizon"
              className="w-8 h-8 object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = '/Images/espo.png'
              }}
            />
            <h1 className="text-xl font-black bg-gradient-to-r from-[#00E0C6] to-[#7B61FF] bg-clip-text text-transparent">
              ESPORIZON
            </h1>
          </Link>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <UserButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1920px] mx-auto px-4 lg:px-8 py-8 lg:py-12 space-y-12 lg:space-y-16 pb-24 lg:pb-12">
        {/* Hero/Overview Section - Polished */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0E1424] to-[#0A0D17] border border-white/10 p-6 lg:p-12">
          <div className="relative z-10 grid lg:grid-cols-[1.5fr_1fr] gap-8 items-center">
            {/* Left: Welcome Message - Dominant */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-3xl lg:text-5xl font-black mb-2 lg:mb-4">
                  Welcome back, <span className="text-[#00E0C6]">{user?.displayName || 'Player'}</span>
                </h2>
                <p className="text-base lg:text-lg text-gray-400">
                  Live tournaments • Real rewards • Skill-based
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/tournaments"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00E0C6] to-[#7B61FF] text-black font-bold hover:shadow-lg hover:shadow-[#00E0C6]/30 transition-all hover:scale-105 text-center"
                >
                  Browse Tournaments
                </Link>
                <button
                  onClick={() => setModalType('add')}
                  className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold border border-white/10 hover:border-[#00E0C6]/50 transition-all"
                >
                  Add Funds
                </button>
              </div>
            </motion.div>

            {/* Right: Character - Reduced dominance, pushed right */}
            <motion.div
              className="hidden lg:flex justify-end"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <motion.img
                src="/Images/02.png"
                alt="Esports Character"
                className="w-72 h-auto relative z-10 opacity-60"
                style={{
                  filter: 'drop-shadow(0 0 30px rgba(0, 224, 198, 0.3))',
                  maskImage: 'linear-gradient(to bottom, black 50%, transparent 95%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 95%)'
                }}
                animate={{
                  y: [0, -8, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            </motion.div>
          </div>

          {/* Background Glow - Subtle */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00E0C6]/5 rounded-full blur-3xl"></div>
        </section>

        {/* Featured Games Carousel - Now First */}
        <GamesCarousel />

        {/* Live & Upcoming Tournaments */}
        <LiveTournamentsGrid />

        {/* Two Column Layout: Recent Winners & Performance/Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <RecentWinners />
          <div className="space-y-8">
            <PerformanceCards stats={userStats} />
            <ActivityTimeline />
          </div>
        </div>
      </main>

      {/* Wallet Modal */}
      <WalletModal
        isOpen={modalType !== null}
        onClose={() => setModalType(null)}
        type={modalType || 'add'}
        currentBalance={balance}
        onSubmit={handleWalletAction}
      />
    </motion.div>
  )
}

export default Dashboard
