const tournamentService = require('../services/TournamentService');
const hostService = require('../services/HostService');
const userService = require('../services/UserService');

const tournamentController = {
    getAll: async (req, res, next) => {
        try {
            const filters = req.query;
            const tournaments = await tournamentService.getTournaments(filters);
            res.json({ success: true, count: tournaments.length, data: tournaments });
        } catch (err) {
            next(err);
        }
    },

    getById: async (req, res, next) => {
        try {
            const tournament = await tournamentService.getTournamentById(req.params.id);
            if (!tournament) return res.status(404).json({ success: false, message: 'Tournament not found' });
            res.json({ success: true, data: tournament });
        } catch (err) {
            next(err);
        }
    },

    create: async (req, res, next) => {
        try {
            const { user } = req;
            if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });

            // 1. Ensure User exists in our DB (Lazy sync from Auth)
            await userService.ensureUser({
                id: user.id,
                username: req.body.username || 'Anonymous', // Should come from req.user usually
                role: user.role,
                subscriptionActive: user.subscriptionActive
            });

            // 2. Business Rule: Only hosts can create
            if (user.role !== 'host' && user.role !== 'admin') {
                return res.status(403).json({ success: false, message: 'Only hosts can create tournaments' });
            }

            // 3. Subscription Check & Host Profile
            const host = await hostService.ensureHostProfile(user.id);
            if (!host) {
                return res.status(403).json({ success: false, message: 'Host subscription required' });
            }

            // 4. Create Tournament
            const tournament = await tournamentService.createTournament({
                ...req.body,
                createdBy: user.id
            });

            // 5. Update Host stats
            host.totalTournaments += 1;
            await host.save();

            res.status(201).json({ success: true, data: tournament });
        } catch (err) {
            next(err);
        }
    },

    register: async (req, res, next) => {
        try {
            const { user } = req;
            if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });

            // Ensure User exists
            await userService.ensureUser({
                id: user.id,
                username: req.body.username || 'Player',
                role: user.role,
                subscriptionActive: user.subscriptionActive
            });

            const tournament = await tournamentService.registerPlayer(req.params.id, user.id);
            res.json({ success: true, message: 'Successfully registered', data: tournament });
        } catch (err) {
            next(err);
        }
    }
};

module.exports = tournamentController;
