import { Tournament, CreateTournamentDto, JoinTournamentDto, TournamentParticipant } from '@/types/tournament'
import { auth, db } from '@/config/firebase'
import {
    collection,
    addDoc,
    getDoc,
    getDocs,
    doc,
    query,
    where,
    orderBy,
    serverTimestamp,
    Timestamp,
    runTransaction,
    arrayUnion,
    increment
} from 'firebase/firestore'

export const tournamentService = {
    // Get tournaments by game and status
    async getTournaments(gameId?: string, status?: string): Promise<Tournament[]> {
        try {
            const tournamentsRef = collection(db, 'tournaments')
            let q = query(tournamentsRef)

            if (gameId) {
                q = query(q, where('gameId', '==', gameId))
            }

            if (status) {
                q = query(q, where('status', '==', status))
            }

            q = query(q, orderBy('startDate', 'asc'))

            const snapshot = await getDocs(q)
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Tournament[]
        } catch (error) {
            console.error('Error fetching tournaments:', error)
            throw new Error('Failed to fetch tournaments')
        }
    },

    // Get single tournament
    async getTournament(id: string): Promise<Tournament> {
        try {
            const tournamentDoc = await getDoc(doc(db, 'tournaments', id))
            if (!tournamentDoc.exists()) throw new Error('Tournament not found')

            return {
                id: tournamentDoc.id,
                ...tournamentDoc.data()
            } as Tournament
        } catch (error) {
            console.error('Error fetching tournament:', error)
            throw error
        }
    },

    // Create tournament
    async createTournament(data: CreateTournamentDto): Promise<{ tournamentId: string }> {
        const user = auth.currentUser
        if (!user) throw new Error('Not authenticated')

        try {
            const tournamentData = {
                ...data,
                organizerId: user.uid,
                organizerName: user.displayName || 'Unknown',
                currentTeams: 0,
                prizePool: 0,
                status: 'upcoming',
                startDate: Timestamp.fromDate(new Date(data.startDate)),
                registrationDeadline: Timestamp.fromDate(new Date(data.registrationDeadline)),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            }

            const docRef = await addDoc(collection(db, 'tournaments'), tournamentData)
            return { tournamentId: docRef.id }
        } catch (error) {
            console.error('Error creating tournament:', error)
            throw new Error('Failed to create tournament')
        }
    },

    // Join tournament
    async joinTournament(tournamentId: string, data: JoinTournamentDto): Promise<void> {
        const user = auth.currentUser
        if (!user) throw new Error('Not authenticated')

        const { uid, displayName } = user
        const { teamName, players } = data

        try {
            await runTransaction(db, async (transaction) => {
                const tournamentRef = doc(db, 'tournaments', tournamentId)
                const tournamentDoc = await transaction.get(tournamentRef)

                if (!tournamentDoc.exists()) {
                    throw new Error('Tournament not found')
                }

                const tournament = tournamentDoc.data() as Tournament

                // Validations
                if (tournament.status !== 'upcoming') {
                    throw new Error(`Tournament is not open for registration (Status: ${tournament.status})`)
                }

                if (tournament.currentTeams >= tournament.maxTeams) {
                    throw new Error('Tournament is full')
                }

                // Wallet check
                const walletRef = doc(db, 'wallets', uid)
                const walletDoc = await transaction.get(walletRef)

                if (!walletDoc.exists()) {
                    throw new Error('Wallet not found')
                }

                const wallet = walletDoc.data()
                if (Number(wallet.balance) < Number(tournament.entryFee)) {
                    throw new Error(`Insufficient balance. Required: ₹${tournament.entryFee}`)
                }

                // Deduct balance and add transaction
                transaction.update(walletRef, {
                    balance: increment(-Number(tournament.entryFee)),
                    transactions: arrayUnion({
                        id: `txn_${Date.now()}`,
                        type: 'deduct',
                        amount: Number(tournament.entryFee),
                        description: `Joined tournament: ${tournament.title}`,
                        timestamp: Timestamp.now()
                    })
                })

                // Add participant
                const participantRef = doc(collection(db, 'tournament_participants'))
                transaction.set(participantRef, {
                    tournamentId,
                    teamName: teamName || null,
                    players: players || [{ userId: uid, userName: displayName || 'Unknown', role: 'leader' }],
                    paymentStatus: 'paid',
                    paidAmount: Number(tournament.entryFee),
                    joinedAt: serverTimestamp()
                })

                // Update tournament
                transaction.update(tournamentRef, {
                    currentTeams: increment(1),
                    prizePool: increment(Number(tournament.entryFee)),
                    updatedAt: serverTimestamp()
                })
            })
        } catch (error) {
            console.error('Error joining tournament:', error)
            throw error
        }
    },

    // Leave tournament (simplified for prototype)
    async leaveTournament(_tournamentId: string): Promise<void> {
        console.warn('Leave tournament logic should be handled with care regarding refunds')
        throw new Error('Leave functionality is handled via support for now to ensure secure refunds')
    },

    // Get participants
    async getParticipants(tournamentId: string): Promise<TournamentParticipant[]> {
        try {
            const q = query(
                collection(db, 'tournament_participants'),
                where('tournamentId', '==', tournamentId),
                orderBy('joinedAt', 'asc')
            )
            const snapshot = await getDocs(q)
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as TournamentParticipant[]
        } catch (error) {
            console.error('Error fetching participants:', error)
            throw new Error('Failed to fetch participants')
        }
    }
}
