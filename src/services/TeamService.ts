import { api } from '@/services/api';

export interface Team {
    _id: string;
    name: string;
    game: string;
    type: 'SOLO' | 'DUO' | 'SQUAD';
    players: { ign: string }[];
    ownerId: string;
}

class TeamService {
    /**
     * Create a new team
     */
    async createTeam(userId: string, data: { name: string, game: string, type: string, players: { ign: string }[] }) {
        try {
            const response = await api.post('/api/teams', { userId, ...data });
            return response.data;
        } catch (error: any) {
            if (import.meta.env.MODE !== 'production') {

                console.error('Create team error:', error);

            }
            throw error;
        }
    }

    /**
     * Get my teams
     */
    async getMyTeams(userId: string): Promise<Team[]> {
        try {
            const response = await api.get(`/api/teams/my/${userId}`);
            return response.data;
        } catch (error: any) {
            if (import.meta.env.MODE !== 'production') {

                console.error('Get teams error:', error);

            }
            return [];
        }
    }

    /**
     * Delete a team
     */
    async deleteTeam(teamId: string) {
        try {
            await api.delete(`/api/teams/${teamId}`);
            return true;
        } catch (error: any) {
            if (import.meta.env.MODE !== 'production') {

                console.error('Delete team error:', error);

            }
            return false;
        }
    }
}

export default new TeamService();
