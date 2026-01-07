import express from 'express';
import admin from 'firebase-admin';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const db = admin.firestore();

// GET /api/tournaments - Get tournaments filtered by game and status
router.get('/', async (req, res) => {
    try {
        const { gameId, status } = req.query;

        let query = db.collection('tournaments');

        if (gameId) {
            query = query.where('gameId', '==', gameId);
        }

        if (status) {
            query = query.where('status', '==', status);
        }

        query = query.orderBy('startDate', 'asc');

        const snapshot = await query.get();
        const tournaments = [];

        snapshot.forEach(doc => {
            tournaments.push({
                id: doc.id,
                ...doc.data()
            });
        });

        res.json({ tournaments });
    } catch (error) {
        console.error('Error fetching tournaments:', error);
        res.status(500).json({ error: 'Failed to fetch tournaments' });
    }
});

// GET /api/tournaments/:id - Get single tournament
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await db.collection('tournaments').doc(id).get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Tournament not found' });
        }

        res.json({
            id: doc.id,
            ...doc.data()
        });
    } catch (error) {
        console.error('Error fetching tournament:', error);
        res.status(500).json({ error: 'Failed to fetch tournament' });
    }
});

// POST /api/tournaments/create - Create new tournament
router.post('/create', authenticateToken, async (req, res) => {
    try {
        const { uid, name } = req.user;
        const {
            gameId,
            gameName,
            title,
            description,
            startDate,
            registrationDeadline,
            maxTeams,
            teamSize,
            entryFee,
            prizeDistribution,
            format,
            mapMode,
            totalMatches
        } = req.body;

        // Validation
        if (!gameId || !title || !startDate || !registrationDeadline) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Calculate prize pool (will accumulate from entry fees)
        const initialPrizePool = 0;

        // Create tournament
        const tournamentRef = await db.collection('tournaments').add({
            gameId,
            gameName,
            title,
            description,
            organizerId: uid,
            organizerName: name || 'Unknown',
            startDate: admin.firestore.Timestamp.fromDate(new Date(startDate)),
            registrationDeadline: admin.firestore.Timestamp.fromDate(new Date(registrationDeadline)),
            maxTeams: parseInt(maxTeams),
            teamSize: parseInt(teamSize),
            currentTeams: 0,
            entryFee: parseFloat(entryFee),
            prizePool: initialPrizePool,
            prizeDistribution,
            status: 'upcoming',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            format,
            mapMode,
            totalMatches: parseInt(totalMatches)
        });

        res.status(201).json({
            tournamentId: tournamentRef.id,
            message: 'Tournament created successfully'
        });
    } catch (error) {
        console.error('Error creating tournament:', error);
        res.status(500).json({ error: 'Failed to create tournament' });
    }
});

