import { auth } from '../config/firebaseConfig';
import { Tournament, TournamentParticipant, TournamentResults } from '@/types/tournament'
import { API_URL } from '@/config/api';

class TournamentService {
    private mockResults: Map<string, TournamentResults> = new Map()

    constructor() {
        this.initializeMockResults()
    }

    private initializeMockResults() {
        // Sample results for different tournaments
        this.mockResults.set('ff-007', {
            tournamentId: 'ff-007',
            leaderboard: [
                { rank: 1, teamName: 'Team Alpha', playerName: 'ProGamer123', kills: 52, points: 320, prize: 5500 },
                { rank: 2, teamName: 'Elite Squad', playerName: 'eSportsKing', kills: 48, points: 295, prize: 3000 },
                { rank: 3, teamName: 'Thunder Gaming', playerName: 'LightningBolt', kills: 45, points: 280, prize: 1500 },
                { rank: 4, teamName: 'Legends', playerName: 'MythicPlayer', kills: 42, points: 265, prize: 0 },
                { rank: 5, teamName: 'Warriors', playerName: 'BattleKing', kills: 39, points: 250, prize: 0 }
            ],
            mvp: 'ProGamer123',
            totalRounds: 4,
            completedAt: '2026-01-12T20:30:00+05:30',
            proofUrls: []
        })
    }

    async getTournaments(gameId?: string, filter: 'upcoming' | 'live' | 'completed' = 'upcoming'): Promise<Tournament[]> {
        await new Promise((resolve) => setTimeout(resolve, 300))
        return this.getMockTournaments(gameId, filter)
    }

    private getMockTournaments(gameId?: string, filter?: string): Tournament[] {
        const now = new Date()

        // detailed mock data
        // Free Fire Tournaments
        const mockTournaments: Tournament[] = [{
            id: 'ff-001',
            gameId: 'freefire',
            gameName: 'Free Fire',
            title: 'Weekend Solo Showdown',
            description: 'Show your individual skill in this high-stakes solo tournament.',
            organizerId: '1',
            organizerName: 'EspoHost',
            startDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            registrationDeadline: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
            maxTeams: 50,
            teamSize: 1,
            currentTeams: 32,
            entryFee: 50,
            prizePool: 5000,
            prizeDistribution: { first: 2500, second: 1500, third: 1000 },
            status: 'upcoming',
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
            format: 'solo',
            mapMode: 'Bermuda',
            totalMatches: 3
        },
        {
            id: 'ff-002',
            gameId: 'freefire',
            gameName: 'Free Fire',
            title: 'Duo Rush Hour',
            description: 'Grab your partner and dominate the duo lobby.',
            organizerId: '1',
            organizerName: 'EspoHost',
            startDate: new Date(now.getTime() + 5 * 60 * 60 * 1000).toISOString(),
            registrationDeadline: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(),
            maxTeams: 25,
            teamSize: 2,
            currentTeams: 20,
            entryFee: 100,
            prizePool: 8000,
            prizeDistribution: { first: 4000, second: 2500, third: 1500 },
            status: 'upcoming',
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
            format: 'duo',
            mapMode: 'Purgatory',
            totalMatches: 3
        },
        {
            id: 'ff-003',
            gameId: 'freefire',
            gameName: 'Free Fire',
            title: 'Squad Pro League',
            description: 'The ultimate squad battle for professional teams.',
            organizerId: '1',
            organizerName: 'EspoHost',
            startDate: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(), // Started 1 hour ago
            registrationDeadline: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
            maxTeams: 12,
            teamSize: 4,
            currentTeams: 12,
            entryFee: 500,
            prizePool: 50000,
            prizeDistribution: { first: 25000, second: 15000, third: 10000 },
            status: 'live',
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
            format: 'squad',
            mapMode: 'Kalahari',
            totalMatches: 5
        },
        {
            id: 'ff-007',
            gameId: 'freefire',
            gameName: 'Free Fire',
            title: 'Champions League Final',
            description: 'Elite championship final tournament',
            organizerId: '1',
            organizerName: 'EspoHost Pro',
            startDate: '2026-01-12T18:00:00+05:30',
            registrationDeadline: '2026-01-12T12:00:00+05:30',
            maxTeams: 100,
            teamSize: 4,
            currentTeams: 100,
            entryFee: 75,
            prizePool: 10000,
            prizeDistribution: { first: 5500, second: 3000, third: 1500 },
            status: 'completed',
            createdAt: '2026-01-10T10:00:00+05:30',
            updatedAt: '2026-01-12T20:30:00+05:30',
            format: 'squad',
            mapMode: 'Bermuda',
            totalMatches: 4
        },

        // BGMI Tournaments
        {
            id: 'bgmi-001',
            gameId: 'bgmi',
            gameName: 'BGMI',
            title: 'BGMI Masters Series',
            description: 'The ultimate battleground requires your skills.',
            organizerId: '2',
            organizerName: 'Krafton Elite',
            startDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            registrationDeadline: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            maxTeams: 50,
            teamSize: 4,
            currentTeams: 45,
            entryFee: 150,
            prizePool: 200000,
            prizeDistribution: { first: 100000, second: 60000, third: 40000 },
            status: 'upcoming',
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
            format: 'squad',
            mapMode: 'Erangel',
            totalMatches: 5
        },
        {
            id: 'bgmi-002',
            gameId: 'bgmi',
            gameName: 'BGMI',
            title: 'Sanhok Scrims',
            description: 'Daily practice scrims for competitive players.',
            organizerId: '2',
            organizerName: 'Krafton Elite',
            startDate: new Date(now.getTime() - 30 * 60 * 1000).toISOString(), // Started 30 mins ago
            registrationDeadline: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
            maxTeams: 20,
            teamSize: 4,
            currentTeams: 18,
            entryFee: 0,
            prizePool: 2000,
            prizeDistribution: { first: 1000, second: 600, third: 400 },
            status: 'live',
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
            format: 'squad',
            mapMode: 'Sanhok',
            totalMatches: 3
        },

        // Valorant Tournaments
        {
            id: 'val-001',
            gameId: 'valorant',
            gameName: 'Valorant',
            title: 'Ascent Showdown',
            description: '5v5 Tactical Shooter Tournament',
            organizerId: '3',
            organizerName: 'Riot Community',
            startDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
            registrationDeadline: new Date(now.getTime() + 12 * 60 * 60 * 1000).toISOString(),
            maxTeams: 32,
            teamSize: 5,
            currentTeams: 12,
            entryFee: 200,
            prizePool: 50000,
            prizeDistribution: { first: 30000, second: 15000, third: 5000 },
            status: 'upcoming',
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
            format: 'squad',
            mapMode: 'Ascent',
            totalMatches: 1
        },

        // Minecraft Tournaments
        {
            id: 'mc-001',
            gameId: 'minecraft',
            gameName: 'Minecraft',
            title: 'Bedwars Championship',
            description: 'Protect your bed at all costs!',
            organizerId: '4',
            organizerName: 'Hypixel Events',
            startDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            registrationDeadline: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(),
            maxTeams: 16,
            teamSize: 4,
            currentTeams: 8,
            entryFee: 0,
            prizePool: 10000,
            prizeDistribution: { first: 7000, second: 2000, third: 1000 },
            status: 'upcoming',
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
            format: 'squad',
            mapMode: 'Hypixel',
            totalMatches: 3
        },
        {
            id: 'mc-002',
            gameId: 'minecraft',
            gameName: 'Minecraft',
            title: 'Skywars Solo',
            description: 'Last player standing wins.',
            organizerId: '4',
            organizerName: 'Hypixel Events',
            startDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            registrationDeadline: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            maxTeams: 100,
            teamSize: 1,
            currentTeams: 88,
            entryFee: 10,
            prizePool: 5000,
            prizeDistribution: { first: 3000, second: 1500, third: 500 },
            status: 'completed',
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
            format: 'solo',
            mapMode: 'Skywars',
            totalMatches: 5
        }]

        let filtered = mockTournaments

        if (gameId) {
            filtered = filtered.filter((t) => t.gameId === gameId)
        }

        if (filter) {
            filtered = filtered.filter((t) => t.status === filter)
        }

        return filtered
    }

