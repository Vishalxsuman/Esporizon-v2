const express = require('express');
const router = express.Router();

/**
 * POST /subscription/activate
 * Activate host subscription for a user (ONE-TIME UPGRADE)
 */
router.post('/activate', async (req, res, next) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                data: null,
                message: 'User authentication required'
            });
        }

        // Upgrade user to host role in MongoDB
        const User = require('../models/User.model');

        const user = await User.findOneAndUpdate(
            { id: userId },
            {
                role: 'host',
                subscriptionActive: true
            },
            {
                new: true, // Return updated document
                upsert: true, // Create if doesn't exist
                setDefaultsOnInsert: true
            }
        );

        if (process.env.NODE_ENV !== 'production') {


            console.log(`✅ User ${userId} upgraded to host`);


        }

        res.json({
            success: true,
            message: 'Host subscription activated successfully',
            isHost: true,
            role: 'host',
            subscriptionActive: true,
            activatedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Subscription activation error:', error);
        next(error);
    }
});

/**
 * GET /subscription/status
 * Get user's subscription status (FREE by default)
 */
router.get('/status', async (req, res, next) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                data: null,
                message: 'User authentication required'
            });
        }

        // Query database for user's actual role
        const User = require('../models/User.model');
        const user = await User.findOne({ id: userId });

        // FREE SUBSCRIPTION MODEL: active by default
        res.json({
            success: true,
            active: true, // Always true - subscription is FREE
            plan: 'free',
            isHost: user?.role === 'host',
            role: user?.role || 'player',
            userId: userId
        });
    } catch (error) {
        console.error('Subscription status error:', error);
        // Return safe default on error
        res.json({
            success: true,
            active: true, // FREE by default
            plan: 'free',
            isHost: false,
            role: 'player'
        });
    }
});

/**
 * POST /subscription/cancel
 * Cancel user's subscription
 */
router.post('/cancel', async (req, res, next) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User authentication required'
            });
        }

        // TODO: Implement actual cancellation logic
        res.json({
            success: true,
            message: 'Subscription cancelled successfully',
            subscriptionActive: false
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