// POST /api/tournaments/:id/join - Join tournament
router.post('/:id/join', authenticateToken, async (req, res) => {
    try {
        const { uid, name } = req.user;
        const { id } = req.params;
        const { teamName, players } = req.body;

        console.log(`[JOIN ATTEMPT] User: ${uid} (${name}) -> Tournament: ${id}`);
        console.log(`[JOIN DATA] Team: ${teamName}, Players: ${JSON.stringify(players)}`);

        // Use Firestore transaction for atomicity
        await db.runTransaction(async (transaction) => {
            const tournamentRef = db.collection('tournaments').doc(id);
            const tournamentDoc = await transaction.get(tournamentRef);

            if (!tournamentDoc.exists) {
                throw new Error('Tournament not found');
            }

            const tournament = tournamentDoc.data();
            console.log(`[JOIN CHECK] Status: ${tournament.status}, Teams: ${tournament.currentTeams}/${tournament.maxTeams}, Fee: ${tournament.entryFee}`);

            // Validations
            if (tournament.status !== 'upcoming') {
                throw new Error(`Tournament is not open for registration (Status: ${tournament.status})`);
            }

            if (tournament.currentTeams >= tournament.maxTeams) {
                throw new Error('Tournament is full');
            }

            const now = admin.firestore.Timestamp.now();
            if (now.toMillis() > tournament.registrationDeadline.toMillis()) {
                throw new Error('Registration deadline has passed');
            }

            // Check if user already joined - simplified check
            const existingParticipant = await db.collection('tournament_participants')
                .where('tournamentId', '==', id)
                .get();

            for (const doc of existingParticipant.docs) {
                const data = doc.data();
                if (data.players.some(p => p.userId === uid)) {
                    throw new Error('You have already joined this tournament');
                }
            }

            // Check wallet balance
            const walletRef = db.collection('wallets').doc(uid);
            const walletDoc = await transaction.get(walletRef);

            if (!walletDoc.exists) {
                throw new Error('Wallet not found');
            }

            const wallet = walletDoc.data();
            console.log(`[JOIN WALLET] Balance: ${wallet.balance}, Required: ${tournament.entryFee}`);

            if (Number(wallet.balance) < Number(tournament.entryFee)) {
                throw new Error(`Insufficient balance. Required: ₹${tournament.entryFee}, Available: ₹${wallet.balance}`);
            }

            // Deduct entry fee
            const newBalance = Number(wallet.balance) - Number(tournament.entryFee);
            transaction.update(walletRef, {
                balance: newBalance,
                transactions: admin.firestore.FieldValue.arrayUnion({
                    id: `txn_${Date.now()}`,
                    type: 'deduct',
                    amount: Number(tournament.entryFee),
                    description: `Joined tournament: ${tournament.title}`,
                    timestamp: now
                })
            });

            // Add participant
            const participantData = {
                tournamentId: id,
                teamName: teamName || null,
                teamLogo: null,
                players: players || [{ userId: uid, userName: name || 'Unknown', role: 'leader' }],
                paymentStatus: 'paid',
                paidAmount: Number(tournament.entryFee),
                paidAt: now,
                joinedAt: now
            };

            transaction.set(db.collection('tournament_participants').doc(), participantData);

            // Update tournament (increment teams, add to prize pool)
            transaction.update(tournamentRef, {
                currentTeams: admin.firestore.FieldValue.increment(1),
                prizePool: admin.firestore.FieldValue.increment(Number(tournament.entryFee)),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        });

        console.log('[JOIN SUCCESS] Transaction completed');
        res.json({ message: 'Successfully joined tournament' });
    } catch (error) {
        console.error('[JOIN ERROR]', error);
        res.status(400).json({ error: error.message || 'Failed to join tournament' });
    }
});

// POST /api/tournaments/:id/leave - Leave tournament
router.post('/:id/leave', authenticateToken, async (req, res) => {
    try {
        const { uid } = req.user;
        const { id } = req.params;

        await db.runTransaction(async (transaction) => {
            const tournamentRef = db.collection('tournaments').doc(id);
            const tournamentDoc = await transaction.get(tournamentRef);

            if (!tournamentDoc.exists) {
                throw new Error('Tournament not found');
            }

            const tournament = tournamentDoc.data();

            // Check if before deadline
            const now = admin.firestore.Timestamp.now();
            if (now.toMillis() > tournament.registrationDeadline.toMillis()) {
                throw new Error('Cannot leave after registration deadline');
            }

            // Find participant
            const participantSnapshot = await db.collection('tournament_participants')
                .where('tournamentId', '==', id)
                .get();

            let participantDoc = null;
            for (const doc of participantSnapshot.docs) {
                const data = doc.data();
                if (data.players.some(p => p.userId === uid)) {
                    participantDoc = doc;
                    break;
                }
            }

            if (!participantDoc) {
                throw new Error('You are not a participant in this tournament');
            }

            const participant = participantDoc.data();

            // Refund entry fee
            const walletRef = db.collection('wallets').doc(uid);
            transaction.update(walletRef, {
                balance: admin.firestore.FieldValue.increment(participant.paidAmount),
                transactions: admin.firestore.FieldValue.arrayUnion({
                    id: `txn_${Date.now()}`,
                    type: 'add',
                    amount: participant.paidAmount,
                    description: `Refund from: ${tournament.title}`,
                    timestamp: now
                })
            });

            // Delete participant
            transaction.delete(participantDoc.ref);

            // Update tournament
            transaction.update(tournamentRef, {
                currentTeams: admin.firestore.FieldValue.increment(-1),
                prizePool: admin.firestore.FieldValue.increment(-participant.paidAmount),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        });

        res.json({ message: 'Successfully left tournament. Entry fee refunded.' });
    } catch (error) {
        console.error('Error leaving tournament:', error);
        res.status(400).json({ error: error.message || 'Failed to leave tournament' });
    }
});

// GET /api/tournaments/:id/participants - Get tournament participants
router.get('/:id/participants', async (req, res) => {
    try {
        const { id } = req.params;

        const snapshot = await db.collection('tournament_participants')
            .where('tournamentId', '==', id)
            .orderBy('joinedAt', 'asc')
            .get();

        const participants = [];
        snapshot.forEach(doc => {
            participants.push({
                id: doc.id,
                ...doc.data()
            });
        });

        res.json({ participants });
    } catch (error) {
        console.error('Error fetching participants:', error);
        res.status(500).json({ error: 'Failed to fetch participants' });
    }
});

export default router;
