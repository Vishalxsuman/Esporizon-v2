import { doc, getDoc, setDoc, updateDoc, onSnapshot, collection, query, where, getDocs, limit } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { UserProfile } from '@/types'

class UserRepository {
    private collection = 'user_profiles'

    async getProfile(userId: string): Promise<UserProfile | null> {
        const docRef = doc(db, this.collection, userId)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
            return docSnap.data() as UserProfile
        }
        return null
    }

    subscribeToProfile(userId: string, callback: (profile: UserProfile) => void) {
        return onSnapshot(doc(db, this.collection, userId), (docSnap) => {
            if (docSnap.exists()) {
                callback(docSnap.data() as UserProfile)
            } else {
                // Initialize default profile if not exists
                const defaultProfile: UserProfile = {
                    username: `user_${userId.slice(0, 8)}`,
                    tournamentsPlayed: 0,
                    tournamentsWon: 0,
                    totalEarnings: 0,
                    referralCode: `ESPO${userId.slice(0, 6).toUpperCase()}`,
                    referralEarnings: 0,
                    gameAccounts: {},
                    settings: {
                        tournamentReminders: true,
                        matchResults: true,
                        newTournaments: true,
                        teamInvites: true
                    }
                }
                this.createProfile(userId, defaultProfile)
                callback(defaultProfile)
            }
        })
    }

    async isUsernameAvailable(username: string, excludeUserId?: string): Promise<boolean> {
        if (!username) return false
        const q = query(
            collection(db, this.collection),
            where('username', '==', username.toLowerCase().trim())
        )
        const snapshot = await getDocs(q)
        if (snapshot.empty) return true

        // If results exist, check if the only match is the current user
        if (excludeUserId) {
            return snapshot.docs.every(doc => doc.id === excludeUserId)
        }
        return false
    }

    async searchUsers(searchTerm: string): Promise<(UserProfile & { uid: string })[]> {
        if (!searchTerm) return []
        const q = query(
            collection(db, this.collection),
            where('username', '>=', searchTerm.toLowerCase()),
            where('username', '<=', searchTerm.toLowerCase() + '\uf8ff'),
            limit(10)
        )
        const snapshot = await getDocs(q)
        return snapshot.docs.map(doc => ({
            uid: doc.id,
            ...doc.data()
        })) as (UserProfile & { uid: string })[]
    }

    async createProfile(userId: string, profile: UserProfile): Promise<void> {
        const docRef = doc(db, this.collection, userId)
        await setDoc(docRef, profile)
    }

    async updateProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
        const docRef = doc(db, this.collection, userId)
        await updateDoc(docRef, data)
    }

    async updateGameAccount(userId: string, game: keyof UserProfile['gameAccounts'], accountId: string): Promise<void> {
        const docRef = doc(db, this.collection, userId)
        await updateDoc(docRef, {
            [`gameAccounts.${game}`]: accountId
        })
    }
}

export const userRepository = new UserRepository()
