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

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const wallet = await this.getOrCreateWallet(userId);

            // Update balance
            wallet.balance += amount;
            wallet.totalDeposited += amount;

            // Add transaction
            wallet.addTransaction('deposit', amount, description);

            await wallet.save({ session });
            await session.commitTransaction();

            return wallet;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    /**
     * Withdraw funds from wallet
     */
    async withdraw(userId, amount, description = 'Withdrawal request') {
        if (amount <= 0) {
            throw new Error('Withdrawal amount must be greater than 0');
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const wallet = await this.getOrCreateWallet(userId);

            if (wallet.balance < amount) {
                throw new Error('Insufficient balance');
            }

            // Update balance
            wallet.balance -= amount;
            wallet.totalWithdrawn += amount;

            // Add transaction
            wallet.addTransaction('withdraw', amount, description, { status: 'pending' });

            await wallet.save({ session });
            await session.commitTransaction();

            return wallet;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    /**
     * Deduct tournament entry fee
     */
    async deductTournamentFee(userId, amount, tournamentId) {
        if (amount <= 0) {
            throw new Error('Fee amount must be greater than 0');
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const wallet = await this.getOrCreateWallet(userId);

            if (wallet.balance < amount) {
                throw new Error('Insufficient balance for tournament entry');
            }

            wallet.balance -= amount;
            wallet.addTransaction('tournament_fee', amount, `Entry fee for tournament`, { tournamentId });

            await wallet.save({ session });
            await session.commitTransaction();

            return wallet;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    /**
     * Credit prize winnings
     */
    async creditPrize(userId, amount, tournamentId, description = 'Prize won') {
        if (amount <= 0) {
            throw new Error('Prize amount must be greater than 0');
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const wallet = await this.getOrCreateWallet(userId);

            wallet.balance += amount;
            wallet.totalWon += amount;
            wallet.addTransaction('prize_won', amount, description, { tournamentId });

            await wallet.save({ session });
            await session.commitTransaction();

            return wallet;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    /**
     * Get transaction history
     */
    async getTransactions(userId, limit = 50) {
        const wallet = await this.getOrCreateWallet(userId);
        return wallet.transactions
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, limit);
    }
}

module.exports = new WalletService();
