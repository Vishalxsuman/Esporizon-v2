const express = require('express');
const router = express.Router();
const User = require('../models/User.model');

/**
 * GET /profile
 * Get current user's profile with role info
 */
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query; // Query parameter 'q'
        if (!q || q.length < 3) return res.json([]);

        // specific logic to avoid leaking sensitive data
        const users = await User.find({
            username: { $regex: q, $options: 'i' }
        })
            .limit(10)
            .select('id username profile.avatarUrl profile.displayName profile.title profile.avatarType');

        const formatted = users.map(u => ({
            uid: u.id,
            username: u.username,
            avatarUrl: u.profile?.avatarUrl,
            displayName: u.profile?.displayName,
            title: u.profile?.title,
            avatarType: u.profile?.avatarType
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// GET /profile previously defined...
router.get('/profile', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (process.env.NODE_ENV !== 'production') {

            console.log('📋 GET /api/user/profile - User ID:', userId);

        }

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User authentication required'
            });
        }

        // Fetch user from database
        const user = await User.findOne({ id: userId });
        if (process.env.NODE_ENV !== 'production') {

            console.log('👤 User found in DB:', user ? `Yes (role: ${user.role})` : 'No');

        }

        const response = {
            success: true,
            id: userId,
            role: user?.role || 'player',
            isHost: user?.role === 'host',
            subscriptionActive: user?.subscriptionActive || false
        };

        if (process.env.NODE_ENV !== 'production') {


            console.log('✅ Sending response:', response);


        }
        res.json(response);
    } catch (error) {
        console.error('❌ Get user profile error:', error);
        res.status(200).json({
            success: true,
            id: req.user?.id,
            role: 'player',
            isHost: false
        });
    }
});

module.exports = router;
