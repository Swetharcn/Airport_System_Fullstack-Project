require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

// Import Routes
const authRoutes    = require('./routes/authRoutes');
const flightRoutes  = require('./routes/flightRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const chatRoutes = require('./routes/chatRoutes');
const navigationRoutes = require('./routes/navigationRoutes');
const crowdRoutes = require('./routes/crowdRoutes');
const lostFoundRoutes = require('./routes/lostFoundRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const baggageRoutes = require('./routes/baggageRoutes');
const predictionRoutes = require('./routes/predictionRoutes');
const boardingPassRoutes = require('./routes/boardingPassRoutes');

// Services
const { startBoardingReminders } = require('./services/schedulerService');
const { initializeZones, updateSimulation } = require('./services/crowdService');
const { checkBoardingReminders } = require('./services/boardingScheduler');

// ─── Initialize App ───────────────────────────────────────────────────────────
const app = express();

// ─── Connect to Database ──────────────────────────────────────────────────────
connectDB();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman) or from local network
    if (!origin) return callback(null, true);
    const allowed = [
      'http://localhost:5173',
      'http://localhost:3000',
      /^http:\/\/10\.\d+\.\d+\.\d+/,       // 10.x.x.x range (hotspot/campus)
      /^http:\/\/192\.168\.\d+\.\d+/,       // 192.168.x.x range (home WiFi)
      /^http:\/\/172\.(1[6-9]|2\d|3[01])\.\d+\.\d+/, // 172.16-31.x.x
    ];
    const isAllowed = allowed.some(p => typeof p === 'string' ? p === origin : p.test(origin));
    callback(isAllowed ? null : new Error('Not allowed by CORS'), isAllowed);
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// HTTP request logging (dev only)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── Mount Routes ─────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/navigation', navigationRoutes);
app.use('/api/crowd-density', crowdRoutes);
app.use('/api/lost-items', lostFoundRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/baggage', baggageRoutes);
app.use('/api/prediction', predictionRoutes);
app.use('/api/boarding-pass', boardingPassRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Smart Airport API is running 🛫' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error(`[ERROR] ${err.message}`);
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Start Server & Background Services ───────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 Environment: ${process.env.NODE_ENV}`);
  
  // Initialize smart modules
  await initializeZones();
  await updateSimulation(); // Run first simulation immediately
  
  // Start background cron jobs
  startBoardingReminders();
  
  // Update crowd simulation every 2 minutes
  setInterval(updateSimulation, 2 * 60 * 1000);

  // Check boarding reminders every 60 seconds
  setInterval(checkBoardingReminders, 60 * 1000);
  console.log('🔔 Boarding reminder scheduler started (checks every 60s)');
});
