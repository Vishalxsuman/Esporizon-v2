import { motion } from 'framer-motion'
import { Tournament } from '@/types'

const TournamentGrid = () => {
  // Mock data - in production, this would come from Firestore
  const tournaments: Tournament[] = [
    {
      id: '1',
      game: 'BGMI',
      title: 'BGMI Championship 2026',
      entryFee: 100,
      prizePool: 50000,
      startDate: new Date('2026-02-01'),
      endDate: new Date('2026-02-15'),
      participants: 245,
      maxParticipants: 500,
      status: 'upcoming',
      imageUrl: '/bgmi.jpg',
    },
    {
      id: '2',
      game: 'Free Fire',
      title: 'Free Fire Pro League',
      entryFee: 150,
      prizePool: 75000,
      startDate: new Date('2026-02-05'),
      endDate: new Date('2026-02-20'),
      participants: 189,
      maxParticipants: 300,
      status: 'live',
      imageUrl: '/freefire.jpg',
    },
    {
      id: '3',
      game: 'Valorant',
      title: 'Valorant Masters',
      entryFee: 200,
      prizePool: 100000,
      startDate: new Date('2026-02-10'),
      endDate: new Date('2026-02-25'),
      participants: 156,
      maxParticipants: 400,
      status: 'upcoming',
      imageUrl: '/valorant.jpg',
    },
  ]

  const getGameColor = (game: string) => {
    switch (game) {
      case 'BGMI':
        return 'from-yellow-500 to-orange-500'
      case 'Free Fire':
        return 'from-blue-500 to-cyan-500'
      case 'Valorant':
        return 'from-red-500 to-pink-500'
      default:
        return 'from-electric-purple to-neon-green'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-dark py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-2">Tournaments</h1>
          <p className="text-gray-400">Join the most competitive esports tournaments</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tournament, index) => (
            <motion.div
              key={tournament.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card hover:scale-105 transition-transform duration-300 cursor-pointer group"
            >
              {/* Game Badge */}
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-4 bg-gradient-to-r ${getGameColor(tournament.game)}`}>
                {tournament.game}
              </div>

              {/* Tournament Image Placeholder */}
              <div className={`w-full h-48 rounded-lg mb-4 bg-gradient-to-br ${getGameColor(tournament.game)} opacity-80 flex items-center justify-center text-6xl`}>
                {tournament.game === 'BGMI' ? '🎮' : tournament.game === 'Free Fire' ? '🔥' : '⚔️'}
              </div>

              <h2 className="text-xl font-bold mb-2">{tournament.title}</h2>

              {/* Prize Pool */}
              <div className="mb-4">
                <p className="text-sm text-gray-400">Prize Pool</p>
                <p className="text-2xl font-bold gradient-text">₹{tournament.prizePool.toLocaleString('en-IN')}</p>
              </div>

              {/* Entry Fee */}
              <div className="mb-4 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-400">Entry Fee</p>
                  <p className="text-lg font-semibold">₹{tournament.entryFee}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  tournament.status === 'live' ? 'bg-neon-green/20 text-neon-green' : 'bg-electric-purple/20 text-electric-purple'
                }`}>
                  {tournament.status.toUpperCase()}
                </div>
              </div>

              {/* Participants */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Participants</span>
                  <span className="font-semibold">{tournament.participants}/{tournament.maxParticipants}</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2">
                  <div
                    className="bg-gradient-cyber h-2 rounded-full transition-all"
                    style={{ width: `${(tournament.participants / tournament.maxParticipants) * 100}%` }}
                  />
                </div>
              </div>

              {/* Join Button */}
              <button className="w-full py-3 bg-gradient-cyber rounded-lg font-semibold hover:scale-105 transition-transform neon-glow">
                {tournament.status === 'live' ? 'Join Now' : 'Register'}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TournamentGrid
