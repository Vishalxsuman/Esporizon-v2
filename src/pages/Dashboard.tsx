import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { walletService } from '@/services/WalletService'
import { Wallet } from '@/types'
import WalletModal from '@/components/WalletModal'
import SocialFeed from '@/components/SocialFeed'
import ParticlesBackground from '@/components/ParticlesBackground'
import toast, { Toaster } from 'react-hot-toast'
import NotificationBell from '@/components/NotificationBell'
import UserButton from '@/components/UserButton'

const Dashboard = () => {
  const { user } = useAuth()
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [loading, setLoading] = useState(true)
  const [modalType, setModalType] = useState<'add' | 'withdraw' | null>(null)
  const location = useLocation()

  // Sync wallet from localStorage
  useEffect(() => {
    if (!user) return

    const loadWallet = async () => {
      try {
        const w = await walletService.getWallet(user.id)
        setWallet(w)
      } catch (error) {
        console.error('Failed to load wallet:', error)
        // Optionally set a mock wallet or null
      } finally {
        setLoading(false)
      }
    }

    loadWallet()

    const handleWalletUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail) setWallet(detail)
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

  const navLinks = [
    { label: 'Social Hub', route: '/social' },
    { label: 'Play Games', route: '/play' },
    { label: 'Tournaments', route: '/tournaments' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-[100dvh] overflow-hidden flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans selection:bg-[var(--accent)]/30 selection:text-[var(--accent)] transition-colors duration-300"
    >
      <Toaster position="top-right" />
      <ParticlesBackground />

      {/* Mobile Header */}
      <div className="lg:hidden p-4 flex justify-between items-center bg-[var(--bg-primary)]/90 backdrop-blur-xl border-b border-[var(--border)] z-20 sticky top-0">
        <div>
          <div className="flex items-center gap-2">
            <img
              src="/Images/logo.png"
              alt="Esporizon"
              className="w-6 h-6 object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = '/Images/espo.png'
              }}
            />
            <h1 className="text-xl font-bold bg-gradient-to-r from-[var(--accent)] to-[#7c3aed] bg-clip-text text-transparent">
              ESPORIZON
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell />
          <UserButton />
        </div>
      </div>

      {/* Desktop Header */}
      <header className="hidden lg:flex h-20 px-8 items-center justify-between border-b border-[var(--border)] bg-[var(--bg-primary)]/80 backdrop-blur-md z-30 sticky top-0">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
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
              <h1 className="text-2xl font-black bg-gradient-to-r from-[var(--accent)] to-[#7c3aed] bg-clip-text text-transparent tracking-tight">
                ESPORIZON
              </h1>
              <p className="text-[10px] text-[var(--text-secondary)] font-bold tracking-[0.2em] uppercase leading-none">Command Center</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-2 bg-[var(--glass)] p-1.5 rounded-full border border-[var(--border)] ml-4">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.route
              return (
                <Link
                  key={link.route}
                  to={link.route}
                  className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 ${isActive
                    ? 'bg-[var(--accent)] text-[#000] shadow-[0_0_15px_rgba(0,255,194,0.4)]'
                    : 'text-[var(--text-secondary)] hover:text-white hover:bg-[var(--glass-intense)]'
                    }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-5">
          <div className="flex flex-col items-end mr-2">
            <span className="text-[10px] text-[var(--text-secondary)] uppercase font-bold tracking-wider">Balance</span>
            <span className="text-lg font-black text-[var(--accent)] font-mono">₹{wallet?.balance.toLocaleString() || '0'}</span>
          </div>
          <div className="h-8 w-[1px] bg-[var(--border)]"></div>
          <NotificationBell />
          <UserButton />
          <Link to="/social" className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#5b21b6] text-white text-sm font-bold hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-all hover:scale-105 border border-white/10">
            + Nexus
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative z-0">

        {/* Helper layout container to center content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar scroll-smooth">
          <div className="max-w-7xl mx-auto p-4 pb-24 lg:p-10 w-full">

            {/* Hero: Featured Tournament */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.005 }}
              className="w-full h-64 lg:h-[22rem] rounded-3xl relative overflow-hidden mb-12 group cursor-pointer border border-[var(--border)] shadow-2xl bg-[var(--bg-primary)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#000] via-transparent to-[#7c3aed]/20 z-10"></div>
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center group-hover:scale-105 transition-transform duration-1000 ease-out"></div>

              <div className="absolute bottom-0 left-0 p-8 lg:p-12 z-20 w-full">
                <div className="flex flex-col lg:flex-row justify-between items-end gap-6">
                  <div className="max-w-2xl">
                    <span className="px-4 py-1.5 rounded-full bg-[var(--accent)]/10 backdrop-blur-md border border-[var(--accent)]/30 text-xs font-black mb-4 inline-block text-[var(--accent)] uppercase tracking-wider shadow-[0_0_10px_rgba(0,255,194,0.2)]">
                      Featured Event
                    </span>
                    <h2 className="text-3xl lg:text-5xl font-black mb-3 text-white drop-shadow-lg uppercase italic tracking-tight">Summer Championship</h2>
                    <p className="text-gray-300 text-base lg:text-lg mb-4 line-clamp-2 max-w-xl">Join the ultimate battle royale experience. Compete with the best and win from a prize pool of ₹1,00,000.</p>
                    <div className="flex items-center gap-4 text-sm font-bold text-[var(--accent)]">
                      <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse"></span> Registration Open</span>
                      <span className="w-1 h-1 rounded-full bg-gray-500"></span>
                      <span>Starts in 2d 14h</span>
                    </div>
                  </div>
                  <button className="w-full lg:w-auto px-8 py-3 bg-[var(--accent)] text-black font-black uppercase tracking-wider rounded-xl hover:bg-white hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,255,194,0.4)]">
                    Join Tournament
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Game Grid */}
            <div className="mb-12">
              <div className="flex justify-between items-end mb-8">
                <h3 className="text-2xl font-black flex items-center gap-4 uppercase italic tracking-tight">
                  <span className="w-2 h-8 bg-gradient-to-b from-[var(--accent)] to-transparent rounded-full shadow-[0_0_15px_var(--accent)]"></span>
                  Explore Games
                </h3>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {games.map((game, idx) => (
                  <Link
                    key={game.id}
                    to={`/arena/${game.id}`}
                    className="group block h-full"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{ y: -8 }}
                      className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/5 bg-[var(--glass)] hover:border-[var(--accent)] transition-all duration-300 shadow-lg group-hover:shadow-[0_0_30px_rgba(0,255,194,0.2)]"
                    >
                      <img
                        src={`https://cdn.jsdelivr.net/gh/Vishalxsuman/Esporizon-v2@main/Images/${game.id}.png`}
                        alt={game.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-300`}></div>
                      <div className={`absolute inset-0 bg-gradient-to-br ${game.gradient} opacity-0 group-hover:opacity-30 transition-opacity duration-300`}></div>

                      {/* LIVE Badge */}
                      <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 group-hover:border-[var(--accent)]/50 transition-colors">
                        <span className="w-2 h-2 rounded-full bg-[#ff4b2b] animate-pulse shadow-[0_0_10px_#ff4b2b]"></span>
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">{game.players}</span>
                      </div>

                      <div className="absolute bottom-0 left-0 w-full p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        <h4 className="text-xl lg:text-2xl font-black text-white group-hover:text-[var(--accent)] transition-colors drop-shadow-lg uppercase italic">{game.name}</h4>
                        <span className="text-xs font-bold text-gray-400 group-hover:text-white transition-colors mt-1 block">Click to Enter Arena &rarr;</span>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Social Feed Preview */}
              <div className="lg:col-span-2">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black flex items-center gap-3 uppercase italic tracking-tight">
                    <span className="w-1.5 h-6 bg-[#7c3aed] rounded-full shadow-[0_0_15px_#7c3aed]"></span>
                    Live Intel
                  </h3>
                  <Link to="/social" className="text-xs font-bold text-[var(--accent)] hover:underline">View Global Feed &rarr;</Link>
                </div>
                <div className="bg-[var(--glass)] rounded-2xl border border-white/5 p-4 lg:p-6 min-h-[300px]">
                  <SocialFeed maxPosts={3} />
                </div>
              </div>

              {/* Quick Wallet / Stats */}
              <div className="flex flex-col gap-6">
                <div className="bg-gradient-to-br from-[var(--glass-intense)] to-[var(--glass)] rounded-3xl border border-white/10 p-6 relative overflow-hidden group">
                  <div className="absolute -right-12 -top-12 w-48 h-48 bg-[var(--accent)]/10 rounded-full blur-3xl group-hover:bg-[var(--accent)]/20 transition-all duration-500"></div>

                  <div className="relative z-10">
                    <p className="text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-widest">Your Balance</p>
                    <h2 className="text-5xl font-black text-white mb-8 tracking-tighter">₹{wallet?.balance.toLocaleString('en-IN') || '0'}</h2>

                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => setModalType('add')}
                        className="w-full py-3 rounded-xl bg-[var(--accent)] text-black font-black uppercase tracking-wider shadow-lg shadow-[var(--accent)]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                      >
                        + Add Funds
                      </button>
                      <button
                        onClick={() => setModalType('withdraw')}
                        className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold border border-white/10 hover:border-white/20 transition-all"
                      >
                        Withdraw Request
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-[var(--glass)] rounded-3xl border border-white/5 p-6 flex flex-col justify-center items-center text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#7c3aed]/10 opacity-50"></div>
                  <h4 className="text-lg font-bold mb-2 relative z-10">Pro Membership</h4>
                  <p className="text-xs text-gray-400 mb-4 relative z-10">Unlock exclusive tournaments and zero fees.</p>
                  <button className="px-6 py-2 rounded-lg bg-[#7c3aed] text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#7c3aed]/30 hover:bg-[#6d28d9] transition-all relative z-10">
                    Upgrade Now
                  </button>
                </div>
              </div>
            </div>

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
