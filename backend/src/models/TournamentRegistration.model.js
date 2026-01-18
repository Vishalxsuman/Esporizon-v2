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
    joinedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Enforce one registration per user per tournament
registrationSchema.index({ userId: 1, tournamentId: 1 }, { unique: true });

module.exports = mongoose.model('TournamentRegistration', registrationSchema);
