import { getAuth } from 'firebase/auth';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import axios from 'axios';

// CRITICAL: No localhost fallback
const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) {
    throw new Error('VITE_API_URL is not configured!');
}


// Guest ID management
const GUEST_ID_KEY = 'prediction_guest_id';

export const getGuestId = (): string => {
    let guestId = localStorage.getItem(GUEST_ID_KEY);
    if (!guestId) {
        guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem(GUEST_ID_KEY, guestId);
    }
    return guestId;
};

// Get auth token
const getAuthToken = async () => {
    const auth = getAuth();
    if (auth.currentUser) {
        return await auth.currentUser.getIdToken();
    }
    return null;
};

// Axios instance
const api = axios.create({
    baseURL: API_URL
});

// Add auth interceptor
api.interceptors.request.use(async (config: any) => {
    const token = await getAuthToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

/**
 * Place a bet
 */
export const placeBet = async (
    gameMode: string,
    betType: 'color' | 'number' | 'big_small',
    betValue: string,
    amountEspo: number,
    isGuest: boolean = false
) => {
    const data: any = {
        gameMode,
        betType,
        betValue,
        amountEspo,
        isGuest
    };

    if (isGuest) {
        data.guestId = getGuestId();
    }

    const response = await api.post('/predict/bet', data);
    return response.data;
};

/**
 * Get current game state for a mode
 */
export const getGameState = async (gameMode: string) => {
    const response = await api.get(`/predict/game-state/${gameMode}`);
    return response.data;
};

/**
 * Get period history
 */
export const getPeriodHistory = async (gameMode: string, limit: number = 100) => {
    const response = await api.get(`/predict/history/${gameMode}`, {
        params: { limit }
    });
    return response.data;
};

/**
 * Get user's bet history
 */
export const getMyBets = async (isGuest: boolean = false, limit: number = 50) => {
    const params: any = { limit, isGuest };

    if (isGuest) {
        params.guestId = getGuestId();
    }

    const response = await api.get('/predict/my-bets', { params });
    return response.data;
};

/**
 * Get chart data (number frequency)
 */
export const getChartData = async (gameMode: string) => {
    const response = await api.get(`/predict/chart/${gameMode}`);
    return response.data;
};

/**
 * Create guest wallet
 */
export const createGuestWallet = async () => {
    const guestId = getGuestId();
    const response = await api.post('/predict/guest/create', { guestId });
    return response.data;
};

/**
 * Get balance
 */
export const getBalance = async (isGuest: boolean = false) => {
    const params: any = { isGuest };

    if (isGuest) {
        params.guestId = getGuestId();
    }

    const response = await api.get('/predict/balance', { params });
    return response.data;
};

/**
 * Subscribe to game state updates (real-time)
 */
export const subscribeToGameState = (
    gameMode: string,
    callback: (state: any) => void
) => {
    const db = getFirestore();
    const stateRef = doc(db, 'prediction-system', `game-state-${gameMode}`);

    return onSnapshot(stateRef, (snapshot) => {
        if (snapshot.exists()) {
            callback(snapshot.data());
        }
    });
};

/**
 * Subscribe to period updates (real-time)
 */
export const subscribeToPeriod = (
    gameMode: string,
    periodId: string,
    callback: (period: any) => void
) => {
    const db = getFirestore();
    const periodRef = doc(db, `prediction-games-${gameMode}`, periodId);

    return onSnapshot(periodRef, (snapshot) => {
        if (snapshot.exists()) {
            callback({
                id: snapshot.id,
                ...snapshot.data()
            });
        }
    });
};

/**
 * Initialize prediction system (admin only, run once)
 */
export const initializeSystem = async () => {
    const response = await api.post('/predict/admin/init');
    return response.data;
};

export default {
    placeBet,
    getGameState,
    getPeriodHistory,
    getMyBets,
    getChartData,
    createGuestWallet,
    getBalance,
    subscribeToGameState,
    subscribeToPeriod,
    initializeSystem,
    getGuestId
};
