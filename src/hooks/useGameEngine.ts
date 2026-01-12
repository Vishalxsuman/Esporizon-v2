import { useState, useEffect, useRef, useCallback } from 'react';
import {
    getCurrentPeriod,
    getLatestResult,
    CurrentPeriodResponse,
    LatestResultResponse,
    isNetworkError,
    isTimeoutError,
    is404Error,
} from '@/lib/predictionApi';

// ===========================================
// TYPE DEFINITIONS
// ===========================================

export interface GameState {
    periodId: string;
    remainingSeconds: number;
    status: 'LOADING' | 'BETTING' | 'LOCKED' | 'RESULT_PENDING';
    lastResult: {
        periodId: string;
        number: number;
        color: string;
        size: string;
    } | null;
}

// ===========================================
// HOOK IMPLEMENTATION
// ===========================================

/**
 * Backend-Authoritative Game Engine
 * 
 * CRITICAL RULES:
 * - Backend is the ONLY source of truth for time and game state
 * - Frontend NEVER decrements timer locally
 * - Frontend NEVER calculates when to lock betting
 * - Frontend NEVER adjusts for network latency
 * - Polling runs continuously with setTimeout (not setInterval)
 * - State transitions are purely driven by backend's remainingSeconds value
 * 
 * @param mode - Game mode (WIN_GO_30S, WIN_GO_1_MIN, WIN_GO_3_MIN, WIN_GO_5_MIN)
 * @returns Current game state
 */
export const useGameEngine = (mode: string = 'WIN_GO_1_MIN') => {
    const [state, setState] = useState<GameState>({
        periodId: '',
        remainingSeconds: 0,
        status: 'LOADING',
        lastResult: null,
    });

    // Track last seen period ID to detect changes
    const lastPeriodIdRef = useRef<string>('');

    // Error backoff state
    const errorCountRef = useRef<number>(0);

    // ===========================================
    // BACKEND SYNC LOGIC
    // ===========================================

    /**
     * Sync with backend - fetch current period data
     * This is called every 1 second by the polling loop
     */
    const syncWithServer = useCallback(async () => {
        try {
            const data: CurrentPeriodResponse = await getCurrentPeriod(mode);

            // Detect period change
            const periodChanged = data.periodId !== lastPeriodIdRef.current && lastPeriodIdRef.current !== '';

            if (periodChanged) {
                console.log('🔄 Period changed:', {
                    old: lastPeriodIdRef.current,
                    new: data.periodId,
                });

                // Fetch result of previous period
                try {
                    const result: LatestResultResponse = await getLatestResult(mode);

                    // Determine size based on number
                    const size = result.number >= 5 ? 'BIG' : 'SMALL';

                    setState((prev) => ({
                        ...prev,
                        periodId: data.periodId,
                        remainingSeconds: data.remainingSeconds,
                        status: computeStatus(data.remainingSeconds),
                        lastResult: {
                            periodId: result.periodId,
                            number: result.number,
                            color: result.color,
                            size,
                        },
                    }));
                } catch (resultError) {
                    console.error('Failed to fetch result, continuing anyway:', resultError);

                    // Update state without result
                    setState((prev) => ({
                        ...prev,
                        periodId: data.periodId,
                        remainingSeconds: data.remainingSeconds,
                        status: computeStatus(data.remainingSeconds),
                    }));
                }

                lastPeriodIdRef.current = data.periodId;
            } else {
                // Same period - just update timer and status
                setState((prev) => ({
                    ...prev,
                    periodId: data.periodId,
                    remainingSeconds: data.remainingSeconds,
                    status: computeStatus(data.remainingSeconds),
                }));

                // Update ref if this is first load
                if (lastPeriodIdRef.current === '') {
                    lastPeriodIdRef.current = data.periodId;

                    // Fetch latest result on initial load
                    try {
                        const result: LatestResultResponse = await getLatestResult(mode);
                        const size = result.number >= 5 ? 'BIG' : 'SMALL';

                        setState((prev) => ({
                            ...prev,
                            lastResult: {
                                periodId: result.periodId,
                                number: result.number,
                                color: result.color,
                                size,
                            },
                        }));
                    } catch (e) {
                        console.error('Failed to fetch initial result:', e);
                    }
                }
            }

            // Reset error count on success
            errorCountRef.current = 0;
        } catch (error) {
            errorCountRef.current += 1;

            // Handle specific error types
            if (is404Error(error)) {
                console.warn('No active period found, waiting for backend...');
                setState((prev) => ({ ...prev, status: 'LOADING' }));
            } else if (isTimeoutError(error)) {
                console.error('Server timeout, retrying...');
                setState((prev) => ({ ...prev, status: 'LOADING' }));
            } else if (isNetworkError(error)) {
                console.error('Network error, retrying...');
                // Keep last known state on network errors
            } else {
                console.error('Unknown sync error:', error);
            }

            // Re-throw to trigger backoff in polling loop
            throw error;
        }
    }, [mode]);

    // ===========================================
    // POLLING LOOP
    // ===========================================

    useEffect(() => {
        let isMounted = true;
        let timeoutId: NodeJS.Timeout;

        /**
         * Self-correcting poll loop using setTimeout
         * This ensures each poll completes before scheduling the next one
         */
        const poll = async () => {
            if (!isMounted) return;

            try {
                await syncWithServer();

                // Success: poll again in 1 second
                timeoutId = setTimeout(poll, 1000);
            } catch (error) {
                // Error: exponential backoff
                const backoffMs = Math.min(3000 * Math.pow(2, errorCountRef.current - 1), 30000);

                console.error(`Poll failed (attempt ${errorCountRef.current}), retrying in ${backoffMs}ms`);

                timeoutId = setTimeout(poll, backoffMs);
            }
        };

        // Reset state when mode changes
        setState({
            periodId: '',
            remainingSeconds: 0,
            status: 'LOADING',
            lastResult: null,
        });
        lastPeriodIdRef.current = '';
        errorCountRef.current = 0;

        // Start polling immediately
        poll();

        // Cleanup on unmount or mode change
        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
    }, [mode, syncWithServer]);

    return state;
};

// ===========================================
// HELPER FUNCTIONS
// ===========================================

/**
 * Compute game status based ONLY on backend's remainingSeconds
 * 
 * CRITICAL: This is the ONLY place where status is determined.
 * Frontend NEVER decides status based on local timer.
 * 
 * @param remainingSeconds - Value from backend
 * @returns Game status
 */
function computeStatus(remainingSeconds: number): GameState['status'] {
    if (remainingSeconds > 5) {
        return 'BETTING';
    } else if (remainingSeconds > 0 && remainingSeconds <= 5) {
        return 'LOCKED';
    } else if (remainingSeconds === 0) {
        return 'RESULT_PENDING';
    } else {
        return 'LOADING';
    }
}
