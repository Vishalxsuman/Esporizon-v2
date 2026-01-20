const tournamentService = require('../services/TournamentService');
const hostService = require('../services/HostService');
const userService = require('../services/UserService');
const Tournament = require('../models/Tournament.model');

const tournamentController = {
    getAll: async (req, res, next) => {
        try {
            const filters = req.query;
            const tournaments = await tournamentService.getTournaments(filters);
            res.json({ success: true, count: tournaments.length, data: tournaments });
        } catch (err) {
            console.error('Error fetching tournaments:', err.message);
            // FAIL SAFE: Return empty array instead of error
            res.status(200).json({ success: true, count: 0, data: [] });
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
                createdBy: user.id,
                hostName: user.username || 'Classic Host' // Pass username as hostName
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

            // Pass req.body (teamName, players) to service
            const result = await tournamentService.registerPlayer(req.params.id, user.id, req.body);
            res.json({
                success: true,
                message: result.alreadyJoined ? 'Already joined' : 'Successfully registered',
                alreadyJoined: !!result.alreadyJoined,
                data: result.tournament
            });
        } catch (err) {
            next(err);
        }
    },

    getAllParticipants: async (req, res, next) => {
        try {
            const TournamentRegistration = require('../models/TournamentRegistration.model');
            const participants = await TournamentRegistration.find({ tournamentId: req.params.id });
            res.json({ success: true, data: participants });
        } catch (err) {
            next(err);
        }
    },

    getJoinStatus: async (req, res, next) => {
        try {
            const { user } = req;
            const { id } = req.params;
            if (!user) return res.json({ success: true, joined: false });

            const TournamentRegistration = require('../models/TournamentRegistration.model');
            const reg = await TournamentRegistration.findOne({ tournamentId: id, userId: user.id });

            res.json({
                success: true,
                joined: !!reg,
                participant: reg
            });
        } catch (err) {
            next(err);
        }
    },

    getUserHistory: async (req, res, next) => {
        try {
            const { id } = req.params; // userId
            // Security: Only allow user to view own history unless admin
            if (req.user.id !== id && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Unauthorized' });
            }

            const TournamentRegistration = require('../models/TournamentRegistration.model');
            const Tournament = require('../models/Tournament.model');

            // Get registrations to find joined tournaments
            const registrations = await TournamentRegistration.find({ userId: id })
                .populate({
                    path: 'tournamentId',
                    select: 'name title game gameId gameName status entryFee prizePool startTime maxSlots registeredPlayers currentTeams organizerName organizerId'
                })
                .lean();

            // Get hosted tournaments
            const hosted = await Tournament.find({
                $or: [{ createdBy: id }, { hostId: id }]
            }).lean();

            // Format joined tournaments
            const joined = registrations
                .filter(r => r.tournamentId) // Filter out deleted tournaments
                .map(r => {
                    const t = r.tournamentId;
                    return {
                        ...t,
                        id: t._id,
                        teamName: r.teamName
                    };
                });

            // Format hosted tournaments
            const hostedFormatted = hosted.map(t => ({
                ...t,
                id: t._id
            }));

            res.json({
                success: true,
                data: {
                    joined: joined,
                    hosted: hostedFormatted
                }
            });
        } catch (err) {
            next(err);
        }
    },

    updateRoomDetails: async (req, res) => {
        try {
            const { id } = req.params;
            const { roomId, password, server, map } = req.body;
            const userId = req.user.id;

            const tournament = await Tournament.findById(id);
            if (!tournament) return res.status(404).json({ message: 'Tournament not found' });

            if (tournament.createdBy !== userId && tournament.hostId !== userId) {
                return res.status(403).json({ message: 'Only host can update room details' });
            }

            tournament.roomDetails = { roomId, password, server, map };
            await tournament.save();

            // Auto-post to chat
            const TournamentChat = require('../models/TournamentChat.model');
            await TournamentChat.create({
                tournamentId: id,
                userId: userId,
                userName: tournament.hostName || 'Host',
                userRole: 'host',
                message: `🎮 **ROOM DETAILS UPDATED** 🎮\nID: ${roomId}\nPass: ${password}\nServer: ${server}\nMap: ${map}`,
                isPinned: true,
                pinnedAt: new Date()
            });

            res.status(200).json({ success: true, data: tournament.roomDetails });
        } catch (error) {
            console.error('Update room error:', error);
            res.status(500).json({ message: 'Failed to update room details' });
        }
    },

    updateStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const userId = req.user.id;

            const tournament = await Tournament.findById(id);
            if (!tournament) return res.status(404).json({ message: 'Tournament not found' });

            if (tournament.createdBy !== userId && tournament.hostId !== userId) {
                return res.status(403).json({ message: 'Unauthorized' });
            }

            tournament.status = status;
            await tournament.save();

            res.status(200).json({ success: true, data: { status } });
        } catch (error) {
            res.status(500).json({ message: 'Failed to update status' });
        }
    },

    publishResults: async (req, res) => {
        try {
            const { id } = req.params;
            const { results } = req.body; // Array of { userId, rank, kills, prize }
            const userId = req.user.id;

            const tournament = await Tournament.findById(id);
            if (tournament.createdBy !== userId && tournament.hostId !== userId) {
                return res.status(403).json({ message: 'Unauthorized' });
            }

            tournament.results = results;
            tournament.status = 'completed'; // Auto-complete
            await tournament.save();

            res.status(200).json({ success: true, message: 'Results published' });
        } catch (error) {
            res.status(500).json({ message: 'Failed to publish results' });
        }
    },
    updateLiveStream: async (req, res) => {
        try {
            const { id } = req.params;
            const { isLive, youtubeUrl } = req.body;
            const userId = req.user.id;

            // Basic Validation
            if (isLive === true) {
                if (!youtubeUrl) {
                    return res.status(400).json({ message: 'YouTube URL is required when expanding live stream' });
                }
                if (!youtubeUrl.match(/(youtube\.com|youtu\.be)/)) {
                    return res.status(400).json({ message: 'Invalid YouTube URL' });
                }
            }

            const tournament = await Tournament.findById(id);
            if (!tournament) return res.status(404).json({ message: 'Tournament not found' });

            if (tournament.createdBy !== userId && tournament.hostId !== userId) {
                return res.status(403).json({ message: 'Only host can manage live stream' });
            }

            // Update Logic
            if (isLive) {
                tournament.liveStream = {
                    isLive: true,
                    youtubeUrl: youtubeUrl
                };
                tournament.status = 'live'; // Sync status for frontend badges
            } else {
                tournament.liveStream = {
                    isLive: false,
                    youtubeUrl: null
                };
                // Revert status if it was live
                if (tournament.status === 'live') {
                    tournament.status = 'upcoming';
                }
            }

            await tournament.save();

            const Post = require('../models/Post.model');

            // Manage Feed Post
            if (isLive) {
                const existingPost = await Post.findOne({ tournamentId: id, type: 'live_stream' });

                if (!existingPost) {
                    await Post.create({
                        author: userId,
                        authorName: tournament.hostName || 'Esporizon Host',
                        authorUsername: 'System',
                        authorAvatar: 'https://cdn-icons-png.flaticon.com/512/3669/3669968.png',
                        content: `${tournament.name} is LIVE now!`,
                        type: 'live_stream',
                        tournamentId: id,
                        tournamentName: tournament.name,
                        game: tournament.game,
                        youtubeUrl: youtubeUrl,
                        isOfficial: true
                    });
                } else {
                    existingPost.youtubeUrl = youtubeUrl;
                    await existingPost.save();
                }

                // Notify via Chat (System message)
                const TournamentChat = require('../models/TournamentChat.model');
                await TournamentChat.create({
                    tournamentId: id,
                    userId: userId,
                    userName: 'System',
                    userRole: 'admin',
                    message: `🔴 **LIVE STREAM STARTED** 🔴\nWatch here: ${youtubeUrl}`,
                    isPinned: true,
                    pinnedAt: new Date()
                });
            } else {
                await Post.deleteMany({ tournamentId: id, type: 'live_stream' });
            }

            res.status(200).json({
                success: true,
                liveStream: tournament.liveStream
            });
        } catch (error) {
            console.error('Update live stream error:', error);
            res.status(500).json({ message: 'Failed to update live stream' });
        }
    }
};

module.exports = tournamentController;
