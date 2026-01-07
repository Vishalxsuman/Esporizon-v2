export interface User {
  id: string
  uid?: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}

export interface UserProfile {
  tournamentsPlayed: number
  tournamentsWon: number
  totalEarnings: number
  referralCode: string
  referralEarnings: number
  username?: string
  bio?: string
  gameAccounts: {
    bgmi?: string
    freefire?: string
    valorant?: string
    minecraft?: string
  }
  settings: {
    tournamentReminders: boolean
    matchResults: boolean
    newTournaments: boolean
    teamInvites: boolean
  }
}

export interface Wallet {
  balance: number
  transactions: Transaction[]
}

export interface Transaction {
  id: string
  type: 'add' | 'deduct' | 'withdraw'
  amount: number
  timestamp: string
  description: string
  status: 'pending' | 'completed' | 'failed'
}

export interface Tournament {
  id: string
  gameId: string
  title: string
  entryFee: number
  prizePool: number
  startDate: string
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  imageUrl?: string
}

export interface Match {
  id: string
  tournamentId: string
  teams: string[]
  startTime: string
  status: 'scheduled' | 'live' | 'completed'
  result?: {
    winner: string
    score: string
  }
}

export interface Prediction {
  id: string
  userId: string
  matchId: string
  predictedTeam: string
  amount: number
  status: 'pending' | 'won' | 'lost'
  createdAt: string
}

export interface ColorPredictionResult {
  id: string
  color: 'red' | 'green' | 'violet'
  multiplier: number
  timestamp: string
}
