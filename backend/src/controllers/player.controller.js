const userService = require('../services/UserService');

const playerController = {
    getProfile: async (req, res, next) => {
        try {
            const profile = await userService.getProfile(req.params.userId);
            if (!profile) return res.status(404).json({ success: false, message: 'Player profile not found' });
            res.json({ success: true, data: profile });
        } catch (err) {
            next(err);
        }
    },

    getTournaments: async (req, res, next) => {
        try {
            const tournaments = await userService.getUserTournaments(req.params.userId);
            res.json({ success: true, count: tournaments.length, data: tournaments });
        } catch (err) {
            next(err);
        }
    }
};

module.exports = playerController;
