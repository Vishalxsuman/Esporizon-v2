import { getFirebaseDb } from '@/config/firebaseConfig'
import {
    collection,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    addDoc,
    runTransaction,
    getDocs
} from 'firebase/firestore'
import {
    TrustLevel,
    TRUST_LEVELS,
    Badge,
    BadgeType,
    BADGE_DEFINITIONS,
    UserWarRoomProfile,
    RecruitmentCard,
    CreateRecruitmentDto,
    TournamentCard,
    TournamentEventType,
    ClipPost
} from '@/types/WarRoomTypes'
import { userService } from './UserService'

const USER_WAR_ROOM_COLLECTION = 'userWarRoomProfiles'
const RECRUITMENT_COLLECTION = 'recruitmentPosts'
const TOURNAMENT_CARDS_COLLECTION = 'tournamentCards'
const CLIPS_COLLECTION = 'clips'
const SQUAD_CHATS_COLLECTION = 'squadChats'

class WarRoomService {
    // ========================================
    // TRUST LEVEL MANAGEMENT
    // ========================================

    async getUserTrustLevel(userId: string): Promise<TrustLevel> {
        try {
            const docRef = doc(getFirebaseDb(), USER_WAR_ROOM_COLLECTION, userId)
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()) {
                const data = docSnap.data() as UserWarRoomProfile
                return data.trustLevel
            }

            // Initialize new user at Level 0
            await this.initializeUserProfile(userId)
            return 0
        } catch (error) {
            console.error('Error getting trust level:', error)
            return 0
        }
    }

    async initializeUserProfile(userId: string): Promise<void> {
        const docRef = doc(getFirebaseDb(), USER_WAR_ROOM_COLLECTION, userId)
        const profile: UserWarRoomProfile = {
            userId,
            trustLevel: 0,
            badges: [],
            stats: {
                postsCreated: 0,
                successfulRecruitments: 0,
                reportCount: 0,
                tournamentsCompleted: 0,
                monthlyTournaments: 0
            },
            updatedAt: new Date().toISOString()
        }
        await setDoc(docRef, profile)
    }

    async updateTrustLevel(userId: string, newLevel: TrustLevel): Promise<void> {
        const docRef = doc(getFirebaseDb(), USER_WAR_ROOM_COLLECTION, userId)
        await updateDoc(docRef, {
            trustLevel: newLevel,
            updatedAt: new Date().toISOString()
        })

        // Also update UserProfile for consistency
        await userService.updateProfile(userId, {
            trustLevel: newLevel
        })
    }

    async checkPermission(userId: string, action: 'view' | 'comment' | 'recruit' | 'post' | 'uploadClips'): Promise<boolean> {
        const trustLevel = await this.getUserTrustLevel(userId)
        const permissions = TRUST_LEVELS[trustLevel].permissions

        switch (action) {
            case 'view':
                return permissions.canView
            case 'comment':
                return permissions.canComment
            case 'recruit':
                return permissions.canRecruit
            case 'post':
                return permissions.canPost
            case 'uploadClips':
                return permissions.canUploadClips
            default:
                return false
        }
    }

    async incrementTournamentCount(userId: string): Promise<void> {
        const docRef = doc(getFirebaseDb(), USER_WAR_ROOM_COLLECTION, userId)
        const docSnap = await getDoc(docRef)

        if (!docSnap.exists()) {
            await this.initializeUserProfile(userId)
        }

        await runTransaction(getFirebaseDb(), async (transaction) => {
            const freshDoc = await transaction.get(docRef)
            if (!freshDoc.exists()) return

            const data = freshDoc.data() as UserWarRoomProfile
            const newTournamentsCompleted = (data.stats.tournamentsCompleted || 0) + 1
            const newMonthlyTournaments = (data.stats.monthlyTournaments || 0) + 1

            transaction.update(docRef, {
                'stats.tournamentsCompleted': newTournamentsCompleted,
                'stats.monthlyTournaments': newMonthlyTournaments,
                updatedAt: new Date().toISOString()
            })

            // Auto-upgrade trust level based on tournaments
            let newTrustLevel = data.trustLevel
            if (newTournamentsCompleted >= 20 && data.trustLevel < 3) {
                newTrustLevel = 3
            } else if (newTournamentsCompleted >= 5 && data.trustLevel < 2) {
                newTrustLevel = 2
            } else if (newTournamentsCompleted >= 1 && data.trustLevel < 1) {
                newTrustLevel = 1
            }

            if (newTrustLevel !== data.trustLevel) {
                transaction.update(docRef, { trustLevel: newTrustLevel })
            }
        })
    }

    // ========================================
    // BADGE SYSTEM
    // ========================================

    async awardBadge(userId: string, badgeType: BadgeType, metadata?: any): Promise<void> {
        const docRef = doc(getFirebaseDb(), USER_WAR_ROOM_COLLECTION, userId)
        const docSnap = await getDoc(docRef)

        if (!docSnap.exists()) {
            await this.initializeUserProfile(userId)
        }

        const profile = (await getDoc(docRef)).data() as UserWarRoomProfile

        // Check if badge already exists
        const hasBadge = profile.badges.some(b => b.type === badgeType)
        if (hasBadge) return

        const badgeDefinition = BADGE_DEFINITIONS[badgeType]
        const newBadge: Badge = {
            id: `${badgeType}_${Date.now()}`,
            type: badgeType,
            name: badgeDefinition.name,
            description: badgeDefinition.description,
            icon: badgeDefinition.icon,
            earnedAt: new Date().toISOString(),
            metadata
        }

        await updateDoc(docRef, {
            badges: [...profile.badges, newBadge],
            updatedAt: new Date().toISOString()
        })

        // Also update UserProfile
        await userService.updateProfile(userId, {
            badges: [...(profile.badges || []), { type: badgeType, earnedAt: newBadge.earnedAt }]
        })
    }

    async getUserBadges(userId: string): Promise<Badge[]> {
        const docRef = doc(getFirebaseDb(), USER_WAR_ROOM_COLLECTION, userId)
        const docSnap = await getDoc(docRef)

        if (!docSnap.exists()) {
            return []
        }

        const data = docSnap.data() as UserWarRoomProfile
        return data.badges || []
    }

    // ========================================
    // RECRUITMENT CARDS
    // ========================================

    async createRecruitmentCard(userId: string, userName: string, userAvatar: string, data: CreateRecruitmentDto): Promise<string> {
        try {
            // Check permission
            const canRecruit = await this.checkPermission(userId, 'recruit')
            if (!canRecruit) {
                throw new Error('Insufficient trust level to create recruitment')
            }

            // Check spam - max 3 recruitments per hour
            const recentPosts = await this.getUserRecentRecruitments(userId, 60) // last hour
            if (recentPosts.length >= 3) {
                throw new Error('Too many recruitments in short time. Please wait.')
            }

            // Get user profile
            const trustLevel = await this.getUserTrustLevel(userId)
            const badges = await this.getUserBadges(userId)

            const card: Omit<RecruitmentCard, 'id'> = {
                userId,
                userName,
                userAvatar,
                trustLevel,
                badges,
                gameId: data.gameId,
                gameName: this.getGameName(data.gameId),
                mode: data.mode,
                tournamentId: data.tournamentId,
                tournamentName: '', // TODO: fetch from tournament
                tournamentStartTime: data.timeSlotTimestamp,
                roleNeeded: data.roleNeeded,
                roleName: this.getRoleName(data.roleNeeded),
                slotsAvailable: data.slotsAvailable,
                currentMembers: [],
                minimumKD: data.minimumKD,
                minimumRank: data.minimumRank,
                requirements: data.requirements,
                timeSlot: data.timeSlot,
                timeSlotTimestamp: data.timeSlotTimestamp,
                entryFee: data.entryFee,
                status: 'active',
                expiresAt: data.timeSlotTimestamp,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }

            const docRef = await addDoc(collection(getFirebaseDb(), RECRUITMENT_COLLECTION), card)
            return docRef.id
        } catch (error) {
            console.error("Error creating recruitment card:", error)
            throw error
        }
    }

    async joinSquad(cardId: string, userId: string): Promise<string> {
        try {
            const cardRef = doc(getFirebaseDb(), RECRUITMENT_COLLECTION, cardId)
            const cardSnap = await getDoc(cardRef)

            if (!cardSnap.exists()) {
                throw new Error('Recruitment card not found')
            }

            const card = cardSnap.data() as RecruitmentCard

            if (card.status !== 'active') {
                throw new Error('Recruitment is no longer active')
            }

            if (card.currentMembers.length >= card.slotsAvailable) {
                throw new Error('Squad is full')
            }

            if (card.currentMembers.includes(userId)) {
                throw new Error('Already joined')
            }

            const newMembers = [...card.currentMembers, userId]
            const isFilled = newMembers.length >= card.slotsAvailable

            await updateDoc(cardRef, {
                currentMembers: newMembers,
                status: isFilled ? 'filled' : 'active',
                updatedAt: new Date().toISOString()
            })

            // Create squad chat if filled
            if (isFilled) {
                const squadChatId = await this.createSquadChat(cardId, card.tournamentId, [...newMembers, card.userId])
                await updateDoc(cardRef, { squadChatId })
                return squadChatId
            }

            return ''
        } catch (error) {
            console.error("Error joining squad:", error)
            throw error
        }
    }

    async createSquadChat(recruitmentCardId: string, tournamentId: string, members: string[]): Promise<string> {
        const chat = {
            recruitmentCardId,
            tournamentId,
            members,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        }

        const docRef = await addDoc(collection(getFirebaseDb(), SQUAD_CHATS_COLLECTION), chat)
        return docRef.id
    }

    async getUserRecentRecruitments(userId: string, minutesBack: number): Promise<RecruitmentCard[]> {
        const cutoffTime = new Date(Date.now() - minutesBack * 60 * 1000).toISOString()

        const q = query(
            collection(getFirebaseDb(), RECRUITMENT_COLLECTION),
            where('userId', '==', userId),
            where('createdAt', '>', cutoffTime),
            orderBy('createdAt', 'desc')
        )

        const snapshot = await getDocs(q)
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RecruitmentCard))
    }

    subscribeToRecruitments(
        filters: { gameId?: string; mode?: string },
        callback: (cards: RecruitmentCard[]) => void
    ): () => void {
        let q = query(
            collection(getFirebaseDb(), RECRUITMENT_COLLECTION),
            where('status', '==', 'active'),
            orderBy('createdAt', 'desc'),
            limit(20)
        )

        if (filters.gameId) {
            q = query(q, where('gameId', '==', filters.gameId))
        }

        return onSnapshot(q, (snapshot) => {
            const cards = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as RecruitmentCard))
            callback(cards)
        })
    }

    // ========================================
    // TOURNAMENT CARDS (AUTO-GENERATED)
    // ========================================

    async generateTournamentCard(tournamentId: string, eventType: TournamentEventType, tournamentData: any): Promise<void> {
        try {
            const card: Omit<TournamentCard, 'id'> = {
                tournamentId,
                eventType,
                gameName: tournamentData.gameName,
                tournamentName: tournamentData.title,
                bannerUrl: tournamentData.bannerUrl,
                prizePool: tournamentData.prizePool,
                entryFee: tournamentData.entryFee,
                slotsTotal: tournamentData.maxTeams,
                slotsFilled: tournamentData.currentTeams || 0,
                organizerId: tournamentData.organizerId,
                organizerName: tournamentData.organizerName,
                isVerifiedHost: false, // TODO: check if verified
                status: tournamentData.status,
                startTime: tournamentData.startDate,
                autoGenerated: true,
                createdAt: new Date().toISOString()
            }

            await addDoc(collection(getFirebaseDb(), TOURNAMENT_CARDS_COLLECTION), card)
        } catch (error) {
            console.error("Error generating tournament card:", error)
            // Non-critical, just log it. Don't throw to avoid interrupting main flow if possible
        }
    }

    subscribeToTournamentCards(
        callback: (cards: TournamentCard[]) => void
    ): () => void {
        const q = query(
            collection(getFirebaseDb(), TOURNAMENT_CARDS_COLLECTION),
            orderBy('createdAt', 'desc'),
            limit(20)
        )

        return onSnapshot(q, (snapshot) => {
            const cards = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as TournamentCard))
            callback(cards)
        })
    }

    // ========================================
    // CLIPS
    // ========================================

    async uploadClip(userId: string, userName: string, userAvatar: string, videoUrl: string, thumbnailUrl: string, data: Partial<ClipPost>): Promise<string> {
        const canUpload = await this.checkPermission(userId, 'uploadClips')
        if (!canUpload) {
            throw new Error('Insufficient trust level to upload clips')
        }

        const trustLevel = await this.getUserTrustLevel(userId)
        const badges = await this.getUserBadges(userId)

        const clip: Omit<ClipPost, 'id'> = {
            userId,
            userName,
            userAvatar,
            trustLevel,
            badges,
            videoUrl,
            thumbnailUrl,
            duration: data.duration || 30,
            tournamentId: data.tournamentId || '',
            tournamentName: data.tournamentName || '',
            matchId: data.matchId,
            killCount: data.killCount,
            tags: data.tags || [],
            views: 0,
            likes: [],
            likeCount: 0,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }

        const docRef = await addDoc(collection(getFirebaseDb(), CLIPS_COLLECTION), clip)
        return docRef.id
    }

    subscribeToClips(
        filters: { gameId?: string; userId?: string },
        callback: (clips: ClipPost[]) => void
    ): () => void {
        let q = query(
            collection(getFirebaseDb(), CLIPS_COLLECTION),
            where('status', '==', 'active'),
            orderBy('createdAt', 'desc'),
            limit(20)
        )

        if (filters.userId) {
            q = query(q, where('userId', '==', filters.userId))
        }

        return onSnapshot(q, (snapshot) => {
            const clips = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as ClipPost))
            callback(clips)
        })
    }

    // ========================================
    // HELPER METHODS
    // ========================================

    private getGameName(gameId: string): string {
        const names: Record<string, string> = {
            freefire: 'Free Fire',
            bgmi: 'BGMI',
            valorant: 'Valorant',
            minecraft: 'Minecraft'
        }
        return names[gameId] || gameId
    }

    private getRoleName(role: string): string {
        const names: Record<string, string> = {
            sniper: 'Sniper',
            rusher: 'Rusher',
            support: 'Support',
            igl: 'In-Game Leader',
            any: 'Any Role'
        }
        return names[role] || role
    }

    // Auto-expire recruitment cards
    async cleanupExpiredCards(): Promise<void> {
        const now = new Date().toISOString()
        const q = query(
            collection(getFirebaseDb(), RECRUITMENT_COLLECTION),
            where('status', '==', 'active'),
            where('expiresAt', '<', now)
        )

        const snapshot = await getDocs(q)
        const batch = snapshot.docs.map(doc =>
            updateDoc(doc.ref, { status: 'expired' })
        )

        await Promise.all(batch)
    }
}

export const warRoomService = new WarRoomService()

