const TournamentChat = require('../models/TournamentChat.model');
const Tournament = require('../models/Tournament.model');

const chatController = {
    // GET /api/tournaments/:id/chat
    getMessages: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            // Check Access
            const tournament = await Tournament.findById(id);
            if (!tournament) return res.status(404).json({ message: 'Tournament not found' });

            const isHost = tournament.createdBy === userId || tournament.hostId === userId;
            const TournamentRegistration = require('../models/TournamentRegistration.model');
            const isParticipant = await TournamentRegistration.exists({ tournamentId: id, userId });

            if (!isHost && !isParticipant) {
                return res.status(403).json({ message: 'Access denied: Must join tournament to view chat' });
            }

            if (process.env.NODE_ENV !== 'production') {


                console.log(`[CHAT_DEBUG] Fetching messages for tournament: ${id}`);


            }
            const messages = await TournamentChat.find({ tournamentId: id })
                .sort({ createdAt: 1 }) // Oldest first
                .limit(500); // Limit to last 500 messages for header safety

            if (process.env.NODE_ENV !== 'production') {


                console.log(`[CHAT_DEBUG] Found ${messages.length} messages for ${id}`);


            }
            res.status(200).json({ success: true, data: messages });
        } catch (error) {
            console.error('[CHAT_DEBUG] Get messages error:', error);
            res.status(500).json({ message: 'Failed to fetch messages' });
        }
    },

    // POST /api/tournaments/:id/chat
    sendMessage: async (req, res) => {
        try {
            const { id } = req.params;
            const { message } = req.body;
            const userId = req.user.id;
            const userName = req.user.displayName || req.user.username || 'User';
            const avatarUrl = req.user.avatarUrl || '';

            // Check Access
            const tournament = await Tournament.findById(id);
            if (!tournament) return res.status(404).json({ message: 'Tournament not found' });

            // Determine role
            const isHost = tournament.createdBy === userId || tournament.hostId === userId;
            const TournamentRegistration = require('../models/TournamentRegistration.model');
            const isParticipant = await TournamentRegistration.exists({ tournamentId: id, userId });

            if (!isHost && !isParticipant) {
                return res.status(403).json({ message: 'Access denied: Must join tournament to post messages' });
            }

            const role = isHost ? 'host' : 'player';

            if (process.env.NODE_ENV !== 'production') {


                console.log(`[CHAT_DEBUG] Saving message. User: ${userName} (${userId}), Role: ${role}, Msg: ${message}`);


            }

            const newMsg = await TournamentChat.create({
                tournamentId: id,
                userId,
                userName,
                userAvatar: avatarUrl,
                userRole: role,
                message
            });

            if (process.env.NODE_ENV !== 'production') {


                console.log(`[CHAT_DEBUG] Message saved. ID: ${newMsg._id}`);


            }

            res.status(201).json({ success: true, data: newMsg });
        } catch (error) {
            console.error('[CHAT_DEBUG] Send message error:', error);
            res.status(500).json({ message: 'Failed to send message' });
        }
    },

    // PATCH /api/tournaments/:id/chat/:messageId/pin
    togglePin: async (req, res) => {
        try {
            const { id, messageId } = req.params;
            const userId = req.user.id;

            const tournament = await Tournament.findById(id);
            if (!tournament) return res.status(404).json({ message: 'Tournament not found' });

            // Strict Host Check
            if (tournament.createdBy !== userId && tournament.hostId !== userId) {
                return res.status(403).json({ message: 'Only host can pin messages' });
            }

            const msg = await TournamentChat.findOne({ _id: messageId, tournamentId: id });
            if (!msg) return res.status(404).json({ message: 'Message not found' });

            msg.isPinned = !msg.isPinned;
            if (msg.isPinned) msg.pinnedAt = new Date();

            await msg.save();

            res.status(200).json({ success: true, data: msg });
        } catch (error) {
            console.error('Pin message error:', error);
            res.status(500).json({ message: 'Failed to pin message' });
        }
    }
};

module.exports = chatController;
