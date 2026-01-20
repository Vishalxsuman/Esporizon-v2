import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, SlidersHorizontal, Search, History, Gamepad2, Users, LayoutGrid, IndianRupee, ChevronRight } from 'lucide-react'
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
      if (import.meta.env.MODE !== 'production') {

          console.error('Error fetching tournaments:', error);

      }
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
      filtered = filtered.filter((t) => t.status === 'live')
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

  const tabs: { id: TabType; label: string }[] = [
    { id: 'live', label: 'Live' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'completed', label: 'Completed' }
  ]

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white pb-32 overflow-x-hidden font-sans">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none transition-opacity duration-1000">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-teal-500/5 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-600/5 blur-[100px]" />
      </div>

      {/* Premium Sticky Header */}
      <div className="sticky top-0 z-50 bg-[#0a0e1a]/80 backdrop-blur-xl border-b border-white/5 p-4 flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="p-2 hover:bg-white/5 rounded-xl transition-all group"
        >
          <ChevronRight className="rotate-180 text-zinc-500 group-hover:text-white" size={24} />
        </button>
        <h1 className="text-sm font-black uppercase tracking-[0.3em] italic flex items-center gap-2">
          <Trophy size={18} className="text-teal-400 drop-shadow-[0_0_8px_rgba(20,184,166,0.5)]" />
          Combat Arena
        </h1>
        <button
          onClick={() => navigate('/my-tournaments')}
          className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-teal-500/20 transition-all border border-white/5"
        >
          <History size={18} className="text-zinc-400" />
        </button>
      </div>

      <div className="relative z-10 px-4 pt-10 max-w-7xl mx-auto space-y-10">
        {/* Search & Hero Display */}
        <div className="space-y-4">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 block text-center">Deployment Directory</span>
          <div className="relative group max-w-2xl mx-auto">
            <div className="absolute inset-0 bg-teal-500/5 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-teal-400 transition-colors" />
            <input
              type="text"
              placeholder="Search Combat Operations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-5 bg-[#0E1424]/40 backdrop-blur-md border border-white/5 rounded-[2rem] text-white placeholder-zinc-700 focus:outline-none focus:border-teal-500/30 transition-all font-bold text-sm tracking-wide"
            />
          </div>
        </div>

        {/* Global Controls Row */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <div className="flex p-1.5 bg-[#0E1424]/60 backdrop-blur-md border border-white/5 rounded-2xl gap-2 shadow-xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all relative ${activeTab === tab.id
                  ? 'text-black'
                  : 'text-zinc-500 hover:text-white'
                  }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="tabBackground"
                    className="absolute inset-0 bg-teal-500 rounded-xl shadow-[0_5px_15px_rgba(20,184,166,0.3)]"
                    transition={{ type: 'spring', bounce: 0.1, duration: 0.5 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 border ${showFilters
              ? 'bg-teal-500 text-black border-teal-400 shadow-[0_0_20px_rgba(20,184,166,0.2)]'
              : 'bg-[#0E1424]/40 border-white/5 text-zinc-400 hover:border-teal-400/30 hover:text-white'
              }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Strategic Filters
          </button>
        </div>

        {/* Filter Panel (Premium Glass) */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              className="p-8 rounded-[2.5rem] bg-[#0E1424]/40 backdrop-blur-2xl border border-white/5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 shadow-3xl"
            >
              <div className="space-y-5">
                <p className="text-[9px] font-black text-teal-400 uppercase tracking-[0.3em] flex items-center gap-2">
                  <Gamepad2 className="w-3 h-3" /> Select Area
                </p>
                <div className="flex flex-wrap gap-2">
                  {['all', 'freefire', 'bgmi', 'valorant', 'minecraft'].map((game) => (
                    <button
                      key={game}
                      onClick={() => setGameFilter(game as GameFilter)}
                      className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border ${gameFilter === game
                        ? 'bg-teal-500 border-teal-400 text-black'
                        : 'bg-white/5 border-transparent text-zinc-500 hover:text-white hover:bg-white/10'
                        }`}
                    >
                      {game}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-5">
                <p className="text-[9px] font-black text-teal-400 uppercase tracking-[0.3em] flex items-center gap-2">
                  <Users className="w-3 h-3" /> Squadron Size
                </p>
                <div className="flex flex-wrap gap-2">
                  {['all', 'solo', 'duo', 'squad'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setModeFilter(mode as ModeFilter)}
                      className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border ${modeFilter === mode
                        ? 'bg-teal-500 border-teal-400 text-black'
                        : 'bg-white/5 border-transparent text-zinc-500 hover:text-white hover:bg-white/10'
                        }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-5">
                <p className="text-[9px] font-black text-teal-400 uppercase tracking-[0.3em] flex items-center gap-2">
                  <IndianRupee className="w-3 h-3" /> Entry Logic
                </p>
                <div className="flex flex-wrap gap-2">
                  {['all', 'free', 'paid'].map((entry) => (
                    <button
                      key={entry}
                      onClick={() => setEntryFilter(entry as EntryFilter)}
                      className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border ${entryFilter === entry
                        ? 'bg-teal-500 border-teal-400 text-black'
                        : 'bg-white/5 border-transparent text-zinc-500 hover:text-white hover:bg-white/10'
                        }`}
                    >
                      {entry}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-5">
                <p className="text-[9px] font-black text-teal-400 uppercase tracking-[0.3em] flex items-center gap-2">
                  <LayoutGrid className="w-3 h-3" /> Array Protocol
                </p>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white focus:outline-none focus:border-teal-500/30 transition-all appearance-none cursor-pointer"
                >
                  <option className="bg-zinc-900" value="startDate">Deployment Priority</option>
                  <option className="bg-zinc-900" value="prizePool">Bounty: High to Low</option>
                  <option className="bg-zinc-900" value="entryFee">Access: Low to High</option>
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Grid (Optimized for Mobile Card Style) */}
        <motion.div
          layout
          className="min-h-[500px]"
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-6">
              <div className="relative">
                <div className="w-20 h-20 border-2 border-teal-500/10 rounded-full" />
                <div className="absolute inset-0 w-20 h-20 border-t-2 border-teal-500 rounded-full animate-spin" />
                <div className="absolute inset-4 rounded-full bg-teal-500/20 blur-xl animate-pulse" />
              </div>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.6em]">Syncing Battlestations...</p>
            </div>
          ) : filteredTournaments.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
              <AnimatePresence mode="popLayout">
                {filteredTournaments.map((tournament, idx) => (
                  <TournamentCard
                    key={tournament.id}
                    tournament={tournament}
                    index={idx}
                    compact={true}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-48 text-center"
            >
              <div className="relative mb-8">
                <div className="w-32 h-32 rounded-full bg-white/5 border border-dashed border-white/10 flex items-center justify-center">
                  <Trophy className="w-12 h-12 text-zinc-900" />
                </div>
                <div className="absolute inset-0 bg-red-500/5 blur-3xl rounded-full" />
              </div>
              <h3 className="text-2xl font-black text-white italic mb-3 tracking-tighter uppercase">No Operations Active</h3>
              <p className="text-zinc-600 text-[11px] font-black uppercase tracking-[0.2em] max-w-sm mx-auto leading-relaxed">
                The restricted sector currently has no deployments matching your parameters.
              </p>
              <button
                onClick={() => {
                  setGameFilter('all');
                  setSearchQuery('');
                  setModeFilter('all');
                  setEntryFilter('all');
                }}
                className="mt-10 px-8 py-4 bg-teal-500/10 border border-teal-500/20 text-teal-400 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-teal-500 hover:text-black transition-all shadow-xl active:scale-95"
              >
                Reset Strategic Grid
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default TournamentGrid
