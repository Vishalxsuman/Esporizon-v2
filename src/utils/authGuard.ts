import { getFirebaseAuth } from '@/config/firebaseConfig';

/**
 * Auth Guard Utility
 * Ensures API calls only fire after auth state is resolved
 */

let authReady = false;
let authReadyPromise: Promise<boolean> | null = null;

/**
 * Wait for Firebase auth state to be resolved
 * @returns Promise<boolean> - true if user is logged in, false otherwise
 */
export const waitForAuth = (): Promise<boolean> => {
    // If already resolved, return immediately
    if (authReady) {
        try {
            const auth = getFirebaseAuth();
            return Promise.resolve(!!auth.currentUser);
        } catch {
            return Promise.resolve(false);
        }
    }

    // If promise already exists, return it
    if (authReadyPromise) {
        return authReadyPromise;
    }

    // Create new promise to wait for auth state
    authReadyPromise = new Promise((resolve) => {
        try {
            const auth = getFirebaseAuth();
            const unsubscribe = auth.onAuthStateChanged((user) => {
                authReady = true;
                unsubscribe();
                resolve(!!user);
            });
        } catch {
            // Firebase not configured, resolve as logged out
            authReady = true;
            resolve(false);
        }
    });

    return authReadyPromise;
};

/**
 * Reset auth state (for testing or logout)
 */
export const resetAuthGuard = () => {
    authReady = false;
    authReadyPromise = null;
};
