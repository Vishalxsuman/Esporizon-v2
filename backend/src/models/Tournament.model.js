const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 100
    },
    game: {
        type: String,
        required: true,
        enum: ['freefire', 'bgmi', 'valorant', 'minecraft', 'codm']
    },
    bannerUrl: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        required: true,
        enum: ['upcoming', 'live', 'completed'],
        default: 'upcoming'
    },
    mode: {
        type: String,
        required: true,
        enum: ['solo', 'duo', 'squad']
    },
    entryFee: {
        type: Number,
        required: true,
        min: 0
    },
    prizePool: {
        type: Number,
        required: true,
        min: 0
    },
    maxSlots: {
        type: Number,
        required: true,
        min: 1,
        max: 100
    },
    registeredPlayers: [{
        type: String // Array of User.id
    }],
    startTime: {
        type: Date,
        required: true
    },
    // Optional redundancy for frontend compatibility if needed, but strict schema preferred
    matchTime: {
        type: String // legacy support or exact time string 
    },
    prizeDistribution: {
        first: { type: Number, default: 0 },
        second: { type: Number, default: 0 },
        third: { type: Number, default: 0 }
    },
    perKillAmount: {
        type: Number,
        default: 0
    },
    // Additional Metadata for UI
    description: {
        type: String,
        default: ''
    },
    rules: [{
        type: String
    }],
    mapMode: {
        type: String,
        default: 'BERMUDA'
    },
    registrationDeadline: {
        type: Date
    },
    totalMatches: {
        type: Number,
        default: 1
    },
    teamSize: {
        type: Number,
        default: 4
    },
    // Room Details (Protected - Visible only to joined players near start time)
    roomDetails: {
        roomId: { type: String, default: '' },
        password: { type: String, default: '' },
        server: { type: String, default: 'India' },
        map: { type: String, default: '' }
    },
    // Results (Array of player/team standings)
    results: [{
        userId: String,
        teamName: String,
        rank: Number,
        kills: Number,
        prize: Number
    }],
    hostId: {
        type: String,
        required: true
    },
    hostName: {
        type: String,
        default: 'Unknown Host'
    },
    createdBy: {
        type: String,
        required: true,
        ref: 'Host' // Storing Host userId here
    },
    liveStream: {
        isLive: {
            type: Boolean,
            default: false
        },
        youtubeUrl: {
            type: String,
            default: null
        }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

tournamentSchema.virtual('slotsFilled').get(function () {
    return this.registeredPlayers ? this.registeredPlayers.length : 0;
});

tournamentSchema.virtual('slotsAvailable').get(function () {
    return this.maxSlots - (this.registeredPlayers ? this.registeredPlayers.length : 0);
});

module.exports = mongoose.model('Tournament', tournamentSchema);
