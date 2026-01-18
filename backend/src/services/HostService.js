const Host = require('../models/Host.model');
const HostRating = require('../models/HostRating.model');
const TournamentRegistration = require('../models/TournamentRegistration.model');
const Tournament = require('../models/Tournament.model');
const User = require('../models/User.model');

class HostService {
    async getHostProfile(hostId) {
        let host = await Host.findOne({ userId: hostId }).populate('userId');
        return host;
    }

    async ensureHostProfile(userId) {
        let host = await Host.findOne({ userId });
        if (!host) {
            // Check if user is eligible (subscriptionActive)
            const user = await User.findOne({ id: userId });
            if (user && (user.subscriptionActive || user.role === 'admin')) {
                host = await Host.create({ userId });
            }
        }
        return host;
    }

    async rateHost(hostId, userId, stars, reviewText) {
        // 1. Check if player has joined any tournament by this host
        const tournamentsByHost = await Tournament.find({ createdBy: hostId }, '_id');
        const tournamentIds = tournamentsByHost.map(t => t._id);

        const hasJoined = await TournamentRegistration.findOne({
            userId,
            tournamentId: { $in: tournamentIds }
        });

        if (!hasJoined) {
            throw new Error('Only players who participated in at least one tournament by this host can rate.');
        }

        // 2. Create or Update Rating
        const rating = await HostRating.findOneAndUpdate(
            { hostId, userId },
            { stars, reviewText },
            { upsert: true, new: true, runValidators: true }
        );

        // 3. Recalculate average rating for the Host
        const ratings = await HostRating.find({ hostId });
        const totalStars = ratings.reduce((sum, r) => sum + r.stars, 0);
        const average = totalStars / ratings.length;

        await Host.findOneAndUpdate(
            { userId: hostId },
            {
                ratingAverage: average,
                ratingCount: ratings.length
            }
        );

        return rating;
    }

    async getHostTournaments(hostId) {
        return await Tournament.find({ createdBy: hostId }).sort({ createdAt: -1 });
    }
}

module.exports = new HostService();
