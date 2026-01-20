const mongoose = require('mongoose');

const tournamentChatSchema = new mongoose.Schema({
    tournamentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tournament',
        required: true,
        index: true // Important for fast retrieval
    },
    userId: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    userAvatar: {
        type: String,
        default: ''
    },
    userRole: {
        type: String,
        enum: ['host', 'player', 'admin'],
        default: 'player'
    },
    message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    isPinned: {
        type: Boolean,
        default: false
    },
    pinnedAt: {
        type: Date
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('TournamentChat', tournamentChatSchema);
