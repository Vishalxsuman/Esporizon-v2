const hostService = require('../services/HostService');
const userService = require('../services/UserService');

const hostController = {
    /**
     * POST /activate
     * Activate user as host (FREE)
     */
    activate: async (req, res, next) => {
        try {
            const userId = req.user?.id;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User authentication required'
                });
            }

            // Update user role to 'host'
            const user = await userService.updateUserRole(userId, 'host');

            // Ensure host profile exists
            const hostProfile = await hostService.ensureHostProfile(userId);

            res.json({
                success: true,
                message: 'Host activated successfully',
                isHost: true,
                hostId: userId,
                hostProfile: hostProfile
            });
        } catch (err) {
            console.error('Host activation error:', err);
            res.status(200).json({
                success: false,
                message: 'Failed to activate host status'
            });
        }
    },

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
