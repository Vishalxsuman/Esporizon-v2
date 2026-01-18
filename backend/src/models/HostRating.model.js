const mongoose = require('mongoose');

const hostRatingSchema = new mongoose.Schema({
    hostId: {
        type: String, // Referencing Host.userId
        required: true,
        ref: 'Host'
    },
    userId: {
        type: String, // Referencing User.id (Reviewer)
        required: true,
        ref: 'User'
    },
    stars: {
        type: Number,
        required: true,
        min: 0,
        max: 5
    },
    reviewText: {
        type: String,
        required: true,
        maxlength: 500
    }
}, {
    timestamps: true
});

// Enforce one rating per user per host
hostRatingSchema.index({ hostId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('HostRating', hostRatingSchema);
