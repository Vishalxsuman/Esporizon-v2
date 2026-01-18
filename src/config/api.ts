// ========================================
// 🌐 API CONFIGURATION WITH VALIDATION
// ========================================

/**
 * Validates API configuration and provides environment-aware fallbacks.
 * Prevents production crashes from missing VITE_API_URL.
 */
function getApiUrl(): string {
    const apiUrl = import.meta.env.VITE_API_URL;

    // Production: require explicit API URL
    if (import.meta.env.PROD && (!apiUrl || apiUrl === 'undefined')) {
        console.error(`
🚨 API Configuration Error - Missing VITE_API_URL

VITE_API_URL is not configured. API calls will fail.

For PRODUCTION DEPLOYMENT:
  Set VITE_API_URL to your backend server URL.
  
For GITHUB PAGES DEPLOYMENT:
  Add VITE_API_URL as a GitHub Repository Variable:
  Settings → Secrets and variables → Actions → Variables tab
  
Example values:
  - Development: http://localhost:5000
  - Production: https://your-backend-domain.com
`.trim());

        // Return empty string to make errors obvious
        return '';
    }

    // Development: allow localhost fallback with warning
    if (!apiUrl || apiUrl === 'undefined') {
        console.warn('⚠️ VITE_API_URL not configured, falling back to http://localhost:5000');
        return 'http://localhost:5000';
    }

    return apiUrl;
}

// Export centralized API URL
export const API_URL = getApiUrl();

// Export flag for conditional API usage
export const isApiConfigured = API_URL !== '';

export const endpoints = {
    baseURL: API_URL,
    profile: (userId: string) => `${API_URL}/api/profile/${userId}`,
    updateProfile: `${API_URL}/api/profile/update`,
};
