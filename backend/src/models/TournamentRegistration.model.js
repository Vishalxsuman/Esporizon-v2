const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        ref: 'User'
    },
    tournamentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Tournament'
    },
    feePaid: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'failed', 'refunded'],
        default: 'confirmed'
    },
    joinedAt: {
        type: Date,
        default: Date.now
    },
    teamName: {
        type: String,
        default: ''
    },
    players: [{
        userId: String,
        userName: String,
        role: String
    }]
}, {
    timestamps: true
});

// Enforce one registration per user per tournament
registrationSchema.index({ userId: 1, tournamentId: 1 }, { unique: true });

module.exports = mongoose.model('TournamentRegistration', registrationSchema);
