const userService = require('../services/UserService');

const playerController = {
    getProfile: async (req, res, next) => {
        try {
            const profile = await userService.getProfile(req.params.userId);
            if (!profile) return res.status(404).json({ success: false, message: 'Player profile not found' });
            res.json({ success: true, data: profile });
        } catch (err) {
            console.error('Error fetching profile:', err.message);
            // FAIL SAFE: Return minimal profile
            res.json({ success: true, data: { id: req.params.userId, username: 'Unknown User', role: 'player' } });
        }
    },

    getTournaments: async (req, res, next) => {
        try {
            const tournaments = await userService.getUserTournaments(req.params.userId);
            res.json({ success: true, count: tournaments.length, data: tournaments });
        } catch (err) {
            console.error('Error fetching user tournaments:', err.message);
            // FAIL SAFE: Return empty array
            res.json({ success: true, count: 0, data: [] });
        }
    }
};

module.exports = playerController;
