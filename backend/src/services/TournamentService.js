const Tournament = require('../models/Tournament.model');
const TournamentRegistration = require('../models/TournamentRegistration.model');
const mongoose = require('mongoose');

class TournamentService {
    async registerPlayer(tournamentId, userId, registrationData = {}) {
        const walletService = require('./WalletService');
        const Wallet = require('../models/Wallet.model'); // Keep for refund safety if needed

        if (!mongoose.Types.ObjectId.isValid(tournamentId)) {
            throw new Error('Invalid Tournament ID');
        }

        // 1. Get Tournament to check rules
        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) throw new Error('Tournament not found');

        // Check if user already joined
        const existingReg = await TournamentRegistration.findOne({ tournamentId, userId });
        if (existingReg) {
            // Ensure consistency in tournament.registeredPlayers array
            if (!tournament.registeredPlayers.includes(userId)) {
                await Tournament.updateOne({ _id: tournamentId }, { $addToSet: { registeredPlayers: userId } });
            }
            return { alreadyJoined: true, tournament };
        }

        // Business Rules Check
        if (tournament.status !== 'upcoming' && tournament.status !== 'live') {
            throw new Error(`Cannot join tournament with status: ${tournament.status}`);
        }

        if (tournament.registeredPlayers.length >= tournament.maxSlots) {
            throw new Error('Tournament is already full');
        }

        const entryFee = tournament.entryFee;
        let deducted = false;

        // 2. ATOMIC WALLET DEDUCTION via Service
        if (entryFee > 0) {
            try {
                await walletService.deductTournamentFee(userId, entryFee, tournamentId);
                deducted = true;
            } catch (err) {
                if (err.message.includes('Insufficient balance')) {
                    throw new Error('Insufficient wallet balance');
                }
                throw err;
            }
        }

        try {
            // 3. ATOMIC TOURNAMENT REGISTRATION
            const tournamentUpdate = await Tournament.updateOne(
                {
                    _id: tournamentId,
                    registeredPlayers: { $ne: userId },
                    $expr: { $lt: [{ $size: "$registeredPlayers" }, "$maxSlots"] }
                },
                { $addToSet: { registeredPlayers: userId } }
            );

            if (tournamentUpdate.modifiedCount === 0) {
                // If update failed, it means user joined elsewhere or full
                throw new Error('Failed to join: Tournament full or already registered');
            }

            // 4. Create Registration Record
            await TournamentRegistration.create({
                userId,
                tournamentId,
                joinedAt: new Date(),
                feePaid: entryFee,
                status: 'confirmed',
                teamName: registrationData.teamName || '',
                players: registrationData.players || []
            });

            // Return updated tournament
            const updatedTournament = await Tournament.findById(tournamentId);
            return { success: true, tournament: updatedTournament };

        } catch (error) {
            // 5. REFUND SAFETY: Revert wallet if tournament join failed
            if (deducted && entryFee > 0) {
                if (process.env.NODE_ENV !== 'production') {

                    console.warn(`Refunding user ${userId} for failed join ${tournamentId}`);

                }
                await walletService.creditPrize(userId, entryFee, tournamentId, 'Refund for failed join');
            }
            throw error;
        }
    }

    async createTournament(data) {
        // Ensure host info is present
        const tournamentData = {
            ...data,
            hostId: data.createdBy,
            // hostName should be passed in data, or we could fetch it, but passing from controller is more efficient
            hostName: data.hostName || 'Organizer'
        };
        const tournament = await Tournament.create(tournamentData);
        return { ...tournament.toObject(), id: tournament._id };
    }

    async getTournaments(filters) {
        const query = {};
        if (filters.game) query.game = filters.game;
        if (filters.status) query.status = filters.status;
        if (filters.mode) query.mode = filters.mode;
        // Organizer filter
        if (filters.organizerId) query.createdBy = filters.organizerId;

        // Optimized query: limit 50, sort by start time, return plain objects
        const tournaments = await Tournament.find(query)
            .sort({ startTime: -1 }) // Newest first
            .limit(50)
            .lean();

        // Map _id to id for frontend
        return tournaments.map(t => ({
            ...t,
            id: t._id,
            // Ensure array exists for safety
            registeredPlayers: t.registeredPlayers || []
        }));
    }

    async getTournamentById(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error('Invalid Tournament ID');
        }
        const tournament = await Tournament.findById(id).lean();
        if (tournament) {
            tournament.id = tournament._id;
        }
        return tournament;
    }
}

module.exports = new TournamentService();
