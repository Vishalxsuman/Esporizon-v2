// ========================================
// 🌐 API CONFIGURATION WITH STRICT VALIDATION
// ========================================

/**
 * Validates API configuration at compile time.
 * THROWS ERROR if VITE_API_BASE_URL is not defined in .env files.
 */
function getApiUrl(): string {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  // STRICT: API URL must be defined in environment
  if (!apiUrl || apiUrl === 'undefined' || apiUrl.trim() === '') {
    throw new Error(
      '❌ VITE_API_BASE_URL is not defined!\n' +
      'Please ensure .env.development or .env.production contains:\n' +
      'VITE_API_BASE_URL=http://localhost:5000 (for local)\n' +
      'VITE_API_BASE_URL=https://your-production-url.com (for production)'
    );
  }

  return apiUrl;
}

// Export centralized API URL (will throw if not configured)
export const API_URL = getApiUrl();

// Export flag for conditional API usage
export const isApiConfigured = API_URL !== '';

export const endpoints = {
  baseURL: API_URL,
  profile: (userId: string) => `${API_URL}/api/profile/${userId}`,
  updateProfile: `${API_URL}/api/profile/update`,
};
