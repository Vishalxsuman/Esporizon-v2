const User = require('../models/User.model');
const TournamentRegistration = require('../models/TournamentRegistration.model');
const Tournament = require('../models/Tournament.model');

class UserService {
    async getProfile(userId) {
        return await User.findOne({ id: userId });
    }

    async getUserTournaments(userId) {
        // Find registrations and populate tournament info
        const registrations = await TournamentRegistration.find({ userId })
            .populate('tournamentId')
            .sort({ joinedAt: -1 });

        return registrations.map(r => r.tournamentId);
    }

    async ensureUser(data) {
        let user = await User.findOne({ id: data.id });
        if (!user) {
            user = await User.create(data);
        }
        return user;
    }
}

module.exports = new UserService();
