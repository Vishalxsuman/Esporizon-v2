import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useUser, UserButton } from '@clerk/clerk-react'
import { walletService } from '@/services/WalletService'
import { Wallet } from '@/types'
import WalletModal from '@/components/WalletModal'
import SocialFeed from '@/components/SocialFeed'
import ParticlesBackground from '@/components/ParticlesBackground'
import toast, { Toaster } from 'react-hot-toast'

const Dashboard = () => {
  const { user } = useUser()
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [loading, setLoading] = useState(true)
  const [modalType, setModalType] = useState<'add' | 'withdraw' | null>(null)

  // Sync wallet from localStorage
  useEffect(() => {
    if (!user) return

    const loadWallet = async () => {
      const w = await walletService.getWallet(user.id)
      setWallet(w)
      setLoading(false)
    }

    loadWallet()

    const handleWalletUpdate = (e: any) => {
      setWallet(e.detail)
    }

    window.addEventListener('walletUpdate', handleWalletUpdate)
    return () => window.removeEventListener('walletUpdate', handleWalletUpdate)
  }, [user])

  const handleWalletAction = async (amount: number) => {
    if (!user) return

    try {
      if (modalType === 'add') {
        await walletService.addFunds(amount, user.id)
        toast.success(`₹${amount.toLocaleString('en-IN')} added successfully!`, {
          icon: '💰',
          style: {
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(0, 255, 194, 0.3)',
            color: '#fff',
          },
        })
      } else if (modalType === 'withdraw') {
        // For now, use placeholder account details
        const accountDetails = { method: 'bank', accountNumber: 'XXXX' }
        await walletService.withdrawFunds(amount, user.id, accountDetails)
        toast.success(`₹${amount.toLocaleString('en-IN')} withdrawn successfully!`, {
          icon: '✅',
          style: {
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(0, 255, 194, 0.3)',
            color: '#fff',
          },
        })
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
      throw error
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent)]"></div>
      </div>
    )
  }

  const games = [
    { id: 'freefire', name: 'Free Fire', players: '1.2M', gradient: 'from-red-500/20 to-orange-500/20' },
    { id: 'bgmi', name: 'BGMI', players: '2.5M', gradient: 'from-orange-500/20 to-yellow-600/20' },
    { id: 'valorant', name: 'Valorant', players: '800K', gradient: 'from-red-600/20 to-pink-500/20' },
    { id: 'minecraft', name: 'Minecraft', players: '500K', gradient: 'from-purple-500/20 to-indigo-500/20' },
  ]

  const quickActions = [
    { icon: '✍️', label: 'Create Post', route: '/create-post' },
    { icon: '🎲', label: 'Color Prediction', route: '/predict' },
    { icon: '🎮', label: 'Tournaments', route: '/tournaments' },
    { icon: '📊', label: 'Earnings', route: '/earnings' },
    { icon: '💬', label: 'Support', route: '/support' },
    { icon: '⚙️', label: 'Settings', route: '/profile' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-[100dvh] overflow-hidden flex flex-col lg:flex-row bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans selection:bg-[var(--accent)]/30 selection:text-[var(--accent)] transition-colors duration-300"
    >
      <Toaster position="top-right" />
      <ParticlesBackground />

      {/* Mobile Header */}
      <div className="lg:hidden p-4 flex justify-between items-center bg-[var(--bg-primary)]/90 backdrop-blur-xl border-b border-[var(--border)] z-20 sticky top-0">
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-[var(--accent)] to-[#7c3aed] bg-clip-text text-transparent italic">
            ESPO V2
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">Welcome {user?.firstName || 'Gamer'}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end mr-2">
            <span className="text-[10px] text-[var(--text-secondary)] uppercase">Balance</span>
            <span className="text-sm font-bold text-[var(--accent)]">₹{wallet?.balance.toLocaleString()}</span>
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col w-64 p-6 border-r border-[var(--border)] bg-[var(--bg-primary)]/50 backdrop-blur-xl h-full z-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[var(--accent)] to-[#7c3aed] bg-clip-text text-transparent italic tracking-tighter">
            ESPO V2
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1 uppercase tracking-widest">Command Center</p>
        </div>

        <nav className="flex-1 space-y-2">
          {quickActions.map((action) => (
            <Link
              key={action.route}
              to={action.route}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass)] transition-all group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[var(--accent)]/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300" />
              <span className="text-xl group-hover:scale-110 transition-transform relative z-10">{action.icon}</span>
              <span className="text-sm font-medium relative z-10">{action.label}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-[var(--border)]">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[var(--glass)] border border-[var(--border)]">
            <UserButton afterSignOutUrl="/" />
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold truncate">{user?.fullName || 'Gamer'}</p>
              <p className="text-[10px] text-[var(--text-secondary)] truncate">{user?.primaryEmailAddress?.emailAddress}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-0">
        {/* Desktop Header */}
        <header className="hidden lg:flex h-16 px-8 items-center justify-between border-b border-[var(--border)] bg-[var(--bg-primary)]/50 backdrop-blur-sm z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold">Welcome back, {user?.firstName || 'Gamer'}!</h2>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/create-post" className="px-5 py-2 rounded-lg bg-[var(--accent)] text-[var(--bg-primary)] text-sm font-bold hover:bg-[var(--accent)]/90 transition-all hover:scale-105 shadow-[0_0_20px_rgba(0,255,194,0.3)]">
              + Create Post
            </Link>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 pb-24 lg:p-8 custom-scrollbar scroll-smooth overscroll-contain">

          {/* Hero: Featured Tournament */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01 }}
            className="w-full h-56 lg:h-64 rounded-2xl relative overflow-hidden mb-8 group cursor-pointer border border-[var(--border)] shadow-2xl bg-[var(--bg-primary)]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#7c3aed] to-[var(--accent)] opacity-80 mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:scale-110 transition-transform duration-1000"></div>
            <div className="absolute bottom-0 left-0 p-6 lg:p-8 z-10 w-full bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex justify-between items-end">
                <div>
                  <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] lg:text-xs font-bold mb-3 inline-block text-[var(--accent)]">FEATURED EVENT</span>
                  <h2 className="text-2xl lg:text-4xl font-bold mb-2">Summer Championship</h2>
                  <p className="text-gray-200 text-sm lg:text-base max-w-lg mb-4 line-clamp-1 lg:line-clamp-none">Join the ultimate battle royale experience. Prize pool ₹1,00,000.</p>
                </div>
                <button className="hidden lg:block px-6 py-2 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors">Join Now</button>
              </div>
            </div>
          </motion.div>

          {/* Game Grid */}
          <div className="mb-10">
            <h3 className="text-xl font-black mb-6 flex items-center gap-3">
              <span className="w-1.5 h-8 bg-[var(--accent)] rounded-full shadow-[0_0_15px_var(--accent)]"></span>
              EXPLORE GAMES
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              {games.map((game, idx) => (
                <Link
                  key={game.id}
                  to={`/tournaments/${game.id}`}
                  className="group block"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ y: -4 }}
                    className="relative aspect-[3/4] rounded-xl overflow-hidden border border-[#00ffc2]/20 bg-[rgba(255,255,255,0.03)] hover:border-[#00ffc2] transition-all duration-300 shadow-lg group-hover:shadow-[0_0_20px_rgba(0,255,194,0.3)] backdrop-blur-[16px]"
                    style={{
                      backdropFilter: 'blur(16px)',
                    }}
                  >
                    <img
                      src={`https://cdn.jsdelivr.net/gh/Vishalxsuman/Esporizon-v2@main/Images/${game.id}.png`}
                      alt={game.name}
                      className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                    <div className={`absolute inset-0 bg-gradient-to-br ${game.gradient} opacity-30 group-hover:opacity-50 transition-opacity`}></div>

                    {/* LIVE Badge with Breathing Animation */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-[#ff4b2b] px-2.5 py-1.5 rounded-full" style={{
                      animation: 'breathe 2s ease-in-out infinite',
                    }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                      <span className="text-[10px] font-bold text-white uppercase tracking-wide">{game.players}</span>
                    </div>

                    <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
                      <h4 className="text-base lg:text-xl font-bold group-hover:text-[var(--accent)] transition-colors drop-shadow-lg">{game.name}</h4>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile Social Feed Preview (Only show on mobile) */}
          <div className="lg:hidden mb-12">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black flex items-center gap-3">
                <span className="w-1.5 h-8 bg-[#7c3aed] rounded-full shadow-[0_0_15px_#7c3aed]"></span>
                LIVE FEED
              </h3>
              <Link to="/posts" className="text-xs text-[var(--accent)]">View All</Link>
            </div>
            <div className="space-y-4">
              <SocialFeed maxPosts={3} />
            </div>
          </div>

        </div>
      </div>

      {/* Right Panel (Desktop Only) */}
      <div className="hidden xl:flex flex-col w-80 h-full border-l border-[var(--border)] bg-[var(--bg-primary)]/30 backdrop-blur-sm z-10 relative">
        <div className="absolute inset-y-0 left-0 w-[1px] bg-gradient-to-b from-transparent via-[var(--border)] to-transparent"></div>

        {/* Wallet Section */}
        <div className="p-6 border-b border-[var(--border)]">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[var(--glass-intense)] to-transparent border border-[var(--border)] relative overflow-hidden group hover:border-[var(--accent)]/30 transition-all">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-[var(--accent)]/10 rounded-full blur-2xl group-hover:bg-[var(--accent)]/20 transition-all"></div>
            <p className="text-xs text-[var(--text-secondary)] mb-1 uppercase tracking-wider font-bold">Total Balance</p>
            <h2 className="text-4xl font-black text-[var(--text-primary)] mb-6 tracking-tight">₹{wallet?.balance.toLocaleString('en-IN') || '0'}</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setModalType('add')}
                className="flex-1 py-2.5 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-[var(--bg-primary)] text-xs font-bold transition-all shadow-lg shadow-[var(--accent)]/20 hover:scale-105 active:scale-95"
              >
                + Add Funds
              </button>
              <button
                onClick={() => setModalType('withdraw')}
                className="flex-1 py-2.5 rounded-lg bg-[var(--glass)] hover:bg-[var(--glass-intense)] text-[var(--text-primary)] text-xs font-bold border border-[var(--border)] transition-all hover:border-[var(--text-secondary)]/30"
              >
                Withdraw
              </button>
            </div>
          </div>
        </div>

        {/* Social Feed Section */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="px-6 py-4 flex justify-between items-end border-b border-[var(--border)] bg-[var(--glass)]">
            <h3 className="font-bold text-[var(--text-secondary)]">Social Feed</h3>
            <Link to="/posts" className="text-xs text-[var(--accent)] hover:underline hover:text-[var(--accent)]/80 transition-colors">View All</Link>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            <SocialFeed maxPosts={5} />
          </div>
        </div>
      </div>

      {/* Wallet Modal */}
      <WalletModal
        isOpen={modalType !== null}
        onClose={() => setModalType(null)}
        type={modalType || 'add'}
        currentBalance={wallet?.balance || 0}
        onSubmit={handleWalletAction}
      />
    </motion.div>
  )
}

export default Dashboard
