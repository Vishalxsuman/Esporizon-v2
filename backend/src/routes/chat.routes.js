const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat.model');
const User = require('../models/User.model');

// GET /api/chats - List all chats for current user
router.get('/', async (req, res) => {
    try {
        const userId = req.user.id;

        // Find chats where user is a participant
        const chats = await Chat.find({ participants: userId })
            .sort({ updatedAt: -1 })
            .limit(50); // Pagination in proper app

        // We need to fetch participant details (avatar, username)
        // Optimization: Get unique participant IDs first
        const participantIds = [...new Set(chats.flatMap(c => c.participants))];
        const users = await User.find({ id: { $in: participantIds } })
            .select('id username profile.avatarUrl profile.displayName profile.title');

        const userMap = users.reduce((acc, u) => {
            acc[u.id] = {
                username: u.username,
                displayName: u.profile?.displayName || u.username,
                avatar: u.profile?.avatarUrl,
                title: u.profile?.title || 'Rookie'
            };
            return acc;
        }, {});

        // Format for frontend
        const formattedChats = chats.map(chat => {
            const friendId = chat.participants.find(p => p !== userId) || userId; // Self chat edge case
            const friend = userMap[friendId] || { username: 'Unknown', displayName: 'Unknown' };

            // Calculate unread
            // Simple logic: count messages where sender != me AND readBy does not include me
            // Note: In a huge array this is slow, but for MVP/Chat schema limit it's fine.
            const unreadCount = chat.messages.filter(m =>
                m.senderId !== userId && !m.readBy?.includes(userId)
            ).length;

            const lastMsg = chat.messages[chat.messages.length - 1];

            return {
                _id: chat._id,
                friendId,
                friendName: friend.displayName,
                friendUsername: friend.username,
                friendAvatar: friend.avatar,
                friendRank: friend.title,
                lastMessage: lastMsg ? lastMsg.text : 'Start a conversation',
                lastMessageTime: lastMsg ? lastMsg.createdAt : chat.createdAt,
                unreadCount
            };
        });

        res.json(formattedChats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// GET /api/chats/:friendId - Get or Create Chat with specific friend
router.get('/:friendId', async (req, res) => {
    try {
        const userId = req.user.id;
        const { friendId } = req.params;

        if (userId === friendId) {
            return res.status(400).json({ message: 'Cannot chat with self' });
        }

        // Find existing chat
        let chat = await Chat.findOne({
            participants: { $all: [userId, friendId], $size: 2 }
        });

        if (!chat) {
            // Create new
            const friend = await User.findOne({ id: friendId });
            if (!friend) return res.status(404).json({ message: 'User not found' });

            chat = new Chat({
                participants: [userId, friendId],
                messages: []
            });
            await chat.save();
        }

        // Format for full view
        // return messages
        res.json({
            _id: chat._id,
            messages: chat.messages,
            participants: chat.participants
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// POST /api/chats/send - Send a message
router.post('/send', async (req, res) => {
    try {
        const userId = req.user.id;
        const { chatId, text, friendId } = req.body;

        let chat;

        if (chatId) {
            chat = await Chat.findById(chatId);
        } else if (friendId) {
            chat = await Chat.findOne({
                participants: { $all: [userId, friendId], $size: 2 }
            });
            if (!chat) {
                chat = new Chat({
                    participants: [userId, friendId],
                    messages: []
                });
            }
        }

        if (!chat) return res.status(404).json({ message: 'Chat not found' });

        const newMessage = {
            senderId: userId,
            text,
            createdAt: new Date(),
            readBy: [userId]
        };

        chat.messages.push(newMessage);
        await chat.save();

        res.json(newMessage);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to send' });
    }
});

// POST /api/chats/read - Mark messages as read
router.post('/read', async (req, res) => {
    try {
        const userId = req.user.id;
        const { chatId } = req.body;

        const chat = await Chat.findById(chatId);
        if (!chat) return res.status(404).json({ message: 'Chat not found' });

        // Update all messages where I am not sender and I haven't read
        let updated = false;
        chat.messages.forEach(msg => {
            if (msg.senderId !== userId && !msg.readBy.includes(userId)) {
                msg.readBy.push(userId);
                updated = true;
            }
        });

        if (updated) await chat.save();

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: 'Error' });
    }
});

module.exports = router;
