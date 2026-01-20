export interface Tournament {
    id: string
    gameId: 'freefire' | 'bgmi' | 'valorant' | 'minecraft' | 'codm'
    gameName: string
    title: string
    description: string
    bannerUrl?: string
    rules?: string[]

    // Organizer
    organizerId: string
    organizerName: string

    // Scheduling
    startDate: string
    registrationDeadline: string

    // Participation
    maxTeams: number
    teamSize: number
    currentTeams: number
    registeredPlayers: string[]

    // Financials
    entryFee: number
    prizePool: number
    prizeDistribution: {
        first: number
        second: number
        third: number
    }

    // Status
    status: 'upcoming' | 'live' | 'completed' | 'cancelled'

    // Meta
    createdAt: string
    updatedAt: string

    // Rules & Format
    format: 'solo' | 'duo' | 'squad'
    mapMode: string
    totalMatches: number
    difficulty?: 'beginner' | 'intermediate' | 'pro'
    perKillAmount?: number // Added for bounty type

    // Room Details
    roomDetails?: {
        roomId: string
        password: string
        server: string
        map: string
    }

    // Live Stream
    youtubeUrl?: string | null
}

export interface TournamentParticipant {
    id: string
    tournamentId: string

    // Team Info
    teamName?: string
    teamLogo?: string

    // Players
    players: {
        userId: string
        userName: string
        role?: 'leader' | 'member'
    }[]

    // Payment
    paymentStatus: 'pending' | 'paid' | 'refunded'
    paidAmount: number
    paidAt?: string

    // Performance
    kills?: number
    placement?: number
    points?: number

    joinedAt: string
}

export interface CreateTournamentDto {
    gameId: string
    gameName: string
    title: string
    description: string
    startDate: Date
    registrationDeadline: Date
    maxTeams: number
    teamSize: number
    entryFee: number
    prizeDistribution: {
        first: number
        second: number
        third: number
    }
    format: 'solo' | 'duo' | 'squad'
    mapMode: string
    totalMatches: number
}

export interface JoinTournamentDto {
    teamName?: string
    players: {
        userId: string
        userName: string
        role?: 'leader' | 'member'
    }[]
}

// Room Details (shared 10 minutes before match)
export interface RoomDetails {
    roomId: string
    password: string
    server: string
    map: string
    specialInstructions?: string
    availableAt: Date
    isAvailable: boolean
}

// Host Profile
export interface HostProfile {
    id: string
    name: string
    avatar?: string
    rating: number
    reviewCount: number
    tournamentsHosted: number
    verified: boolean
    memberSince: string
    stats: HostStats
}

export interface HostStats {
    totalTournaments: number
    activeTournaments: number
    completedTournaments: number
    totalParticipants: number
    averageRating: number
    successRate: number
    responseTime: string
    cancellationRate: number
}

// Tournament Results
export interface TournamentResults {
    tournamentId: string
    leaderboard: ResultEntry[]
    mvp?: string
    totalRounds: number
    completedAt: string
    proofUrls?: string[]
}

export interface ResultEntry {
    rank: number
    teamName: string
    playerName: string
    kills?: number
    points: number
    prize: number
}

// Advanced Filtering
export interface TournamentFilters {
    gameId?: string[]
    status?: ('upcoming' | 'live' | 'completed')[]
    mode?: ('solo' | 'duo' | 'squad')[]
    entryType?: 'free' | 'paid' | 'all'
    minPrize?: number
    maxEntryFee?: number
    sortBy?: 'startDate' | 'prizePool' | 'entryFee'
    sortOrder?: 'asc' | 'desc'
}
