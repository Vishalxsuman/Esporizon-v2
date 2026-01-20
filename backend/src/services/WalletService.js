const Wallet = require('../models/Wallet.model');
const mongoose = require('mongoose');

class WalletService {
    /**
     * Get or create wallet for user
     */
    async getOrCreateWallet(userId) {
        let wallet = await Wallet.findOne({ userId });

        if (!wallet) {
            wallet = await Wallet.create({
                userId,
                balance: 0,
                transactions: []
            });
        }

        return wallet;
    }

    /**
     * Deposit funds to wallet
     */
    async deposit(userId, amount, description = 'Manual deposit') {
        if (amount <= 0) {
            throw new Error('Deposit amount must be greater than 0');
        }

        const transaction = {
            type: 'deposit',
            amount,
            description,
            status: 'completed',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const wallet = await Wallet.findOneAndUpdate(
            { userId },
            {
                $inc: { balance: amount, totalDeposited: amount },
                $push: { transactions: transaction }
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        return wallet;
    }

    /**
     * Withdraw funds from wallet
     */
    async withdraw(userId, amount, description = 'Withdrawal request') {
        if (amount <= 0) {
            throw new Error('Withdrawal amount must be greater than 0');
        }

        const transaction = {
            type: 'withdraw',
            amount,
            description,
            status: 'pending', // Usually pending admin approval or gateway
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Check balance atomically
        const wallet = await Wallet.findOneAndUpdate(
            { userId, balance: { $gte: amount } },
            {
                $inc: { balance: -amount, totalWithdrawn: amount },
                $push: { transactions: transaction }
            },
            { new: true }
        );

        if (!wallet) {
            throw new Error('Insufficient balance');
        }

        return wallet;
    }

    /**
     * Deduct tournament entry fee
     */
    async deductTournamentFee(userId, amount, tournamentId) {
        if (amount <= 0) {
            throw new Error('Fee amount must be greater than 0');
        }

        const transaction = {
            type: 'tournament_fee',
            amount,
            description: `Entry fee for tournament`,
            metadata: { tournamentId },
            status: 'completed',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const wallet = await Wallet.findOneAndUpdate(
            { userId, balance: { $gte: amount } },
            {
                $inc: { balance: -amount },
                $push: { transactions: transaction }
            },
            { new: true }
        );

        if (!wallet) {
            throw new Error('Insufficient balance for tournament entry');
        }

        return wallet;
    }

    /**
     * Credit prize winnings
     */
    async creditPrize(userId, amount, tournamentId, description = 'Prize won') {
        if (amount <= 0) {
            throw new Error('Prize amount must be greater than 0');
        }

        const transaction = {
            type: 'prize_won',
            amount,
            description,
            metadata: { tournamentId },
            status: 'completed',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const wallet = await Wallet.findOneAndUpdate(
            { userId },
            {
                $inc: { balance: amount, totalWon: amount },
                $push: { transactions: transaction }
            },
            { new: true, upsert: true }
        );

        return wallet;
    }

    /**
     * Get transaction history
     */
    async getTransactions(userId, limit = 50) {
        const wallet = await this.getOrCreateWallet(userId);
        return wallet.transactions
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, limit);
    }
}

module.exports = new WalletService();
