import { db } from './firebase'
import {
    collection,
    doc,
    getDocs,
    addDoc,
    updateDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp
} from 'firebase/firestore'
import type { Leaderboard, LeaderboardEntry } from '@/types/match'

class LeaderboardService {
    private leaderboardsCollection = collection(db, 'leaderboards')

    // Get current leaderboard by type
    async getLeaderboard(type: 'overall_champions' | 'free_masters' | 'top_earners'): Promise<Leaderboard | null> {
        try {
            // Get the current week's leaderboard
            const q = query(
                this.leaderboardsCollection,
                where('type', '==', type),
                where('period', '==', 'weekly'),
                orderBy('createdAt', 'desc'),
                limit(1)
            )

            const snapshot = await getDocs(q)
            if (snapshot.empty) {
                // Create new leaderboard if none exists
                return await this.createLeaderboard(type)
            }

            const doc = snapshot.docs[0]
            return { id: doc.id, ...doc.data() } as Leaderboard
        } catch (error) {
            console.error('Error getting leaderboard:', error)
            return null
        }
    }

    // Get user's rank in a leaderboard
    async getUserRank(userId: string, type: 'overall_champions' | 'free_masters' | 'top_earners'): Promise<number | null> {
        try {
            const leaderboard = await this.getLeaderboard(type)
            if (!leaderboard) return null

            const userEntry = leaderboard.entries.find(e => e.userId === userId)
            return userEntry ? userEntry.rank : null
        } catch (error) {
            console.error('Error getting user rank:', error)
            return null
        }
    }

    // Update leaderboard entry after match
    async updateLeaderboardEntry(
        userId: string,
        userName: string,
        userAvatar: string | undefined,
        type: 'overall_champions' | 'free_masters' | 'top_earners',
        updates: {
            gamesPlayed?: number
            gamesWon?: number
            earnings?: number
        }
    ): Promise<void> {
        try {
            const leaderboard = await this.getLeaderboard(type)
            if (!leaderboard) return

            const leaderboardRef = doc(this.leaderboardsCollection, leaderboard.id)
            const existingIndex = leaderboard.entries.findIndex(e => e.userId === userId)

            if (existingIndex >= 0) {
                // Update existing entry
                const entry = leaderboard.entries[existingIndex]
                entry.gamesPlayed += updates.gamesPlayed || 0
                entry.gamesWon += updates.gamesWon || 0
                entry.totalEarnings += updates.earnings || 0

                // Re-sort and re-rank
                leaderboard.entries.sort((a, b) => {
                    if (type === 'top_earners') {
                        return b.totalEarnings - a.totalEarnings
                    }
                    return b.gamesWon - a.gamesWon
                })

                leaderboard.entries.forEach((e, idx) => {
                    e.rank = idx + 1
                    // Assign badges to top 3
                    if (idx === 0) e.badge = 'gold'
                    else if (idx === 1) e.badge = 'silver'
                    else if (idx === 2) e.badge = 'bronze'
                    else delete e.badge
                })

                await updateDoc(leaderboardRef, {
                    entries: leaderboard.entries
                })
            } else {
                // Add new entry
                const newEntry: LeaderboardEntry = {
                    userId,
                    userName,
                    userAvatar,
                    gamesPlayed: updates.gamesPlayed || 0,
                    gamesWon: updates.gamesWon || 0,
                    totalEarnings: updates.earnings || 0,
                    rank: leaderboard.entries.length + 1
                }

                leaderboard.entries.push(newEntry)

                // Re-sort and re-rank
                leaderboard.entries.sort((a, b) => {
                    if (type === 'top_earners') {
                        return b.totalEarnings - a.totalEarnings
                    }
                    return b.gamesWon - a.gamesWon
                })

                leaderboard.entries.forEach((e, idx) => {
                    e.rank = idx + 1
                    if (idx === 0) e.badge = 'gold'
                    else if (idx === 1) e.badge = 'silver'
                    else if (idx === 2) e.badge = 'bronze'
                    else delete e.badge
                })

                await updateDoc(leaderboardRef, {
                    entries: leaderboard.entries
                })
            }
        } catch (error) {
            console.error('Error updating leaderboard entry:', error)
            throw new Error('Failed to update leaderboard')
        }
    }

    // Create new leaderboard
    private async createLeaderboard(type: 'overall_champions' | 'free_masters' | 'top_earners'): Promise<Leaderboard> {
        const now = new Date()
        const weekStart = this.getWeekStart(now)
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekEnd.getDate() + 7)

        const resetAt = new Date(weekEnd)

        const newLeaderboard: Omit<Leaderboard, 'id'> = {
            type,
            period: 'weekly',
            weekStartDate: weekStart.toISOString(),
            weekEndDate: weekEnd.toISOString(),
            entries: [],
            resetAt: resetAt.toISOString(),
            createdAt: now.toISOString()
        }

        const docRef = await addDoc(this.leaderboardsCollection, {
            ...newLeaderboard,
            createdAt: serverTimestamp(),
            resetAt: resetAt
        })

        return {
            ...newLeaderboard,
            id: docRef.id
        }
    }

    // Get week start date (Monday 00:00)
    private getWeekStart(date: Date): Date {
        const d = new Date(date)
        const day = d.getDay()
        const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust for Sunday
        const monday = new Date(d.setDate(diff))
        monday.setHours(0, 0, 0, 0)
        return monday
    }

    // Check if leaderboard needs reset
    async checkAndResetLeaderboards(): Promise<void> {
        try {
            const types: Array<'overall_champions' | 'free_masters' | 'top_earners'> = [
                'overall_champions',
                'free_masters',
                'top_earners'
            ]

            for (const type of types) {
                const leaderboard = await this.getLeaderboard(type)
                if (!leaderboard) continue

                const resetDate = new Date(leaderboard.resetAt)
                const now = new Date()

                if (now >= resetDate) {
                    // Archive old leaderboard (could store in separate collection)
                    // For now, just create new one
                    await this.createLeaderboard(type)
                }
            }
        } catch (error) {
            console.error('Error checking leaderboards:', error)
        }
    }
}

export const leaderboardService = new LeaderboardService()
