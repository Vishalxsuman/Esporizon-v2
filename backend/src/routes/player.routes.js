const express = require('express');
const router = express.Router();
const pc = require('../controllers/player.controller');

router.get('/:userId/profile', pc.getProfile);
router.get('/:userId/tournaments', pc.getTournaments);

module.exports = router;
