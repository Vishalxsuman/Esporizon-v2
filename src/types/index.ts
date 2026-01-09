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
  avatarUrl?: string
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
  balance: number // INR balance
  espoCoins: number // Espo Coin balance (2.5 EC = ₹1)
  transactions: Transaction[]
}

export interface Transaction {
  id: string
  type: 'add' | 'deduct' | 'withdraw' | 'match_entry' | 'match_win' | 'ad_reward' | 'platform_fee'
  amount: number
  currency: 'INR' | 'ESPO_COIN'
  timestamp: string
  description: string
  status: 'pending' | 'completed' | 'failed'
  metadata?: {
    matchId?: string
    adId?: string
    [key: string]: any
  }
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