    async getTournament(id: string): Promise<Tournament | null> {
        const tournaments = await this.getTournaments()
        return tournaments.find((t) => t.id === id) || null
    }

    async getTournamentResults(tournamentId: string): Promise<TournamentResults | null> {
        await new Promise((resolve) => setTimeout(resolve, 300))
        return this.mockResults.get(tournamentId) || null
    }

    async getParticipants(_tournamentId: string): Promise<TournamentParticipant[]> {
        await new Promise((resolve) => setTimeout(resolve, 200))
        return []
    }

    async joinTournament(tournamentId: string, data: { teamName: string; players: any[] }): Promise<void> {
        try {
            const token = await auth?.currentUser?.getIdToken();

            const response = await fetch(`${API_URL}/api/tournaments/${tournamentId}/register`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    teamName: data.teamName,
                    players: data.players
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to join tournament');
            }

            const result = await response.json();
            console.log('Successfully joined tournament:', result);
        } catch (error) {
            console.warn('Backend unavailable, simulating join tournament');
            // Simulate success
            return;
        }
    }

    async leaveTournament(tournamentId: string): Promise<void> {
        try {
            const token = await auth?.currentUser?.getIdToken();

            const response = await fetch(`${API_URL}/api/tournaments/${tournamentId}/register`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to leave tournament');
            }

            console.log('Successfully left tournament');
        } catch (error) {
            console.warn('Backend unavailable, simulating leave tournament');
            return;
        }
    }

    // Add new methods for host tournament management
    async createTournament(tournamentData: any): Promise<any> {
        try {
            const token = await auth?.currentUser?.getIdToken();

            const response = await fetch(`${API_URL}/api/tournaments`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(tournamentData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create tournament');
            }

            return await response.json();
        } catch (error) {
            console.warn('Backend unavailable, simulating tournament creation');
            return {
                message: 'Tournament Created (Mock)',
                tournament: { ...tournamentData, id: `mock-${Date.now()}` }
            };
        }
    }

    async updateTournamentStatus(tournamentId: string, status: string): Promise<void> {
        try {
            const token = await auth?.currentUser?.getIdToken();

            const response = await fetch(`${API_URL}/api/tournaments/${tournamentId}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update status');
            }
        } catch (error) {
            console.error('Error updating tournament status:', error);
            throw error;
        }
    }

    async deleteTournament(tournamentId: string): Promise<void> {
        try {
            const token = await auth?.currentUser?.getIdToken();

            const response = await fetch(`${API_URL}/api/tournaments/${tournamentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete tournament');
            }
        } catch (error) {
            console.error('Error deleting tournament:', error);
            throw error;
        }
    }
}

export const tournamentService = new TournamentService()
