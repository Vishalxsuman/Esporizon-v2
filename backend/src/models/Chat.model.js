const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    senderId: { type: String, required: true }, // Firebase UID
    text: { type: String, required: true },
    readBy: [{ type: String }], // Array of UIDs who have read this message
    createdAt: { type: Date, default: Date.now }
});

const chatSchema = new mongoose.Schema({
    participants: [{ type: String, required: true }], // Array of UIDs
    messages: [messageSchema],
    lastMessage: {
        text: String,
        senderId: String,
        createdAt: Date,
        unreadCount: { type: Number, default: 0 } // Optimization field? Or calc dynamically?
        // Dynamic calc is safer for now.
    }
}, {
    timestamps: true
});

// Index for fast lookups of user's chats
chatSchema.index({ participants: 1 });

module.exports = mongoose.model('Chat', chatSchema);
