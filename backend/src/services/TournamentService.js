const Tournament = require('../models/Tournament.model');
const TournamentRegistration = require('../models/TournamentRegistration.model');
const mongoose = require('mongoose');

class TournamentService {
    async registerPlayer(tournamentId, userId) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // 1. Find tournament with lock (using session)
            const tournament = await Tournament.findById(tournamentId).session(session);
            if (!tournament) throw new Error('Tournament not found');

            // 2. Business Rules Check
            if (tournament.status !== 'upcoming') {
                throw new Error(`Cannot join tournament with status: ${tournament.status}`);
            }

            if (tournament.registeredPlayers.length >= tournament.maxSlots) {
                throw new Error('Tournament is already full');
            }

            if (tournament.registeredPlayers.includes(userId)) {
                throw new Error('User is already registered for this tournament');
            }

            // 3. Atomically update Tournament and create Registration
            tournament.registeredPlayers.push(userId);
            await tournament.save({ session });

            await TournamentRegistration.create([{
                userId,
                tournamentId,
                joinedAt: new Date()
            }], { session });

            await session.commitTransaction();
            return tournament;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    async createTournament(data) {
        return await Tournament.create(data);
    }

    async getTournaments(filters) {
        const query = {};
        if (filters.game) query.game = filters.game;
        if (filters.status) query.status = filters.status;
        if (filters.mode) query.mode = filters.mode;

        return await Tournament.find(query).sort({ startTime: 1 });
    }

    async getTournamentById(id) {
        return await Tournament.findById(id);
    }
}

module.exports = new TournamentService();
