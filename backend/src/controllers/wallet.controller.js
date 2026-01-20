const walletService = require('../services/WalletService');

const walletController = {
    /**
     * GET /wallet - Get user wallet
     */
    getWallet: async (req, res, next) => {
        try {
            const userId = req.user?.id || req.headers['user-id'];

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User authentication required'
                });
            }

            const wallet = await walletService.getOrCreateWallet(userId);

            res.json({
                success: true,
                balance: wallet.balance,
                totalDeposited: wallet.totalDeposited,
                totalWithdrawn: wallet.totalWithdrawn,
                totalWon: wallet.totalWon
            });
        } catch (err) {
            console.error('Error fetching wallet:', err.message);
            // FAIL SAFE: Return default 0 balance on error
            res.json({
                success: true,
                balance: 0,
                totalDeposited: 0,
                totalWithdrawn: 0,
                totalWon: 0
            });
        }
    },

    /**
     * POST /wallet/deposit - Add funds
     */
    deposit: async (req, res, next) => {
        try {
            const userId = req.user?.id || req.headers['user-id'];

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User authentication required'
                });
            }

            const { amount } = req.body;

            if (!amount || amount <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Valid amount required'
                });
            }

            const wallet = await walletService.deposit(userId, amount, 'Manual deposit');

            res.json({
                success: true,
                message: 'Funds added successfully',
                balance: wallet.balance
            });
        } catch (err) {
            next(err);
        }
    },

    /**
     * POST /wallet/withdraw - Request withdrawal
     */
    withdraw: async (req, res, next) => {
        try {
            const userId = req.user?.id || req.headers['user-id'];

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User authentication required'
                });
            }

            const { amount } = req.body;

            if (!amount || amount <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Valid amount required'
                });
            }

            const wallet = await walletService.withdraw(userId, amount, 'Withdrawal request');

            res.json({
                success: true,
                message: 'Withdrawal request submitted',
                balance: wallet.balance
            });
        } catch (err) {
            if (err.message === 'Insufficient balance') {
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }
            next(err);
        }
    },

    /**
     * GET /wallet/transactions - Get transaction history
     */
    getTransactions: async (req, res, next) => {
        try {
            const userId = req.user?.id || req.headers['user-id'];

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User authentication required'
                });
            }

            const limit = parseInt(req.query.limit) || 50;
            const transactions = await walletService.getTransactions(userId, limit);

            res.json({
                success: true,
                count: transactions.length,
                data: transactions
            });
        } catch (err) {
            console.error('Error fetching transactions:', err.message);
            // FAIL SAFE: Return empty array
            res.json({
                success: true,
                count: 0,
                data: []
            });
        }
    }
};

module.exports = walletController;
