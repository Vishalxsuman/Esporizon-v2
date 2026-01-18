require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Start Server
app.listen(PORT, () => {
    console.log(`
  🎮 Esporizon Backend Running
  📡 Port: ${PORT}
  🌍 Mode: ${process.env.NODE_ENV || 'development'}
  `);
});
