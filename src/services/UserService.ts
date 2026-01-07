import { UserProfile } from '@/types'

const STORAGE_KEY_PREFIX = 'espo_profile_'

const DEFAULT_PROFILE: UserProfile = {
    tournamentsPlayed: 0,
    tournamentsWon: 0,
    totalEarnings: 0,
    referralCode: 'ESPO' + Math.random().toString(36).substring(2, 8).toUpperCase(),
    referralEarnings: 0,
    gameAccounts: {},
    settings: {
        tournamentReminders: true,
        matchResults: true,
        newTournaments: true,
        teamInvites: true
    }
}

class UserService {
    async getProfile(userId: string): Promise<UserProfile> {
        const key = STORAGE_KEY_PREFIX + userId
        const stored = localStorage.getItem(key)
        if (stored) {
            return JSON.parse(stored)
        }
        localStorage.setItem(key, JSON.stringify(DEFAULT_PROFILE))
        return DEFAULT_PROFILE
    }

    subscribeToProfile(userId: string, callback: (profile: UserProfile) => void): () => void {
        const fetchAndCallback = async () => {
            const profile = await this.getProfile(userId)
            callback(profile)
        }

        fetchAndCallback()
        window.addEventListener('profileUpdate', fetchAndCallback)
        return () => window.removeEventListener('profileUpdate', fetchAndCallback)
    }

    async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
        const current = await this.getProfile(userId)
        const updated = {
            ...current,
            ...updates,
            gameAccounts: { ...current.gameAccounts, ...updates.gameAccounts },
            settings: { ...current.settings, ...updates.settings }
        }
        localStorage.setItem(STORAGE_KEY_PREFIX + userId, JSON.stringify(updated))
        window.dispatchEvent(new CustomEvent('profileUpdate'))
    }

    async searchUsers(query: string): Promise<(UserProfile & { uid: string })[]> {
        // Return a simulated search result for the demo
        console.log('Searching users locally:', query)
        return []
    }
}

export const userService = new UserService()
