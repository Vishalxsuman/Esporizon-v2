export interface User {
  id: string
  uid?: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  isHost?: boolean
}

export interface UserProfile {
  tournamentsPlayed: number
  tournamentsWon: number
  totalEarnings: number
  referralCode: string
  referralEarnings: number
  username?: string
  displayName?: string
  bio?: string
  location?: string
  themeColor?: string
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
  // War Room fields
  trustLevel?: 0 | 1 | 2 | 3
  badges?: Array<{
    type: string
    earnedAt: string
  }>
  warRoomStats?: {
    postsCreated: number
    successfulRecruitments: number
    reportCount: number
  }
  // Dossier fields
  clanTag?: string
  clanLogo?: string
  signatureGame?: {
    gameId: string
    gameName: string
    inGameId: string
    rank: string
    winRate: number
    tournamentsPlayed: number
    lastUpdated: string
  }
  lfgStatus?: {
    mode: 'available_scrims' | 'looking_duo' | 'tournament_ready' | 'not_available'
    expiresAt?: string
    autoExpireHours?: number
    setAt: string
  }
  skillMetrics?: {
    aggression: number
    survival: number
    teamImpact: number
    consistency: number
    clutchFactor: number
    lastCalculated: string
  }
  bannerUrl?: string
  country?: string
  languages?: string[]
  socialLinks?: {
    youtube?: string
    twitch?: string
    discord?: string
    instagram?: string
    twitter?: string
  }
  isVerifiedHost?: boolean
  hostMetrics?: {
    hostingRating: number
    totalPrizeDistributed: number
    tournamentsCompleted: number
    activeTournaments: number
    upcomingTournaments: number
  }
  playerStats?: {
    gameStats?: {
      bgmi?: {
        currentRank: string
        winRate: number
        matchesPlayed: number
        matchesWon: number
        kills: number
        rankScore: number
      }
      freefire?: {
        currentRank: string
        winRate: number
        matchesPlayed: number
        matchesWon: number
        kills: number
        rankScore: number
      }
      valorant?: {
        currentRank: string
        winRate: number
        matchesPlayed: number
        matchesWon: number
        kills: number
        rankScore: number
      }
      minecraft?: {
        currentRank: string
        winRate: number
        matchesPlayed: number
        matchesWon: number
        kills: number
        rankScore: number
      }
    }
    recentTournaments?: Array<{
      tournamentId: string
      game: string
      rank: number
      isWinner: boolean
      rankScoreChange: number
      date: string
    }>
    totalEarnings?: number
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


