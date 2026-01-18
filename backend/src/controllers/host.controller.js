const hostService = require('../services/HostService');
const userService = require('../services/UserService');

const hostController = {
    getProfile: async (req, res, next) => {
        try {
            const host = await hostService.getHostProfile(req.params.hostId);
            if (!host) return res.status(404).json({ success: false, message: 'Host not found' });
            res.json({ success: true, data: host });
        } catch (err) {
            next(err);
        }
    },

    getTournaments: async (req, res, next) => {
        try {
            const tournaments = await hostService.getHostTournaments(req.params.hostId);
            res.json({ success: true, count: tournaments.length, data: tournaments });
        } catch (err) {
            next(err);
        }
    },

    rate: async (req, res, next) => {
        try {
            const { user } = req;
            const { hostId } = req.params;
            const { stars, reviewText } = req.body;

            if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });

            // Ensure player exists in our DB
            await userService.ensureUser({
                id: user.id,
                username: req.body.username || 'Reviewer',
                role: user.role,
                subscriptionActive: user.subscriptionActive
            });

            const rating = await hostService.rateHost(hostId, user.id, stars, reviewText);
            res.json({ success: true, message: 'Rating submitted successfully', data: rating });
        } catch (err) {
            if (err.message.includes('Only players who participated')) {
                return res.status(403).json({ success: false, message: err.message });
            }
            next(err);
        }
    }
};

module.exports = hostController;
