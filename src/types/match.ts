// Match types supporting both Chess and 29 Card Game
export interface Match {
    id: string
    gameId: 'chess' | 'card29'
    gameName: string
    mode: 'free' | 'paid'
    visibility: 'private' | 'public'

    // Entry & Prize
    entryFee: number // Espo Coins (0 for free play)
    prizePool: number // Calculated from entries
    platformFee: number // Percentage (admin-defined)
    platformFeeAmount: number // Actual amount deducted
    winnerPrize: number // Amount winner receives
    timeControl: number // Seconds per player (e.g. 600 = 10 mins)
    withBots?: boolean // Whether the match includes bots

    // Players
    creatorId: string
    creatorName: string
    creatorAvatar?: string
    players: MatchPlayer[]
    maxPlayers: number // 2 for chess, 4-6 for 29

    // State
    status: 'waiting' | 'locked' | 'in_progress' | 'completed' | 'cancelled' | 'expired'
    winnerId?: string
    winnerName?: string

    // Invite
    inviteCode?: string // For private matches

    // Game State
    gameState?: GameState

    // Timestamps
    createdAt: string
    startsAt?: string
    completedAt?: string
    expiresAt?: string
}

export interface Card {
    suit: 'H' | 'D' | 'C' | 'S'
    rank: '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A'
}

export interface TrickTurn {
    playerId: string
    card: Card
    playerName?: string
    playedAt?: string
}

export interface GameState {
    hands: { [playerId: string]: Card[] }
    currentTrick: TrickTurn[]
    tricks: { [trickIndex: string]: TrickTurn[] } // Changed from TrickTurn[][] to Object to avoid Firestore nested array error
    trumpSuit: string | null
    currentPlayer: number
    passedPlayers?: string[] // Track IDs of players who have passed
    dealerIndex?: number // Index of the dealer, rotates every round
    round: number
    scores: { [playerId: string]: number } // Card points for current round
    gamePoints: { [teamId: string]: number } // Team Game Points (target 6)
    lastMoveTime?: string
    pairShown?: boolean
    lastTrickCards: TrickTurn[] // Last 4 played cards for UI display

    // Bidding
    bids: { [playerId: string]: number } // PlayerId -> Bid Amount
    currentBidder: number // Index of player currently bidding
    highestBid: { playerId: string, amount: number } | null
    bidWinner: string | null // PlayerId of final bid winner
    phase: 'bidding' | 'playing' | 'completed'

    // Server Timer
    turnStartedAt: any | null // Firestore Timestamp or ISO string fallback
    turnDuration: number // Duration in seconds (usually 30)

    // Enhanced Features
    singleHandMode?: boolean // Single Hand mode: 1 trick only, no trump/rank
    secondDealComplete?: boolean // Track if second 4-card deal has happened
    remainingDeck?: Card[] // Cards not yet dealt (for second deal)

    // Double / Redouble ("Bain")
    isDoubled?: boolean // "Double" challenged by opponents
    isRedoubled?: boolean // "Redouble" challenged back by bid winner
    bainPhase?: 'none' | 'double_chance' | 'redouble_chance' // Phase tracking for Bain
    trumpRevealed?: boolean // Whether the trump suit has been revealed
    bidAdjustment?: number // For Pair rule (±4)
    pairDeclaredBy?: string | null // PlayerId who declared a Pair
    roundWinner?: { team: number, points: number, bidWon: boolean, isDraw?: boolean } | null // Round result for popup
    showRoundPopup?: boolean // Show round winner popup
    setWinner?: { team: number } | null // Set victory result
    showSetPopup?: boolean // Show set victory popup
    lastWinnerId?: string | null // For trick fly-to-winner animation
}



export interface MatchPlayer {
    userId: string
    userName: string
    userAvatar?: string
    joinedAt: string
    coinsLocked: number
    role?: 'creator' | 'participant'
    isBot?: boolean
}

export interface MatchResult {
    matchId: string
    winnerId: string
    winnerName: string
    submittedBy: string
    submittedAt: string
    verified: boolean
}

export interface CreateMatchDto {
    gameId: 'chess' | 'card29'
    mode: 'free' | 'paid'
    visibility: 'private' | 'public'
    entryFee: number
    maxPlayers: number
    withBots?: boolean
}

export interface JoinMatchDto {
    matchId: string
    userId: string
    userName: string
    userAvatar?: string
}

// Leaderboard types
export interface Leaderboard {
    id: string
    type: 'overall_champions' | 'free_masters' | 'top_earners'
    period: 'weekly'
    weekStartDate: string
    weekEndDate: string
    entries: LeaderboardEntry[]
    resetAt: string
    createdAt: string
}

export interface LeaderboardEntry {
    userId: string
    userName: string
    userAvatar?: string
    gamesPlayed: number
    gamesWon: number
    totalEarnings: number // Espo Coins
    rank: number
    badge?: 'gold' | 'silver' | 'bronze'
}

// Notification types
export interface Notification {
    id: string
    userId: string
    type: 'match_invite' | 'match_accepted' | 'match_result' | 'tournament_joined' | 'coin_transaction'
    title: string
    message: string
    read: boolean
    delivered: boolean
    actionUrl?: string
    metadata?: {
        matchId?: string
        transactionId?: string
        amount?: number
        [key: string]: any
    }
    createdAt: string
}

// Ad viewing types
export interface AdView {
    id: string
    userId: string
    date: string // YYYY-MM-DD for daily tracking
    views: AdViewRecord[]
    dailyCount: number
    lastViewedAt: string
}

export interface AdViewRecord {
    adProvider: string
    rewardCoins: number
    completedAt: string
}

export interface AdStatus {
    canWatch: boolean
    dailyCount: number
    maxDaily: number
    nextAvailableAt?: string
    cooldownRemaining?: number
}

// Admin configuration
export interface AdminConfig {
    id: string
    platformFeePercent: number // e.g., 10 = 10%
    minEntryAmount: number // Espo Coins
    maxEntryAmount: number // Espo Coins
    enabledGames: Array<'chess' | 'card29'>
    adRewardAmount: number // Espo Coins per ad
    maxDailyAds: number // 10
    adCooldownMinutes: number // 5
    espoCoinToINR: number // 2.5
    updatedAt: string
}

// Abuse detection
export interface AbuseLog {
    id: string
    userId: string
    type: 'collusion' | 'farming' | 'match_fixing' | 'rapid_requests'
    severity: 'low' | 'medium' | 'high'
    details: string
    relatedUserIds?: string[]
    relatedMatchIds?: string[]
    detectedAt: string
    actionTaken?: string
}
