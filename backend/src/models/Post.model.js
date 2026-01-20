const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    author: {
        type: String, // Firebase UID
        required: true,
        ref: 'User'
    },
    authorName: { type: String, required: true },
    authorUsername: { type: String, required: true },
    authorAvatar: { type: String },

    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    image: {
        type: String,
        default: ''
    },
    type: {
        type: String,
        enum: ['global', 'recruitment', 'tournament', 'clip', 'host_update', 'live_stream'],
        default: 'global'
    },

    likes: [{ type: String }], // Array of User UIDs
    comments: [{
        user: { type: String, required: true }, // UID
        username: { type: String, required: true },
        avatar: { type: String },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }],

    tags: [{ type: String }],

    isPinned: { type: Boolean, default: false },
    isOfficial: { type: Boolean, default: false }, // For Host/Admin posts

    // Linked Tournament Info (for live_stream/recruitment)
    tournamentId: { type: String },
    tournamentName: { type: String },
    game: { type: String },
    youtubeUrl: { type: String }

}, {
    timestamps: true
});

module.exports = mongoose.model('Post', postSchema);
