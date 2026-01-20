const express = require('express');
const router = express.Router();
const User = require('../models/User.model');

// For simplicity, we'll just manipulate the 'friends' array on User model directly for now.
// A more complex system would have a FriendRequest model. 
// Let's implement immediate adding for MVP context or a simple request flow?
// Prompt says: POST /api/friends/request, POST /api/friends/accept.
// So I should mock the request flow or store it.
// I'll add 'friendRequests' to User model in a bit or just assume immediate add for now if I want to be fast, 
// BUT the prompt is specific.
// Let's stick to "Add Friend" = "Add to friends list" for simplicity provided we don't have a Request model yet.
// Wait, prompt says "Friend System... POST /request... POST /accept".
// I will simulate request/accept by checking if the other person has added you?
// Actually, let's just make "Request" add to a 'incomingRequests' array on the target user.

// I need to update User model to have 'incomingRequests' if I want to do this properly.
// Or I can build a simple "Follow" system where you just add them.
// "No duplicate friends" - "Cannot add self".
/**
 * FEATURE: Friend Request System
 * 1. Send Request via Username
 * 2. Accept Request
 * 3. Reject Request
 * 4. List Incoming Requests
 * 5. List Friends
 */

// GET /requests - List incoming friend requests
router.get('/requests', async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findOne({ id: userId });

        if (!user) return res.status(404).json({ message: 'User not found' });

        // Fetch details of users who sent requests
        // Note: In real app better to populate reference, but we use UIDs
        const requestUsers = await User.find({ id: { $in: user.friendRequests } })
            .select('id username profile.avatarUrl profile.displayName profile.title');

        const formattedRequests = requestUsers.map(u => ({
            uid: u.id,
            username: u.username,
            displayName: u.profile?.displayName || u.username,
            avatar: u.profile?.avatarUrl,
            title: u.profile?.title || 'Rookie'
        }));

        res.json(formattedRequests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// POST /request - Send Friend Request
router.post('/request', async (req, res) => {
    try {
        const { targetUsername } = req.body;
        const senderId = req.user.id;

        const sender = await User.findOne({ id: senderId });
        const target = await User.findOne({ username: targetUsername });

        if (!target) return res.status(404).json({ message: 'User not found' });
        if (target.id === senderId) return res.status(400).json({ message: 'Cannot add yourself' });

        // Check if already friends
        if (sender.friends.includes(target.id)) {
            return res.status(400).json({ message: 'Already friends' });
        }

        // Check if request already sent
        if (target.friendRequests.includes(senderId)) {
            return res.status(400).json({ message: 'Request already sent' });
        }

        // Check if target already sent request to sender (Mutual add scenario?)
        // For strict flow, we just accept it automatically? Or warn?
        // Let's stick to request flow.

        // Add to target's incoming requests
        target.friendRequests.push(senderId);
        await target.save();

        // Add to sender's sent requests
        sender.sentFriendRequests.push(target.id);
        await sender.save();

        res.json({ success: true, message: 'Friend request sent' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// POST /accept - Accept Friend Request
router.post('/accept', async (req, res) => {
    try {
        const { requesterUid } = req.body;
        const acceptorId = req.user.id;

        const acceptor = await User.findOne({ id: acceptorId });
        const requester = await User.findOne({ id: requesterUid });

        if (!requester || !acceptor) return res.status(404).json({ message: 'User not found' });

        // Verify request exists
        if (!acceptor.friendRequests.includes(requesterUid)) {
            return res.status(400).json({ message: 'No request from this user' });
        }

        // Add to both friends lists
        acceptor.friends.push(requesterUid);
        requester.friends.push(acceptorId);

        // Remove from requests lists
        acceptor.friendRequests = acceptor.friendRequests.filter(id => id !== requesterUid);
        requester.sentFriendRequests = requester.sentFriendRequests.filter(id => id !== acceptorId);

        await acceptor.save();
        await requester.save();

        res.json({ success: true, message: 'Friend request accepted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// POST /reject - Reject Friend Request
router.post('/reject', async (req, res) => {
    try {
        const { requesterUid } = req.body;
        const rejectorId = req.user.id;

        const rejector = await User.findOne({ id: rejectorId });
        const requester = await User.findOne({ id: requesterUid });

        // Remove from lists
        if (rejector) {
            rejector.friendRequests = rejector.friendRequests.filter(id => id !== requesterUid);
            await rejector.save();
        }

        if (requester) {
            requester.sentFriendRequests = requester.sentFriendRequests.filter(id => id !== rejectorId);
            await requester.save();
        }

        res.json({ success: true, message: 'Friend request rejected' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// GET /list/:userId - List Friends
router.get('/list/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findOne({ id: userId });

        if (!user) return res.status(404).json({ message: 'User not found' });

        const friends = await User.find({ id: { $in: user.friends || [] } })
            .select('id username profile.avatarUrl profile.displayName profile.title'); // Add fields as needed

        const formattedFriends = friends.map(f => ({
            id: f.id,
            username: f.username,
            displayName: f.profile?.displayName,
            avatar: f.profile?.avatarUrl,
            title: f.profile?.title,
            status: 'offline' // Placeholder
        }));

        res.json(formattedFriends);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
