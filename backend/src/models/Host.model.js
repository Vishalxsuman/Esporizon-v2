const mongoose = require('mongoose');

const hostSchema = new mongoose.Schema({
    userId: {
        type: String, // Referencing User.id
        required: true,
        unique: true,
        ref: 'User'
    },
    ratingAverage: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    ratingCount: {
        type: Number,
        default: 0
    },
    totalTournaments: {
        type: Number,
        default: 0
    },
    completedTournaments: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Host', hostSchema);
