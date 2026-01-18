const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./middleware/error.middleware');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mock Auth Middleware (As per requirement: assume req.user is available)
// For development/demo, we can set a default user if none is provided
app.use((req, res, next) => {
    // In production, an actual auth middleware would populate req.user
    // If headers provide a user-id, we can mock it here for testing
    if (req.headers['user-id']) {
        req.user = {
            id: req.headers['user-id'],
            role: req.headers['user-role'] || 'player',
            subscriptionActive: req.headers['user-sub'] === 'true'
        };
    }
    next();
});

// Routes
app.use('/tournaments', require('./routes/tournament.routes'));
app.use('/host', require('./routes/host.routes'));
app.use('/player', require('./routes/player.routes'));

app.get('/health', (req, res) => res.status(200).json({ status: 'OK' }));

// 404 Handler
app.use((req, res, next) => {
    res.status(404).json({ success: false, message: 'Endpoint not found' });
});

// Error Handler
app.use(errorHandler);

module.exports = app;
