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
        enum: ['freefire', 'bgmi', 'valorant', 'minecraft']
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
    createdBy: {
        type: String, // Ref to Host.userId or Host._id? Prompt says createdBy (hostId). 
        // Usually cleaner to ref Host.userId (the Firebase/External UID)
        required: true,
        ref: 'Host'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

tournamentSchema.virtual('slotsFilled').get(function () {
    return this.registeredPlayers.length;
});

tournamentSchema.virtual('slotsAvailable').get(function () {
    return this.maxSlots - this.registeredPlayers.length;
});

module.exports = mongoose.model('Tournament', tournamentSchema);
