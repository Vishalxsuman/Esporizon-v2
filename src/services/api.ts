import axios from 'axios';
import { API_URL } from '@/config/api';
import { auth } from '@/config/firebaseConfig';
import { waitForAuth } from '@/utils/authGuard';

// Create a centralized Axios instance with fast-fail timeout
export const api = axios.create({
    baseURL: API_URL,
    timeout: 3000, // 3 second timeout - fast fail on backend issues
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Wait for Auth Ready & Attach Firebase Token
api.interceptors.request.use(
    async (config) => {
        try {
            // CRITICAL: Wait for auth to be ready before making any API call
            await waitForAuth();

            if (auth && auth.currentUser) {
                const token = await auth.currentUser.getIdToken();
                if (!config.headers) {
                    config.headers = {} as any;
                }
                config.headers['Authorization'] = `Bearer ${token}`;
            }
        } catch (error) {
            if (import.meta.env.MODE !== 'production') {

                console.error('Error attaching auth token:', error);

            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Global Error Handling - NEVER THROW
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle timeout errors - return safe default instead of crashing
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            if (import.meta.env.MODE !== 'production') {

                console.warn('⚠️ API Timeout (3s): Returning safe default');

            }
            return Promise.resolve({ data: null, success: false } as any);
        }

        // Handle 404 errors - return safe default
        if (error.response?.status === 404) {
            if (import.meta.env.MODE !== 'production') {

                console.warn('⚠️ API 404: Endpoint not found, returning safe default');

            }
            return Promise.resolve({ data: null, success: false } as any);
        }

        // Handle 500 errors - return safe default
        if (error.response?.status === 500) {
            if (import.meta.env.MODE !== 'production') {

                console.warn('⚠️ API 500: Server error, returning safe default');

            }
            return Promise.resolve({ data: null, success: false } as any);
        }

        // Handle network errors - return safe default
        if (error.request && !error.response) {
            if (import.meta.env.MODE !== 'production') {

                console.warn('⚠️ Network Error: No response from server, returning safe default');

            }
            return Promise.resolve({ data: null, success: false } as any);
        }

        // Log other errors once (not infinite retries)
        if (!axios.isCancel(error)) {
            if (import.meta.env.MODE !== 'production') {

                console.error(`API Error [${error.response?.status || 'UNKNOWN'}]:`, error.response?.data?.message || error.message);

            }
        }

        // Still reject for authentication errors (401, 403) to trigger proper handling
        if (error.response?.status === 401 || error.response?.status === 403) {
            return Promise.reject(error);
        }

        // For all other errors, return safe default
        return Promise.resolve({ data: null, success: false } as any);
    }
);

// Helper for request cancellation
export const createCancelToken = () => axios.CancelToken.source();
