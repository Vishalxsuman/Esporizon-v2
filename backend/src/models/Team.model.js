const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    ownerId: {
        type: String, // Firebase UID
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    game: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['SOLO', 'DUO', 'SQUAD'],
        required: true
    },
    players: [{
        ign: { type: String, required: true },
        // Could store link to user ID later if we want verified players
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Team', teamSchema);
