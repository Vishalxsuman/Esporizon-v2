import axios from 'axios';
import { auth } from '@/config/firebaseConfig';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Get auth headers with Firebase token
 */
const getAuthHeaders = async () => {
    const token = await auth.currentUser?.getIdToken();
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

/**
 * Get host profile
 */
export const getHostProfile = async (hostId: string) => {
    const response = await axios.get(`${API_URL}/api/host/${hostId}`);
    return response.data;
};

/**
 * Get host's tournaments
 */
export const getHostTournaments = async (hostId: string, status?: string) => {
    const params = status ? { status } : {};
    const response = await axios.get(`${API_URL}/api/host/${hostId}/tournaments`, { params });
    return response.data;
};

/**
 * Rate a host
 */
export const rateHost = async (hostId: string, stars: number, reviewText?: string) => {
    const headers = await getAuthHeaders();
    const response = await axios.post(
        `${API_URL}/api/host/${hostId}/rate`,
        { stars, reviewText },
        { headers }
    );
    return response.data;
};

export const hostService = {
    getHostProfile,
    getHostTournaments,
    rateHost
};
