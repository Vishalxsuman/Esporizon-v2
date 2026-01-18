import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, SlidersHorizontal, Flame, Search, History } from 'lucide-react'
import TournamentCard from '@/components/TournamentCard'
import { Tournament } from '@/types/tournament'
import { tournamentService } from '../services/TournamentService';
import { useNavigate } from 'react-router-dom'

type TabType = 'live' | 'upcoming' | 'completed'
type GameFilter = 'all' | 'freefire' | 'bgmi' | 'valorant' | 'minecraft'
type ModeFilter = 'all' | 'solo' | 'duo' | 'squad'
type EntryFilter = 'all' | 'free' | 'paid'
type SortOption = 'startDate' | 'prizePool' | 'entryFee'

const TournamentGrid = () => {
  const navigate = useNavigate()
  // State
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('live')
  const [gameFilter, setGameFilter] = useState<GameFilter>('all')
  const [modeFilter, setModeFilter] = useState<ModeFilter>('all')
  const [entryFilter, setEntryFilter] = useState<EntryFilter>('all')
  const [sortBy, setSortBy] = useState<SortOption>('startDate')
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch tournaments
  useEffect(() => {
    fetchTournaments()
  }, [])

  const fetchTournaments = async () => {
    setLoading(true)
    try {
      const data = await tournamentService.getTournaments()
      setTournaments(data)
    } catch (error) {
      console.error('Error fetching tournaments:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter logic
  const getFilteredTournaments = () => {
    let filtered = [...tournaments]

    // Game filter
    if (gameFilter !== 'all') {
      filtered = filtered.filter((t) => t.gameId === gameFilter)
    }

    // Status filter (based on active tab)
    if (activeTab === 'live') {
      filtered = filtered.filter((t) => t.status === 'ongoing')
    } else if (activeTab === 'upcoming') {
      filtered = filtered.filter((t) => t.status === 'upcoming')
    } else if (activeTab === 'completed') {
      filtered = filtered.filter((t) => t.status === 'completed')
    }

    // Mode filter
    if (modeFilter !== 'all') {
      filtered = filtered.filter((t) =>
        t.format?.toLowerCase().includes(modeFilter.toLowerCase())
      )
    }

    // Entry filter
    if (entryFilter === 'free') {
      filtered = filtered.filter((t) => t.entryFee === 0)
    } else if (entryFilter === 'paid') {
      filtered = filtered.filter((t) => t.entryFee > 0)
    }

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter((t) =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'prizePool') {
        return b.prizePool - a.prizePool
      } else if (sortBy === 'entryFee') {
        return a.entryFee - b.entryFee
      } else {
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      }
    })

    return filtered
  }

  const filteredTournaments = getFilteredTournaments()
  const liveTournaments = tournaments.filter((t) => t.status === 'ongoing')

  const gameFilters: { id: GameFilter; name: string; icon: string }[] = [
    { id: 'all', name: 'All Games', icon: '🎮' },
    { id: 'freefire', name: 'Free Fire', icon: '🔥' },
    { id: 'bgmi', name: 'BGMI', icon: '🎯' },
    { id: 'valorant', name: 'Valorant', icon: '⚔️' },
    { id: 'minecraft', name: 'Minecraft', icon: '⛏️' }
  ]

  const tabs: { id: TabType; label: string }[] = [
    { id: 'live', label: 'Live' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'completed', label: 'Completed' }
  ]

  return (
    <div className="min-h-screen bg-black pb-24 animate-fadeIn bg-cyber-grid bg-fixed overflow-x-hidden">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-teal-500/10 blur-[120px] opacity-50" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-cyan-600/5 blur-[100px] opacity-30" />
      </div>

      <div className="relative z-10 px-5 pt-8 pb-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-950 border border-white/5 flex items-center justify-center shadow-2xl">
              <Trophy className="w-6 h-6 text-teal-400 drop-shadow-[0_0_12px_rgba(20,184,166,0.6)]" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white tracking-tighter italic leading-none">
                TOURNAMENTS<span className="text-teal-500 italic text-5xl">.</span>
              </h1>
              <p className="text-[10px] font-black tracking-[0.3em] text-zinc-500 uppercase">
                Live, upcoming, and completed esports tournaments across all games
              </p>
            </div>
          </div>
        </motion.div>

        {/* Live Tournaments Section */}
        {liveTournaments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-10"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-red-500 animate-pulse" />
                <h2 className="text-2xl font-black text-white italic">LIVE NOW</h2>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-red-500/50 to-transparent" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveTournaments.slice(0, 3).map((tournament, idx) => (
                <TournamentCard key={tournament.id} tournament={tournament} index={idx} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Filter & Discovery Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          {/* Search & Filter Toggle */}
          <div className="flex items-center gap-4 mb-6">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search tournaments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-zinc-900/60 border border-white/5 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-teal-500/30 transition-colors"
              />
            </div>

            {/* History Button */}
            <button
              onClick={() => navigate('/my-tournaments')}
              className="px-5 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all flex items-center gap-2 bg-zinc-900/60 border border-white/5 text-zinc-400 hover:border-teal-500/30 hover:text-teal-400"
            >
              <History className="w-4 h-4" />
              History
            </button>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-5 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all flex items-center gap-2 ${showFilters
                ? 'bg-teal-500 text-black'
                : 'bg-zinc-900/60 border border-white/5 text-zinc-400 hover:border-teal-500/30'
                }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-2xl bg-zinc-900/60 border border-white/5 p-6 mb-6 space-y-6"
              >
                {/* Game Filter */}
                <div>
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 block">
                    Game
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {gameFilters.map((game) => (
                      <button
                        key={game.id}
                        onClick={() => setGameFilter(game.id)}
                        className={`px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${gameFilter === game.id
                          ? 'bg-teal-500 text-black shadow-[0_0_20px_rgba(20,184,166,0.4)]'
                          : 'bg-zinc-800/50 text-zinc-400 border border-white/5 hover:border-white/10'
                          }`}
                      >
                        <span>{game.icon}</span>
                        <span>{game.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mode & Entry Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Mode Filter */}
                  <div>
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 block">
                      Mode
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['all', 'solo', 'duo', 'squad'].map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setModeFilter(mode as ModeFilter)}
                          className={`px-4 py-2 rounded-xl font-bold text-sm uppercase transition-all ${modeFilter === mode
                            ? 'bg-teal-500 text-black'
                            : 'bg-zinc-800/50 text-zinc-400 border border-white/5'
                            }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Entry Type Filter */}
                  <div>
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 block">
                      Entry Type
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['all', 'free', 'paid'].map((entry) => (
                        <button
                          key={entry}
                          onClick={() => setEntryFilter(entry as EntryFilter)}
                          className={`px-4 py-2 rounded-xl font-bold text-sm uppercase transition-all ${entryFilter === entry
                            ? 'bg-teal-500 text-black'
                            : 'bg-zinc-800/50 text-zinc-400 border border-white/5'
                            }`}
                        >
                          {entry}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sort By */}
                <div>
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 block">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="w-full md:w-auto px-4 py-2 bg-zinc-800/50 border border-white/5 rounded-xl text-white focus:outline-none focus:border-teal-500/30"
                  >
                    <option value="startDate">Start Time</option>
                    <option value="prizePool">Prize Pool (High to Low)</option>
                    <option value="entryFee">Entry Fee (Low to High)</option>
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Status Tabs */}
          <div className="flex justify-center gap-8 border-b border-zinc-800/50 max-w-md mx-auto mb-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative pb-3 font-black text-[11px] uppercase tracking-[0.2em] transition-all ${activeTab === tab.id
                  ? 'text-teal-400 drop-shadow-[0_0_8px_rgba(20,184,166,0.4)]'
                  : 'text-zinc-500 hover:text-zinc-300'
                  }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500 rounded-full shadow-[0_0_10px_rgba(20,184,166,0.8)]"
                  />
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tournament List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mb-4" />
              <p className="text-zinc-500 font-bold text-sm">Loading tournaments...</p>
            </div>
          ) : filteredTournaments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTournaments.map((tournament, idx) => (
                <TournamentCard key={tournament.id} tournament={tournament} index={idx} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-10 h-10 text-zinc-700" />
              </div>
              <h3 className="text-zinc-400 font-bold mb-2">No tournaments found</h3>
              <p className="text-zinc-600 text-sm">Try adjusting your filters or check back later</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default TournamentGrid
