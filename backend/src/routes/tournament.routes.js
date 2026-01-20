const express = require('express');
const router = express.Router();
const tc = require('../controllers/tournament.controller');
const { verifyFirebaseToken } = require('../middleware/auth.middleware');

const chatController = require('../controllers/chat.controller');

// Public routes
router.get('/', tc.getAll);
router.get('/:id', tc.getById);

// Chat Routes
router.get('/:id/chat', verifyFirebaseToken, chatController.getMessages);
router.post('/:id/chat', verifyFirebaseToken, chatController.sendMessage);
router.patch('/:id/chat/:messageId/pin', verifyFirebaseToken, chatController.togglePin);

// Protected routes - require authentication
router.post('/', verifyFirebaseToken, tc.create);
router.post('/:id/register', verifyFirebaseToken, tc.register);
router.get('/:id/participants', tc.getAllParticipants); // Open to all, but maybe verify checks inside? No, public info mostly.

// Host Management Routes
router.post('/:id/room-details', verifyFirebaseToken, tc.updateRoomDetails);
router.patch('/:id/status', verifyFirebaseToken, tc.updateStatus);
router.post('/:id/results', verifyFirebaseToken, tc.publishResults);
router.patch('/:id/live-stream', verifyFirebaseToken, tc.updateLiveStream);

// Status & History
router.get('/:id/join-status', verifyFirebaseToken, tc.getJoinStatus);
router.get('/user/:id/history', verifyFirebaseToken, tc.getUserHistory);

module.exports = router;
