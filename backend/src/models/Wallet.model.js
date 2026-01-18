const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['deposit', 'withdraw', 'tournament_fee', 'prize_won', 'refund'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'completed'
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

const walletSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    balance: {
        type: Number,
        default: 0,
        min: 0
    },
    transactions: [transactionSchema],
    totalDeposited: {
        type: Number,
        default: 0
    },
    totalWithdrawn: {
        type: Number,
        default: 0
    },
    totalWon: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Method to add transaction
walletSchema.methods.addTransaction = function (type, amount, description = '', metadata = {}) {
    this.transactions.push({
        type,
        amount,
        description,
        metadata,
        status: 'completed'
    });
};

module.exports = mongoose.model('Wallet', walletSchema);
