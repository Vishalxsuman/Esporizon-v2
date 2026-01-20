const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./middleware/error.middleware');
const { verifyFirebaseToken, optionalAuth } = require('./middleware/auth.middleware');

const app = express();

// ========================================
// CORS Configuration
// ========================================
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            process.env.BASE_CLIENT_URL,
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:3000',
        ];

        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    allowedHeaders: ['Content-Type', 'Authorization', 'user-id', 'user-role', 'user-sub'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
};

app.use(cors(corsOptions));

// Explicit OPTIONS handler for preflight requests
app.options('*', cors(corsOptions));

// ========================================
// Body Parsing Middleware
// ========================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ========================================
// Health Check (No Auth Required)
// ========================================
app.get('/health', (req, res) => res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() }));

// Advanced Health Check with System Status
app.get('/api/health', async (req, res) => {
    const mongoose = require('mongoose');
    const admin = require('firebase-admin');

    const health = {
        success: true,
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: {
            status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
            readyState: mongoose.connection.readyState,
            name: mongoose.connection.name || 'N/A'
        },
        firebase: {
            status: admin.apps.length > 0 ? 'initialized' : 'disabled'
        },
        server: {
            nodeVersion: process.version,
            environment: process.env.NODE_ENV || 'development',
            port: process.env.PORT || 5000
        }
    };

    // Set status based on critical services
    if (mongoose.connection.readyState !== 1) {
        health.status = 'DEGRADED';
        health.success = false;
    }

    res.status(health.success ? 200 : 503).json(health);
});

// ========================================
// Routes
// ========================================
// Wallet routes - require authentication
app.use('/wallet', verifyFirebaseToken, require('./routes/wallet.routes'));

// Tournament routes - GET is public, POST/register require auth
const tournamentRoutes = require('./routes/tournament.routes');
app.use('/api/tournaments', tournamentRoutes);
app.use('/tournaments', tournamentRoutes); // Support both /tournaments and /api/tournaments

// Host routes - require authentication
app.use('/api/host', verifyFirebaseToken, require('./routes/host.routes'));
app.use('/host', verifyFirebaseToken, require('./routes/host.routes'));

// Profile routes - require authentication for some ops, but allow read
const profileRoutes = require('./routes/profile.routes');
app.use('/api/profile', verifyFirebaseToken, profileRoutes);

// Player routes - require authentication
app.use('/api/player', verifyFirebaseToken, require('./routes/player.routes'));
app.use('/player', verifyFirebaseToken, require('./routes/player.routes'));

// User routes - require authentication
app.use('/api/user', verifyFirebaseToken, require('./routes/user.routes'));

// Subscription routes - require authentication
// Note: Create this route file if it doesn't exist
try {
    const subscriptionRoutes = require('./routes/subscription.routes');
    app.use('/api/subscription', verifyFirebaseToken, subscriptionRoutes);
    app.use('/subscription', verifyFirebaseToken, subscriptionRoutes);
} catch (error) {
    if (process.env.NODE_ENV !== 'production') {

        console.warn('⚠️ Subscription routes not found - skipping');

    }
}

// Teams routes
app.use('/api/teams', verifyFirebaseToken, require('./routes/team.routes'));

// Friends routes
app.use('/api/friends', verifyFirebaseToken, require('./routes/friends.routes'));

// Chat routes
app.use('/api/chats', verifyFirebaseToken, require('./routes/chat.routes'));

// Post routes
app.use('/api/posts', verifyFirebaseToken, require('./routes/post.routes'));

// Ensure wallet is at /api/wallet
app.use('/api/wallet', verifyFirebaseToken, require('./routes/wallet.routes'));

// ========================================
// 404 Handler
// ========================================
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Endpoint not found: ${req.method} ${req.path}`,
        timestamp: new Date().toISOString()
    });
});

// ========================================
// Global Error Handler (MUST BE LAST)
// ========================================
app.use(errorHandler);

module.exports = app;
