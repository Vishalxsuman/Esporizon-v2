const express = require('express');
const router = express.Router();
const hc = require('../controllers/host.controller');

// Host activation (FREE)
router.post('/activate', hc.activate);

router.get('/:hostId', hc.getProfile);
router.get('/:hostId/tournaments', hc.getTournaments);
router.post('/:hostId/rate', hc.rate);

module.exports = router;
