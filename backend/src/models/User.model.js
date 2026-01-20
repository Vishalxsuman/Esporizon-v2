const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    role: {
        type: String,
        enum: ['player', 'host', 'admin'],
        default: 'player'
    },
    subscriptionActive: {
        type: Boolean,
        default: false
    },
    profile: {
        title: { type: String, default: 'Beginner' },
        displayName: { type: String, default: '' },
        avatarId: { type: String, default: '1' },
        avatarType: { type: String, default: 'default' },
        frameId: { type: String, default: 'none' },
        bio: { type: String, default: '' },
        location: { type: String, default: 'Unknown' },
        country: { type: String, default: 'India' },
        languages: [{ type: String }],
        bannerUrl: { type: String, default: '' },
        socialLinks: {
            discord: String,
            twitter: String,
            instagram: String,
            youtube: String,
            twitch: String
        },
        gameAccounts: {
            bgmi: { type: String, default: '' },
            freefire: { type: String, default: '' },
            valorant: { type: String, default: '' },
            minecraft: { type: String, default: '' }
        },
        themeColor: { type: String, default: 'teal' },
        currentStreak: { type: Number, default: 0 }
    },
    friends: [{ type: String }], // Array of UIDs
    friendRequests: [{ type: String }], // Incoming requests (UIDs)
    sentFriendRequests: [{ type: String }], // Outgoing requests (UIDs)
    teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
    tournamentsJoined: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tournament' }],
    tournamentsHosted: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tournament' }],
    stats: {
        type: Map,
        of: new mongoose.Schema({
            game: String,
            currentRank: { type: String, default: 'Unranked' },
            rankScore: { type: Number, default: 0 },
            matchesPlayed: { type: Number, default: 0 },
            matchesWon: { type: Number, default: 0 },
            matchesLost: { type: Number, default: 0 },
            winRate: { type: Number, default: 0 },
            kills: { type: Number, default: 0 },
            kdRatio: { type: Number, default: 0 }
        })
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

module.exports = mongoose.model('User', userSchema);
