const express = require('express');
const router = express.Router();
const walletController = require('../controllers/wallet.controller');

// GET /wallet - Get user wallet balance
router.get('/', walletController.getWallet);

// POST /wallet/deposit - Add funds to wallet
router.post('/deposit', walletController.deposit);

// POST /wallet/withdraw - Request withdrawal
router.post('/withdraw', walletController.withdraw);

// GET /wallet/transactions - Get transaction history
router.get('/transactions', walletController.getTransactions);

module.exports = router;
