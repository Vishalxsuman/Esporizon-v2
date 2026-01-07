import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { Match } from '@/types'

interface RealTimeMatchHubProps {
  tournamentId?: string
  maxMatches?: number
}

const RealTimeMatchHub: React.FC<RealTimeMatchHubProps> = ({ tournamentId, maxMatches = 5 }) => {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let q = query(
      collection(db, 'matches'),
      where('status', 'in', ['scheduled', 'live']),
      orderBy('startTime', 'asc'),
      limit(maxMatches)
    )

    if (tournamentId) {
      q = query(
        collection(db, 'matches'),
        where('tournamentId', '==', tournamentId),
        where('status', 'in', ['scheduled', 'live']),
        orderBy('startTime', 'asc'),
        limit(maxMatches)
      )
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const matchesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          startTime: doc.data().startTime?.toDate() || new Date(),
        })) as Match[]

        setMatches(matchesData)
        setLoading(false)
      },
      (error) => {
        console.error('Error listening to matches:', error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [tournamentId, maxMatches])

  if (loading) {
    return (
      <div className="glass-card">
        <div className="animate-pulse">
          <div className="h-4 bg-white/10 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-white/5 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Live Matches</h2>
        {matches.some((m) => m.status === 'live') && (
          <motion.div
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="flex items-center gap-2 text-neon-green"
          >
            <div className="w-2 h-2 bg-neon-green rounded-full"></div>
            <span className="text-sm font-semibold">LIVE</span>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {matches.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No upcoming matches</p>
          </div>
        ) : (
          <div className="space-y-3">
            {matches.map((match) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-4 rounded-lg border ${
                  match.status === 'live'
                    ? 'bg-neon-green/10 border-neon-green/50'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {match.status === 'live' && (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="w-2 h-2 bg-neon-green rounded-full"
                      />
                    )}
                    <span className="text-sm font-semibold">
                      {match.status === 'live' ? 'LIVE NOW' : 'UPCOMING'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {match.startTime.toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {match.teams.map((team, index) => (
                        <span key={index} className="text-sm font-medium">
                          {team}
                          {index < match.teams.length - 1 && (
                            <span className="mx-2 text-gray-500">vs</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                  {match.result && (
                    <div className="text-sm font-bold text-neon-green">
                      {match.result.winner} - {match.result.score}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default RealTimeMatchHub
