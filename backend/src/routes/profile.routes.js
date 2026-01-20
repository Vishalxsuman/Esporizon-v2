const express = require('express');
const router = express.Router();
const User = require('../models/User.model');

// Helper to construct full profile response matching frontend expectations
const buildProfileResponse = (user) => {
    // Calculate aggregates
    let totalMatches = 0;
    let totalWins = 0;

    if (user.stats) {
        user.stats.forEach(stat => {
            totalMatches += stat.matchesPlayed || 0;
            totalWins += stat.matchesWon || 0;
        });
    }

    const overallWinRate = totalMatches > 0 ? Math.round((totalWins / totalMatches) * 100) : 0;

    return {
        user: {
            id: user.id || user._id.toString(), // Use MongoDB ID if 'id' field matches or fallback
            username: user.username,
            firebaseUid: user.id, // Assuming 'id' in model stores firebase UID based on UserService usage
            createdAt: user.createdAt
        },
        profile: user.profile || {},
        stats: user.stats || {},
        aggregate: {
            totalMatches,
            totalWins,
            overallWinRate
        },
        history: [] // History would ideally come from a separate collection, empty for now
    };
};

/**
 * GET /me - Get Current User Profile (Full Data)
 * Used by ProfileService.getMyProfile
 */
router.post('/me', async (req, res) => {
    try {
        const { firebaseUid, userId } = req.body;
        const lookupId = firebaseUid || userId || req.user.id; // Fallback to auth token ID

        let user = await User.findOne({ id: lookupId });

        // If user doesn't exist, create a default record (Lazy Sync)
        if (!user) {
            if (process.env.NODE_ENV !== 'production') {

                console.log(`Creating new user record for ID: ${lookupId}`);

            }
            user = new User({
                id: lookupId,
                username: `Player_${lookupId.slice(0, 5)}`, // Default username
                role: 'player',
                profile: {
                    title: 'New Operative',
                    avatarType: 'initials',
                    bio: 'Welcome to Esporizon combat grid.'
                },
                stats: []
            });
            await user.save();
        }

        res.json(buildProfileResponse(user));
    } catch (error) {
        console.error('Get My Profile Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

/**
 * PUT /me - Update Profile
 * Used by ProfileService.updateProfile
 */
router.put('/me', async (req, res) => {
    try {
        const { firebaseUid, ...updateData } = req.body;
        const lookupId = firebaseUid || req.user.id;

        // Extract profile specific fields to avoid overwriting everything
        // This is a simplified update - assumes updateData matches schema structure mostly
        // For 'profile' nested fields, we need to be careful. 
        // Frontend likely sends flattened or partial structure?
        // ProfileService sends: { ...data } where data is ProfileUpdateData interface

        // We need to map frontend fields to backend schema
        const updateOps = {};

        // Check for username uniqueness if username is being updated
        if (updateData.username) {
            const existingUser = await User.findOne({ username: updateData.username });
            if (existingUser && existingUser.id !== lookupId) {
                return res.status(400).json({ message: 'Username is already taken' });
            }
            updateOps.username = updateData.username;
        }

        if (updateData.displayName) updateOps['profile.displayName'] = updateData.displayName;
        if (updateData.bio !== undefined) updateOps['profile.bio'] = updateData.bio;
        if (updateData.location !== undefined) updateOps['profile.location'] = updateData.location;
        if (updateData.country !== undefined) updateOps['profile.country'] = updateData.country;
        if (updateData.languages) updateOps['profile.languages'] = updateData.languages;
        if (updateData.bannerUrl) updateOps['profile.bannerUrl'] = updateData.bannerUrl;
        if (updateData.avatarId) updateOps['profile.avatarId'] = updateData.avatarId;
        if (updateData.avatarType) updateOps['profile.avatarType'] = updateData.avatarType;
        if (updateData.avatarUrl) updateOps['profile.avatarUrl'] = updateData.avatarUrl; // Direct URL support
        if (updateData.frameId) updateOps['profile.frameId'] = updateData.frameId;
        if (updateData.themeColor) updateOps['profile.themeColor'] = updateData.themeColor;

        // Handle Game Accounts
        if (updateData.gameAccounts) {
            Object.keys(updateData.gameAccounts).forEach(key => {
                updateOps[`profile.gameAccounts.${key}`] = updateData.gameAccounts[key];
            });
        }

        // Handle Social Links (Deep merge approach)
        if (updateData.socialLinks) {
            Object.keys(updateData.socialLinks).forEach(key => {
                updateOps[`profile.socialLinks.${key}`] = updateData.socialLinks[key];
            });
        }

        const user = await User.findOneAndUpdate(
            { id: lookupId },
            { $set: updateOps },
            { new: true }
        );

        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json(buildProfileResponse(user));
    } catch (error) {
        console.error('Update Profile Error:', error);
        // Handle duplicate key error from mongo if race condition
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Username is already taken' });
        }
        res.status(500).json({ message: 'Update failed' });
    }
});

/**
 * GET /:userId - Get Any User Profile
 * Used by ProfileService.getProfileByUserId
 */
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findOne({ id: userId });

        if (!user) {
            // Check if looking up by mongo _id as fallback?
            // Assuming 'id' field is custom string ID (Firebase UID usually)
            return res.status(404).json(null); // Return null as expected by frontend fix
        }

        res.json(buildProfileResponse(user));
    } catch (error) {
        console.error('Get User Profile Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

/**
 * POST /init - Initialize Stats
 */
router.post('/init', async (req, res) => {
    try {
        const { userId } = req.body;
        // Just return success, stats are defaulted in schema
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: 'Init failed' });
    }
});

module.exports = router;
