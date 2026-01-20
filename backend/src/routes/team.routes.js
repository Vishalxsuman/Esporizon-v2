const express = require('express');
const router = express.Router();
const Team = require('../models/Team.model');
const User = require('../models/User.model');

// Create Team
router.post('/', async (req, res) => {
    try {
        const { userId, name, game, type, players } = req.body; // userId passed from frontend (firebase UID)

        const team = new Team({
            ownerId: userId,
            name,
            game,
            type,
            players
        });

        await team.save();

        // Add to user's team list
        await User.findOneAndUpdate(
            { id: userId },
            { $push: { teams: team._id } }
        );

        res.json(team);
    } catch (error) {
        console.error('Create Team Error:', error);
        res.status(500).json({ message: 'Failed to create team' });
    }
});

// Get My Teams
router.get('/my/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const teams = await Team.find({ ownerId: userId }).sort({ createdAt: -1 });
        res.json(teams);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch teams' });
    }
});

// Delete Team
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Team.findByIdAndDelete(id);

        // Remove from user array (optional but good practice)
        // We'd need the ownerId or do a generic pull

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete team' });
    }
});

module.exports = router;
