import axios from 'axios';

// ===========================================
// CONFIGURATION
// ===========================================

// CRITICAL: No localhost fallback. This MUST be set in environment.
const BASE_URL = import.meta.env.VITE_API_URL;

if (!BASE_URL) {
    throw new Error(
        'VITE_API_URL is not configured! Set it in .env.production or .env.development'
    );
}

console.log('🎮 Prediction API initialized with base URL:', BASE_URL);

// ===========================================
// AXIOS INSTANCE
// ===========================================

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 5000, // 5 second timeout
    headers: {
        'Content-Type': 'application/json',
    },
});

// ===========================================
// GAME MODE MAPPING
// ===========================================

/**
 * Frontend uses Firestore mode names (WIN_GO_1_MIN)
 * Backend API expects short gameType codes (1m)
 */
const GAME_TYPE_MAP: Record<string, string> = {
    WIN_GO_30S: '30s',
    WIN_GO_1_MIN: '1m',
    WIN_GO_3_MIN: '3m',
    WIN_GO_5_MIN: '5m',
};

const mapGameMode = (mode: string): string => {
    const gameType = GAME_TYPE_MAP[mode];
    if (!gameType) {
        throw new Error(`Invalid game mode: ${mode}. Expected WIN_GO_30S, WIN_GO_1_MIN, WIN_GO_3_MIN, or WIN_GO_5_MIN`);
    }
    return gameType;
};

// ===========================================
// TYPE DEFINITIONS
// ===========================================

export interface CurrentPeriodResponse {
    periodId: string;
    gameType: string;
    remainingSeconds: number;
}

export interface LatestResultResponse {
    periodId: string;
    number: number;
    color: 'RED' | 'GREEN' | 'VIOLET';
}

export interface HistoryItem {
    periodId: string;
    number: number;
    color: string;
    timestamp?: number;
}

// ===========================================
// API METHODS
// ===========================================

/**
 * Get current period information
 * 
 * Backend endpoint: GET /api/current-period?gameType=1m
 * 
 * @param mode - Frontend mode (WIN_GO_1_MIN, etc.)
 * @returns Current period data
 * @throws AxiosError if request fails
 */
export const getCurrentPeriod = async (mode: string): Promise<CurrentPeriodResponse> => {
    const gameType = mapGameMode(mode);

    console.log(`🎮 [API] getCurrentPeriod: mode="${mode}" → gameType="${gameType}"`);

    try {
        const { data } = await api.get<CurrentPeriodResponse>('/current-period', {
            params: { gameType },
        });

        console.log(`✅ [API] Response:`, { periodId: data.periodId, gameType: data.gameType, remainingSeconds: data.remainingSeconds });

        return data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(`❌ getCurrentPeriod failed for ${mode}:`, {
                status: error.response?.status,
                message: error.message,
                code: error.code,
            });
        }
        throw error;
    }
};

/**
 * Get latest result
 * 
 * Backend endpoint: GET /api/latest-result?gameType=1m
 * 
 * @param mode - Frontend mode
 * @returns Latest result data
 */
export const getLatestResult = async (mode: string): Promise<LatestResultResponse> => {
    const gameType = mapGameMode(mode);

    try {
        const { data } = await api.get<LatestResultResponse>('/latest-result', {
            params: { gameType },
        });

        return data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(`❌ getLatestResult failed for ${mode}:`, {
                status: error.response?.status,
                message: error.message,
            });
        }
        throw error;
    }
};

/**
 * Get game history
 * 
 * Backend endpoint: GET /api/history?gameType=1m&limit=20
 * 
 * @param mode - Frontend mode
 * @param limit - Number of results to return (default: 20)
 * @returns Array of historical results
 */
export const getHistory = async (mode: string, limit: number = 20): Promise<HistoryItem[]> => {
    const gameType = mapGameMode(mode);

    try {
        const { data } = await api.get<HistoryItem[]>('/history', {
            params: { gameType, limit },
        });

        return data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(`❌ getHistory failed for ${mode}:`, error.message);
        }
        throw error;
    }
};

// ===========================================
// ERROR HANDLING HELPERS
// ===========================================

export const isNetworkError = (error: unknown): boolean => {
    if (!axios.isAxiosError(error)) return false;
    return (
        error.code === 'ECONNABORTED' ||
        error.code === 'ERR_NETWORK' ||
        error.message.includes('Network Error')
    );
};

export const isTimeoutError = (error: unknown): boolean => {
    if (!axios.isAxiosError(error)) return false;
    return error.code === 'ECONNABORTED' && error.message.includes('timeout');
};

export const is404Error = (error: unknown): boolean => {
    if (!axios.isAxiosError(error)) return false;
    return error.response?.status === 404;
};

// ===========================================
// EXPORTS
// ===========================================

export default {
    getCurrentPeriod,
    getLatestResult,
    getHistory,
    isNetworkError,
    isTimeoutError,
    is404Error,
};
