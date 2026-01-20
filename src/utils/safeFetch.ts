
/**
 * Executes an async function safely, returning a default value on error.
 * Used for non-critical data fetching.
 */
export async function safeFetch<T>(
    fetcher: () => Promise<T>,
    defaultValue: T,
    errorMessage = "Data fetch failed"
): Promise<T> {
    try {
        return await fetcher();
    } catch (error) {
        // Log only in development mode to suppress crashes in production
        if (import.meta.env.MODE !== 'production') {
            console.warn(`SafeFetch Warning [${errorMessage}]:`, error);
        }
        return defaultValue;
    }
}
