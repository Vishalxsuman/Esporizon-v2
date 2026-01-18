import axios from 'axios';
import { auth } from '@/config/firebaseConfig';
import { API_URL } from '@/config/api';

/**
 * Get auth headers with Firebase token
 */
const getAuthHeaders = async () => {
    const token = await auth?.currentUser?.getIdToken();
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

/**
 * Upload tournament results (screenshot)
 */
export const uploadTournamentResults = async (tournamentId: string, screenshot: string) => {
    const headers = await getAuthHeaders();
    const response = await axios.post(
        `${API_URL}/api/tournaments/${tournamentId}/results/upload`,
        { screenshot },
        { headers }
    );
    return response.data;
};

/**
 * Get tournament results
 */
export const getTournamentResults = async (tournamentId: string) => {
    const response = await axios.get(`${API_URL}/api/tournaments/${tournamentId}/results`);
    return response.data;
};

/**
 * Get player stats
 */
export const getPlayerStats = async (userId: string) => {
    const response = await axios.get(`${API_URL}/api/players/${userId}/stats`);
    return response.data;
};

/**
 * Get tournament payouts
 */
export const getTournamentPayouts = async (tournamentId: string) => {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_URL}/api/tournaments/${tournamentId}/payouts`, { headers });
    return response.data;
};

/**
 * Mark payout as sent
 */
export const markPayoutSent = async (payoutId: string, transactionReference?: string, notes?: string) => {
    const headers = await getAuthHeaders();
    const response = await axios.patch(
        `${API_URL}/api/payouts/${payoutId}/mark-sent`,
        { transactionReference, notes },
        { headers }
    );
    return response.data;
};

export const resultService = {
    uploadTournamentResults,
    getTournamentResults,
    getPlayerStats,
    getTournamentPayouts,
    markPayoutSent
};
