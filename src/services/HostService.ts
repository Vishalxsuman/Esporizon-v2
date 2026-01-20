import { api } from '@/services/api';
import { waitForAuth } from '@/utils/authGuard';

/**
 * Get host profile
 */
export const getHostProfile = async (hostId: string) => {
    try {
        await waitForAuth();
        const response = await api.get(`/api/host/${hostId}`);
        return response?.data ?? null;
    } catch (error) {
        if (import.meta.env.MODE !== 'production') {

            console.error('Failed to get host profile:', error);

        }
        return null;
    }
};

/**
 * Get host's tournaments
 */
export const getHostTournaments = async (hostId: string, status?: string) => {
    try {
        await waitForAuth();
        const params = status ? { status } : {};
        const response = await api.get(`/api/host/${hostId}/tournaments`, { params });
        return response?.data ?? [];
    } catch (error) {
        if (import.meta.env.MODE !== 'production') {

            console.error('Failed to get host tournaments:', error);

        }
        return [];
    }
};

/**
 * Rate a host
 */
export const rateHost = async (hostId: string, stars: number, reviewText?: string) => {
    try {
        await waitForAuth();
        const response = await api.post(
            `/api/host/${hostId}/rate`,
            { stars, reviewText }
        );
        return response?.data ?? null;
    } catch (error) {
        if (import.meta.env.MODE !== 'production') {

            console.error('Failed to rate host:', error);

        }
        return null;
    }
};

/**
 * Activate current user as host (FREE)
 */
export const activateHost = async () => {
    try {
        await waitForAuth();
        const response = await api.post('/api/host/activate');
        return response?.data ?? { success: false };
    } catch (error) {
        if (import.meta.env.MODE !== 'production') {

            console.error('Failed to activate host:', error);

        }
        return { success: false, message: 'Activation failed' };
    }
};

export const hostService = {
    getHostProfile,
    getHostTournaments,
    rateHost,
    activateHost
};
