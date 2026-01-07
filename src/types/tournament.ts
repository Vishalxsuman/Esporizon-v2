export interface Tournament {
    id: string
    gameId: 'freefire' | 'bgmi' | 'valorant' | 'minecraft'
    gameName: string
    title: string
    description: string

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

    // Financials
    entryFee: number
    prizePool: number
    prizeDistribution: {
        first: number
        second: number
        third: number
    }

    // Status
    status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'

    // Meta
    createdAt: string
    updatedAt: string

    // Rules & Format
    format: 'solo' | 'duo' | 'squad'
    mapMode: string
    totalMatches: number
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
