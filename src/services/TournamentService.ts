import { Tournament, CreateTournamentDto, JoinTournamentDto, TournamentParticipant } from '@/types/tournament'

const STATIC_TOURNAMENTS: Tournament[] = [
    {
        id: 'freefire_1',
        gameId: 'freefire',
        title: 'Free Fire Open Championship',
        description: 'Compete with the best in the biggest Free Fire tournament of the season.',
        entryFee: 50,
        prizePool: 10000,
        maxTeams: 100,
        currentTeams: 45,
        status: 'upcoming',
        startDate: new Date(Date.now() + 86400000).toISOString() as any,
        registrationDeadline: new Date(Date.now() + 43200000).toISOString() as any,
        format: 'SQUAD',
        mapMode: 'Bermuda',
        prizeDistribution: { first: 50, second: 30, third: 20 },
        organizerId: 'system',
        organizerName: 'ESPO Admin'
    },
    {
        id: 'bgmi_1',
        gameId: 'bgmi',
        title: 'BGMI Pro League',
        description: 'The ultimate battle royale for pro players.',
        entryFee: 100,
        prizePool: 50000,
        maxTeams: 64,
        currentTeams: 60,
        status: 'upcoming',
        startDate: new Date(Date.now() + 172800000).toISOString() as any,
        registrationDeadline: new Date(Date.now() + 86400000).toISOString() as any,
        format: 'SQUAD',
        mapMode: 'Erangel',
        prizeDistribution: { first: 60, second: 25, third: 15 },
        organizerId: 'system',
        organizerName: 'ESPO Admin'
    }
]

export const tournamentService = {
    async getTournaments(gameId?: string, status?: string): Promise<Tournament[]> {
        let tournaments = [...STATIC_TOURNAMENTS]
        if (gameId) {
            tournaments = tournaments.filter(t => t.gameId === gameId)
        }
        if (status) {
            tournaments = tournaments.filter(t => t.status === status)
        }
        return tournaments
    },

    async getTournament(id: string): Promise<Tournament> {
        const tournament = STATIC_TOURNAMENTS.find(t => t.id === id)
        if (!tournament) throw new Error('Tournament not found')
        return tournament
    },

    async createTournament(data: CreateTournamentDto): Promise<{ tournamentId: string }> {
        console.log('Tournament created locally (simulated):', data)
        return { tournamentId: `tour_${Date.now()}` }
    },

    async joinTournament(tournamentId: string, data: JoinTournamentDto): Promise<void> {
        console.log('Joined tournament (simulated):', tournamentId, data)
        // In a real simulation, we'd deduct from WalletService localStorage
        // but for now we just log it as per the "stateless" goal.
    },

    async leaveTournament(_tournamentId: string): Promise<void> {
        throw new Error('Leave functionality is handled via support')
    },

    async getParticipants(tournamentId: string): Promise<TournamentParticipant[]> {
        return [] // Empty for now in static mode
    }
}
