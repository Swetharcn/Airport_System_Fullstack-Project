const mongoose = require('mongoose');

/**
 * Connects to MongoDB using the URI from environment variables.
 * Retries every 5 seconds on failure instead of crashing the process.
 */
const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI;

  const tryConnect = async () => {
    try {
      const conn = await mongoose.connect(MONGO_URI);
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
      console.error(`❌ MongoDB Connection Error: ${error.message}`);
      console.log('🔄 Retrying MongoDB connection in 5 seconds...');
      setTimeout(tryConnect, 5000); // Retry after 5 s — server stays alive
    }
  };

  await tryConnect();
};

// Handle disconnection events and attempt auto-reconnect
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
});

module.exports = connectDB;
