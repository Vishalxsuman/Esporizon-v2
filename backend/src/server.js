require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to Database with robust error handling and retries
const connectWithRetry = async (retries = 5, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await connectDB();
      return;
    } catch (err) {
      console.error(`❌ Database Connection Failed (Attempt ${i + 1}/${retries})...`);
      if (i < retries - 1) await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  console.error('❌ All database connection attempts failed. Server will continue but DB features will fail.');
};

connectWithRetry();

// Start Server
const server = app.listen(PORT, () => {
  console.log(`
  🎮 Esporizon Backend Running
  📡 Port: ${PORT}
  🌍 Mode: ${process.env.NODE_ENV || 'development'}
  `);
});

// Handle server errors (e.g., port in use)
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Please stop other processes or use a different port.`);
    process.exit(1);
  } else {
    console.error('❌ Server startup error:', error);
  }
});
