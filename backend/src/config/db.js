const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/esporizon_prod');
        console.log(`🚀 MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(`❌ Error: ${err.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
