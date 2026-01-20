import { api } from '@/services/api';
import { waitForAuth } from '@/utils/authGuard';

export const activateSubscription = async () => {
    try {
        await waitForAuth();
        const response = await api.post('/api/subscription/activate');

        if (!response || !response.data) {
            return { success: false, message: 'Activation failed (Network)' };
        }

        return response.data;
    } catch (error) {
        if (import.meta.env.MODE !== 'production') {

            console.error('Subscription activation failed:', error);

        }
        return { success: false, message: 'Activation failed' };
    }
};

/**
 * Get subscription status - SUBSCRIPTION IS FREE BY DEFAULT
 */
export const getSubscriptionStatus = async () => {
    try {
        await waitForAuth();
        const response = await api.get('/api/subscription/status');

        // Handle null response (timeout/network error)
        if (!response || !response.data) {
            // FREE SUBSCRIPTION: Default to active
            return { active: true, plan: 'free' };
        }

        return response.data;
    } catch (error) {
        if (import.meta.env.MODE !== 'production') {

            console.error('Failed to get subscription status:', error);

        }
        // FREE SUBSCRIPTION: Returns active by default
        return { active: true, plan: 'free' };
    }
};

export const subscriptionService = {
    activateSubscription,
    getSubscriptionStatus
};
