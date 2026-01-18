const express = require('express');
const router = express.Router();
const tc = require('../controllers/tournament.controller');

router.get('/', tc.getAll);
router.get('/:id', tc.getById);
router.post('/', tc.create);
router.post('/:id/register', tc.register);

module.exports = router;
