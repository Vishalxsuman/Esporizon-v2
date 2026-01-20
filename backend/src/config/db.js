const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('❌ MONGODB_URI is not defined in environment variables');
        }
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            family: 4,
            maxPoolSize: 10,
            socketTimeoutMS: 45000,
            retryReads: true,
            retryWrites: true,
        });
        if (process.env.NODE_ENV !== 'production') {

            console.log(`🚀 MongoDB Connected: ${conn.connection.host}`);

        }
    } catch (err) {
        // Do NOT exit process here - let server.js handle it
        // This ensures the API remains responsive (health checks, etc.) even if DB is down
        console.error(`❌ MongoDB Connection Error: ${err.message}`);
        // We do strictly THROW here so server.js can log it, but server.js catches it.
        throw err;
    }
};

module.exports = connectDB;
