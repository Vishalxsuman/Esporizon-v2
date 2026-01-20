import { Tournament, TournamentParticipant, TournamentResults } from '@/types/tournament'
import { api } from '@/services/api'
import { waitForAuth } from '@/utils/authGuard'

class TournamentService {

    async getTournaments(gameId?: string, filter?: 'live' | 'completed'): Promise<Tournament[]> {
        try {
            await waitForAuth();
            const params: Record<string, string> = {};
            if (gameId) params.game = gameId;
            if (filter) params.status = filter;

            const response = await api.get('/api/tournaments', { params });
            const rawData = response?.data?.data || [];

            // Map Backend Schema to Frontend Interface
            return rawData.map((t: any) => ({
                ...t,
                id: t._id || t.id,
                title: t.name || t.title, // Map name -> title
                currentTeams: t.registeredPlayers?.length || 0, // Map array length -> number
                maxTeams: t.maxSlots || t.maxTeams || 100, // Map maxSlots -> maxTeams
                gameName: t.game?.toUpperCase() || 'UNKNOWN',
                entryFee: t.entryFee || 0,
                prizePool: t.prizePool || 0,
                status: t.status || 'upcoming'
            }));
        } catch (error) {
            if (import.meta.env.MODE !== 'production') {
                if (import.meta.env.MODE !== 'production') {

                    console.error('Error fetching tournaments list', error);

                }
            }

            return [];
        }
    }

    async getTournament(id: string): Promise<Tournament | null> {
        try {
            const response = await api.get(`/api/tournaments/${id}`);
            const t = response?.data?.data || response?.data; // Handle { success: true, data: { ... } } vs { ... }

            if (!t) return null;

            return {
                ...t,
                id: t._id || t.id,
                title: t.name || t.title,
                currentTeams: t.registeredPlayers?.length || 0,
                maxTeams: t.maxSlots || t.maxTeams || 100,
                gameName: t.game?.toUpperCase() || 'UNKNOWN',
                entryFee: t.entryFee || 0,
                prizePool: t.prizePool || 0,
                startDate: t.startTime || t.startDate, // Map startTime
                status: t.status || 'upcoming',
                organizerName: t.hostName || t.organizerName || 'Host', // Map hostName
                organizerId: t.hostId || t.createdBy, // Map hostId
            };
        } catch (error: any) {
            if (import.meta.env.MODE !== 'production') {
                if (import.meta.env.MODE !== 'production') {

                    console.error(`Error fetching tournament ${id}`, error);

                }
            }

            return null;
        }
    }

    async getTournamentResults(tournamentId: string): Promise<TournamentResults | null> {
        try {
            const response = await api.get(`/api/tournaments/${tournamentId}/results`);
            return response?.data ?? null;
        } catch (error) {
            return null;
        }
    }

    async getParticipants(tournamentId: string): Promise<TournamentParticipant[]> {
        try {
            const response = await api.get(`/api/tournaments/${tournamentId}/participants`);
            // CRITICAL FIX: Backend returns { success: true, data: [...] }
            return response?.data?.data || [];
        } catch (error) {
            if (import.meta.env.MODE !== 'production') {

                console.error(`Error fetching participants for ${tournamentId}:`, error);

            }
            return [];
        }
    }

    async getRoomDetails(tournamentId: string): Promise<any> {
        try {
            const response = await api.get(`/api/tournaments/${tournamentId}/room-details`);
            return response?.data ?? null;
        } catch (error) {
            if (import.meta.env.MODE !== 'production') {

                console.error(`Error fetching room details for ${tournamentId}:`, error);

            }
            return null;
        }
    }

    async joinTournament(tournamentId: string, data: { teamName: string; players: any[] }): Promise<any> {
        try {
            await waitForAuth();
            const response = await api.post(`/api/tournaments/${tournamentId}/register`, {
                teamName: data.teamName,
                players: data.players
            });
            if (import.meta.env.MODE !== 'production') {
                if (import.meta.env.MODE !== 'production') {

                    console.log('Successfully joined tournament:', response?.data);

                }
            }

            return response?.data;
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to join tournament';
            throw new Error(message);
        }
    }

    async leaveTournament(tournamentId: string): Promise<void> {
        try {
            await waitForAuth();
            await api.delete(`/api/tournaments/${tournamentId}/register`);
            if (import.meta.env.MODE !== 'production') {

                console.log('Successfully left tournament');

            }
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to leave tournament';
            throw new Error(message);
        }
    }

    async createTournament(tournamentData: any): Promise<any> {
        try {
            await waitForAuth();

            // STRICT LAYER: Enforce backend contract
            const payload = {
                ...tournamentData,
                status: 'upcoming', // Default to upcoming to allow joining
            };

            const response = await api.post('/api/tournaments', payload);
            return response?.data;
        } catch (error: any) {
            if (import.meta.env.MODE !== 'production') {

                console.error('Create tournament failed:', error);

            }
            // Log full validation error for debugging
            if (error.response?.data?.message) {
                if (import.meta.env.MODE !== 'production') {

                    console.error('Validation Error:', error.response.data);

                }
            }
            const message = error.response?.data?.message || 'Failed to create tournament';
            throw new Error(message);
        }
    }

