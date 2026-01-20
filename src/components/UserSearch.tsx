import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, User as UserIcon, Trophy, X, ChevronRight } from 'lucide-react'
import { userService } from '@/services/UserService'
import { UserProfile } from '@/types'
import { useNavigate } from 'react-router-dom'

const UserSearch = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [results, setResults] = useState<(UserProfile & { uid: string })[]>([])
    const [searching, setSearching] = useState(false)
    const [showResults, setShowResults] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        const delayDebounce = setTimeout(async () => {
            if (searchTerm.trim()) {
                setSearching(true)
                try {
                    const users = await userService.searchUsers(searchTerm)
                    setResults(users)
                    setShowResults(true)
                } catch (error) {
                    if (import.meta.env.MODE !== 'production') {

                        console.error('Search error:', error);

                    }
                } finally {
                    setSearching(false)
                }
            } else {
                setResults([])
                setShowResults(false)
            }
        }, 500)

        return () => clearTimeout(delayDebounce)
    }, [searchTerm])

    return (
        <div className="relative w-full max-w-md mx-auto z-50">
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#00ffc2] transition-colors" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search users..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-medium focus:outline-none focus:border-[var(--accent)]/50 focus:bg-white/10 transition-all placeholder-[var(--text-secondary)]/30"
                />
                {searchTerm && (
                    <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-all"
                    >
                        <X className="w-3 h-3 text-[var(--text-secondary)]" />
                    </button>
                )}
            </div>

            <AnimatePresence>
                {showResults && (results.length > 0 || searching) && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full mt-2 w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl z-50"
                    >
                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-2">
                            {searching ? (
                                <div className="p-8 text-center">
                                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-[var(--accent)]"></div>
                                    <p className="mt-2 text-xs text-[var(--text-secondary)] uppercase font-black tracking-widest">Searching...</p>
                                </div>
                            ) : results.length > 0 ? (
                                results.map((result) => (
                                    <motion.div
                                        key={result.uid}
                                        whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
                                        onClick={() => navigate(`/profile/${result.uid}`)}
                                        className="flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00ffc2] to-[#7c3aed] p-[1px]">
                                                <div className="w-full h-full rounded-full bg-[#18181b] flex items-center justify-center overflow-hidden">
                                                    <UserIcon className="w-5 h-5 text-gray-400" />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-white group-hover:text-[#00ffc2] transition-colors line-clamp-1">
                                                    @{result.username || 'unknown'}
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <div className="flex items-center gap-1 text-[10px] text-gray-500 font-black uppercase tracking-tighter">
                                                        <Trophy className="w-2.5 h-2.5 text-yellow-500" />
                                                        {result.tournamentsWon} Wins
                                                    </div>
                                                    <div className="w-1 h-1 rounded-full bg-white/10" />
                                                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                                        ₹{result.totalEarnings.toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                                    </motion.div>
                                ))
                            ) : (
                                <div className="p-8 text-center">
                                    <p className="text-sm text-gray-500 font-medium">No agents found with that username.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default UserSearch
