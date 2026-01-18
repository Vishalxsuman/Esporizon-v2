// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const endpoints = {
    baseURL: API_URL,
    profile: (userId: string) => `${API_URL}/api/profile/${userId}`,
    updateProfile: `${API_URL}/api/profile/update`,
};