    async updateTournamentStatus(tournamentId: string, status: string): Promise<void> {
        try {
            await api.patch(`/api/tournaments/${tournamentId}/status`, { status });
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to update status';
            throw new Error(message);
        }
    }

    async deleteTournament(tournamentId: string): Promise<void> {
        try {
            await api.delete(`/api/tournaments/${tournamentId}`);
        } catch (error: any) {
            if (import.meta.env.MODE !== 'production') {

                console.error('Error deleting tournament:', error);

            }
            const message = error.response?.data?.message || 'Failed to delete tournament';
            throw new Error(message);
        }
    }

    async getOrganizerTournaments(organizerId: string): Promise<Tournament[]> {
        try {
            await waitForAuth();
            const response = await api.get('/api/tournaments', { params: { organizerId } });
            // Extract data array and map to frontend interface
            const rawData = response?.data?.data || [];
            return rawData.map((t: any) => ({
                ...t,
                id: t._id || t.id,
                title: t.name || t.title,
                currentTeams: t.registeredPlayers?.length || 0,
                maxTeams: t.maxSlots || t.maxTeams || 100,
                gameName: t.game?.toUpperCase() || 'UNKNOWN',
                entryFee: t.entryFee || 0,
                prizePool: t.prizePool || 0,
                status: t.status || 'upcoming'
            }));
        } catch (error) {
            if (import.meta.env.MODE !== 'production') {

                console.error('Error fetching organizer tournaments:', error);

            }
            return [];
        }
    }

    async getChatMessages(tournamentId: string): Promise<any[] | null> {
        try {
            const response = await api.get(`/api/tournaments/${tournamentId}/chat`);
            return response?.data?.data || [];
        } catch (error) {
            if (import.meta.env.MODE !== 'production') {

                console.error('Error fetching chat messages:', error);

            }
            return null;
        }
    }

    async sendChatMessage(tournamentId: string, message: string): Promise<void> {
        try {
            await api.post(`/api/tournaments/${tournamentId}/chat`, { message });
        } catch (error) {
            if (import.meta.env.MODE !== 'production') {

                console.error('Error sending message:', error);

            }
            throw error;
        }
    }

    async pinMessage(tournamentId: string, messageId: string): Promise<void> {
        try {
            await api.patch(`/api/tournaments/${tournamentId}/chat/${messageId}/pin`);
        } catch (error) {
            if (import.meta.env.MODE !== 'production') {

                console.error('Error pinning message:', error);

            }
            throw error;
        }
    }

    async updateRoomDetails(tournamentId: string, details: any): Promise<void> {
        try {
            await api.post(`/api/tournaments/${tournamentId}/room-details`, details);
        } catch (error) {
            if (import.meta.env.MODE !== 'production') {

                console.error('Error updating room details:', error);

            }
            throw error;
        }
    }

    async getJoinStatus(tournamentId: string): Promise<{ joined: boolean, participant?: any }> {
        try {
            await waitForAuth(); // Ensure token present
            const response = await api.get(`/api/tournaments/${tournamentId}/join-status`);
            return response?.data || { joined: false };
        } catch (error) {
            if (import.meta.env.MODE !== 'production') {

                console.error('Error checking join status:', error);

            }
            return { joined: false };
        }
    }

    async getMyTournamentHistory(userId: string): Promise<{ joined: any[], hosted: any[] }> {
        try {
            await waitForAuth();
            const response = await api.get(`/api/tournaments/user/${userId}/history`);
            const data = response?.data?.data || { joined: [], hosted: [] };

            const mapT = (t: any) => ({
                ...t,
                id: t._id || t.id,
                title: t.name || t.title,
                currentTeams: t.registeredPlayers?.length || 0,
                maxTeams: t.maxSlots || t.maxTeams || 100,
                gameName: (t.gameName || t.game || 'UNKNOWN').toUpperCase(),
                entryFee: t.entryFee || 0,
                prizePool: t.prizePool || 0,
                status: t.status || 'upcoming'
            });

            return {
                joined: (data.joined || []).map(mapT),
                hosted: (data.hosted || []).map(mapT)
            };
        } catch (error) {
            if (import.meta.env.MODE !== 'production') {

                console.error('Error fetching history:', error);

            }
            return { joined: [], hosted: [] };
        }
    }

    async publishResults(tournamentId: string, results: any[]): Promise<void> {
        try {
            await api.post(`/api/tournaments/${tournamentId}/results`, { results });
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to publish results';
            throw new Error(message);
        }
    }

    async updateLiveStream(tournamentId: string, data: { isLive: boolean, youtubeUrl?: string }): Promise<void> {
        try {
            await api.patch(`/api/tournaments/${tournamentId}/live-stream`, data);
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to update live stream';
            throw new Error(message);
        }
    }
}

export const tournamentService = new TournamentService()
