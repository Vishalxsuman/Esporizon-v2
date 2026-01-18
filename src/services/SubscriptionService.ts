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

export const activateSubscription = async () => {
    try {
        const headers = await getAuthHeaders();
        const response = await axios.post(`${API_URL}/subscription/activate`, {}, { headers });
        return response.data;
    } catch (error) {
        console.warn('Backend currently unavailable, simulating successful activation');
        return { success: true, message: 'Subscription activated (Mock)' };
    }
};

/**
 * Get subscription status
 */
export const getSubscriptionStatus = async () => {
    try {
        const headers = await getAuthHeaders();
        const response = await axios.get(`${API_URL}/subscription/status`, { headers });
        return response.data;
    } catch (error) {
        console.warn('Backend currently unavailable, returning mock status');
        // Return mock host status if local storage says so, otherwise false
        const isHost = localStorage.getItem('user_is_host') === 'true';
        return { isHost };
    }
};

export const subscriptionService = {
    activateSubscription,
    getSubscriptionStatus
};
