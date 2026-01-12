/**
 * COLOR PREDICTION GAME BACKEND
 * Express server with all game APIs
 * Runs multiple game modes simultaneously (30s, 1m, 3m, 5m)
 */

const express = require('express');
const cors = require('cors');
const periodEngine = require('./engine/periodEngine');
const resultGenerator = require('./engine/resultGenerator');
const betManager = require('./engine/betManager');
const wallet = require('./engine/wallet');
const { GAME_MODES } = require('./engine/engineConfig');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors()); // Enable CORS for all origins
app.use(express.json()); // Parse JSON bodies

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get user ID from request
 * In production, this would extract from session/JWT token
 * For now, using default user for testing
 */
function getUserId(req) {
    // TODO: Extract from authentication token
    return req.headers['user-id'] || 'user1';
}

/**
 * Validate game type parameter
 */
function validateGameType(gameType) {
    if (!GAME_MODES[gameType]) {
        throw new Error(`Invalid game type. Must be one of: ${Object.keys(GAME_MODES).join(', ')}`);
    }
}

// ============================================================================
// API ROUTES - GAME PERIOD & RESULTS
// ============================================================================

/**
 * GET /api/current-period?gameType=30s|1m|3m|5m
 * Returns current period ID and remaining seconds
 */
app.get('/api/current-period', (req, res) => {
    try {
        const { gameType } = req.query;

        if (!gameType) {
            return res.status(400).json({ error: 'gameType parameter is required' });
        }

        validateGameType(gameType);

        const currentPeriod = periodEngine.getCurrentPeriod(gameType);

        if (!currentPeriod) {
            return res.status(404).json({ error: 'No active period found' });
        }

        res.json(currentPeriod);
    } catch (error) {
        console.error('Error in /api/current-period:', error);
        res.status(400).json({ error: error.message });
    }
});

/**
 * GET /api/latest-result?gameType=30s|1m|3m|5m
 * Returns the most recent result for a game type
 */
app.get('/api/latest-result', (req, res) => {
    try {
        const { gameType } = req.query;

        if (!gameType) {
            return res.status(400).json({ error: 'gameType parameter is required' });
        }

        validateGameType(gameType);

        const latestResult = resultGenerator.getLatestResult(gameType);

        if (!latestResult) {
            return res.status(404).json({ error: 'No results available yet' });
        }

        res.json(latestResult);
    } catch (error) {
        console.error('Error in /api/latest-result:', error);
        res.status(400).json({ error: error.message });
    }
});

/**
 * GET /api/history?gameType=30s|1m|3m|5m&limit=20
 * Returns result history for a game type
 */
app.get('/api/history', (req, res) => {
    try {
        const { gameType, limit } = req.query;

        if (!gameType) {
            return res.status(400).json({ error: 'gameType parameter is required' });
        }

        validateGameType(gameType);

        const historyLimit = limit ? parseInt(limit, 10) : 20;
        const history = resultGenerator.getHistory(gameType, historyLimit);

        res.json(history);
    } catch (error) {
        console.error('Error in /api/history:', error);
        res.status(400).json({ error: error.message });
    }
});

// ============================================================================
// API ROUTES - BET PLACEMENT
// ============================================================================

/**
 * POST /api/predict/place-bet
 * Place a bet for a specific period
 * Body: { gameType, periodId, betType, value, amount }
 */
app.post('/api/predict/place-bet', (req, res) => {
    try {
        const userId = getUserId(req);
        const { gameType, periodId, betType, value, amount } = req.body;

        // Validate required fields
        if (!gameType || !periodId || !betType || value === undefined || !amount) {
            return res.status(400).json({
                error: 'Missing required fields: gameType, periodId, betType, value, amount'
            });
        }

        validateGameType(gameType);

        // Get current period to check remaining time
        const currentPeriod = periodEngine.getCurrentPeriod(gameType);

        if (!currentPeriod) {
            return res.status(400).json({ error: 'No active period' });
        }

        // Verify period ID matches current period
        if (currentPeriod.periodId !== periodId) {
            return res.status(400).json({
                error: 'Period ID mismatch. Current period: ' + currentPeriod.periodId
            });
        }

        // Place bet (will validate timing, balance, etc.)
        const bet = betManager.placeBet(
            userId,
            gameType,
            periodId,
            betType,
            value,
            amount,
            currentPeriod.remainingSeconds
        );

        res.json({
            success: true,
            bet,
            remainingBalance: wallet.getBalance(userId),
        });
    } catch (error) {
        console.error('Error in /api/predict/place-bet:', error);
        res.status(400).json({ error: error.message });
    }
});

// ============================================================================
// API ROUTES - WALLET
// ============================================================================

/**
 * GET /api/wallet
 * Get user's wallet balance
 */
app.get('/api/wallet', (req, res) => {
    try {
        const userId = getUserId(req);
        const balance = wallet.getBalance(userId);

        res.json({ balance });
    } catch (error) {
        console.error('Error in /api/wallet:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/wallet/deposit
 * Deposit funds into wallet
 * Body: { amount }
 */
app.post('/api/wallet/deposit', (req, res) => {
    try {
        const userId = getUserId(req);
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid deposit amount' });
        }

        const newBalance = wallet.deposit(userId, amount);

        res.json({
            success: true,
            balance: newBalance,
        });
    } catch (error) {
        console.error('Error in /api/wallet/deposit:', error);
        res.status(400).json({ error: error.message });
    }
});

/**
 * POST /api/wallet/withdraw
 * Withdraw funds from wallet
 * Body: { amount }
 */
app.post('/api/wallet/withdraw', (req, res) => {
    try {
        const userId = getUserId(req);
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid withdrawal amount' });
        }

        const newBalance = wallet.withdraw(userId, amount);

        res.json({
            success: true,
            balance: newBalance,
        });
    } catch (error) {
        console.error('Error in /api/wallet/withdraw:', error);
        res.status(400).json({ error: error.message });
    }
});

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

/**
 * Start the server
 */
function startServer() {
    // Initialize all game engines (30s, 1m, 3m, 5m)
    console.log('='.repeat(60));
    console.log('COLOR PREDICTION GAME BACKEND - STARTING');
    console.log('='.repeat(60));

    periodEngine.initializeAllEngines();

    console.log('='.repeat(60));

    // Start Express server
    app.listen(PORT, () => {
        console.log(`✅ Backend running on http://localhost:${PORT}`);
        console.log(`✅ All game modes active: ${Object.keys(GAME_MODES).join(', ')}`);
        console.log('='.repeat(60));
    });
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down gracefully...');
    periodEngine.stopAllEngines();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down gracefully...');
    periodEngine.stopAllEngines();
    process.exit(0);
});

// Start the server
startServer();

module.exports = app;
